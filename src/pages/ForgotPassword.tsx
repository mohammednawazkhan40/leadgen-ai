import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">
              Lead<span className="text-blue-500">Gen</span> AI
            </h1>
            <p className="text-gray-400 mt-4 text-lg">Reset your password</p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-gray-300">
                We've sent a password reset link to{" "}
                <span className="text-white font-medium">{email}</span>. Please
                check your inbox.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-primary w-full mt-4"
              >
                Resend Email
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
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Send Reset Link
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
