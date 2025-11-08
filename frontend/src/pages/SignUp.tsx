import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';

export function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create profile with 3 free credits
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: firstName,
          last_name: lastName,
          credits: 3,
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Profile might already exist, try to fetch it
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (!existingProfile) {
            throw new Error('Failed to create user profile');
          }
        }

        // Wait a moment for profile to be available
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          {/* Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-olive-600 p-3 rounded-xl">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
            Create Your Account
          </h1>
          <p className="text-center text-slate-600 mb-8">
            Get started with 3 free pricing checks
          </p>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Or sign up with email</span>
            </div>
          </div>

          {/* Email Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </div>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
                  placeholder="John"
                  autoComplete="off"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </div>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
                  placeholder="Doe"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
                placeholder="you@example.com"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </div>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </div>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-olive-600 text-white py-3 rounded-lg font-medium hover:bg-olive-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <Link to="/signin" className="text-olive-600 hover:text-olive-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="text-xs text-slate-500 text-center mt-6">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-olive-600 hover:underline">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link to="/terms#privacy" className="text-olive-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

