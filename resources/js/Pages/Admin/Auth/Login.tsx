import React, { FormEvent, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Head, usePage } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Swal from 'sweetalert2';

interface FormData {
  email: string;
  password: string;
  remember: boolean;
  [key: string]: string | boolean;
}

export default function Login() {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    email: '',
    password: '',
    remember: false,
  });
  const { status } = usePage().props as { status?: string };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('login'), {
      onSuccess: () => {
        Swal.fire({
          title: 'Welcome Back!',
          text: 'Successfully logged in to the dashboard.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-xl'
          }
        });
      },
    });
  };

  useEffect(() => {
    if (status) {
      Swal.fire({
        title: 'Success',
        text: status,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });
    }
  }, [status]);

  return (
    <>
      <Head title="Admin Login" />
      <div className="min-h-screen w-full flex">
        {/* Left Panel - Visual & Branding */}
        <div className="hidden lg:flex w-1/2 bg-indigo-950 relative overflow-hidden flex-col justify-between p-12 text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90"></div>

          <div className="relative z-10">
            <div className="p-1 bg-white/10 rounded-full backdrop-blur-sm inline-block">
              <img
                src="/ChatGPT Image Nov 24, 2025, 05_45_18 PM.png"
                alt="Logo"
                className="h-45 w-45 rounded-full object-cover border-4 border-white/20 shadow-2xl"
              />
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
              Manage your <br />
              <span className="text-indigo-300">Empire</span> with ease.
            </h1>
            <p className="text-lg text-indigo-200/80 leading-relaxed">
              Welcome to the Varanasi Saree Admin Portal. Streamline your operations, manage vendors, and track performance all in one place.
            </p>
          </div>

          <div className="relative z-10 text-sm text-indigo-300/60">
            © {new Date().getFullYear()} Varanasi Saree. All rights reserved.
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 sm:p-12 lg:p-24">
          <div className="w-full max-w-md space-y-10">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Sign in
              </h2>
              <p className="text-gray-500">
                Please enter your details to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@varanasisaree.com"
                      className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 font-medium animate-in slide-in-from-left-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 font-medium animate-in slide-in-from-left-1">{errors.password}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="remember"
                  checked={data.remember}
                  onCheckedChange={(checked) => setData('remember', checked as boolean)}
                  className="border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <Label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-600 cursor-pointer"
                >
                  Remember me for 30 days
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Secure Access
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
