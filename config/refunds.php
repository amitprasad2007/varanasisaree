<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Refund Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration options for the refund system including approval thresholds,
    | credit note settings, and vendor-specific options.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Approval Thresholds
    |--------------------------------------------------------------------------
    |
    | Define the amounts that require different levels of approval
    |
    */
    'approval_thresholds' => [
        'vendor_approval_threshold' => env('REFUND_VENDOR_APPROVAL_THRESHOLD', 1000),
        'admin_approval_threshold' => env('REFUND_ADMIN_APPROVAL_THRESHOLD', 5000),
        'automatic_approval_limit' => env('REFUND_AUTO_APPROVAL_LIMIT', 100),
    ],

    /*
    |--------------------------------------------------------------------------
    | Credit Note Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for credit note generation and management
    |
    */
    'credit_notes' => [
        'default_expiry_months' => env('CREDIT_NOTE_EXPIRY_MONTHS', 12),
        'allow_partial_use' => env('CREDIT_NOTE_PARTIAL_USE', true),
        'vendor_isolation' => env('CREDIT_NOTE_VENDOR_ISOLATION', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Refund Methods
    |--------------------------------------------------------------------------
    |
    | Available refund methods and their configurations
    |
    */
    'methods' => [
        'credit_note' => [
            'enabled' => true,
            'name' => 'Store Credit',
            'description' => 'Refund as store credit note',
        ],
        'bank_transfer' => [
            'enabled' => env('REFUND_BANK_TRANSFER_ENABLED', true),
            'name' => 'Bank Transfer',
            'description' => 'Direct bank transfer refund',
        ],
        'razorpay' => [
            'enabled' => env('REFUND_RAZORPAY_ENABLED', true),
            'name' => 'Razorpay Refund',
            'description' => 'Automatic refund via Razorpay',
        ],
        'manual' => [
            'enabled' => true,
            'name' => 'Manual Refund',
            'description' => 'Manual refund processing',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Vendor Settings
    |--------------------------------------------------------------------------
    |
    | Settings specific to multi-vendor refund management
    |
    */
    'vendor' => [
        'isolation_enabled' => env('REFUND_VENDOR_ISOLATION', true),
        'require_vendor_approval' => env('REFUND_REQUIRE_VENDOR_APPROVAL', true),
        'vendor_commission_deduction' => env('REFUND_VENDOR_COMMISSION_DEDUCTION', false),
        'cross_vendor_credit_notes' => env('REFUND_CROSS_VENDOR_CREDIT', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    |
    | Configure notifications for different refund events
    |
    */
    'notifications' => [
        'customer_notifications' => env('REFUND_CUSTOMER_NOTIFICATIONS', true),
        'vendor_notifications' => env('REFUND_VENDOR_NOTIFICATIONS', true),
        'admin_notifications' => env('REFUND_ADMIN_NOTIFICATIONS', true),
        'high_value_alert_threshold' => env('REFUND_HIGH_VALUE_ALERT', 2000),
    ],

    /*
    |--------------------------------------------------------------------------
    | Stock Management
    |--------------------------------------------------------------------------
    |
    | Settings for stock restoration during refunds
    |
    */
    'stock' => [
        'auto_restore_stock' => env('REFUND_AUTO_RESTORE_STOCK', true),
        'quality_check_required' => env('REFUND_QC_REQUIRED', false),
        'damaged_stock_handling' => env('REFUND_DAMAGED_STOCK', 'quarantine'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Time Limits
    |--------------------------------------------------------------------------
    |
    | Configure time limits for refund processing
    |
    */
    'customer_portal_enabled' => env('REFUNDS_CUSTOMER_PORTAL_ENABLED', false),

    'time_limits' => [
        'refund_request_window_days' => env('REFUND_REQUEST_WINDOW', 30),
        'vendor_approval_timeout_hours' => env('REFUND_VENDOR_TIMEOUT', 48),
        'admin_approval_timeout_hours' => env('REFUND_ADMIN_TIMEOUT', 72),
        'processing_timeout_days' => env('REFUND_PROCESSING_TIMEOUT', 7),
    ],
];