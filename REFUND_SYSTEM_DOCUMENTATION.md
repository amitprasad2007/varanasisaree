# Refund System Documentation

## Overview

The refund system is a comprehensive solution for handling product returns and refunds for both online orders and POS sales. It supports multiple refund methods including credit notes and direct money refunds.

## Architecture

### Core Components

1. **Models**
   - `Refund` - Main refund record
   - `RefundItem` - Individual items being refunded
   - `RefundTransaction` - Payment gateway transactions for money refunds
   - `CreditNote` - Store credit issued for credit note refunds

2. **Services**
   - `RefundService` - Core business logic for refund processing
   - `RazorpayRefundService` - Razorpay payment gateway integration
   - `NotificationService` - Customer notifications

3. **Controllers**
   - `RefundManagementController` - Admin refund management
   - `VendorRefundController` - Vendor-specific refund handling

## Refund Flow

### 1. Refund Request Creation

```php
$refundData = [
    'sale_id' => $saleId,           // For POS sales
    'order_id' => $orderId,         // For online orders
    'amount' => 750.00,
    'method' => 'credit_note',      // 'credit_note' | 'money' | 'razorpay'
    'reason' => 'Customer complaint',
    'items' => [
        [
            'product_id' => 1,
            'quantity' => 1,
            'unit_price' => 750.00,
            'total_amount' => 750.00,
            'reason' => 'Damaged item'
        ]
    ]
];

$refund = $refundService->createRefundRequest($refundData);
```

### 2. Approval Process

**Status Flow:** `pending` → `approved` → `processing` → `completed`

```php
// Approve refund
$refund = $refundService->approveRefund($refund, [
    'admin_notes' => 'Approved after review'
]);

// Reject refund
$refund = $refundService->rejectRefund($refund, 'Insufficient evidence', [
    'admin_notes' => 'Customer did not provide proof'
]);
```

### 3. Processing

The system automatically processes approved refunds based on the method:

- **Credit Note**: Creates a `CreditNote` record with store credit
- **Money Refund**: Creates a `RefundTransaction` and processes through payment gateway

## Database Schema

### Refunds Table
```sql
- id (primary key)
- sale_id (foreign key to sales)
- order_id (foreign key to orders)
- customer_id (foreign key to customers)
- vendor_id (foreign key to vendors)
- amount (decimal)
- method (enum: credit_note, money, razorpay)
- refund_status (enum: pending, approved, rejected, processing, completed, failed)
- reason (text)
- admin_notes (text)
- rejection_reason (text)
- reference (unique string)
- requested_at, approved_at, processed_at, completed_at (timestamps)
```

### Refund Items Table
```sql
- id (primary key)
- refund_id (foreign key)
- product_id (foreign key)
- product_variant_id (foreign key)
- quantity (integer)
- unit_price (decimal)
- total_amount (decimal)
- qc_status (enum: pending, passed, failed)
- qc_notes (text)
```

## API Endpoints

### Admin Routes
- `GET /refunds` - List all refunds
- `GET /refunds/{id}` - Show refund details
- `POST /refunds/{id}/approve` - Approve refund
- `POST /refunds/{id}/reject` - Reject refund
- `POST /refunds/{id}/process` - Process refund
- `PUT /refund-items/{id}/qc-status` - Update QC status

### Frontend Components
- `resources/js/Pages/Admin/Refunds/Index.tsx` - Refunds list
- `resources/js/Pages/Admin/Refunds/Show.tsx` - Refund details
- `resources/js/Pages/Admin/Refunds/Create.tsx` - Create refund

## Error Handling

### Common Errors and Solutions

1. **"Refund cannot be approved. Current status: completed"**
   - Refund is already processed
   - Check refund status before attempting approval

2. **"Total refunds exceed transaction amount"**
   - Attempting to refund more than the original transaction
   - Validate amounts before approval

3. **"No transaction ID found for this refund"**
   - RazorpayRefundService cannot find original payment
   - Check if original payment exists and has transaction_id

### Error Logging
All refund operations are logged with relevant context:

```php
\Log::error('Refund approval failed', [
    'refund_id' => $refund->id,
    'user_id' => $user->id,
    'error' => $e->getMessage(),
]);
```

## Security & Permissions

### Validation Rules
- Admin notes: max 1000 characters
- Rejection reason: min 10 characters, max 1000 characters
- Refund amount: must not exceed source transaction amount

### Status Validation
- Only `pending` refunds can be approved
- Only `pending` or `approved` refunds can be rejected
- Only `approved` refunds can be processed

## Multi-Vendor Support

The system supports multi-vendor scenarios:
- Refunds are isolated by vendor
- Vendors can only manage their own refunds
- Admin users can manage all refunds

## Payment Gateway Integration

### Razorpay Integration
```php
// Process Razorpay refund
$razorpayService = app(\App\Services\RazorpayRefundService::class);
$result = $razorpayService->processRefund($transaction, $amount, $reason);
```

### Supported Methods
- `credit_note` - Store credit
- `money` - Direct money refund
- `razorpay` - Razorpay gateway refund
- `manual` - Manual processing

## Notifications

### Customer Notifications
Customers receive notifications for:
- Refund requested
- Refund approved
- Refund rejected
- Refund completed (credit note)
- Refund completed (money)

### Email Templates
- `emails/refund-status.blade.php` - Refund status updates

## Quality Control (QC) Process

For physical returns, items go through QC:
- `pending` - Item not yet inspected
- `passed` - Item approved for refund
- `failed` - Item rejected

## Testing

### Manual Testing
```bash
# Run complete flow test
php artisan tinker --execute="include 'tmp_rovodev_complete_test.php';"
```

### Test Cases
1. Create refund request
2. Approve refund (credit note)
3. Approve refund (money)
4. Reject refund
5. Partial refunds
6. Multiple refunds for same transaction

## Troubleshooting

### Common Issues

1. **Frontend button not working**
   - Check browser console for JavaScript errors
   - Verify route names are correct
   - Check CSRF token

2. **RazorpayRefundService errors**
   - Verify Razorpay credentials in .env
   - Check if original payment exists
   - Ensure transaction_id is not null

3. **Notification failures**
   - Check email configuration
   - Verify customer email addresses
   - Check NotificationService logs

### Debug Mode
Enable debug logging in `config/logging.php` and monitor logs in `storage/logs/`.

## Configuration

### Environment Variables
```env
RAZOR_KEY_ID=your_razorpay_key
RAZOR_KEY_SECRET=your_razorpay_secret
```

### Config Files
- `config/refunds.php` - Refund-specific configurations
- `config/mail.php` - Email notification settings

## Maintenance

### Regular Tasks
1. Monitor refund statistics
2. Review failed refunds
3. Clean up old notification records
4. Update QC processes

### Database Maintenance
```sql
-- Clean up old notifications (older than 6 months)
DELETE FROM notifications 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH) 
AND type = 'refund_status';
```

## Recent Fixes (November 2025)

1. **Fixed RazorpayRefundService transaction_id issue**
   - Added null checking for order and sale transaction IDs
   - Implemented fallback logic for transaction ID retrieval

2. **Enhanced error handling**
   - Added validation for refund status before operations
   - Improved frontend error messages
   - Added comprehensive logging

3. **Improved frontend debugging**
   - Added console logging for button clicks
   - Enhanced error display for users
   - Added form validation

## Future Improvements

1. **Bulk Operations** - Allow bulk approval/rejection of refunds
2. **Automated QC** - AI-powered quality control for returns
3. **Advanced Reporting** - Detailed analytics and insights
4. **Integration** - Support for additional payment gateways
5. **Mobile App** - Mobile interface for refund management