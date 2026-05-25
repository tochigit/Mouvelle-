#!/bin/bash
# Comprehensive ÈLARA browser test script
# Starts server, tests all pages, reports errors

set -e

cd /home/z/my-project

# Kill any existing server
pkill -f "server.js" 2>/dev/null || true
sleep 2

# Start server
node .next/standalone/server.js > /tmp/elara-server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
sleep 5

# Verify server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "FATAL: Server failed to start"
  cat /tmp/elara-server.log
  exit 1
fi
echo "Server started successfully"

# Close any existing browser
agent-browser close 2>/dev/null || true
sleep 1

# Results array
RESULTS=""

# Function to test a page
test_page() {
  local page_name="$1"
  local action="$2"
  
  echo ""
  echo "==========================================================="
  echo "TESTING: $page_name"
  echo "==========================================================="
  
  agent-browser errors --clear 2>/dev/null
  agent-browser console --clear 2>/dev/null
  
  # Execute the navigation action
  eval "$action"
  sleep 3
  agent-browser wait 2000 2>/dev/null || true
  
  # Collect results
  local body_len=$(agent-browser eval "document.body.innerHTML.length" 2>&1 || echo "0")
  local loads=$([ "$body_len" -gt 1000 ] && echo "YES" || echo "NO")
  local errors=$(agent-browser errors 2>&1 || echo "")
  local console_msgs=$(agent-browser console 2>&1 || echo "")
  
  echo "  Body Length: $body_len"
  echo "  Loads Correctly: $loads"
  echo "  JS Errors: ${errors:-None}"
  echo "  Console Warnings: ${console_msgs:-None}"
  
  # Check if server is still alive
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "  WARNING: Server died during test!"
    # Restart server
    node .next/standalone/server.js > /tmp/elara-server.log 2>&1 &
    SERVER_PID=$!
    sleep 4
    echo "  Server restarted with PID: $SERVER_PID"
  fi
  
  RESULTS="${RESULTS}
${page_name}: loads=${loads}, errors=${errors:-None}, warnings=${console_msgs:-None}"
}

# ============================================================
# TEST 1: HOMEPAGE
# ============================================================
test_page "Homepage" "agent-browser open http://localhost:81/ 2>&1 && sleep 3 && agent-browser wait --load networkidle 2>&1 || true"

# ============================================================
# TEST 2: SHOP PAGE
# ============================================================
# Get SHOP button ref and click it
SHOP_REF=$(agent-browser snapshot -i 2>&1 | rg "button \"SHOP\"" | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "Found SHOP button ref: $SHOP_REF"
test_page "Shop Page" "agent-browser click @${SHOP_REF} 2>&1"

# ============================================================
# TEST 3: PRODUCT DETAIL PAGE
# ============================================================
# Find a product card and click it
PROD_REF=$(agent-browser snapshot -i 2>&1 | rg "Quick View" | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "Found product card ref: $PROD_REF"
if [ -n "$PROD_REF" ]; then
  test_page "Product Detail Page" "agent-browser click @${PROD_REF} 2>&1"
else
  echo "No product card found, trying to navigate directly"
  # Navigate to shop first and try again
  agent-browser snapshot -i 2>&1 | head -10
  RESULTS="${RESULTS}
Product Detail Page: SKIPPED - could not find product card"
fi

# ============================================================
# TEST 4: WISHLIST PAGE
# ============================================================
WISH_REF=$(agent-browser snapshot -i 2>&1 | rg "Wishlist" | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "Found Wishlist button ref: $WISH_REF"
test_page "Wishlist Page" "agent-browser click @${WISH_REF} 2>&1"

# ============================================================
# TEST 5: ACCOUNT PAGE
# ============================================================
# Look for account/user icon
ACCT_REF=$(agent-browser snapshot -i 2>&1 | rg -i "account\|user\|profile\|person" | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "Found Account button ref: $ACCT_REF"
if [ -n "$ACCT_REF" ]; then
  test_page "Account Page" "agent-browser click @${ACCT_REF} 2>&1"
else
  echo "No account button found, checking all interactive elements"
  agent-browser snapshot -i 2>&1 | head -15
  RESULTS="${RESULTS}
Account Page: SKIPPED - could not find account button"
fi

# ============================================================
# TEST 6: CART SIDEBAR
# ============================================================
CART_REF=$(agent-browser snapshot -i 2>&1 | rg -i "Shopping bag\|cart\|bag" | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "Found Cart button ref: $CART_REF"
test_page "Cart Sidebar" "agent-browser click @${CART_REF} 2>&1"

# ============================================================
# SUMMARY
# ============================================================
echo ""
echo "============================================================"
echo "SUMMARY OF ALL TESTS"
echo "============================================================"
echo "$RESULTS"

# Clean up
kill $SERVER_PID 2>/dev/null || true
