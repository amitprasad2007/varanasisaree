import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, Building2, User, Mail, Lock, Phone, MapPin, FileText, Shield, Star, Users, TrendingUp, Award, CreditCard, Globe } from 'lucide-react';
import Swal from 'sweetalert2';
import { cn } from '@/lib/utils';

export default function VendorRegister() {
    const { data, setData, post, processing, errors, reset } = useForm<{
        username: string;
        business_name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
        description: string;
        address: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
        gstin: string;
        pan: string;
        contact_person: string;
        contact_email: string;
        contact_phone: string;
        terms_accepted: boolean;
        domain: string;
    }>({
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
        terms_accepted: false,
        domain: window.location.hostname.split('.')[0],
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('vendor.register.store', { domain: data.domain }), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Your vendor account has been created successfully. Please wait for admin approval.',
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false
                });
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Vendor Registration" />

            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-300/10 to-yellow-300/10 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl w-full flex items-start justify-center relative z-10 gap-12">
                    {/* Left side - Branding & Benefits (Sticky on large screens) */}
                    <div className="hidden lg:flex flex-col space-y-10 text-center lg:text-left w-1/3 sticky top-12 self-start">
                        <div className="space-y-6">
                            <div className="flex items-center justify-center lg:justify-start space-x-3">
                                <div className="h-14 w-14 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-xl">
                                    <Building2 className="h-7 w-7 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                    Join Our Marketplace
                                </h1>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                                    Start Selling<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                                        Today
                                    </span>
                                </h2>
                                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                                    Join thousands of successful vendors and grow your business with our powerful e-commerce platform.
                                </p>
                            </div>
                        </div>

                        {/* Benefits grid */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg flex items-center space-x-4">
                                <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Boost Sales</h3>
                                    <p className="text-sm text-gray-600">Increase revenue with our advanced marketing tools</p>
                                </div>
                            </div>

                            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg flex items-center space-x-4">
                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Reach Millions</h3>
                                    <p className="text-sm text-gray-600">Access to our vast customer base</p>
                                </div>
                            </div>

                            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg flex items-center space-x-4">
                                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Award className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Premium Tools</h3>
                                    <p className="text-sm text-gray-600">Professional seller tools included</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Registration form */}
                    <div className="w-full lg:w-2/3 max-w-3xl">
                        <Card className="border-0 shadow-2xl shadow-emerald-500/10 bg-white/90 backdrop-blur-sm">
                            <CardHeader className="text-center space-y-4 pb-6 border-b border-gray-100">
                                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg lg:hidden">
                                    <Building2 className="h-8 w-8 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl font-bold text-gray-900">Create Vendor Account</CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Fill in your details to start selling on our platform
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Account Information */}
                                    <div className="space-y-5">
                                        <div className="flex items-center space-x-2 text-emerald-700 border-b border-emerald-100 pb-2">
                                            <User className="h-5 w-5" />
                                            <h3 className="text-lg font-semibold">Account Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                                                <Input
                                                    id="username"
                                                    value={data.username}
                                                    onChange={(e) => setData('username', e.target.value)}
                                                    placeholder="johndoe123"
                                                    className={cn(errors.username && 'border-red-500')}
                                                    required
                                                />
                                                {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="john@example.com"
                                                    className={cn(errors.email && 'border-red-500')}
                                                    required
                                                />
                                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        className={cn("pr-10", errors.password && 'border-red-500')}
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                                    </Button>
                                                </div>
                                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password_confirmation"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        className={cn("pr-10", errors.password_confirmation && 'border-red-500')}
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Information */}
                                    <div className="space-y-5">
                                        <div className="flex items-center space-x-2 text-emerald-700 border-b border-emerald-100 pb-2">
                                            <Building2 className="h-5 w-5" />
                                            <h3 className="text-lg font-semibold">Business Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="business_name" className="text-sm font-medium text-gray-700">Business Name</Label>
                                                <Input
                                                    id="business_name"
                                                    value={data.business_name}
                                                    onChange={(e) => setData('business_name', e.target.value)}
                                                    placeholder="Your Business LLC"
                                                    className={cn(errors.business_name && 'border-red-500')}
                                                    required
                                                />
                                                {errors.business_name && <p className="text-xs text-red-500">{errors.business_name}</p>}
                                            </div>

                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Tell us about your business..."
                                                    className={cn("min-h-[80px] resize-none", errors.description && 'border-red-500')}
                                                />
                                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Business Phone</Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="+1 (555) 000-0000"
                                                    className={cn(errors.phone && 'border-red-500')}
                                                    required
                                                />
                                                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="gstin" className="text-sm font-medium text-gray-700">GSTIN (Optional)</Label>
                                                <Input
                                                    id="gstin"
                                                    value={data.gstin}
                                                    onChange={(e) => setData('gstin', e.target.value)}
                                                    placeholder="GSTIN12345"
                                                    className={cn(errors.gstin && 'border-red-500')}
                                                />
                                                {errors.gstin && <p className="text-xs text-red-500">{errors.gstin}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="pan" className="text-sm font-medium text-gray-700">PAN (Optional)</Label>
                                                <Input
                                                    id="pan"
                                                    value={data.pan}
                                                    onChange={(e) => setData('pan', e.target.value)}
                                                    placeholder="ABCDE1234F"
                                                    className={cn(errors.pan && 'border-red-500')}
                                                />
                                                {errors.pan && <p className="text-xs text-red-500">{errors.pan}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Details */}
                                    <div className="space-y-5">
                                        <div className="flex items-center space-x-2 text-emerald-700 border-b border-emerald-100 pb-2">
                                            <MapPin className="h-5 w-5" />
                                            <h3 className="text-lg font-semibold">Address Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Street Address</Label>
                                                <Input
                                                    id="address"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    placeholder="123 Main St"
                                                    className={cn(errors.address && 'border-red-500')}
                                                />
                                                {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                                                <Input
                                                    id="city"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value)}
                                                    placeholder="New York"
                                                    className={cn(errors.city && 'border-red-500')}
                                                />
                                                {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                                                <Input
                                                    id="state"
                                                    value={data.state}
                                                    onChange={(e) => setData('state', e.target.value)}
                                                    placeholder="NY"
                                                    className={cn(errors.state && 'border-red-500')}
                                                />
                                                {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                                                <Input
                                                    id="country"
                                                    value={data.country}
                                                    onChange={(e) => setData('country', e.target.value)}
                                                    placeholder="USA"
                                                    className={cn(errors.country && 'border-red-500')}
                                                />
                                                {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="postal_code" className="text-sm font-medium text-gray-700">Postal Code</Label>
                                                <Input
                                                    id="postal_code"
                                                    value={data.postal_code}
                                                    onChange={(e) => setData('postal_code', e.target.value)}
                                                    placeholder="10001"
                                                    className={cn(errors.postal_code && 'border-red-500')}
                                                />
                                                {errors.postal_code && <p className="text-xs text-red-500">{errors.postal_code}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Person Details */}
                                    <div className="space-y-5">
                                        <div className="flex items-center space-x-2 text-emerald-700 border-b border-emerald-100 pb-2">
                                            <CreditCard className="h-5 w-5" />
                                            <h3 className="text-lg font-semibold">Contact Person Details (Optional)</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_person" className="text-sm font-medium text-gray-700">Contact Name</Label>
                                                <Input
                                                    id="contact_person"
                                                    value={data.contact_person}
                                                    onChange={(e) => setData('contact_person', e.target.value)}
                                                    placeholder="Jane Doe"
                                                    className={cn(errors.contact_person && 'border-red-500')}
                                                />
                                                {errors.contact_person && <p className="text-xs text-red-500">{errors.contact_person}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="contact_email" className="text-sm font-medium text-gray-700">Contact Email</Label>
                                                <Input
                                                    id="contact_email"
                                                    type="email"
                                                    value={data.contact_email}
                                                    onChange={(e) => setData('contact_email', e.target.value)}
                                                    placeholder="jane@example.com"
                                                    className={cn(errors.contact_email && 'border-red-500')}
                                                />
                                                {errors.contact_email && <p className="text-xs text-red-500">{errors.contact_email}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="contact_phone" className="text-sm font-medium text-gray-700">Contact Phone</Label>
                                                <Input
                                                    id="contact_phone"
                                                    value={data.contact_phone}
                                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                                    placeholder="+1 (555) 987-6543"
                                                    className={cn(errors.contact_phone && 'border-red-500')}
                                                />
                                                {errors.contact_phone && <p className="text-xs text-red-500">{errors.contact_phone}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terms and Conditions */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-start space-x-3">
                                            <input
                                                id="terms_accepted"
                                                type="checkbox"
                                                checked={data.terms_accepted}
                                                onChange={(e) => setData('terms_accepted', e.target.checked)}
                                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-1"
                                                required
                                            />
                                            <label htmlFor="terms_accepted" className="text-sm text-gray-700 leading-relaxed">
                                                I agree to the{' '}
                                                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                                                    Terms of Service
                                                </a>
                                                {' '}and{' '}
                                                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                                                    Privacy Policy
                                                </a>
                                            </label>
                                        </div>
                                        {errors.terms_accepted && (
                                            <p className="text-xs text-red-500">{errors.terms_accepted}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                                        disabled={processing || !data.terms_accepted}
                                    >
                                        {processing ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Creating Account...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Shield className="h-4 w-4" />
                                                <span>Create Vendor Account</span>
                                            </div>
                                        )}
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <a
                                            href="/vendor/login"
                                            className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors hover:underline"
                                        >
                                            Sign in to your existing account
                                        </a>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Security notice */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                                <Shield className="h-3 w-3" />
                                <span>Your information is protected with bank-level security</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}