# Online Refund & Return System with Razorpay Integration

## Overview

This document describes the complete refund and return system implemented for online customers, integrated with Razorpay payment gateway. The system supports both automatic Razorpay refunds and manual refund methods like credit notes and bank transfers.

## Features

### ✅ Completed Features

1. **Razorpay Integration**
   - Automatic refund processing through Razorpay API
   - Refund eligibility validation
   - Real-time refund status checking
   - Error handling and retry mechanisms

2. **Multiple Refund Methods**
   - Razorpay refunds (automatic)
   - Credit notes (store credit)
   - Bank transfers (manual)
   - Manual processing

3. **Customer Interface**
   - Refund request form with item selection
   - Refund status tracking
   - Credit note management
   - Refund history and statistics

4. **Admin Interface**
   - Refund approval/rejection workflow
   - Bulk refund processing
   - Refund analytics and reporting
   - Razorpay connection testing

5. **Comprehensive Testing**
   - Unit tests for all services
   - Integration tests for API endpoints
   - Mock Razorpay API testing
   - Edge case handling

## Backend Implementation

### Services

#### 1. RazorpayRefundService (`app/Services/RazorpayRefundService.php`)

Handles all Razorpay-specific refund operations:

```php
// Process refund
$result = $razorpayService->processRefund($transaction, $amount, $reason);

// Check refund status
$status = $razorpayService->checkRefundStatus($refundId);

// Validate eligibility
$validation = $razorpayService->validateRefundEligibility($payment, $amount);
```

**Key Methods:**
- `processRefund()` - Creates refund with Razorpay
- `checkRefundStatus()` - Gets refund status from Razorpay
- `validateRefundEligibility()` - Validates if refund is possible
- `testConnection()` - Tests Razorpay API connection

#### 2. Enhanced RefundService (`app/Services/RefundService.php`)

Updated to support Razorpay refunds:

```php
// Create refund request
$refund = $refundService->createRefundRequest($data);

// Approve refund
$refund = $refundService->approveRefund($refund, $data);

// Process refund (handles Razorpay automatically)
$refund = $refundService->processRefund($refund);
```

### Controllers

#### 1. RefundController (`app/Http/Controllers/Api/RefundController.php`)

Customer-facing refund endpoints:

```php
// Customer endpoints
GET    /api/refunds                           // List customer refunds
POST   /api/refunds                           // Create refund request
GET    /api/refunds/{id}                      // Get refund details
POST   /api/refunds/{id}/cancel               // Cancel refund
GET    /api/refunds/check-eligibility         // Check refund eligibility
GET    /api/refunds/check-razorpay-eligibility // Check Razorpay eligibility
POST   /api/refunds/check-razorpay-status     // Check Razorpay refund status
GET    /api/credit-notes                      // Get credit notes
GET    /api/refund-statistics                 // Get refund statistics
```

#### 2. AdminRefundController (`app/Http/Controllers/Api/AdminRefundController.php`)

Admin refund management endpoints:

```php
// Admin endpoints
GET    /api/admin/refunds                     // List all refunds
GET    /api/admin/refunds/{id}                // Get refund details
POST   /api/admin/refunds/{id}/approve        // Approve refund
POST   /api/admin/refunds/{id}/reject         // Reject refund
POST   /api/admin/refunds/{id}/process        // Process refund
POST   /api/admin/refunds/{id}/retry-razorpay // Retry failed Razorpay refund
GET    /api/admin/refunds/status/{status}     // Get refunds by status
GET    /api/admin/refunds/statistics          // Get refund statistics
GET    /api/admin/refunds/test-razorpay       // Test Razorpay connection
```

### Database Schema

#### Refunds Table
```sql
- id (primary key)
- order_id (foreign key to orders)
- sale_id (foreign key to sales)
- customer_id (foreign key to customers)
- amount (decimal)
- method (enum: razorpay, credit_note, bank_transfer, manual)
- status (enum: pending, approved, rejected, processing, completed, cancelled)
- reason (text)
- admin_notes (text, nullable)
- rejection_reason (text, nullable)
- reference (string, unique)
- requested_at (timestamp)
- approved_at (timestamp, nullable)
- processed_at (timestamp, nullable)
- completed_at (timestamp, nullable)
- paid_at (timestamp, nullable)
```

#### Refund Transactions Table
```sql
- id (primary key)
- refund_id (foreign key to refunds)
- transaction_id (string, unique)
- gateway (enum: razorpay, stripe, paytm, manual, bank_transfer)
- status (enum: processing, completed, failed, pending)
- amount (decimal)
- gateway_transaction_id (string, nullable)
- gateway_refund_id (string, nullable)
- gateway_response (json, nullable)
- processed_at (timestamp)
- completed_at (timestamp, nullable)
```

#### Payments Table (Enhanced)
```sql
- refunded_amount (decimal, default 0)
- refund_status (enum: not_refunded, partially_refunded, fully_refunded)
- refund_details (json, nullable)
```

## Frontend Implementation

### Pages

#### 1. RefundRequestPage (`src/pages/RefundRequest.tsx`)

Complete refund request form with:
- Order item selection
- Quantity adjustment
- Refund method selection
- Eligibility checking
- Real-time amount calculation

**Features:**
- Item-by-item refund selection
- Razorpay eligibility validation
- Multiple refund methods
- Form validation
- Error handling

#### 2. RefundManagementPage (`src/pages/RefundManagement.tsx`)

Customer refund dashboard with:
- Refund history
- Credit note management
- Statistics overview
- Status tracking

**Features:**
- Tabbed interface (Refunds/Credit Notes)
- Status badges and icons
- Action buttons (Cancel, View Details)
- Statistics cards
- Empty states

### API Integration

#### Services (`src/services/api.ts`)

Complete API integration with TypeScript interfaces:

```typescript
// Refund interfaces
interface RefundRequest {
  order_id?: number;
  sale_id?: number;
  amount: number;
  method: 'credit_note' | 'money' | 'razorpay' | 'bank_transfer' | 'manual';
  reason: string;
  items?: RefundItem[];
}

interface Refund {
  id: number;
  order_id?: number;
  customer_id: number;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  reason: string;
  reference: string;
  // ... other fields
}

// API functions
export const createRefund = (refundData: RefundRequest) => 
  api.post('/refunds', refundData).then(res => res.data);

export const getRefunds = (params?: { status?: string }) => 
  api.get('/refunds', { params }).then(res => res.data);

export const checkRazorpayEligibility = (orderId: number) => 
  api.get('/refunds/check-razorpay-eligibility', { params: { order_id: orderId } }).then(res => res.data);
```

## Testing

### Test Coverage

#### 1. RazorpayRefundTest (`tests/Feature/RazorpayRefundTest.php`)

Comprehensive test suite covering:

**Eligibility Validation:**
- ✅ Valid refund eligibility
- ✅ Non-captured payment rejection
- ✅ Exceeding refund amount rejection
- ✅ Fully refunded payment rejection

**API Endpoints:**
- ✅ Create refund request
- ✅ Razorpay eligibility check
- ✅ Non-Razorpay order rejection
- ✅ Get customer refunds
- ✅ Cancel pending refund
- ✅ Non-pending refund cancellation
- ✅ Refund statistics

**Razorpay Integration:**
- ✅ Mock Razorpay refund processing
- ✅ Razorpay refund failure handling
- ✅ Refund status checking
- ✅ Connection testing

#### 2. Factory Classes

**RefundFactory** - Creates test refunds with various states
**RefundTransactionFactory** - Creates test refund transactions
**PaymentFactory** - Creates test payments with refund data

### Running Tests

```bash
# Run all refund tests
php artisan test --filter RazorpayRefundTest

# Run specific test
php artisan test --filter "it_can_validate_razorpay_refund_eligibility"

# Run with coverage
php artisan test --coverage --filter RazorpayRefundTest
```

## Configuration

### Environment Variables

```env
# Razorpay Configuration
RAZOR_KEY_ID=rzp_live_RL5JZLkFipqqbJ
RAZOR_KEY_SECRET=your_razorpay_secret_key

# For testing
RAZOR_KEY_ID=rzp_test_your_test_key_id
RAZOR_KEY_SECRET=your_test_secret_key
```

### Razorpay Setup

1. **Get API Keys:**
   - Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Get API keys from Settings > API Keys
   - Use test keys for development

2. **Webhook Configuration:**
   - Set up webhooks for refund events
   - Configure refund success/failure webhooks

3. **Test Mode:**
   - Use test API keys for development
   - Test refunds with small amounts
   - Verify webhook delivery

## Usage Examples

### 1. Customer Refund Request

```typescript
// Frontend: Create refund request
const refundData = {
  order_id: 123,
  amount: 500,
  method: 'razorpay',
  reason: 'Product defect',
  items: [{
    product_id: 1,
    quantity: 1,
    unit_price: 500,
    total_amount: 500,
    reason: 'Product defect'
  }]
};

const response = await createRefund(refundData);
```

### 2. Admin Refund Processing

```php
// Backend: Approve and process refund
$refund = Refund::find(1);
$refundService = app(RefundService::class);

// Approve refund
$refund = $refundService->approveRefund($refund, [
    'admin_notes' => 'Approved after verification'
]);

// Process refund (automatically handles Razorpay)
$refund = $refundService->processRefund($refund);
```

### 3. Razorpay Refund Status Check

```php
// Backend: Check refund status
$razorpayService = app(RazorpayRefundService::class);
$status = $razorpayService->checkRefundStatus('ref_123456789');

if ($status['success']) {
    echo "Refund Status: " . $status['status'];
    echo "Amount: ₹" . $status['amount'];
}
```

## Error Handling

### Common Error Scenarios

1. **Payment Not Captured**
   - Error: "Payment not captured"
   - Solution: Ensure payment is in 'captured' status

2. **Insufficient Refund Amount**
   - Error: "Refund amount exceeds remaining refundable amount"
   - Solution: Check payment refund history

3. **Razorpay API Errors**
   - Error: "Payment not found"
   - Solution: Verify payment ID and Razorpay configuration

4. **Network Timeouts**
   - Error: "Request timeout"
   - Solution: Implement retry mechanism

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## Security Considerations

1. **API Authentication**
   - All endpoints require authentication
   - Customer can only access their own refunds
   - Admin endpoints require admin privileges

2. **Data Validation**
   - Input validation on all endpoints
   - Amount validation (positive numbers)
   - Method validation (allowed values only)

3. **Razorpay Security**
   - API keys stored securely
   - Webhook signature verification
   - HTTPS only for production

## Performance Optimization

1. **Database Indexing**
   - Index on customer_id, order_id, status
   - Composite indexes for common queries

2. **Caching**
   - Cache refund statistics
   - Cache eligibility checks

3. **Async Processing**
   - Queue refund processing for large amounts
   - Background status checking

## Monitoring & Analytics

### Key Metrics

1. **Refund Statistics**
   - Total refunds by status
   - Average refund amount
   - Refund success rate
   - Processing time

2. **Razorpay Metrics**
   - API response times
   - Error rates
   - Refund success rate

3. **Customer Analytics**
   - Refund request frequency
   - Common refund reasons
   - Customer satisfaction

## Future Enhancements

### Planned Features

1. **Advanced Workflow**
   - Multi-level approval process
   - Automated approval rules
   - Escalation mechanisms

2. **Enhanced Analytics**
   - Refund trend analysis
   - Product return patterns
   - Customer behavior insights

3. **Integration Improvements**
   - Multiple payment gateway support
   - Real-time notifications
   - Mobile app integration

4. **Automation**
   - Auto-refund for specific conditions
   - Smart routing based on amount
   - Predictive refund processing

## Support & Maintenance

### Troubleshooting

1. **Common Issues**
   - Check Razorpay API keys
   - Verify webhook configuration
   - Review error logs

2. **Debug Mode**
   - Enable detailed logging
   - Use test environment
   - Monitor API calls

3. **Support Channels**
   - Technical documentation
   - Error logging system
   - Customer support integration

---

## Conclusion

The online refund and return system with Razorpay integration provides a comprehensive solution for handling customer refunds. The system supports multiple refund methods, provides real-time status tracking, and includes robust error handling and testing.

The implementation follows Laravel best practices, includes comprehensive test coverage, and provides both customer and admin interfaces for managing refunds effectively.

For any issues or questions, refer to the test cases and API documentation, or contact the development team.
