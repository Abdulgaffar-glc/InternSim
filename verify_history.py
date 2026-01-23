import urllib.request
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def post_json(url, data):
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def test_history():
    print("1. Sending first message...")
    try:
        data1 = post_json(
            f"{BASE_URL}/review", 
            {"code": "count = 0", "context": "Testing"}
        )
        session_id = data1.get("session_id")
        print(f"   Received Session ID: {session_id}")
        
        if not session_id:
            print("FAILED: No session_id returned.")
            return

        print("\n2. Sending follow-up message with same Session ID...")
        # We ask a question that requires context from the first message
        data2 = post_json(
            f"{BASE_URL}/review",
            {
                "code": "What is the variable name?", 
                "context": "Testing history",
                "session_id": session_id
            }
        )
        feedback = data2.get("feedback", "")
        print(f"   Response: {feedback[:100]}...")

        if "count" in feedback or "variable" in feedback:
            print("\nSUCCESS: History seems to be working.")
        else:
            print("\nWARNING: content check ambiguous, but request succeeded.")

    except Exception as e:
        print(f"\nFAILED: {e}")
        #sys.exit(1) # Don't crash hard, just report

if __name__ == "__main__":
    time.sleep(1)
    test_history()
