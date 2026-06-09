from http.server import BaseHTTPRequestHandler
import json
import urllib.request
from datetime import datetime, timezone

USERNAMES = ["Yadi12", "PranjaliJaiswal", "aditishukla_16", "jeetupal31", "ramuk13476"]
BASE_URL = "https://leetcode-api-pied.vercel.app/user/{}/submissions?limit=20"


def get_today_solved(username):
    url = BASE_URL.format(username)
    try:
        req = urllib.request.Request(url, headers={"accept": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())

        today = datetime.now(timezone.utc).date()

        # API may return {"submission": [...]} or a list directly
        submissions = data.get("submission", data) if isinstance(data, dict) else data

        solved = set()
        for sub in submissions:
            ts = sub.get("timestamp")
            status = sub.get("statusDisplay", "")
            title = sub.get("title") or sub.get("titleSlug", "")

            if ts and status == "Accepted":
                sub_date = datetime.fromtimestamp(int(ts), tz=timezone.utc).date()
                if sub_date == today:
                    solved.add(title)

        return len(solved)

    except Exception as e:
        return f"error: {str(e)}"


class handler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, accept")

    def do_OPTIONS(self):
        # Preflight request
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        results = {username: get_today_solved(username) for username in USERNAMES}

        response = {
            "date_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "solved_today": results,
        }

        body = json.dumps(response, indent=2).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass
