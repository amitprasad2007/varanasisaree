# Database Field Reference - Collections System

## Status/Active Field Usage

### ✅ Collection Types (`collection_types` table)
- **Field**: `is_active` (boolean)
- **Values**: `true` / `false`
- **Usage**: `where('is_active', true)`

### ✅ Collections (`collections` table)
- **Field**: `is_active` (boolean)
- **Values**: `true` / `false`
- **Usage**: `where('is_active', true)`

### ✅ Products (`products` table)
- **Field**: `status` (enum)
- **Values**: `'active'` / `'inactive'`
- **Usage**: `where('status', 'active')`

## Fixed Issues

### CollectionController.php - Line 169
- **Before**: `->where('is_active', true)` ❌
- **After**: `->where('status', 'active')` ✅

### API CollectionController.php - Line 51
- **Already Correct**: `->where('products.status', 'active')` ✅

## Testing

The collections system should now work properly:
- `/collections` - Collections listing page
- `/collections/{slug}` - Individual collection page
- `/collections/{id}/products` - Admin collection products management
- API endpoints for frontend integration

All database queries now use the correct field names and values.