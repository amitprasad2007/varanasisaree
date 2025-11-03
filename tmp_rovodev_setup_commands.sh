#!/bin/bash

# Multi-Vendor Refund System Setup Commands
# Run these commands in sequence from your project root

echo "🚀 Setting up Multi-Vendor Refund System..."

# Step 1: Database Migration
echo "📊 Running database migrations..."
php artisan migrate

# Step 2: Clear caches
echo "🗑️ Clearing caches..."
php artisan config:cache
php artisan route:cache
php artisan view:clear

# Step 3: Install frontend dependencies (if needed)
echo "📦 Installing/updating frontend dependencies..."
npm install

# Step 4: Build frontend assets
echo "🎨 Building frontend assets..."
npm run build

# Step 5: Create storage links (if needed)
echo "🔗 Creating storage links..."
php artisan storage:link

# Step 6: Set permissions (Linux/Mac only)
echo "🔐 Setting permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Step 7: Run tests
echo "🧪 Running refund system tests..."
php artisan test tests/Feature/MultiVendorRefundTest.php

echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Next Steps:"
echo "1. Navigate to /refunds (Admin) or /vendor/refunds (Vendor)"
echo "2. Test POS returns at /pos"
echo "3. Review the documentation in MULTI_VENDOR_REFUND_SYSTEM_SUMMARY.md"
echo ""
echo "🔧 Configuration files created:"
echo "- config/refunds.php (system configuration)"
echo "- app/Policies/RefundPolicy.php (authorization)"
echo "- tests/Feature/MultiVendorRefundTest.php (test suite)"