from pprint import pprint

from parsers.relay_analysis import analyze_received_headers


def main() -> None:
    normal_header = (
        "from mail.example.com (mail.example.com [203.0.113.50])\n"
        " by mx.example.net with ESMTPS id ABC123\n"
        " for <testuser@example.com>;\n"
        " Wed, 30 Sep 2026 10:30:01 +0530"
    )
    normal_result = analyze_received_headers([normal_header])
    normal_hop = normal_result["relay_path"][0]
    assert normal_hop["hop"] == 1
    assert normal_hop["from_host"] == "mail.example.com"
    assert normal_hop["from_ip"] == "203.0.113.50"
    assert normal_hop["to_host"] == "mx.example.net"
    assert normal_hop["protocol"] == "ESMTPS"
    assert normal_hop["raw"] == normal_header
    print("Case 1: normal Received header")
    pprint(normal_result)

    multiple_headers = [
        "from edge.example.org (edge.example.org [192.0.2.10]) "
        "by relay.example.net with ESMTP id FIRST; Tue, 29 Sep 2026 09:00:00 +0000",
        "from relay.example.net (relay.example.net [198.51.100.20]) "
        "by mx.example.com with ESMTPS id SECOND; Tue, 29 Sep 2026 09:00:01 +0000",
    ]
    multiple_result = analyze_received_headers(multiple_headers)
    first_hop, second_hop = multiple_result["relay_path"]
    assert first_hop["hop"] == 1
    assert first_hop["from_ip"] == "192.0.2.10"
    assert first_hop["from_host"] == "edge.example.org"
    assert first_hop["to_host"] == "relay.example.net"
    assert first_hop["protocol"] == "ESMTP"
    assert first_hop["raw"] == multiple_headers[0]
    assert second_hop["hop"] == 2
    assert second_hop["from_ip"] == "198.51.100.20"
    assert second_hop["from_host"] == "relay.example.net"
    assert second_hop["to_host"] == "mx.example.com"
    assert second_hop["protocol"] == "ESMTPS"
    assert second_hop["raw"] == multiple_headers[1]
    print("\nCase 2: multiple relay hops")
    pprint(multiple_result)

    malformed_header = "from localhost"
    malformed_result = analyze_received_headers([malformed_header])
    malformed_hop = malformed_result["relay_path"][0]
    assert malformed_hop["hop"] == 1
    assert malformed_hop["from_host"] == "localhost"
    assert malformed_hop["from_ip"] is None
    assert malformed_hop["to_host"] is None
    assert malformed_hop["protocol"] is None
    assert malformed_hop["raw"] == malformed_header
    assert {item["type"] for item in malformed_result["observations"]} == {
        "missing_source_ip",
        "malformed_received_header",
    }
    print("\nCase 3: malformed/minimal Received header")
    pprint(malformed_result)


if __name__ == "__main__":
    main()