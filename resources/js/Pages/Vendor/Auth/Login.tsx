import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Building2, Mail, Lock, Shield, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { cn } from '@/lib/utils';

export default function VendorLogin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        domain: window.location.hostname.split('.')[0],
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('vendor.login.store', { domain: data.domain }),{
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'You have successfully logged in',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false as const
                });
            },
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Vendor Login" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-6xl w-full flex items-center justify-center relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
                        {/* Left side - Branding & Features */}
                        <div className="hidden lg:flex flex-col space-y-8 text-center lg:text-left">
                            <div className="space-y-6">
                                <div className="flex items-center justify-center lg:justify-start space-x-3">
                                    <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Vendor Portal
                                    </h1>
                                </div>
                                
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-bold text-gray-900">
                                        Welcome Back!
                                    </h2>
                                    <p className="text-xl text-gray-600 max-w-lg">
                                        Manage your products, track sales, and grow your business with our powerful vendor platform.
                                    </p>
                                </div>
                            </div>

                            {/* Features list */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="text-gray-700">Real-time sales analytics</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="text-gray-700">Inventory management</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="text-gray-700">Order processing tools</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="text-gray-700">24/7 customer support</span>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Login form */}
                        <div className="w-full max-w-md mx-auto">
                            <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="text-center space-y-4 pb-8">
                                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg lg:hidden">
                                        <Building2 className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-2xl font-bold text-gray-900">Sign in to your account</CardTitle>
                                        <CardDescription className="text-gray-600">
                                            Enter your credentials to access your vendor dashboard
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="business@example.com"
                                                    className={cn(
                                                        "pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all",
                                                        errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    )}
                                                    required
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm text-red-500 flex items-center space-x-1">
                                                    <span>⚠️</span>
                                                    <span>{errors.email}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="••••••••••"
                                                    className={cn(
                                                        "pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all",
                                                        errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    )}
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? 
                                                        <EyeOff className="h-4 w-4 text-gray-400" /> : 
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    }
                                                </Button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-sm text-red-500 flex items-center space-x-1">
                                                    <span>⚠️</span>
                                                    <span>{errors.password}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    id="remember-me"
                                                    name="remember-me"
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                                    Remember me
                                                </label>
                                            </div>
                                            <div className="text-sm">
                                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                                    Forgot password?
                                                </a>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Signing In...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="h-4 w-4" />
                                                    <span>Sign In Securely</span>
                                                </div>
                                            )}
                                        </Button>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-200" />
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-white text-gray-500">New to our platform?</span>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-sm text-gray-600">
                                                Don't have a vendor account?{' '}
                                                <a 
                                                    href="/vendor/register" 
                                                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                                                >
                                                    Create one now
                                                </a>
                                            </p>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Security notice */}
                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                                    <Shield className="h-3 w-3" />
                                    <span>Your data is secured with enterprise-grade encryption</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
