from typing import Any
from pathlib import Path


SUSPICIOUS_EXTENSIONS = {
    ".exe",
    ".scr",
    ".bat",
    ".cmd",
    ".com",
    ".js",
    ".vbs",
    ".vbe",
    ".ps1",
    ".msi",
    ".hta",
    ".jar",
    ".iso",
    ".img",
}


def analyze_attachments(
    attachments: list[dict[str, Any]],
) -> dict[str, Any]:
    """Analyze attachment metadata without opening or executing attachments."""

    observations = []
    analyzed_attachments = []

    for attachment in attachments:
        filename = attachment.get("filename") or ""
        extension = Path(filename).suffix.lower()

        analyzed = {
            **attachment,
            "extension": extension,
        }

        analyzed_attachments.append(analyzed)

        if extension in SUSPICIOUS_EXTENSIONS:
            observations.append(
                {
                    "type": "suspicious_attachment_extension",
                    "severity": "high",
                    "title": "Attachment uses a potentially dangerous file extension",
                    "evidence": {
                        "filename": filename,
                        "extension": extension,
                        "content_type": attachment.get("content_type"),
                    },
                }
            )

    return {
        "attachments": analyzed_attachments,
        "observations": observations,
    }