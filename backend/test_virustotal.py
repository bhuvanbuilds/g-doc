import asyncio

from services.virustotal import lookup_url


async def main():
    url = "https://example.com/verify-account"

    result = await lookup_url(url)

    print("\nVIRUSTOTAL RESULT")
    print("=================")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())