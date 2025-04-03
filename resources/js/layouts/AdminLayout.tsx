import React, { ReactNode } from 'react';
import { Toaster } from '@/Components/ui/toaster';
import { Toaster as Sonner } from '@/Components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Head } from '@inertiajs/react';
import AdminNav from '@/Components/AdminNav';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <>
      <Head title={title} />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="flex flex-col min-h-screen bg-background">
          <AdminNav />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </TooltipProvider>
    </>
  );
}