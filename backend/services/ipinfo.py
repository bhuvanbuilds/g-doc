import os
from typing import Any

import ipinfo
from dotenv import load_dotenv


load_dotenv()


def get_ipinfo_token() -> str:
    token = os.getenv("IPINFO_TOKEN")

    if not token:
        raise RuntimeError(
            "IPINFO_TOKEN is not configured"
        )

    return token


def lookup_ip(ip_address: str) -> dict[str, Any]:
    """
    Look up infrastructure information for an IP address.

    This provides network/geolocation intelligence.
    It does not identify a person or prove attacker identity.
    """

    try:
        token = get_ipinfo_token()

        handler = ipinfo.getHandler(token)

        details = handler.getDetails(ip_address)

        return {
            "status": "found",
            "ip": ip_address,
            "hostname": getattr(details, "hostname", None),
            "city": getattr(details, "city", None),
            "region": getattr(details, "region", None),
            "country": getattr(details, "country", None),
            "country_name": getattr(details, "country_name", None),
            "loc": getattr(details, "loc", None),
            "org": getattr(details, "org", None),
            "timezone": getattr(details, "timezone", None),
        }

    except Exception as exc:
        return {
            "status": "error",
            "ip": ip_address,
            "error": f"IPinfo lookup failed: {str(exc)}",
        }