"""
Shared HTTP probe utility for Data Reconnaissance agents.

Provides a safe, timeout-aware HTTP client for probing public wildfire
data APIs and documenting their response structures.

ADK Tool Compatibility: All functions use primitive parameter types only.
"""

import json
import logging
import time
import urllib.error
import urllib.request
from typing import Any

logger = logging.getLogger("ranger.data_recon.probe")

DEFAULT_TIMEOUT = 30  # seconds
DEFAULT_USER_AGENT = "RANGER-DataRecon/1.0 (forest-recovery-research)"
MAX_RESPONSE_BYTES = 5 * 1024 * 1024  # 5MB max response


def probe_url(
    url: str,
    timeout: int = DEFAULT_TIMEOUT,
    max_bytes: int = MAX_RESPONSE_BYTES,
) -> dict:
    """
    Probe a URL and return structured response metadata.

    Returns:
        dict with keys: status_code, content_type, content_length,
        headers, body_preview, response_time_ms, error
    """
    result = {
        "url": url,
        "status_code": None,
        "content_type": None,
        "content_length": None,
        "headers": {},
        "body_preview": "",
        "response_time_ms": 0,
        "error": None,
    }

    req = urllib.request.Request(
        url,
        headers={"User-Agent": DEFAULT_USER_AGENT},
    )

    start = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            result["status_code"] = resp.status
            result["content_type"] = resp.headers.get("Content-Type", "")
            result["content_length"] = resp.headers.get("Content-Length")
            result["headers"] = dict(resp.headers.items())

            body = resp.read(max_bytes)
            try:
                text = body.decode("utf-8", errors="replace")
            except Exception:
                text = f"<binary data, {len(body)} bytes>"

            # Truncate preview to 50000 chars (enough for most API responses)
            result["body_preview"] = text[:50000]

    except urllib.error.HTTPError as e:
        result["status_code"] = e.code
        result["error"] = f"HTTP {e.code}: {e.reason}"
        try:
            body = e.read(4096)
            result["body_preview"] = body.decode("utf-8", errors="replace")[:500]
        except Exception:
            pass

    except urllib.error.URLError as e:
        result["error"] = f"URL Error: {str(e.reason)}"

    except TimeoutError:
        result["error"] = f"Timeout after {timeout}s"

    except Exception as e:
        result["error"] = f"{type(e).__name__}: {str(e)}"

    result["response_time_ms"] = round((time.monotonic() - start) * 1000)
    return result


def analyze_json_structure(json_text: str, max_depth: int = 3) -> dict:
    """
    Analyze the structure of a JSON response without returning all data.

    Returns a schema-like summary: key names, types, array lengths,
    and sample values for leaf nodes.
    """
    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON: {str(e)}", "preview": json_text[:500]}

    return _describe_value(data, depth=0, max_depth=max_depth)


def _describe_value(value: Any, depth: int, max_depth: int) -> dict:
    """Recursively describe a JSON value's structure."""
    if depth >= max_depth:
        return {"type": type(value).__name__, "truncated": True}

    if isinstance(value, dict):
        result = {"type": "object", "key_count": len(value), "keys": {}}
        for k, v in list(value.items())[:30]:  # Limit to 30 keys
            result["keys"][k] = _describe_value(v, depth + 1, max_depth)
        if len(value) > 30:
            result["truncated_keys"] = len(value) - 30
        return result

    elif isinstance(value, list):
        result = {"type": "array", "length": len(value)}
        if len(value) > 0:
            result["first_element"] = _describe_value(
                value[0], depth + 1, max_depth
            )
        return result

    elif isinstance(value, str):
        return {"type": "string", "sample": value[:100]}

    elif isinstance(value, bool):
        return {"type": "boolean", "sample": value}

    elif isinstance(value, (int, float)):
        return {"type": "number", "sample": value}

    elif value is None:
        return {"type": "null"}

    else:
        return {"type": type(value).__name__}


def analyze_csv_structure(csv_text: str) -> dict:
    """
    Analyze CSV response structure: headers, row count, sample values.
    """
    lines = csv_text.strip().split("\n")
    if not lines:
        return {"error": "Empty CSV response"}

    headers = lines[0].split(",")
    result = {
        "type": "csv",
        "column_count": len(headers),
        "columns": [h.strip() for h in headers],
        "row_count": len(lines) - 1,
        "sample_rows": [],
    }

    # Include up to 3 sample rows
    for line in lines[1:4]:
        values = line.split(",")
        row = {}
        for i, h in enumerate(headers):
            if i < len(values):
                row[h.strip()] = values[i].strip()
        result["sample_rows"].append(row)

    return result


def execute(params: dict) -> dict:
    """
    Execute an API probe against a given URL.

    Args:
        params: dict with keys:
            - url (str): The URL to probe
            - timeout (int, optional): Timeout in seconds (default 30)
            - analyze_response (bool, optional): Whether to analyze JSON/CSV structure

    Returns:
        dict with probe results and optional structure analysis
    """
    url = params.get("url", "")
    timeout = params.get("timeout", DEFAULT_TIMEOUT)
    analyze = params.get("analyze_response", True)

    probe_result = probe_url(url, timeout=timeout)

    if analyze and probe_result["body_preview"] and not probe_result["error"]:
        content_type = probe_result.get("content_type", "")
        body = probe_result["body_preview"]

        if "json" in content_type or body.strip().startswith(("{", "[")):
            probe_result["structure"] = analyze_json_structure(body)
        elif "csv" in content_type or "text/plain" in content_type:
            probe_result["structure"] = analyze_csv_structure(body)

    return probe_result
