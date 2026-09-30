from typing import Any

from parsers.header_analysis import analyze_headers
from parsers.auth_analysis import analyze_authentication
from parsers.url_analysis import analyze_urls
from parsers.attachment_analysis import analyze_attachments
from parsers.relay_analysis import analyze_received_headers
from parsers.timeline_analysis import analyze_timeline

from services.virustotal import lookup_url
from services.ipinfo import lookup_ip
from services.groq import analyze_email_with_groq
from detection.risk_engine import calculate_risk


async def build_evidence(email_data: dict[str, Any]) -> dict[str, Any]:
    """
    Run deterministic email analysis, external threat-intelligence
    enrichment, semantic analysis, and risk assessment.
    """

    # -----------------------------
    # 1. Header analysis
    # -----------------------------

    header_analysis = analyze_headers(email_data)
    relay_analysis = analyze_received_headers(
        email_data.get("received", [])
    )

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

    geolocation_fields = (
        "hostname",
        "city",
        "region",
        "country",
        "country_name",
        "loc",
        "org",
        "timezone",
    )
    ipinfo_by_ip = {}
    for result in ipinfo_results:
        if isinstance(result, dict) and isinstance(result.get("ip"), str):
            ipinfo_by_ip.setdefault(result["ip"], result)

    for relay in relay_analysis.get("relay_path", []):
        if not isinstance(relay, dict):
            continue

        ipinfo_result = ipinfo_by_ip.get(relay.get("from_ip"))
        if ipinfo_result is None:
            relay["geolocation"] = None
        else:
            relay["geolocation"] = {
                field: ipinfo_result.get(field)
                for field in geolocation_fields
            }

    timeline_analysis = analyze_timeline(
        relay_analysis.get("relay_path", [])
    )

    # -----------------------------
    # 7. Combine all observations
    # -----------------------------

    technical_observations = (
        header_analysis["observations"]
        + authentication_analysis["observations"]
        + url_analysis["observations"]
        + attachment_analysis["observations"]
        + relay_analysis["observations"]
    )

    technical_evidence = {
        "headers": header_analysis,
        "authentication": authentication_analysis,
        "urls": url_analysis,
        "attachments": attachment_analysis,
        "virustotal": virustotal_results,
        "ipinfo": ipinfo_results,
        "relay": relay_analysis,
        "timeline": timeline_analysis,
        "observations": technical_observations,
    }

    ai_analysis = analyze_email_with_groq(
        email_data=email_data,
        evidence=technical_evidence,
    )
    risk_assessment = calculate_risk(
        technical_evidence=technical_evidence,
        ai_analysis=ai_analysis,
    )

    return {
        "technical_evidence": technical_evidence,
        "ai_analysis": ai_analysis,
        "risk_assessment": risk_assessment,
        "observations": technical_observations,
    }
