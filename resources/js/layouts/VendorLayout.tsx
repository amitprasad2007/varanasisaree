import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import VendorSidebar from "@/components/VendorSidebar";
import { Head } from '@inertiajs/react';
import React, { ReactNode } from 'react';

interface VendorLayoutProps {
    children: ReactNode;
    title: string;
}

export default function VendorLayout({ children, title }: VendorLayoutProps) {
    return (
        <>
            <Head title={title} />
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <div className="flex min-h-screen bg-gray-50">
                    <VendorSidebar />
                    <main className="flex-1 ml-72 p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </TooltipProvider>
        </>
    );
}
