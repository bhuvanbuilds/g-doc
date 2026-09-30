from typing import Any

from parsers.header_analysis import analyze_headers
from parsers.auth_analysis import analyze_authentication
from parsers.url_analysis import analyze_urls
from parsers.attachment_analysis import analyze_attachments


def build_evidence(email_data: dict[str, Any]) -> dict[str, Any]:
    """
    Run all deterministic email analysis modules and combine
    their results into a single evidence package.

    This function does not assign a final threat score.
    """

    header_analysis = analyze_headers(email_data)

    authentication_analysis = analyze_authentication(
        email_data.get("authentication_results", [])
    )

    url_analysis = analyze_urls(
        email_data.get("urls", [])
    )

    attachment_analysis = analyze_attachments(
        email_data.get("attachments", [])
    )

    all_observations = (
        header_analysis["observations"]
        + authentication_analysis["observations"]
        + url_analysis["observations"]
        + attachment_analysis["observations"]
    )

    return {
        "headers": header_analysis,
        "authentication": authentication_analysis,
        "urls": url_analysis,
        "attachments": attachment_analysis,
        "observations": all_observations,
    }