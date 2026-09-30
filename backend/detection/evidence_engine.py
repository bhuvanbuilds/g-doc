from typing import Any

from parsers.header_analysis import analyze_headers
from parsers.auth_analysis import analyze_authentication
from parsers.url_analysis import analyze_urls
from parsers.attachment_analysis import analyze_attachments

from services.virustotal import lookup_url
from services.ipinfo import lookup_ip


async def build_evidence(email_data: dict[str, Any]) -> dict[str, Any]:
    """
    Run deterministic email analysis and external threat-intelligence
    enrichment.

    This function collects evidence but does not assign a final
    threat score.
    """

    # -----------------------------
    # 1. Header analysis
    # -----------------------------

    header_analysis = analyze_headers(email_data)

    # -----------------------------
    # 2. SPF / DKIM / DMARC
    # -----------------------------

    authentication_analysis = analyze_authentication(
        email_data.get("authentication_results", [])
    )

    # -----------------------------
    # 3. URL analysis
    # -----------------------------

    url_analysis = analyze_urls(
        email_data.get("urls", [])
    )

    # -----------------------------
    # 4. Attachment analysis
    # -----------------------------

    attachment_analysis = analyze_attachments(
        email_data.get("attachments", [])
    )

    # -----------------------------
    # 5. VirusTotal URL enrichment
    # -----------------------------

    virustotal_results = []

    for url in email_data.get("urls", []):
        result = await lookup_url(url)
        virustotal_results.append(result)

    # -----------------------------
    # 6. IPinfo IP enrichment
    # -----------------------------

    ipinfo_results = []

    for ip_address in header_analysis.get("received_ips", []):
        result = lookup_ip(ip_address)
        ipinfo_results.append(result)

    # -----------------------------
    # 7. Combine all observations
    # -----------------------------

    all_observations = (
        header_analysis["observations"]
        + authentication_analysis["observations"]
        + url_analysis["observations"]
        + attachment_analysis["observations"]
    )

    # -----------------------------
    # 8. Return complete evidence
    # -----------------------------

    return {
        "headers": header_analysis,
        "authentication": authentication_analysis,
        "urls": url_analysis,
        "attachments": attachment_analysis,
        "virustotal": virustotal_results,
        "ipinfo": ipinfo_results,
        "observations": all_observations,
    }