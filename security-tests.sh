#!/bin/bash

TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdGF0dXMiOiJzdWNjZXNzIiwiZGF0YSI6eyJpZCI6MjEsInVzZXJuYW1lIjoiIiwiZW1haWwiOiJhaWRlbkBnbWFpbC5jb20iLCJwYXNzd29yZCI6ImJhYWYyZDJhMTFjNThiM2M4NTAxNDg5NGVmZDliMmIwIiwicm9sZSI6ImN1c3RvbWVyIiwiZGVsdXhlVG9rZW4iOiIiLCJsYXN0TG9naW5JcCI6IjAuMC4wLjAiLCJwcm9maWxlSW1hZ2UiOiIvYXNzZXRzL3B1YmxpYy9pbWFnZXMvdXBsb2Fkcy9kZWZhdWx0LnN2ZyIsInRvdHBTZWNyZXQiOiIiLCJpc0FjdGl2ZSI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyNS0xMS0wMyAxNjo1Mzo0MS4zMjEgKzAwOjAwIiwidXBkYXRlZEF0IjoiMjAyNS0xMS0wMyAxNjo1Mzo0MS4zMjEgKzAwOjAwIiwiZGVsZXRlZEF0IjpudWxsfSwiaWF0IjoxNzYyMTg4ODIzLCJleHAiOjE3NjIyMDY4MjN9.CsBUtMBnL4f7hXPWtZAhmDeA34LJYvEoeiTZw3MXrTShakKXJD05oP0GkhMq9FdPoJVnaMFt3MJuR-J2b1mey9accJ_m3EFUA2C4MhxO1YPkZq7voMX8ni-E8UJb4k2fdDJvMSfqH72B7dIatYpgeBgDUBXH7dg7mfrIwnni5Xc"
BASKET_ID=6

echo "Running security tests..."
echo ""

# test 1 - deleted product
echo "Test 1: Deleted product"
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "http://localhost:3000/api/BasketItems" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"ProductId\": 10, \"BasketId\": $BASKET_ID, \"quantity\": 1}"
echo "Expected: 400"
echo ""

# test 2 - valid product
echo "Test 2: Valid product"
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "http://localhost:3000/api/BasketItems" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"ProductId\": 1, \"BasketId\": $BASKET_ID, \"quantity\": 1}"
echo "Expected: 200"
echo ""


# test 3 - wrong basket
echo "Test 3: Cross-basket manipulation"
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "http://localhost:3000/api/BasketItems" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"ProductId\": 1, \"BasketId\": 999, \"quantity\": 1}"
echo "Expected: 401"
echo ""

# test 4 - normal operation
echo "Test 4: Own basket access"
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "http://localhost:3000/api/BasketItems" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"ProductId\": 2, \"BasketId\": $BASKET_ID, \"quantity\": 1}"
echo "Expected: 200"
echo ""

echo "Done."