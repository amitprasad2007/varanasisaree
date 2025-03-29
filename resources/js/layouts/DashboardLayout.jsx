
import { Toaster } from "@/Components/ui/toaster";
import { Toaster as Sonner } from "@/Components/ui/sonner";
import { TooltipProvider } from "@/Components/ui/tooltip";
import Sidebar from "@/Components/Sidebar";
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
