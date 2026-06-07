#!/bin/bash
# Comprehensive Mouvelle' browser test script v2
cd /home/z/my-project

# Kill any existing server and start fresh
pkill -f "server.js" 2>/dev/null || true
sleep 2
node .next/standalone/server.js > /tmp/mouvelle-server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
sleep 5

if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "FATAL: Server failed to start"
  exit 1
fi
echo "Server started"

# Close browser and start fresh
agent-browser close 2>/dev/null || true
sleep 1

# Open homepage
agent-browser open http://localhost:81/ 2>&1
sleep 4
agent-browser wait --load networkidle 2>&1 || true
agent-browser wait 3000 2>&1 || true

echo "============================================================"
echo "Mouvelle' E-COMMERCE APP - BROWSER CONSOLE ERROR TESTS"
echo "============================================================"

# ============================================================
# TEST 1: HOMEPAGE
# ============================================================
echo ""
echo "=============================="
echo "TEST 1: HOMEPAGE"
echo "=============================="
agent-browser errors --clear 2>&1 || true
agent-browser console --clear 2>&1 || true
sleep 2

TITLE=$(agent-browser eval "document.title" 2>&1)
BODY_LEN=$(agent-browser eval "document.body.innerHTML.length" 2>&1)
ERRORS=$(agent-browser errors 2>&1)
CONSOLE=$(agent-browser console 2>&1)
echo "  Page Title: $TITLE"
echo "  Body Content: ${BODY_LEN} bytes"
echo "  Loads Correctly: $([ "$BODY_LEN" -gt 1000 ] && echo 'YES' || echo 'NO')"
echo "  JavaScript Errors: ${ERRORS:-None}"
echo "  Console Warnings: ${CONSOLE:-None}"

# ============================================================
# TEST 2: SHOP PAGE
# ============================================================
echo ""
echo "=============================="
echo "TEST 2: SHOP PAGE"
echo "=============================="
agent-browser errors --clear 2>&1 || true
agent-browser console --clear 2>&1 || true

# Get the SHOP button ref and click it
SNAPSHOT=$(agent-browser snapshot -i 2>&1)
SHOP_REF=$(echo "$SNAPSHOT" | rg 'button "SHOP"' | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "  Found SHOP button ref: $SHOP_REF"

if [ -n "$SHOP_REF" ]; then
  agent-browser click @${SHOP_REF} 2>&1 || true
  sleep 3
  agent-browser wait 2000 2>&1 || true
fi

BODY_LEN=$(agent-browser eval "document.body.innerHTML.length" 2>&1)
SHOP_HEADING=$(agent-browser eval "
  const hs = document.querySelectorAll('h1');
  Array.from(hs).map(h => h.textContent).join(' | ');
" 2>&1)
ERRORS=$(agent-browser errors 2>&1)
CONSOLE=$(agent-browser console 2>&1)
echo "  Main Headings: $SHOP_HEADING"
echo "  Body Content: ${BODY_LEN} bytes"
echo "  Loads Correctly: $([ "$BODY_LEN" -gt 1000 ] && echo 'YES' || echo 'NO')"
echo "  JavaScript Errors: ${ERRORS:-None}"
echo "  Console Warnings: ${CONSOLE:-None}"

# ============================================================
# TEST 3: PRODUCT DETAIL PAGE
# ============================================================
echo ""
echo "=============================="
echo "TEST 3: PRODUCT DETAIL PAGE"
echo "=============================="
agent-browser errors --clear 2>&1 || true
agent-browser console --clear 2>&1 || true

# Try to navigate to product detail via JavaScript by clicking product card
agent-browser eval "
  const productCard = document.querySelector('[class*=\"group cursor-pointer\"]');
  if(productCard) {
    productCard.click();
    'Clicked product card';
  } else {
    'No product card found';
  }
" 2>&1 || true

sleep 3
agent-browser wait 2000 2>&1 || true

BODY_LEN=$(agent-browser eval "document.body.innerHTML.length" 2>&1)
PROD_HEADING=$(agent-browser eval "
  const hs = document.querySelectorAll('h1, h2');
  Array.from(hs).slice(0, 5).map(h => h.textContent.substring(0, 50)).join(' | ');
" 2>&1)
ERRORS=$(agent-browser errors 2>&1)
CONSOLE=$(agent-browser console 2>&1)
echo "  Main Headings: $PROD_HEADING"
echo "  Body Content: ${BODY_LEN} bytes"
echo "  Loads Correctly: $([ "$BODY_LEN" -gt 1000 ] && echo 'YES' || echo 'NO')"
echo "  JavaScript Errors: ${ERRORS:-None}"
echo "  Console Warnings: ${CONSOLE:-None}"

# Also try using the interactive snapshot to find and click a product
SNAPSHOT=$(agent-browser snapshot -i 2>&1)
PROD_REF=$(echo "$SNAPSHOT" | rg "Quick View" | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "  Found Quick View product ref: $PROD_REF"
if [ -n "$PROD_REF" ]; then
  # Click the product card (parent of Quick View)
  PROD_PARENT=$(echo "$SNAPSHOT" | rg -B1 "Quick View" | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
  echo "  Product card parent ref: $PROD_PARENT"
  if [ "$PROD_PARENT" != "$PROD_REF" ] && [ -n "$PROD_PARENT" ]; then
    agent-browser click @${PROD_PARENT} 2>&1 || true
    sleep 3
    agent-browser wait 2000 2>&1 || true
    
    BODY_LEN2=$(agent-browser eval "document.body.innerHTML.length" 2>&1)
    PROD_HEADING2=$(agent-browser eval "
      const hs2 = document.querySelectorAll('h1, h2');
      Array.from(hs2).slice(0, 5).map(h => h.textContent.substring(0, 50)).join(' | ');
    " 2>&1)
    ERRORS2=$(agent-browser errors 2>&1)
    CONSOLE2=$(agent-browser console 2>&1)
    echo "  After product click:"
    echo "    Main Headings: $PROD_HEADING2"
    echo "    Body Content: ${BODY_LEN2} bytes"
    echo "    Loads Correctly: $([ "$BODY_LEN2" -gt 1000 ] && echo 'YES' || echo 'NO')"
    echo "    JavaScript Errors: ${ERRORS2:-None}"
    echo "    Console Warnings: ${CONSOLE2:-None}"
  fi
fi

# ============================================================
# TEST 4: WISHLIST PAGE
# ============================================================
echo ""
echo "=============================="
echo "TEST 4: WISHLIST PAGE"
echo "=============================="
agent-browser errors --clear 2>&1 || true
agent-browser console --clear 2>&1 || true

SNAPSHOT=$(agent-browser snapshot -i 2>&1)
WISH_REF=$(echo "$SNAPSHOT" | rg 'button "Wishlist"' | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "  Found Wishlist button ref: $WISH_REF"

if [ -n "$WISH_REF" ]; then
  agent-browser click @${WISH_REF} 2>&1 || true
  sleep 3
  agent-browser wait 2000 2>&1 || true
fi

BODY_LEN=$(agent-browser eval "document.body.innerHTML.length" 2>&1)
WISH_HEADING=$(agent-browser eval "
  const hs3 = document.querySelectorAll('h1, h2');
  Array.from(hs3).slice(0, 3).map(h => h.textContent.substring(0, 50)).join(' | ');
" 2>&1)
ERRORS=$(agent-browser errors 2>&1)
CONSOLE=$(agent-browser console 2>&1)
echo "  Main Headings: $WISH_HEADING"
echo "  Body Content: ${BODY_LEN} bytes"
echo "  Loads Correctly: $([ "$BODY_LEN" -gt 1000 ] && echo 'YES' || echo 'NO')"
echo "  JavaScript Errors: ${ERRORS:-None}"
echo "  Console Warnings: ${CONSOLE:-None}"

# ============================================================
# TEST 5: ACCOUNT PAGE
# ============================================================
echo ""
echo "=============================="
echo "TEST 5: ACCOUNT PAGE"
echo "=============================="
agent-browser errors --clear 2>&1 || true
agent-browser console --clear 2>&1 || true

# Account is in mobile menu. First open mobile menu
SNAPSHOT=$(agent-browser snapshot -i 2>&1)
# Look for the hamburger menu button (Open menu)
MENU_REF=$(echo "$SNAPSHOT" | rg 'Open menu' | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "  Found menu button ref: $MENU_REF"

if [ -n "$MENU_REF" ]; then
  agent-browser click @${MENU_REF} 2>&1 || true
  sleep 2
  agent-browser wait 1000 2>&1 || true
  
  # Now find the Account button in the mobile menu
  SNAPSHOT2=$(agent-browser snapshot -i 2>&1)
  ACCT_REF=$(echo "$SNAPSHOT2" | rg -i "Account" | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
  echo "  Found Account button ref: $ACCT_REF"
  
  if [ -n "$ACCT_REF" ]; then
    agent-browser click @${ACCT_REF} 2>&1 || true
    sleep 3
    agent-browser wait 2000 2>&1 || true
  fi
fi

BODY_LEN=$(agent-browser eval "document.body.innerHTML.length" 2>&1)
ACCT_HEADING=$(agent-browser eval "
  const hs4 = document.querySelectorAll('h1, h2');
  Array.from(hs4).slice(0, 3).map(h => h.textContent.substring(0, 50)).join(' | ');
" 2>&1)
ERRORS=$(agent-browser errors 2>&1)
CONSOLE=$(agent-browser console 2>&1)
echo "  Main Headings: $ACCT_HEADING"
echo "  Body Content: ${BODY_LEN} bytes"
echo "  Loads Correctly: $([ "$BODY_LEN" -gt 1000 ] && echo 'YES' || echo 'NO')"
echo "  JavaScript Errors: ${ERRORS:-None}"
echo "  Console Warnings: ${CONSOLE:-None}"

# ============================================================
# TEST 6: CART SIDEBAR
# ============================================================
echo ""
echo "=============================="
echo "TEST 6: CART SIDEBAR"
echo "=============================="
agent-browser errors --clear 2>&1 || true
agent-browser console --clear 2>&1 || true

# The CartSidebar is opened by setting isCartOpen to true in the Zustand store
# We can trigger it by clicking the Shopping bag button which navigates to 'cart' page
# But the sidebar itself is a Sheet component that opens based on isCartOpen state
# Let's first click the Shopping bag to go to cart page, and also try opening the sidebar

SNAPSHOT=$(agent-browser snapshot -i 2>&1)
BAG_REF=$(echo "$SNAPSHOT" | rg 'Shopping bag' | head -1 | sed 's/.*\[ref=\([^]]*\)\].*/\1/')
echo "  Found Shopping bag button ref: $BAG_REF"

if [ -n "$BAG_REF" ]; then
  agent-browser click @${BAG_REF} 2>&1 || true
  sleep 3
  agent-browser wait 2000 2>&1 || true
fi

BODY_LEN=$(agent-browser eval "document.body.innerHTML.length" 2>&1)
CART_HEADING=$(agent-browser eval "
  const hs5 = document.querySelectorAll('h1, h2, h3');
  Array.from(hs5).slice(0, 5).map(h => h.textContent.substring(0, 50)).join(' | ');
" 2>&1)
ERRORS=$(agent-browser errors 2>&1)
CONSOLE=$(agent-browser console 2>&1)
echo "  Main Headings: $CART_HEADING"
echo "  Body Content: ${BODY_LEN} bytes"
echo "  Loads Correctly: $([ "$BODY_LEN" -gt 1000 ] && echo 'YES' || echo 'NO')"
echo "  JavaScript Errors: ${ERRORS:-None}"
echo "  Console Warnings: ${CONSOLE:-None}"

# Also try opening the cart sidebar via the store
agent-browser eval "
  // Try to find the Zustand cart store and open the sidebar
  // The store is persisted under 'mouvelle-cart' key
  try {
    const cartData = JSON.parse(localStorage.getItem('mouvelle-cart'));
    'Cart data: ' + JSON.stringify(cartData).substring(0, 100);
  } catch(e) {
    'Could not read cart: ' + e.message;
  }
" 2>&1 || true

# ============================================================
# SUMMARY
# ============================================================
echo ""
echo "============================================================"
echo "FINAL SUMMARY"
echo "============================================================"
echo "Test completed. Check results above."

# Check server status
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "Server is still running (PID: $SERVER_PID)"
else
  echo "WARNING: Server died during testing"
fi

# Clean up
kill $SERVER_PID 2>/dev/null || true
