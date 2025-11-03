<?php

namespace App\Policies;

use App\Models\Refund;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Auth\Access\HandlesAuthorization;

class RefundPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any refunds.
     */
    public function viewAny(User $user): bool
    {
        // Admin can view all refunds
        if ($user->hasRole('admin')) {
            return true;
        }

        // Vendor users can view refunds for their vendor
        if ($user->vendor_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the refund.
     */
    public function view(User $user, Refund $refund): bool
    {
        // Admin can view all refunds
        if ($user->hasRole('admin')) {
            return true;
        }

        // Users can only view refunds for their vendor
        if ($user->vendor_id && $refund->vendor_id === $user->vendor_id) {
            return true;
        }

        // Customer can view their own refunds
        if ($user instanceof \App\Models\Customer && $refund->customer_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create refunds.
     */
    public function create(User $user): bool
    {
        // Admin can create refunds
        if ($user->hasRole('admin')) {
            return true;
        }

        // Vendor users with appropriate permissions can create refunds
        if ($user->vendor_id && $user->can('manage_refunds')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update the refund.
     */
    public function update(User $user, Refund $refund): bool
    {
        // Admin can update all refunds
        if ($user->hasRole('admin')) {
            return true;
        }

        // Vendor users can update their own refunds if not completed
        if ($user->vendor_id && 
            $refund->vendor_id === $user->vendor_id && 
            in_array($refund->refund_status, ['pending', 'approved'])) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can approve refunds.
     */
    public function approve(User $user, Refund $refund): bool
    {
        // Admin can approve all refunds
        if ($user->hasRole('admin')) {
            return true;
        }

        // Vendor managers can approve their vendor's refunds
        if ($user->vendor_id && 
            $refund->vendor_id === $user->vendor_id &&
            $user->hasRole('vendor_manager') &&
            $refund->refund_status === 'pending') {
            return true;
        }

        // For high-value refunds, require admin approval
        if ($refund->requiresVendorApproval() && !$user->hasRole('admin')) {
            return false;
        }

        return false;
    }

    /**
     * Determine whether the user can reject refunds.
     */
    public function reject(User $user, Refund $refund): bool
    {
        return $this->approve($user, $refund);
    }

    /**
     * Determine whether the user can process refunds.
     */
    public function process(User $user, Refund $refund): bool
    {
        // Admin can process all approved refunds
        if ($user->hasRole('admin') && $refund->refund_status === 'approved') {
            return true;
        }

        // Vendor users with finance permissions can process their vendor's refunds
        if ($user->vendor_id && 
            $refund->vendor_id === $user->vendor_id &&
            $user->can('process_refunds') &&
            $refund->refund_status === 'approved') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the refund.
     */
    public function delete(User $user, Refund $refund): bool
    {
        // Only admin can delete refunds, and only if pending
        if ($user->hasRole('admin') && $refund->refund_status === 'pending') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can force delete the refund.
     */
    public function forceDelete(User $user, Refund $refund): bool
    {
        // Only super admin can force delete
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can restore the refund.
     */
    public function restore(User $user, Refund $refund): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine if user can create refunds for a specific vendor
     */
    public function createForVendor(User $user, ?int $vendorId): bool
    {
        // Admin can create for any vendor
        if ($user->hasRole('admin')) {
            return true;
        }

        // Users can only create for their own vendor
        if ($user->vendor_id && $user->vendor_id === $vendorId) {
            return true;
        }

        return false;
    }

    /**
     * Determine if user can view vendor-specific refund reports
     */
    public function viewReports(User $user, ?int $vendorId = null): bool
    {
        // Admin can view all reports
        if ($user->hasRole('admin')) {
            return true;
        }

        // Vendor users can view their own vendor's reports
        if ($user->vendor_id && ($vendorId === null || $user->vendor_id === $vendorId)) {
            return true;
        }

        return false;
    }
}