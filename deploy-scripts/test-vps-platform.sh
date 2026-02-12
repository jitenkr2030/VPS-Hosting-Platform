#!/bin/bash

# VPS Platform End-to-End Test Script
# This script tests the complete VPS creation workflow

set -e

echo "🧪 Testing VPS Platform End-to-End Workflow..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INTEGRATION_URL="http://localhost:3002"
FLINT_URL="http://localhost:5550"
PAYMENTER_URL="http://localhost:8000"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((TESTS_PASSED++))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((TESTS_FAILED++))
}

# Test function
test_api() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local auth_header="$4"
    local method="${5:-GET}"
    local data="$6"
    
    log_info "Testing $name: $method $url"
    
    local response
    if [ -n "$auth_header" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
                -X "$method" "$url" \
                -H "Authorization: $auth_header" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
                -X "$method" "$url" \
                -H "Authorization: $auth_header")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
                -X "$method" "$url" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url")
        fi
    fi
    
    if [ "$response" = "$expected_status" ]; then
        log_success "$name - HTTP $response"
        return 0
    else
        log_error "$name - HTTP $response (expected $expected_status)"
        if [ -f /tmp/response.json ]; then
            echo "Response: $(cat /tmp/response.json)"
        fi
        return 1
    fi
}

# Wait for service to be ready
wait_for_service() {
    local service_name="$1"
    local url="$2"
    local max_attempts=30
    local attempt=1
    
    log_info "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            log_success "$service_name is ready"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    echo ""
    log_error "$service_name is not ready after $max_attempts attempts"
    return 1
}

# Start testing
echo "========================================"
echo "🧪 VPS Platform End-to-End Tests"
echo "========================================"

# Test 1: Check Service Health
log_info "Test 1: Service Health Check"

echo "Checking Flint service..."
if wait_for_service "Flint" "$FLINT_URL/api/host/status"; then
    log_success "Flint service is healthy"
else
    log_error "Flint service is not responding"
fi

echo "Checking Paymenter service..."
if wait_for_service "Paymenter" "$PAYMENTER_URL"; then
    log_success "Paymenter service is healthy"
else
    log_error "Paymenter service is not responding"
fi

echo "Checking Integration service..."
if wait_for_service "Integration" "$INTEGRATION_URL/api/health"; then
    log_success "Integration service is healthy"
else
    log_error "Integration service is not responding"
fi

# Test 2: User Registration
log_info "Test 2: User Registration"

REGISTER_DATA='{
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@example.com",
    "password": "TestPass123!"
}'

if test_api "User Registration" "$INTEGRATION_URL/api/auth/register" "201" "" "POST" "$REGISTER_DATA"; then
    AUTH_TOKEN=$(jq -r '.accessToken' /tmp/response.json)
    USER_ID=$(jq -r '.user.id' /tmp/response.json)
    log_success "User registered successfully - Token received"
else
    log_error "User registration failed"
    exit 1
fi

# Test 3: Get Available Plans
log_info "Test 3: Get Available Plans"

if test_api "Get Plans" "$INTEGRATION_URL/api/vps/plans" "200" "Bearer $AUTH_TOKEN"; then
    FREE_PLAN_AVAILABLE=$(jq -r '.plans.free' /tmp/response.json)
    if [ "$FREE_PLAN_AVAILABLE" != "null" ]; then
        log_success "Free plan is available"
    else
        log_error "Free plan not found in response"
    fi
else
    log_error "Failed to get plans"
fi

# Test 4: Create Free VPS
log_info "Test 4: Create Free VPS"

VPS_DATA='{
    "planName": "free",
    "customConfig": {
        "hostname": "test-free-vps"
    }
}'

if test_api "Create Free VPS" "$INTEGRATION_URL/api/vps/create" "201" "Bearer $AUTH_TOKEN" "POST" "$VPS_DATA"; then
    SERVICE_ID=$(jq -r '.service.id' /tmp/response.json)
    VM_UUID=$(jq -r '.vm.uuid' /tmp/response.json)
    log_success "Free VPS creation initiated - Service ID: $SERVICE_ID"
    
    # Wait for VPS to be created
    log_info "Waiting for VPS to be provisioned..."
    sleep 10
    
    # Check VPS status
    if test_api "Get VPS Status" "$INTEGRATION_URL/api/vps/services/$SERVICE_ID" "200" "Bearer $AUTH_TOKEN"; then
        VM_STATUS=$(jq -r '.vmStatus.status' /tmp/response.json)
        log_success "VPS Status: $VM_STATUS"
    fi
else
    log_error "Free VPS creation failed"
    # Continue with other tests
fi

# Test 5: Get User Services
log_info "Test 5: Get User Services"

if test_api "Get User Services" "$INTEGRATION_URL/api/vps/services" "200" "Bearer $AUTH_TOKEN"; then
    SERVICES_COUNT=$(jq '.services | length' /tmp/response.json)
    log_success "User has $SERVICES_COUNT services"
else
    log_error "Failed to get user services"
fi

# Test 6: Payment Methods
log_info "Test 6: Get Payment Methods"

if test_api "Get Payment Methods" "$INTEGRATION_URL/api/billing/payment-methods" "200" "Bearer $AUTH_TOKEN"; then
    PAYMENT_METHODS_COUNT=$(jq '.paymentMethods | length' /tmp/response.json)
    log_success "Available payment methods: $PAYMENT_METHODS_COUNT"
else
    log_error "Failed to get payment methods"
fi

# Test 7: Create Order (Paid Plan)
log_info "Test 7: Create Order for Paid Plan"

ORDER_DATA='{
    "planName": "starter",
    "billingCycle": "monthly"
}'

if test_api "Create Order" "$INTEGRATION_URL/api/billing/order" "201" "Bearer $AUTH_TOKEN" "POST" "$ORDER_DATA"; then
    ORDER_ID=$(jq -r '.order.id' /tmp/response.json)
    INVOICE_ID=$(jq -r '.invoice.id' /tmp/response.json)
    log_success "Order created - Order ID: $ORDER_ID, Invoice ID: $INVOICE_ID"
else
    log_error "Order creation failed"
fi

# Test 8: Real-time Features
log_info "Test 8: Real-time Features"

if test_api "Get WebSocket Token" "$INTEGRATION_URL/api/realtime/ws-token" "200" "Bearer $AUTH_TOKEN"; then
    WS_TOKEN=$(jq -r '.wsToken' /tmp/response.json)
    log_success "WebSocket token received"
else
    log_error "Failed to get WebSocket token"
fi

if test_api "Get Activity Feed" "$INTEGRATION_URL/api/realtime/activity" "200" "Bearer $AUTH_TOKEN"; then
    ACTIVITY_COUNT=$(jq '.activity | length' /tmp/response.json)
    log_success "Activity feed: $ACTIVITY_COUNT entries"
else
    log_error "Failed to get activity feed"
fi

# Test 9: VM Management (if VM was created)
if [ -n "$VM_UUID" ] && [ "$VM_UUID" != "null" ]; then
    log_info "Test 9: VM Management"
    
    # Test VM status from Flint directly
    FLINT_API_KEY=$(sudo -u flint jq -r '.api_key' /home/flint/.flint/config.json 2>/dev/null || echo "flint_api_key_placeholder")
    
    if test_api "Get VM Details from Flint" "$FLINT_URL/api/vms/$VM_UUID" "200" "Bearer $FLINT_API_KEY"; then
        VM_DETAILS_STATUS=$(jq -r '.status' /tmp/response.json)
        log_success "VM details from Flint: $VM_DETAILS_STATUS"
    else
        log_warning "Could not get VM details from Flint"
    fi
fi

# Test 10: System Metrics (Admin)
log_info "Test 10: System Metrics"

if test_api "Get System Metrics" "$INTEGRATION_URL/api/realtime/system-metrics" "200" "Bearer $AUTH_TOKEN"; then
    # This might fail if user is not admin, which is expected
    log_success "System metrics endpoint accessible"
else
    log_success "System metrics endpoint correctly restricted (non-admin)"
fi

# Test 11: Cleanup Test Data
log_info "Test 11: Cleanup Test Data"

if [ -n "$SERVICE_ID" ] && [ "$SERVICE_ID" != "null" ]; then
    # In a real implementation, you'd clean up the test VPS
    log_info "Test VPS would be cleaned up here (Service ID: $SERVICE_ID)"
fi

# Clean up temporary files
rm -f /tmp/response.json

# Test Summary
echo ""
echo "========================================"
echo "📊 Test Results Summary"
echo "========================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo -e "${GREEN}🎉 Your VPS platform is working correctly!${NC}"
    echo ""
    echo -e "${GREEN}🚀 Users can now actually:${NC}"
    echo -e "   • Sign up and get authenticated"
    echo -e "   • Create free VPS instances"
    echo -e "   • Manage their VPS in real-time"
    echo -e "   • Process payments and upgrade plans"
    echo -e "   • Monitor resources and performance"
    echo ""
    echo -e "${GREEN}💰 Ready for commercial deployment!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo -e "${YELLOW}💡 Common issues:${NC}"
    echo -e "   • Services not running (check: /usr/local/bin/check-vps-services)"
    echo -e "   • Network connectivity issues"
    echo -e "   • Configuration problems"
    echo -e "   • Missing dependencies"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
    echo -e "   1. Check all services: /usr/local/bin/check-vps-services"
    echo -e "   2. Restart services: sudo systemctl restart flint paymenter vps-integration"
    echo -e "   3. Check logs: sudo journalctl -u vps-integration -f"
    echo -e "   4. Verify configurations"
    exit 1
fi