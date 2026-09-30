import ipaddress
import re
from typing import Any


FROM_PATTERN = re.compile(
    r"\bfrom\s+(?P<value>.*?)(?=\s+\b(?:by|with|via|id|for)\b|;|$)",
    re.IGNORECASE | re.DOTALL,
)
BY_PATTERN = re.compile(
    r"\bby\s+(?P<value>.*?)(?=\s+\b(?:with|via|id|for)\b|;|$)",
    re.IGNORECASE | re.DOTALL,
)
PROTOCOL_PATTERN = re.compile(
    r"\bwith\s+(?P<value>[A-Za-z][A-Za-z0-9._+-]*)",
    re.IGNORECASE,
)
IPV4_PATTERN = re.compile(r"(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])")


def _extract_host(clause: str | None) -> str | None:
    if not clause:
        return None

    without_comments = re.sub(r"\([^)]*\)", " ", clause).strip()
    token_match = re.match(r"(?P<token>\[[^\]]+\]|[^\s;,]+)", without_comments)
    if not token_match:
        return None

    host = token_match.group("token").strip("[](),;")
    if not host or host.lower() in {"unknown", "none"}:
        return None

    try:
        ipaddress.IPv4Address(host)
    except ipaddress.AddressValueError:
        return host
    return None


def _extract_ipv4(clause: str | None) -> str | None:
    if not clause:
        return None

    for candidate in IPV4_PATTERN.findall(clause):
        try:
            return str(ipaddress.IPv4Address(candidate))
        except ipaddress.AddressValueError:
            continue
    return None


def analyze_received_headers(received_headers: list[str]) -> dict[str, Any]:
    """Extract relay metadata without inferring attacker identity or reputation."""
    if isinstance(received_headers, str):
        headers = [received_headers]
    elif isinstance(received_headers, (list, tuple)):
        headers = list(received_headers)
    else:
        headers = []

    relay_path = []
    observations = []

    for hop, header in enumerate(headers, start=1):
        raw = header if isinstance(header, str) else "" if header is None else str(header)
        unfolded = re.sub(r"\r?\n[ \t]+", " ", raw)

        from_match = FROM_PATTERN.search(unfolded)
        by_match = BY_PATTERN.search(unfolded)
        protocol_match = PROTOCOL_PATTERN.search(unfolded)

        from_clause = from_match.group("value") if from_match else None
        by_clause = by_match.group("value") if by_match else None
        from_ip = _extract_ipv4(from_clause)

        relay_path.append(
            {
                "hop": hop,
                "from_host": _extract_host(from_clause),
                "from_ip": from_ip,
                "to_host": _extract_host(by_clause),
                "protocol": protocol_match.group("value") if protocol_match else None,
                "raw": raw,
            }
        )

        if from_ip is None:
            observations.append(
                {
                    "type": "missing_source_ip",
                    "severity": "low",
                    "title": "Received header has no valid source IPv4 address",
                    "evidence": {"hop": hop, "raw": raw},
                }
            )

        if from_match is None or by_match is None:
            observations.append(
                {
                    "type": "malformed_received_header",
                    "severity": "low",
                    "title": "Received header is missing a recognizable from or by clause",
                    "evidence": {"hop": hop, "raw": raw},
                }
            )

    return {
        "relay_path": relay_path,
        "observations": observations,
    }