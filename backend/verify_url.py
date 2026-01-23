import httpx
import asyncio

async def check_url(url):
    print(f"Testing {url}...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json={}, timeout=10)
            print(f"Status for {url}: {response.status_code}")
    except Exception as e:
        print(f"Error for {url}: {e}")

async def main():
    urls = [
        "https://api.intelligence.io.solutions/api/v1/chat/completions",
        "https://api.intelligence.io.solutions/v1/chat/completions"
    ]
    await asyncio.gather(*(check_url(url) for url in urls))

if __name__ == "__main__":
    asyncio.run(main())
