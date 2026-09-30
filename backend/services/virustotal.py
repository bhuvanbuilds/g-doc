import os
import base64
from typing import Any

import httpx
from dotenv import load_dotenv


load_dotenv()

VIRUSTOTAL_API_URL = "https://www.virustotal.com/api/v3"


def get_api_key() -> str:
    api_key = os.getenv("VIRUSTOTAL_API_KEY")

    if not api_key:
        raise RuntimeError(
            "VIRUSTOTAL_API_KEY is not configured"
        )

    return api_key


def url_to_vt_id(url: str) -> str:
    """Convert a URL into the VirusTotal URL identifier."""

    return base64.urlsafe_b64encode(
        url.encode()
    ).decode().strip("=")


async def lookup_url(url: str) -> dict[str, Any]:
    """
    Look up a URL in VirusTotal.

    The function never visits the target URL.
    It only communicates with the VirusTotal API.
    """

    try:
        api_key = get_api_key()

        url_id = url_to_vt_id(url)

        headers = {
            "x-apikey": api_key,
            "Accept": "application/json",
        }

        endpoint = f"{VIRUSTOTAL_API_URL}/urls/{url_id}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                endpoint,
                headers=headers,
            )

        if response.status_code == 404:
            return {
                "status": "not_found",
                "url": url,
                "message": "URL is not currently known to VirusTotal",
            }

        if response.status_code == 401:
            return {
                "status": "error",
                "url": url,
                "error": "VirusTotal API authentication failed",
            }

        if response.status_code == 429:
            return {
                "status": "rate_limited",
                "url": url,
                "message": "VirusTotal API rate limit reached",
            }

        response.raise_for_status()

        data = response.json()

        attributes = (
            data.get("data", {})
            .get("attributes", {})
        )

        return {
            "status": "found",
            "url": url,
            "reputation": attributes.get("reputation"),
            "last_analysis_stats": attributes.get(
                "last_analysis_stats",
                {},
            ),
        }

    except httpx.TimeoutException:
        return {
            "status": "error",
            "url": url,
            "error": "VirusTotal request timed out",
        }

    except httpx.RequestError:
        return {
            "status": "error",
            "url": url,
            "error": "Unable to connect to VirusTotal",
        }

    except Exception as exc:
        return {
            "status": "error",
            "url": url,
            "error": f"VirusTotal lookup failed: {str(exc)}",
        }