#!/bin/bash
# RANGER Session Management Test Commands
# Category 2 Validation - Quick Reference
# Generated: 2025-12-26

BASE_URL="https://ranger-coordinator-1058891520442.us-central1.run.app"

echo "==================================="
echo "RANGER Session Management Tests"
echo "==================================="

# Test 2.1 & 2.2: Create Session and Capture ID
echo ""
echo "Test 2.1-2.2: Creating new session..."
SESSION_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{}' \
  "$BASE_URL/apps/coordinator/users/test-user/sessions" | jq -r '.id')

echo "Session ID: $SESSION_ID"

# Validate UUID format
if echo "$SESSION_ID" | awk '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ {exit 0} {exit 1}'; then
  echo "✓ Valid UUID format"
else
  echo "✗ Invalid UUID format"
fi

# Test 2.3: Session Persistence
echo ""
echo "Test 2.3: Testing session persistence..."
cat > /tmp/test_message.json <<EOF
{
  "appName": "coordinator",
  "userId": "test-user",
  "session_id": "$SESSION_ID",
  "new_message": {
    "role": "user",
    "parts": [
      {
        "text": "What is the Cedar Creek fire status?"
      }
    ]
  }
}
EOF

echo "Sending message to session..."
curl -N -X POST \
  -H "Content-Type: application/json" \
  -d @/tmp/test_message.json \
  "$BASE_URL/run_sse" \
  --max-time 10 2>&1 | head -20

# Test 2.4: Independent Sessions
echo ""
echo "Test 2.4: Creating two independent sessions..."
SESSION1=$(curl -s -X POST -H "Content-Type: application/json" -d '{}' "$BASE_URL/apps/coordinator/users/test-user/sessions" | jq -r '.id')
echo "Session 1: $SESSION1"

SESSION2=$(curl -s -X POST -H "Content-Type: application/json" -d '{}' "$BASE_URL/apps/coordinator/users/test-user/sessions" | jq -r '.id')
echo "Session 2: $SESSION2"

if [ "$SESSION1" != "$SESSION2" ]; then
  echo "✓ Sessions are independent"
else
  echo "✗ Sessions have same ID (should be different)"
fi

echo ""
echo "==================================="
echo "Tests Complete"
echo "==================================="
