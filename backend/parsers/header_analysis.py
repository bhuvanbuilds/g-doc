from email.utils import parseaddr
from typing import Any
import re


def extract_domain(email_address: str | None) -> str | None:
    """Extract the domain from an email address."""

    if not email_address:
        return None

    _, address = parseaddr(email_address)

    if "@" not in address:
        return None

    return address.rsplit("@", 1)[1].lower()


def extract_ip_addresses(received_headers: list[str]) -> list[str]:
    """Extract IPv4 addresses from Received headers."""

    ips = []

    for header in received_headers:
        matches = re.findall(
            r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
            header,
        )

        for ip in matches:
            if ip not in ips:
                ips.append(ip)

    return ips


def analyze_headers(email_data: dict[str, Any]) -> dict[str, Any]:
    """Generate objective observations from email headers."""

    from_domain = extract_domain(email_data.get("from"))
    reply_to_domain = extract_domain(email_data.get("reply_to"))
    return_path_domain = extract_domain(email_data.get("return_path"))

    observations = []

    # Reply-To mismatch
    if from_domain and reply_to_domain:
        if from_domain != reply_to_domain:
            observations.append(
                {
                    "type": "reply_to_mismatch",
                    "severity": "medium",
                    "title": "Reply-To domain differs from sender domain",
                    "evidence": {
                        "from_domain": from_domain,
                        "reply_to_domain": reply_to_domain,
                    },
                }
            )

    # Return-Path mismatch
    if from_domain and return_path_domain:
        if from_domain != return_path_domain:
            observations.append(
                {
                    "type": "return_path_mismatch",
                    "severity": "low",
                    "title": "Return-Path domain differs from sender domain",
                    "evidence": {
                        "from_domain": from_domain,
                        "return_path_domain": return_path_domain,
                    },
                }
            )

    # Extract IPs from Received headers
    received_ips = extract_ip_addresses(
        email_data.get("received", [])
    )

    return {
        "sender_domain": from_domain,
        "reply_to_domain": reply_to_domain,
        "return_path_domain": return_path_domain,
        "received_ips": received_ips,
        "observations": observations,
    }