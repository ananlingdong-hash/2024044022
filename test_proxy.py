import urllib.request, json

# Quick streaming test via proxy
data = json.dumps({
    "model": "deepseek-chat",
    "input": "say hello in one word",
    "max_output_tokens": 10
}).encode()

req = urllib.request.Request("http://127.0.0.1:3001/v1/responses", data=data, method="POST")
req.add_header("Content-Type", "application/json")
try:
    resp = urllib.request.urlopen(req, timeout=20)
    body = resp.read().decode(errors="replace")
    # Check if we got a completed response
    if "response.completed" in body:
        print("PROXY WORKS! Got response.completed event")
    else:
        print("PARTIAL:", body[:300])
except Exception as e:
    print("FAIL:", e)
