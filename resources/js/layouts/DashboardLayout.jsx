import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar.js";
import { Head } from '@inertiajs/react';

export default function DashboardLayout({ children, title }) {
  return (
    <>
      <Head title={title} />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </TooltipProvider>
    </>
  );
}
