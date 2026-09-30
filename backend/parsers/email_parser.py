from email import policy
from email.parser import BytesParser
from email.message import Message
from typing import Any
import re


def extract_body(message: Message) -> tuple[str, str]:
    """Extract plain-text and HTML content from an email."""
    body_text = ""
    body_html = ""

    if message.is_multipart():
        for part in message.walk():
            content_type = part.get_content_type()
            disposition = part.get_content_disposition()

            # Ignore attachments for body extraction
            if disposition == "attachment":
                continue

            try:
                content = part.get_content()
            except Exception:
                continue

            if content_type == "text/plain" and not body_text:
                body_text = content
            elif content_type == "text/html" and not body_html:
                body_html = content
    else:
        try:
            content = message.get_content()

            if message.get_content_type() == "text/html":
                body_html = content
            else:
                body_text = content
        except Exception:
            pass

    return body_text, body_html


def extract_attachments(message: Message) -> list[dict[str, Any]]:
    """Extract attachment metadata without opening or executing attachments."""
    attachments = []

    for part in message.walk():
        filename = part.get_filename()

        if filename:
            payload = part.get_payload(decode=True)

            attachments.append(
                {
                    "filename": filename,
                    "content_type": part.get_content_type(),
                    "size": len(payload) if payload else 0,
                }
            )

    return attachments


def extract_urls(text: str) -> list[str]:
    """Extract URLs from email content."""
    url_pattern = r"https?://[^\s<>'\"]+"

    urls = re.findall(url_pattern, text or "")

    # Remove duplicates while preserving order
    return list(dict.fromkeys(urls))


def parse_email(file_bytes: bytes) -> dict[str, Any]:
    """Parse raw .eml bytes and return structured email information."""

    message = BytesParser(policy=policy.default).parsebytes(file_bytes)

    body_text, body_html = extract_body(message)

    combined_body = f"{body_text}\n{body_html}"

    received_headers = message.get_all("Received", [])
    authentication_results = message.get_all(
        "Authentication-Results", []
    )

    attachments = extract_attachments(message)

    return {
        "from": message.get("From"),
        "to": message.get("To"),
        "cc": message.get("Cc"),
        "reply_to": message.get("Reply-To"),
        "return_path": message.get("Return-Path"),
        "subject": message.get("Subject"),
        "date": message.get("Date"),
        "message_id": message.get("Message-ID"),
        "received": received_headers,
        "authentication_results": authentication_results,
        "body_text": body_text,
        "body_html": body_html,
        "attachments": attachments,
        "urls": extract_urls(combined_body),
    }