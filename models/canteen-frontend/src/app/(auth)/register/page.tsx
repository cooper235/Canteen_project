'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '@/lib/config';
import { themeClasses } from '@/lib/theme';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'canteen_owner';
  phone: string;
};

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        // Store token if provided
        if (responseData.token) {
          localStorage.setItem('token', responseData.token);
        }
        // Redirect to login
        router.push('/login?registered=true');
      } else {
        setError(responseData.message || 'Registration failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error. Please check if the server is running.';
      setError(errorMessage);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${themeClasses.background}`}>
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <UserPlus size={40} className="text-blue-400" />
          </motion.div>
          <h2 className={`mt-4 text-3xl font-black ${themeClasses.textPrimary}`}>
            Create Account
          </h2>
          <p className={`mt-2 text-sm ${themeClasses.textSecondary}`}>
            Join us and start ordering delicious food
          </p>
        </div>

        {/* Form Container */}
        <div className={`${themeClasses.card} backdrop-blur-xl p-8 space-y-6`}>
          {error && (
            <motion.div
              className="bg-red-900/30 border border-red-700 p-4 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label htmlFor="name" className={`block text-sm font-medium ${themeClasses.textPrimary}`}>
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`w-full px-4 py-2 rounded-lg ${themeClasses.border} border bg-slate-800/50 backdrop-blur ${themeClasses.textPrimary} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="John Doe"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <label htmlFor="email" className={`block text-sm font-medium ${themeClasses.textPrimary}`}>
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-4 py-2 rounded-lg ${themeClasses.border} border bg-slate-800/50 backdrop-blur ${themeClasses.textPrimary} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="password" className={`block text-sm font-medium ${themeClasses.textPrimary}`}>
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`w-full px-4 py-2 rounded-lg ${themeClasses.border} border bg-slate-800/50 backdrop-blur ${themeClasses.textPrimary} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
            </motion.div>

            {/* Phone Field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <label htmlFor="phone" className={`block text-sm font-medium ${themeClasses.textPrimary}`}>
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={`w-full px-4 py-2 rounded-lg ${themeClasses.border} border bg-slate-800/50 backdrop-blur ${themeClasses.textPrimary} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="+91 XXXXXXXXXX"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\d{10,}$/,
                      message: 'Please enter a valid phone number (minimum 10 digits)',
                    },
                    minLength: {
                      value: 10,
                      message: 'Phone number must be at least 10 digits',
                    },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>
            </motion.div>

            {/* Role Field */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="role" className={`block text-sm font-medium ${themeClasses.textPrimary}`}>
                I am a
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  className={`w-full px-4 py-2 rounded-lg ${themeClasses.border} border bg-slate-800/50 backdrop-blur ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  {...register('role', { required: 'Role is required' })}
                >
                  <option value="student">Student</option>
                  <option value="canteen_owner">Canteen Owner</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
                )}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus size={20} />
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className={`border-t ${themeClasses.border}`}></div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-orange-400 hover:text-orange-300 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
