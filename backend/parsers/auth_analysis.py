import re
from typing import Any


def analyze_authentication(
    authentication_results: list[str],
) -> dict[str, Any]:
    """
    Parse SPF, DKIM, and DMARC results from Authentication-Results
    headers.

    This function only interprets the information present in the
    email headers. It does not independently verify SPF, DKIM, or DMARC.
    """

    results = {
        "spf": None,
        "dkim": None,
        "dmarc": None,
        "raw": authentication_results,
        "observations": [],
    }

    combined = " ".join(authentication_results).lower()

    # SPF
    spf_match = re.search(r"\bspf\s*=\s*(pass|fail|softfail|neutral|none|temperror|permerror)\b", combined)

    if spf_match:
        results["spf"] = spf_match.group(1)

    # DKIM
    dkim_match = re.search(r"\bdkim\s*=\s*(pass|fail|neutral|none|temperror|permerror)\b", combined)

    if dkim_match:
        results["dkim"] = dkim_match.group(1)

    # DMARC
    dmarc_match = re.search(r"\bdmarc\s*=\s*(pass|fail|bestguesspass|none|temperror|permerror)\b", combined)

    if dmarc_match:
        results["dmarc"] = dmarc_match.group(1)

    # Generate objective observations
    for mechanism in ["spf", "dkim", "dmarc"]:
        value = results[mechanism]

        if value in {"fail", "softfail", "permerror", "temperror"}:
            results["observations"].append(
                {
                    "type": f"{mechanism}_problem",
                    "severity": "high" if value == "fail" else "medium",
                    "title": f"{mechanism.upper()} returned {value}",
                    "evidence": {
                        mechanism: value,
                    },
                }
            )

    return results