"""Proxy: Codex CLI (Responses API) -> DeepSeek (Chat Completions with SSE streaming)"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import urllib.request
import urllib.error
import ssl
import sys
import time
import uuid

DEEPSEEK_KEY = os.getenv("DEEPSEEK_KEY", "")
TARGET = "https://api.deepseek.com/v1"

def translate_messages(req_body: dict) -> list:
    input_text = req_body.get("input", "")
    if isinstance(input_text, list):
        messages = input_text
    elif isinstance(input_text, str):
        messages = [{"role": "user", "content": input_text}]
    else:
        messages = [{"role": "user", "content": str(input_text)}]
    
    for msg in messages:
        if msg.get("role") == "developer":
            msg["role"] = "system"
        content = msg.get("content")
        if isinstance(content, list):
            parts = []
            for part in content:
                if isinstance(part, dict):
                    parts.append(part.get("text", str(part)))
                else:
                    parts.append(str(part))
            msg["content"] = "\n".join(parts)
    
    instructions = req_body.get("instructions", "")
    if instructions:
        messages = [{"role": "system", "content": instructions}] + messages
    
    return messages

def sse_event(event_type: str, data: str) -> str:
    """Build an SSE event string."""
    return f"event: {event_type}\ndata: {data}\n\n"

class ProxyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b"{}"
        try:
            req_body = json.loads(body)
        except:
            req_body = {}
        
        if self.path == "/v1/responses":
            try:
                messages = translate_messages(req_body)
                model = req_body.get("model", "deepseek-chat")
                resp_id = f"resp_{uuid.uuid4().hex[:12]}"
                msg_id = f"msg_{uuid.uuid4().hex[:12]}"
                
                chat_req = json.dumps({
                    "model": model,
                    "messages": messages,
                    "stream": True,
                    "temperature": req_body.get("temperature"),
                    "max_tokens": req_body.get("max_output_tokens", req_body.get("max_tokens")),
                }).encode()
                
                url = f"{TARGET}/chat/completions"
                req = urllib.request.Request(url, data=chat_req, method="POST")
                req.add_header("Content-Type", "application/json")
                req.add_header("Authorization", f"Bearer {DEEPSEEK_KEY}")
                
                ctx = ssl.create_default_context()
                resp = urllib.request.urlopen(req, timeout=120, context=ctx)
                
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Connection", "keep-alive")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                
                # Send response.created + in_progress
                created = {
                    "type": "response.created",
                    "response": {
                        "id": resp_id,
                        "object": "response",
                        "status": "in_progress",
                        "model": model,
                    }
                }
                self.wfile.write(sse_event("response.created", json.dumps(created)).encode())
                self.wfile.flush()
                self.wfile.write(sse_event("response.in_progress", json.dumps({"type": "response.in_progress", "response": {"id": resp_id}})).encode())
                self.wfile.flush()
                
                # Send output_item.added before text deltas
                item_added = {
                    "type": "response.output_item.added",
                    "output_index": 0,
                    "item": {
                        "id": msg_id,
                        "type": "message",
                        "status": "in_progress",
                        "role": "assistant",
                    }
                }
                self.wfile.write(sse_event("response.output_item.added", json.dumps(item_added)).encode())
                self.wfile.flush()
                
                # Content part added
                content_added = {
                    "type": "response.content_part.added",
                    "item_id": msg_id,
                    "output_index": 0,
                    "content_index": 0,
                    "part": {"type": "output_text", "text": ""}
                }
                self.wfile.write(sse_event("response.content_part.added", json.dumps(content_added)).encode())
                self.wfile.flush()
                
                # Stream chunks
                print("[proxy] starting stream from DeepSeek...", flush=True)
                full_text = ""
                buffer = b""
                while True:
                    chunk = resp.read(4096)
                    if not chunk:
                        break
                    buffer += chunk
                    while b"\n" in buffer:
                        line, buffer = buffer.split(b"\n", 1)
                        line = line.strip()
                        if not line or line == b"data: [DONE]":
                            continue
                        if line.startswith(b"data: "):
                            line = line[6:]
                        try:
                            data = json.loads(line)
                            choices = data.get("choices", [])
                            if choices:
                                delta = choices[0].get("delta", {})
                                text = delta.get("content", "")
                                if text:
                                    full_text += text
                                    delta_event = {
                                        "type": "response.output_text.delta",
                                        "item_id": msg_id,
                                        "output_index": 0,
                                        "content_index": 0,
                                        "delta": text,
                                    }
                                    self.wfile.write(sse_event("response.output_text.delta", json.dumps(delta_event)).encode())
                                    self.wfile.flush()
                        except json.JSONDecodeError:
                            pass
                
                print(f"[proxy] stream done, full_text length: {len(full_text)}", flush=True)
                
                # Send output_item.done + content_part.done
                content_done = {
                    "type": "response.content_part.done",
                    "item_id": msg_id,
                    "output_index": 0,
                    "content_index": 0,
                    "part": {"type": "output_text", "text": full_text}
                }
                self.wfile.write(sse_event("response.content_part.done", json.dumps(content_done)).encode())
                
                item_done = {
                    "type": "response.output_item.done",
                    "output_index": 0,
                    "item": {
                        "id": msg_id,
                        "type": "message",
                        "status": "completed",
                        "role": "assistant",
                        "content": [{"type": "output_text", "text": full_text}]
                    }
                }
                self.wfile.write(sse_event("response.output_item.done", json.dumps(item_done)).encode())
                
                # Send response.completed
                completed = {
                    "type": "response.completed",
                    "response": {
                        "id": resp_id,
                        "object": "response",
                        "status": "completed",
                        "model": model,
                        "output": [{
                            "type": "message",
                            "id": msg_id,
                            "status": "completed",
                            "role": "assistant",
                            "content": [{"type": "output_text", "text": full_text}]
                        }],
                        "usage": {"input_tokens": len(str(messages)), "output_tokens": len(full_text)},
                    }
                }
                self.wfile.write(sse_event("response.completed", json.dumps(completed)).encode())
                self.wfile.flush()
                
            except urllib.error.HTTPError as e:
                err_body = e.read().decode(errors="replace")
                error_data = json.dumps({"error": {"message": f"DeepSeek API error: {err_body}"}})
                self.send_response(e.code)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(error_data.encode())
            except Exception as e:
                error_data = json.dumps({"error": {"message": str(e)}})
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(error_data.encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()
    
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"status":"ok"}')
    
    def log_message(self, format, *args):
        print(f"[proxy] {args[0]}", flush=True)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    server = HTTPServer(("127.0.0.1", port), ProxyHandler)
    print(f"Proxy SSE OK: http://localhost:{port}/v1/responses -> {TARGET}/chat/completions", flush=True)
    server.serve_forever()
