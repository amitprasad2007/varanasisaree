import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, Building2, User, Mail, Lock, Phone, MapPin, FileText, Shield, Star, Users, TrendingUp, Award } from 'lucide-react';
import Swal from 'sweetalert2';
import { cn } from '@/lib/utils';

export default function VendorRegister() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        business_name: '',
        business_address: '',
        business_description: '',
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
                    text: 'Your vendor account has been created successfully',
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false as const
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
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-300/10 to-yellow-300/10 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl w-full flex items-center justify-center relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
                        {/* Left side - Branding & Benefits */}
                        <div className="hidden lg:flex flex-col space-y-10 text-center lg:text-left">
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
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                    <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Boost Sales</h3>
                                    <p className="text-sm text-gray-600">Increase revenue with our advanced marketing tools</p>
                                </div>
                                
                                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Reach Millions</h3>
                                    <p className="text-sm text-gray-600">Access to our vast customer base</p>
                                </div>
                                
                                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                                        <Award className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Premium Tools</h3>
                                    <p className="text-sm text-gray-600">Professional seller tools included</p>
                                </div>
                                
                                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                    <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                                        <Star className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">5-Star Support</h3>
                                    <p className="text-sm text-gray-600">Dedicated support team for vendors</p>
                                </div>
                            </div>

                            {/* Testimonial */}
                            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">JD</span>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 text-sm mb-1">"Joining this platform was the best decision for my business. Sales increased by 300% in just 6 months!"</p>
                                        <p className="text-xs text-gray-500 font-medium">- John Doe, Fashion Vendor</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Registration form */}
                        <div className="w-full max-w-lg mx-auto">
                            <Card className="border-0 shadow-2xl shadow-emerald-500/10 bg-white/90 backdrop-blur-sm">
                                <CardHeader className="text-center space-y-4 pb-6">
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
                                
                                <CardContent className="space-y-6">
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Personal Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Personal Information</h3>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                                        Full Name
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <Input
                                                            id="name"
                                                            type="text"
                                                            value={data.name}
                                                            onChange={(e) => setData('name', e.target.value)}
                                                            placeholder="John Doe"
                                                            className={cn(
                                                                "pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all",
                                                                errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            )}
                                                            required
                                                        />
                                                    </div>
                                                    {errors.name && (
                                                        <p className="text-xs text-red-500">{errors.name}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                                        Phone Number
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Phone className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <Input
                                                            id="phone"
                                                            type="tel"
                                                            value={data.phone}
                                                            onChange={(e) => setData('phone', e.target.value)}
                                                            placeholder="+1 (555) 123-4567"
                                                            className={cn(
                                                                "pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all",
                                                                errors.phone && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            )}
                                                            required
                                                        />
                                                    </div>
                                                    {errors.phone && (
                                                        <p className="text-xs text-red-500">{errors.phone}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                    Email Address
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        placeholder="john@business.com"
                                                        className={cn(
                                                            "pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all",
                                                            errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        )}
                                                        required
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-xs text-red-500">{errors.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Business Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Business Information</h3>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="business_name" className="text-sm font-medium text-gray-700">
                                                    Business Name
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Building2 className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Input
                                                        id="business_name"
                                                        type="text"
                                                        value={data.business_name}
                                                        onChange={(e) => setData('business_name', e.target.value)}
                                                        placeholder="Your Business LLC"
                                                        className={cn(
                                                            "pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all",
                                                            errors.business_name && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        )}
                                                        required
                                                    />
                                                </div>
                                                {errors.business_name && (
                                                    <p className="text-xs text-red-500">{errors.business_name}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="business_address" className="text-sm font-medium text-gray-700">
                                                    Business Address
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Textarea
                                                        id="business_address"
                                                        value={data.business_address}
                                                        onChange={(e) => setData('business_address', e.target.value)}
                                                        placeholder="123 Business St, City, State 12345"
                                                        className={cn(
                                                            "pl-9 min-h-[80px] bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all resize-none",
                                                            errors.business_address && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        )}
                                                        required
                                                    />
                                                </div>
                                                {errors.business_address && (
                                                    <p className="text-xs text-red-500">{errors.business_address}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="business_description" className="text-sm font-medium text-gray-700">
                                                    Business Description
                                                </Label>
                                                <div className="relative">
                                                    <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Textarea
                                                        id="business_description"
                                                        value={data.business_description}
                                                        onChange={(e) => setData('business_description', e.target.value)}
                                                        placeholder="Describe what your business does..."
                                                        className={cn(
                                                            "pl-9 min-h-[80px] bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all resize-none",
                                                            errors.business_description && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        )}
                                                        required
                                                    />
                                                </div>
                                                {errors.business_description && (
                                                    <p className="text-xs text-red-500">{errors.business_description}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Security */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Security</h3>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                        Password
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Lock className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <Input
                                                            id="password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={data.password}
                                                            onChange={(e) => setData('password', e.target.value)}
                                                            placeholder="••••••••••"
                                                            className={cn(
                                                                "pl-9 pr-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all",
                                                                errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            )}
                                                            required
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? 
                                                                <EyeOff className="h-4 w-4 text-gray-400" /> : 
                                                                <Eye className="h-4 w-4 text-gray-400" />
                                                            }
                                                        </Button>
                                                    </div>
                                                    {errors.password && (
                                                        <p className="text-xs text-red-500">{errors.password}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                                        Confirm Password
                                                    </Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Lock className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <Input
                                                            id="password_confirmation"
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            value={data.password_confirmation}
                                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                                            placeholder="••••••••••"
                                                            className={cn(
                                                                "pl-9 pr-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all",
                                                                errors.password_confirmation && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            )}
                                                            required
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? 
                                                                <EyeOff className="h-4 w-4 text-gray-400" /> : 
                                                                <Eye className="h-4 w-4 text-gray-400" />
                                                            }
                                                        </Button>
                                                    </div>
                                                    {errors.password_confirmation && (
                                                        <p className="text-xs text-red-500">{errors.password_confirmation}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Terms and Conditions */}
                                        <div className="space-y-4">
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
            </div>
        </>
    );
}