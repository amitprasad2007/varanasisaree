import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    ShoppingCart,
    Star,
    MapPin,
    Phone,
    Mail,
    ArrowRight,
    TrendingUp,
    Users,
    Award
} from 'lucide-react';

interface VendorHomeProps {
    vendor: {
        username: string;
        business_name: string;
        description: string;
        logo: string;
    };
}

export default function VendorHome({ vendor }: VendorHomeProps) {
    return (
        <>
            <Head title={`${vendor.business_name} - Home`} />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {vendor.logo && (
                                    <img
                                        src={vendor.logo}
                                        alt={vendor.business_name}
                                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                    />
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{vendor.business_name}</h1>
                                    <p className="text-gray-600">@{vendor.username}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Contact
                                </Button>
                                <Button className="bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Shop Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Welcome to {vendor.business_name}
                        </h2>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                            {vendor.description || 'Discover amazing products and exceptional service.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 cursor-pointer">
                                <Package className="h-5 w-5 mr-2" />
                                Browse Products
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 cursor-pointer">
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                View Cart
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="text-center border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">500+</h4>
                                    <p className="text-gray-600">Products Available</p>
                                </CardContent>
                            </Card>

                            <Card className="text-center border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">10K+</h4>
                                    <p className="text-gray-600">Happy Customers</p>
                                </CardContent>
                            </Card>

                            <Card className="text-center border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">98%</h4>
                                    <p className="text-gray-600">Satisfaction Rate</p>
                                </CardContent>
                            </Card>

                            <Card className="text-center border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Award className="h-8 w-8 text-yellow-600" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">5+</h4>
                                    <p className="text-gray-600">Years Experience</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h3>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                We're committed to providing the best products and service to our customers
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h4 className="text-xl font-semibold mb-2">Quality Products</h4>
                                    <p className="text-gray-600">
                                        We offer only the highest quality products that meet our strict standards.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingCart className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h4 className="text-xl font-semibold mb-2">Fast Delivery</h4>
                                    <p className="text-gray-600">
                                        Quick and reliable shipping to get your products to you as soon as possible.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Star className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <h4 className="text-xl font-semibold mb-2">Customer Satisfaction</h4>
                                    <p className="text-gray-600">
                                        Your satisfaction is our priority. We're here to help with any questions.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-6">About {vendor.business_name}</h3>
                                <p className="text-lg text-gray-600 mb-6">
                                    {vendor.description || 'We are a dedicated team passionate about providing exceptional products and service to our valued customers. With years of experience in the industry, we understand what it takes to deliver quality and reliability.'}
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-gray-700">Quality assurance on all products</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-gray-700">Professional customer support</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-gray-700">Fast and secure shipping</span>
                                    </div>
                                </div>
                                <Button className="mt-6 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
                                    Learn More
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-100">
                                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="h-16 w-16 text-blue-600" />
                                </div>
                                <h4 className="text-xl font-semibold mb-2">Our Products</h4>
                                <p className="text-gray-600 mb-4">
                                    Explore our wide range of products designed to meet your needs
                                </p>
                                <Button variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                    View Catalog
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-20 bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h3 className="text-3xl font-bold mb-6">Get in Touch</h3>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 cursor-pointer">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                            </Button>
                            <Button className="bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Now
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h4 className="font-semibold mb-4">{vendor.business_name}</h4>
                                <p className="text-gray-600 text-sm">
                                    {vendor.description || 'Your trusted partner for quality products and exceptional service.'}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Quick Links</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Products</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">About Us</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Support</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Customer Service</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Returns</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Shipping Info</a></li>
                                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Size Guide</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Connect With Us</h4>
                                <div className="flex space-x-4">
                                    <Button variant="outline" size="sm" className="w-10 h-10 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <span className="sr-only">Facebook</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                                        </svg>
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-10 h-10 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <span className="sr-only">Instagram</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM8 15a2 2 0 11-4 0 2 2 0 014 0zm6.945-8.15a2.108 2.108 0 01-.797-.797C13.79 5.344 12.554 5 10 5s-3.79.344-5.148.053a2.108 2.108 0 01-.797.797C3.344 6.21 3 7.446 3 10s.344 3.79.053 5.148c.19.389.408.608.797.797C6.21 16.656 7.446 17 10 17s3.79-.344 5.148-.053c.389-.19.608-.408.797-.797C16.656 13.79 17 12.554 17 10s-.344-3.79-.053-5.148zM10 7a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
                                        </svg>
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-10 h-10 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <span className="sr-only">Twitter</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t mt-8 pt-8 text-center">
                            <p className="text-gray-600 text-sm">
                                © 2024 {vendor.business_name}. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
