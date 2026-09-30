from pprint import pprint

from parsers.timeline_analysis import analyze_timeline


def main() -> None:
    normal_raw = (
        "from mail.example.com (mail.example.com [203.0.113.50]) "
        "by mx.example.net with ESMTPS id ABC123; "
        "Wed, 30 Sep 2026 10:30:01 +0530"
    )
    normal_result = analyze_timeline(
        [
            {
                "hop": 1,
                "from_host": "mail.example.com",
                "from_ip": "203.0.113.50",
                "to_host": "mx.example.net",
                "protocol": "ESMTPS",
                "raw": normal_raw,
            }
        ]
    )
    normal_event = normal_result["events"][0]
    assert normal_event["timestamp"] == "2026-09-30T10:30:01+05:30"
    assert normal_event["event_type"] == "relay"
    assert normal_result["summary"] == {
        "hop_count": 1,
        "first_observed": "2026-09-30T10:30:01+05:30",
        "last_observed": "2026-09-30T10:30:01+05:30",
    }
    print("Case 1: one valid Received header")
    pprint(normal_result)

    multiple_result = analyze_timeline(
        [
            {
                "hop": 1,
                "from_host": "mx.example.net",
                "from_ip": "198.51.100.20",
                "to_host": "mail.example.com",
                "protocol": "ESMTPS",
                "raw": "from mx.example.net by mail.example.com with ESMTPS; "
                "Wed, 30 Sep 2026 10:31:00 +0530",
            },
            {
                "hop": 2,
                "from_host": "mail.example.com",
                "from_ip": "203.0.113.50",
                "to_host": "mx.example.net",
                "protocol": "ESMTP",
                "raw": "from mail.example.com by mx.example.net with ESMTP; "
                "Wed, 30 Sep 2026 10:29:00 +0530",
            },
        ]
    )
    assert [event["hop"] for event in multiple_result["events"]] == [1, 2]
    assert multiple_result["summary"]["hop_count"] == 2
    assert multiple_result["summary"]["first_observed"] == (
        "2026-09-30T10:29:00+05:30"
    )
    assert multiple_result["summary"]["last_observed"] == (
        "2026-09-30T10:31:00+05:30"
    )
    print("\nCase 2: multiple relay hops")
    pprint(multiple_result)

    malformed_result = analyze_timeline(
        [
            {
                "hop": 1,
                "from_host": "relay.example.net",
                "from_ip": "203.0.113.8",
                "to_host": "mx.example.net",
                "protocol": "ESMTP",
                "raw": "from relay.example.net by mx.example.net with ESMTP id NO_DATE",
            }
        ]
    )
    assert malformed_result["events"][0]["timestamp"] is None
    assert malformed_result["summary"] == {
        "hop_count": 1,
        "first_observed": None,
        "last_observed": None,
    }
    print("\nCase 3: missing/malformed timestamp")
    pprint(malformed_result)


if __name__ == "__main__":
    main()