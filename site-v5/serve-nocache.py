#!/usr/bin/env python3
"""Local dev server for site-v5 that disables all HTTP caching.

Plain `python -m http.server` lets browsers cache index.html/styles.css/
main.js aggressively, so edits don't show up without a hard-refresh. This
sends Cache-Control: no-store on every response so every reload is always
the current files on disk.
"""
import http.server
import os
import sys

PORT = 8095

# Always serve this script's own folder, regardless of the process's cwd.
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    with http.server.ThreadingHTTPServer(("", port), NoCacheHandler) as httpd:
        print(f"Serving site-v5 with no-cache headers on http://localhost:{port}")
        httpd.serve_forever()
