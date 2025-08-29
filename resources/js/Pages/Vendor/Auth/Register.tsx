import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Swal from "sweetalert2";

import { Eye, EyeOff, CheckCircle, XCircle, Building2 } from 'lucide-react';

export default function VendorRegister() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        business_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        gstin: '',
        pan: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
    const [checkingSubdomain, setCheckingSubdomain] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('vendor.register.store'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Vendor registered successfully. Please wait for admin approval',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false
                });
            }
        });

    };


    const checkSubdomain = async () => {
        if (!data.username) return;
        setCheckingSubdomain(true);
        try {
          const response = await axios.get(`/vendor/check-subdomain/${data.username}`);
          const result = await response;
          setSubdomainAvailable(response.data.available);
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Error fetching subcategories'+error,
            icon: 'error',
            timer: 3000,
            showConfirmButton: false
        });
        }
      };





    const handleUsernameChange = (value: string) => {
        setData('username', value);
        setSubdomainAvailable(null);
        if (value.length >= 3) {
            checkSubdomain();
        }
    };

    return (
        <>
            <Head title="Vendor Registration" />

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
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username *</Label>
                                        <div className="relative">
                                            <Input
                                                id="username"
                                                type="text"
                                                value={data.username}
                                                onChange={(e) => handleUsernameChange(e.target.value)}
                                                placeholder="mybusiness"
                                                className={errors.username ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                            />
                                            {subdomainAvailable !== null && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    {subdomainAvailable ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.username && (
                                            <p className="text-sm text-red-500">{errors.username}</p>
                                        )}
                                        {subdomainAvailable !== null && (
                                            <p className={`text-sm ${subdomainAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                                {subdomainAvailable
                                                    ? `Subdomain available: ${data.username}.yourdomain.com`
                                                    : 'Username already taken'
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="business_name">Business Name *</Label>
                                        <Input
                                            id="business_name"
                                            type="text"
                                            value={data.business_name}
                                            onChange={(e) => setData('business_name', e.target.value)}
                                            placeholder="My Business Store"
                                            className={errors.business_name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.business_name && (
                                            <p className="text-sm text-red-500">{errors.business_name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="business@example.com"
                                            className={errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="9876543210"
                                            className={errors.phone ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-500">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="••••••••"
                                                className={errors.password ? 'border-red-500 focus:ring-red-500 pr-10' : 'focus:ring-blue-500 pr-10'}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-red-500">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="••••••••"
                                                className={errors.password_confirmation ? 'border-red-500 focus:ring-red-500 pr-10' : 'focus:ring-blue-500 pr-10'}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Business Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Business Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Tell us about your business..."
                                        rows={3}
                                        className={errors.description ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                {/* Address Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="123 Business Street"
                                            className={errors.address ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-500">{errors.address}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="Mumbai"
                                            className={errors.city ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-500">{errors.city}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            type="text"
                                            value={data.state}
                                            onChange={(e) => setData('state', e.target.value)}
                                            placeholder="Maharashtra"
                                            className={errors.state ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.state && (
                                            <p className="text-sm text-red-500">{errors.state}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            type="text"
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                            placeholder="India"
                                            className={errors.country ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.country && (
                                            <p className="text-sm text-red-500">{errors.country}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input
                                            id="postal_code"
                                            type="text"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            placeholder="400001"
                                            className={errors.postal_code ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.postal_code && (
                                            <p className="text-sm text-red-500">{errors.postal_code}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Tax Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="gstin">GSTIN</Label>
                                        <Input
                                            id="gstin"
                                            type="text"
                                            value={data.gstin}
                                            onChange={(e) => setData('gstin', e.target.value)}
                                            placeholder="27ABCDE1234F1Z5"
                                            className={errors.gstin ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.gstin && (
                                            <p className="text-sm text-red-500">{errors.gstin}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pan">PAN</Label>
                                        <Input
                                            id="pan"
                                            type="text"
                                            value={data.pan}
                                            onChange={(e) => setData('pan', e.target.value)}
                                            placeholder="ABCDE1234F"
                                            className={errors.pan ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.pan && (
                                            <p className="text-sm text-red-500">{errors.pan}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Contact Information */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person">Contact Person</Label>
                                        <Input
                                            id="contact_person"
                                            type="text"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                            placeholder="John Doe"
                                            className={errors.contact_person ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.contact_person && (
                                            <p className="text-sm text-red-500">{errors.contact_person}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email">Contact Email</Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            value={data.contact_email}
                                            onChange={(e) => setData('contact_email', e.target.value)}
                                            placeholder="contact@example.com"
                                            className={errors.contact_email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.contact_email && (
                                            <p className="text-sm text-red-500">{errors.contact_email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone">Contact Phone</Label>
                                        <Input
                                            id="contact_phone"
                                            type="tel"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            placeholder="9876543210"
                                            className={errors.contact_phone ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
                                        />
                                        {errors.contact_phone && (
                                            <p className="text-sm text-red-500">{errors.contact_phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm"
                                        disabled={processing || subdomainAvailable === false}
                                    >
                                        {processing ? 'Creating Account...' : 'Create Vendor Account'}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <a href="/vendor/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                            Sign in here
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
