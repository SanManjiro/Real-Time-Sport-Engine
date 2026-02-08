#!/usr/bin/env bash
echo "Testing Rate Limit (429)..."
echo "Sending 70 requests in 2 seconds (limit is 50)..."
echo ""

PORT=${PORT:-3000}

for i in {1..70}; do
  curl -s -o /dev/null -w "Request #$i: HTTP %{http_code}\n" http://localhost:${PORT}/matches &
done
wait

echo ""
echo "✅ If you see HTTP 429, rate limiting works!"

