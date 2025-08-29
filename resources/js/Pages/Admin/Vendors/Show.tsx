
import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Eye, EyeOff, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Show() {

    return (
        <DashboardLayout title="Vendor Management">
           <div className="min-h-screen bg-background flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
                            <Building2 className="h-8 w-8 text-black" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Become a Vendor</h1>
                        <p className="mt-2 text-gray-600">
                            Join our marketplace and start selling your products
                        </p>
                    </div>

                    <Card className="w-full border-2 shadow-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">Vendor Registration</CardTitle>
                            <CardDescription>
                                Fill in your business details to get started
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username *</Label>
                                        <div className="relative">
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="business_name">Business Name *</Label>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone *</Label>
                                    </div>
                                </div>


                                {/* Business Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Business Description</Label>

                                </div>

                                {/* Address Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>

                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code</Label>

                                    </div>
                                </div>

                                {/* Tax Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="gstin">GSTIN</Label>

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pan">PAN</Label>

                                    </div>
                                </div>

                                {/* Additional Contact Information */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person">Contact Person</Label>

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email">Contact Email</Label>

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone">Contact Phone</Label>
                                    </div>
                                </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
