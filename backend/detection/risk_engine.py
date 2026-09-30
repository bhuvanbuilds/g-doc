import json
from typing import Any


OBSERVATION_RULES = {
    "reply_to_mismatch": (
        10,
        "Reply-To domain differs from sender domain",
        "headers",
    ),
    "return_path_mismatch": (
        5,
        "Return-Path domain differs from sender domain",
        "headers",
    ),
    "ip_based_url": (
        20,
        "A URL uses an IP address instead of a domain",
        "urls",
    ),
    "unusual_url_port": (
        15,
        "A URL uses a non-standard port",
        "urls",
    ),
    "unencrypted_url": (
        5,
        "A URL uses HTTP instead of HTTPS",
        "urls",
    ),
    "suspicious_attachment_extension": (
        25,
        "An attachment uses a potentially dangerous file extension",
        "attachments",
    ),
}

AI_SIGNAL_RULES = {
    "credential_harvesting": (
        10,
        "AI detected credential harvesting language",
    ),
    "impersonation": (
        8,
        "AI detected possible impersonation",
    ),
    "phishing_language": (
        8,
        "AI detected phishing language",
    ),
    "urgency": (
        5,
        "AI detected urgency or pressure",
    ),
    "urgency_pressure": (
        5,
        "AI detected urgency or pressure",
    ),
    "social_engineering": (
        8,
        "AI detected social-engineering language",
    ),
    "suspicious_request": (
        5,
        "AI detected a suspicious request",
    ),
    "unusual_sender_behavior": (
        5,
        "AI detected unusual sender behavior",
    ),
}


def _normalize_signal(value: Any) -> str:
    if not isinstance(value, str):
        return ""

    return "_".join(value.strip().lower().replace("-", " ").split())


def _stable_key(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), default=str)


def _as_items(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return [value]
    return []


def _is_positive_number(value: Any) -> bool:
    if isinstance(value, bool):
        return False

    try:
        return float(value) > 0
    except (TypeError, ValueError):
        return False


def calculate_risk(technical_evidence: dict, ai_analysis: dict) -> dict:
    """Calculate a deterministic risk score with capped AI supporting points."""
    if not isinstance(technical_evidence, dict):
        technical_evidence = {}
    if not isinstance(ai_analysis, dict):
        ai_analysis = {}

    breakdown = []
    reasons = []
    technical_categories = set()
    categories = set()
    technical_score = 0
    ai_score = 0

    def add_entry(source: str, signal: str, points: int, reason: str) -> None:
        breakdown.append(
            {
                "source": source,
                "signal": signal,
                "points": points,
                "reason": reason,
            }
        )
        if reason not in reasons:
            reasons.append(reason)

    authentication = technical_evidence.get("authentication")
    if not isinstance(authentication, dict):
        authentication = {}

    for mechanism in ("spf", "dkim", "dmarc"):
        result = _normalize_signal(authentication.get(mechanism))
        if result == "fail":
            points = {"spf": 25, "dkim": 20, "dmarc": 25}[mechanism]
            reason = f"{mechanism.upper()} authentication failed"
        elif result in {"softfail", "permerror", "temperror"}:
            points = 10
            reason = f"{mechanism.upper()} authentication returned {result}"
        else:
            continue

        technical_score += points
        technical_categories.add("authentication")
        categories.add("authentication")
        add_entry("technical", f"{mechanism}_{result}", points, reason)

    observation_lists = [technical_evidence.get("observations")]
    for section_name in ("headers", "authentication", "urls", "attachments"):
        section = technical_evidence.get(section_name)
        if isinstance(section, dict):
            observation_lists.append(section.get("observations"))

    observations = []
    for observation_list in observation_lists:
        observations.extend(_as_items(observation_list))

    seen_observations = set()
    has_observations = False
    for observation in observations:
        if not isinstance(observation, dict):
            continue
        has_observations = True

        signal = _normalize_signal(
            observation.get("type") or observation.get("signal")
        )
        rule = OBSERVATION_RULES.get(signal)
        if not rule:
            continue

        points, reason, category = rule
        evidence_key = _stable_key(observation.get("evidence", {}))
        observation_key = (signal, evidence_key)
        if observation_key in seen_observations:
            continue
        seen_observations.add(observation_key)

        technical_score += points
        technical_categories.add(category)
        categories.add(category)
        add_entry("technical", signal, points, reason)

    virustotal_results = _as_items(technical_evidence.get("virustotal"))
    seen_virustotal_signals = set()
    has_virustotal_detections = False

    for result in virustotal_results:
        if not isinstance(result, dict):
            continue

        stats = result.get("last_analysis_stats")
        if not isinstance(stats, dict):
            continue

        url = result.get("url")
        result_key = url if isinstance(url, str) else _stable_key(result)
        for stat_name, signal, points, reason in (
            (
                "malicious",
                "virustotal_malicious",
                35,
                "VirusTotal reports malicious detections for a URL",
            ),
            (
                "suspicious",
                "virustotal_suspicious",
                20,
                "VirusTotal reports suspicious detections for a URL",
            ),
        ):
            if not _is_positive_number(stats.get(stat_name)):
                continue

            result_signal = (result_key, stat_name)
            if result_signal in seen_virustotal_signals:
                continue
            seen_virustotal_signals.add(result_signal)

            has_virustotal_detections = True
            technical_score += points
            technical_categories.add("virustotal")
            categories.add("virustotal")
            add_entry("technical", signal, points, reason)

    analysis = ai_analysis.get("analysis")
    if not isinstance(analysis, dict):
        analysis = {}

    ai_signals = _as_items(analysis.get("signals"))
    seen_ai_signals = set()
    for ai_signal in ai_signals:
        if isinstance(ai_signal, str):
            signal_name = _normalize_signal(ai_signal)
        elif isinstance(ai_signal, dict):
            signal_name = _normalize_signal(
                ai_signal.get("type") or ai_signal.get("signal")
            )
        else:
            continue

        rule = AI_SIGNAL_RULES.get(signal_name)
        if not rule:
            continue

        signal_key = _stable_key(ai_signal)
        if signal_key in seen_ai_signals:
            continue
        seen_ai_signals.add(signal_key)

        points, reason = rule
        applied_points = min(points, 25 - ai_score)
        if applied_points <= 0:
            continue

        ai_score += applied_points
        categories.add("ai")
        add_entry("ai", signal_name, applied_points, reason)

    score = min(100, technical_score + ai_score)
    if score < 25:
        risk_level = "low"
    elif score < 50:
        risk_level = "medium"
    elif score < 75:
        risk_level = "high"
    else:
        risk_level = "critical"

    confidence = 0.5
    if has_observations or any(
        category != "virustotal" for category in technical_categories
    ):
        confidence += 0.15
    if has_virustotal_detections:
        confidence += 0.15
    if len(categories) > 1:
        confidence += 0.1

    ai_confidence = analysis.get("confidence")
    if (
        isinstance(ai_confidence, (int, float))
        and not isinstance(ai_confidence, bool)
        and 0 <= ai_confidence <= 1
    ):
        confidence += max(0.0, ai_confidence - 0.5) * 0.2

    confidence = round(min(1.0, confidence), 2)

    return {
        "score": score,
        "risk_level": risk_level,
        "confidence": confidence,
        "reasons": reasons,
        "breakdown": breakdown,
    }