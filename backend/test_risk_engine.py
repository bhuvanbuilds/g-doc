from pprint import pprint

from detection.risk_engine import calculate_risk


def main() -> None:
    clean_case = {
        "authentication": {
            "spf": "pass",
            "dkim": "pass",
            "dmarc": "pass",
        },
        "observations": [],
        "virustotal": [
            {
                "status": "found",
                "url": "https://example.com/",
                "last_analysis_stats": {
                    "malicious": 0,
                    "suspicious": 0,
                },
            }
        ],
    }
    clean_ai_analysis = {
        "status": "success",
        "analysis": {
            "confidence": 0.5,
            "signals": [],
        },
    }

    suspicious_case = {
        "authentication": {
            "spf": "pass",
            "dkim": "pass",
            "dmarc": "fail",
        },
        "observations": [
            {
                "type": "reply_to_mismatch",
                "title": "Reply-To domain differs from sender domain",
                "evidence": {
                    "from_domain": "example.com",
                    "reply_to_domain": "attacker.example",
                },
            },
            {
                "type": "suspicious_attachment_extension",
                "title": "Attachment uses a potentially dangerous file extension",
                "evidence": {
                    "filename": "invoice.exe",
                    "extension": ".exe",
                },
            },
        ],
        "virustotal": [
            {
                "status": "found",
                "url": "https://malicious.example/login",
                "last_analysis_stats": {
                    "malicious": 4,
                    "suspicious": 0,
                },
            }
        ],
    }
    suspicious_ai_analysis = {
        "status": "success",
        "analysis": {
            "confidence": 0.9,
            "signals": [
                {
                    "type": "impersonation",
                    "description": "The sender imitates a trusted organization.",
                },
                {
                    "type": "credential_harvesting",
                    "description": "The message requests account credentials.",
                },
            ],
        },
    }

    sample_email_case = {
        "authentication": {
            "spf": "pass",
            "dkim": "pass",
            "dmarc": "pass",
        },
        "observations": [
            {
                "type": "reply_to_mismatch",
                "title": "Reply-To domain differs from sender domain",
                "evidence": {
                    "from_domain": "example.com",
                    "reply_to_domain": "gmail.com",
                },
            },
        ],
        "virustotal": [
            {
                "status": "found",
                "url": "https://example.com/login",
                "last_analysis_stats": {
                    "malicious": 0,
                    "suspicious": 0,
                    "harmless": 8,
                },
            }
        ],
    }
    sample_ai_analysis = {
        "status": "success",
        "analysis": {
            "risk_level": "low",
            "confidence": 0.6,
            "signals": [
                {"type": "phishing_language"},
                {"type": "urgency"},
                {"type": "impersonation"},
                {"type": "reply_to_mismatch"},
            ],
        },
    }

    clean_result = calculate_risk(clean_case, clean_ai_analysis)
    suspicious_result = calculate_risk(
        suspicious_case,
        suspicious_ai_analysis,
    )
    sample_email_result = calculate_risk(
        sample_email_case,
        sample_ai_analysis,
    )

    assert clean_result["risk_level"] == "low"
    for result in (clean_result, suspicious_result):
        assert isinstance(result["score"], int)
        assert 0 <= result["score"] <= 100
    assert 0 <= sample_email_result["score"] <= 100
    assert sample_email_result["risk_level"] in {
        "low",
        "medium",
        "high",
        "critical",
    }

    print("Case 1: clean email")
    pprint(clean_result)
    print("\nCase 2: suspicious email")
    pprint(suspicious_result)
    print("\nCase 3: suspicious_test.eml scenario")
    pprint(sample_email_result)


if __name__ == "__main__":
    main()