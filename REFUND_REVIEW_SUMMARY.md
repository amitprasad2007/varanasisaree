# Return and Refund Process — Unified (Admin/Seller Only)

## Overview
The Return and Refund workflow has been unified across POS returns and Admin refund management. Customers do not initiate or manage refunds in the portal. All actions are performed by Admin/Seller staff and recorded consistently via `RefundService`.

- POS returns create a `SaleReturn` and then open a unified `Refund` with method `credit_note`; the refund is immediately approved and processed (credit note issued).
- Admin can also create/approve/process refunds for Sales or Orders; for online orders, Razorpay is supported via `RazorpayRefundService`.
- Frontend consumers continue to use `refund.status` while the backend uses `refund_status` under the hood.

## Key Components
- `App\Services\RefundService` — single entry point to create, approve/reject, and process refunds (credit note or money/gateway-based).
- `App\Http\Controllers\POS\SaleController@processReturn` — creates `SaleReturn` and calls `RefundService` to issue a credit note refund.
- `App\Http\Controllers\RefundManagementController` — Admin UI for listing, creating, approving/rejecting, and processing refunds.
- `App\Services\RazorpayRefundService` — handles Razorpay refund execution and status checks for online orders.
- `App\Models\Refund` — exposes `status` accessor for compatibility; uses `refund_status` in database.

## Data Flow
1) POS Return
- Staff selects an invoice and quantities to return in `POS/Index.tsx`.
- Backend: `SaleController@processReturn` creates `SaleReturn` + `SaleReturnItem`, restores stock, calculates refund_total.
- Calls `RefundService::createRefundRequest({ sale_id, sale_return_id, amount, method: 'credit_note' })` and then `approveRefund` to complete and issue a `CreditNote`.

2) Admin Refunds
- Staff uses `Admin/Refunds` pages to list and filter refunds by `status` and `refund_type`.
- Creating a refund uses `RefundService::createRefundRequest`, then `approveRefund` or `rejectRefund` as needed.
- For Razorpay orders, `RazorpayRefundService` validates and processes the refund.

## Test Process (How to Validate)

1) Database prep
```bash
php artisan migrate:fresh --seed
```

2) Run automated tests (Feature)
```bash
php artisan test --filter POSRefundTest
```
What’s covered:
- POS return creates `SaleReturn` and items
- Stock restoration
- Refund record created with `refund_status = completed`
- Credit note issuance with correct amounts and status
- Partial return scenario

3) Manual POS validation
- Navigate to `pos.index`
- Create a sale, then open “Process Return / Refund” dialog
- Select invoice, choose items/quantities, confirm
- Verify: credit note is created; stock increments; refund visible under Admin → Refunds

4) Manual Admin validation
- Go to `Admin/Refunds` (route `refunds.index`)
- Verify filters: `status` and `refund_type` work correctly
- Create a refund for a sale/order and approve it
- For Razorpay orders, check validation and status with Razorpay endpoints if configured

## Important Behaviors
- Refund status lifecycle: pending → approved → processing → completed (or rejected/failed)
- Credit note refunds: create `credit_notes` with `status = active`, decrement on usage, mark `used` at zero balance
- Source transactions updated with cumulative refunded amounts and partial/full flags

## What Changed (High Level)
- POS returns now create official `Refund` records and issue credit notes through `RefundService` instead of directly creating credit notes.
- Admin filters standardized to use `refund_status` and `refund_type`.
- `Refund` model provides `status` accessor for compatibility with existing UI.
- Removed customer-facing refund pages/routes.

## Maintenance Checklist
- Ensure env credentials for Razorpay are present when online refunds are used: `RAZOR_KEY_ID`, `RAZOR_KEY_SECRET`.
- Monitor `refund_status` mismatches; the UI should always read `refund.status` (accessor).
- Keep `RefundService` the single pathway for any new refund method integrations.

## Conclusion
The system now uses a single, consistent Admin/Seller-only Return and Refund process across POS and Admin flows, backed by `RefundService`, with tests validating POS returns and credit note issuance. This setup is production-ready and easier to maintain/extensible for gateways like Razorpay.

