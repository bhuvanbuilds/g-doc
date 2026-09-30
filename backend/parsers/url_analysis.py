from urllib.parse import urlparse
from typing import Any
import ipaddress


def analyze_urls(urls: list[str]) -> dict[str, Any]:
    """Analyze URLs without making any network requests."""

    analyzed_urls = []
    observations = []

    for url in urls:
        try:
            parsed = urlparse(url)

            hostname = parsed.hostname
            scheme = parsed.scheme.lower()
            port = parsed.port

            is_ip_address = False

            if hostname:
                try:
                    ipaddress.ip_address(hostname)
                    is_ip_address = True
                except ValueError:
                    pass

            url_info = {
                "url": url,
                "scheme": scheme,
                "hostname": hostname,
                "port": port,
                "path": parsed.path,
                "query": parsed.query,
                "is_ip_address": is_ip_address,
            }

            analyzed_urls.append(url_info)

            if is_ip_address:
                observations.append(
                    {
                        "type": "ip_based_url",
                        "severity": "medium",
                        "title": "URL uses an IP address instead of a domain",
                        "evidence": {
                            "url": url,
                            "hostname": hostname,
                        },
                    }
                )

            if scheme == "http":
                observations.append(
                    {
                        "type": "unencrypted_url",
                        "severity": "low",
                        "title": "URL uses HTTP instead of HTTPS",
                        "evidence": {
                            "url": url,
                        },
                    }
                )

            if port and port not in {80, 443}:
                observations.append(
                    {
                        "type": "unusual_url_port",
                        "severity": "medium",
                        "title": "URL uses a non-standard port",
                        "evidence": {
                            "url": url,
                            "port": port,
                        },
                    }
                )

        except ValueError:
            observations.append(
                {
                    "type": "invalid_url",
                    "severity": "low",
                    "title": "URL contains an invalid port or URL structure",
                    "evidence": {
                        "url": url,
                    },
                }
            )

    return {
        "urls": analyzed_urls,
        "observations": observations,
    }