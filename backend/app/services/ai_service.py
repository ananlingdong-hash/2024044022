from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
import urllib.error

from app.config import settings
from app.schemas import AIRequest, AIResponse


def _extract_minimax_content(data: dict) -> str:
    candidates = [
        data.get("reply"),
        data.get("output_text"),
        data.get("text"),
        data.get("data", {}).get("reply") if isinstance(data.get("data"), dict) else None,
    ]
    if isinstance(data.get("choices"), list) and data["choices"]:
        first = data["choices"][0]
        if isinstance(first, dict):
            candidates.append(first.get("text"))
            message = first.get("message")
            if isinstance(message, dict):
                candidates.append(message.get("content"))
    for item in candidates:
        if isinstance(item, str) and item.strip():
            return item.strip()
    return ""


def run_ai(payload: AIRequest) -> AIResponse:
    start = time.perf_counter()
    content, diagnostic = call_minimax(payload)
    elapsed = int((time.perf_counter() - start) * 1000) + 120
    return AIResponse(content=content, model="minimax-m2.7", latencyMs=elapsed, diagnostic=diagnostic)


def build_prompt_template(model: str) -> dict:
    return {
        "model": "MiniMax-M2.7",
        "messages": [
            {"role": "system", "content": "你是AI量化分析股票基金助手，优先返回可执行结论。"},
            {"role": "user", "content": "请给出短中长期分层策略建议。"},
        ],
    }


def as_json_text(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=False)


def _build_minimax_endpoint(group_id: str | None) -> str:
    base = settings.minimax_api_url.strip()
    if not base:
        base = "https://api.minimax.chat/v1/text/chatcompletion_v2"
    parsed = urllib.parse.urlparse(base)
    query = urllib.parse.parse_qs(parsed.query)
    if group_id:
        query["GroupId"] = [group_id]
    else:
        query.pop("GroupId", None)
    new_query = urllib.parse.urlencode(query, doseq=True)
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))


def call_minimax(payload: AIRequest) -> tuple[str, str | None]:
    if not settings.minimax_api_key:
        return "[MiniMax 未配置] 请在 backend/.env 设置 MINIMAX_API_KEY。", "missing-minimax-key"
    group_id = settings.minimax_group_id or settings.minimax_user_id or "13112329599"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.minimax_api_key}",
    }
    request_sender = {
        "model": settings.minimax_model,
        "messages": [
            {"sender_type": "USER", "sender_name": "quant_user", "text": f"任务: {payload.task}\n上下文: {payload.context}"}
        ],
        "tokens_to_generate": 600,
        "temperature": 0.3,
    }
    request_role = {
        "model": settings.minimax_model,
        "messages": [
            {"role": "system", "content": "你是AI量化分析股票基金助手，回答简洁且可执行。"},
            {"role": "user", "content": f"任务: {payload.task}\n上下文: {payload.context}"},
        ],
        "temperature": 0.3,
        "max_tokens": 600,
    }
    # Prefer the proven working path first to reduce end-to-end latency.
    attempts = [
        ("no-group-role", _build_minimax_endpoint(None), request_role),
        ("no-group-sender", _build_minimax_endpoint(None), request_sender),
        ("with-group-role", _build_minimax_endpoint(group_id), request_role),
        ("with-group-sender", _build_minimax_endpoint(group_id), request_sender),
    ]
    last_error = ""
    for tag, endpoint, body in attempts:
        try:
            req = urllib.request.Request(endpoint, data=json.dumps(body).encode("utf-8"), method="POST", headers=headers)
            with urllib.request.urlopen(req, timeout=25) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            base_resp = data.get("base_resp")
            if isinstance(base_resp, dict):
                status_code = int(base_resp.get("status_code", 0))
                status_msg = str(base_resp.get("status_msg", "")).strip()
                if status_code != 0:
                    last_error = f"{tag}: status_code={status_code}, status_msg={status_msg}"
                    continue
            content = _extract_minimax_content(data)
            if content:
                return content, f"minimax-ok-{tag}"
            last_error = f"{tag}: empty-content keys={list(data.keys())[:8]}"
        except urllib.error.HTTPError as err:
            body_text = err.read().decode("utf-8", errors="ignore")[:220]
            last_error = f"{tag}: http={err.code} body={body_text}"
            continue
        except Exception as exc:
            last_error = f"{tag}: exception={exc}"
            continue
    return f"[MiniMax 调用失败] 已尝试多种格式仍失败。最后错误: {last_error}", "minimax-all-attempts-failed"
