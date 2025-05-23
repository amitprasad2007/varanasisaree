import React, { FormEvent, ChangeEvent,useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('login'), {
      onSuccess: () => {
          Swal.fire({
              title: 'Success!',
              text: 'You have successfully logged in',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
          });
      },
  });
  };
   // Show success message if status is provided (e.g., after password reset)
   useEffect(() => {
    if (status) {
        Swal.fire({
            title: 'Success!',
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 to-blue-300 p-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && (
                  <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                />
                {errors.password && (
                  <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={processing}
                className="cursor-pointer group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Log in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
