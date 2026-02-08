#!/usr/bin/env bash
echo "Testing Rate Limit (429)..."
echo "Sending 60 requests in 2 seconds (limit is 50)..."
echo ""

for i in {1..70}; do
  curl -s -o /dev/null -w "Request #$i: HTTP %{http_code}\n" http://localhost:8000/matches &
done
wait

echo ""
echo "✅ If you see HTTP 429, rate limiting works!"

