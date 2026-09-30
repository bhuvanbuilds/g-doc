from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import Any


def _parse_timestamp(raw_header: Any) -> tuple[str | None, datetime | None]:
    if not isinstance(raw_header, str) or ";" not in raw_header:
        return None, None

    date_text = raw_header.rsplit(";", 1)[-1].strip()
    if not date_text:
        return None, None

    try:
        parsed_timestamp = parsedate_to_datetime(date_text)
    except (IndexError, OverflowError, TypeError, ValueError):
        return None, None

    return parsed_timestamp.isoformat(), parsed_timestamp


def analyze_timeline(relay_path: list[dict[str, Any]]) -> dict[str, Any]:
    """Create a local relay timeline without inferring missing timestamps."""
    if not isinstance(relay_path, (list, tuple)):
        relay_hops = []
    else:
        relay_hops = relay_path

    events = []
    parsed_timestamps = []

    for relay_hop in relay_hops:
        if not isinstance(relay_hop, dict):
            continue

        timestamp, parsed_timestamp = _parse_timestamp(relay_hop.get("raw"))
        events.append(
            {
                "hop": relay_hop.get("hop"),
                "timestamp": timestamp,
                "from_host": relay_hop.get("from_host"),
                "from_ip": relay_hop.get("from_ip"),
                "to_host": relay_hop.get("to_host"),
                "protocol": relay_hop.get("protocol"),
                "event_type": "relay",
            }
        )

        if parsed_timestamp is not None:
            parsed_timestamps.append((parsed_timestamp, timestamp))

    first_observed = None
    last_observed = None
    if parsed_timestamps:
        try:
            ordered_timestamps = sorted(
                parsed_timestamps,
                key=lambda item: item[0],
            )
            first_observed = ordered_timestamps[0][1]
            last_observed = ordered_timestamps[-1][1]
        except TypeError:
            # Mixed aware/naive dates cannot be ordered without assuming a timezone.
            first_observed = parsed_timestamps[0][1]
            last_observed = parsed_timestamps[-1][1]

    return {
        "events": events,
        "summary": {
            "hop_count": len(events),
            "first_observed": first_observed,
            "last_observed": last_observed,
        },
    }