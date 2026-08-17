import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { addToast } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      addToast('error', error.message);
    } else {
      addToast('success', 'Password reset email sent! Check your inbox.');
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl shadow-blue-500/5">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">
              Lead<span className="text-blue-500">Gen</span> AI
            </h1>
            <p className="text-gray-400 mt-4 text-lg">Reset your password</p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Check your email</h2>
              <p className="text-gray-400">
                We've sent a password reset link to{' '}
                <span className="text-white font-medium">{email}</span>.
                Follow the link in the email to set a new password.
              </p>
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                className="btn-primary w-full mt-4"
              >
                Send Another Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-gray-400 text-sm text-center">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field w-full pl-11"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <Link
            to="/signin"
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-white mt-6 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
