import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Layers,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'STAFF' | 'ADMIN'>('CUSTOMER');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFeedback, setForgotFeedback] = useState<string | null>(null);

  // Password requirement checkers
  const hasLength = password.length > 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasLength && hasUpper && hasLower && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isRegisterMode && !isPasswordValid) {
      setErrorMsg('Please satisfy all password security requirements before proceeding.');
      return;
    }

    try {
      setLoading(true);
      if (isRegisterMode) {
        await register({
          name,
          email,
          password,
          companyName,
          role,
        });
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'CUSTOMER' | 'STAFF' | 'ADMIN') => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await quickDemoLogin(demoRole);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await api.auth.forgotPassword(forgotEmail);
      setForgotFeedback((res as any)?.message || res || 'Password reset link sent to your registered email.');
    } catch (err: any) {
      setForgotFeedback(err.message || 'Failed to dispatch reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Hackathon Quick Demo Header */}
      <div className="max-w-md w-full mx-auto mb-6 bg-zinc-900 text-white rounded-3xl p-4 shadow-lg border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hackathon Quick-Access Credentials:</span>
          </div>
          <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
            1-Click Demo
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('CUSTOMER')}
            className="px-2.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white transition text-center shadow-sm"
          >
            Customer (Alex)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('STAFF')}
            className="px-2.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-[11px] font-bold text-white transition text-center shadow-sm"
          >
            Staff (Sarah)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('ADMIN')}
            className="px-2.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-[11px] font-bold text-white transition text-center shadow-sm"
          >
            Admin (Marcus)
          </button>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center mx-auto shadow-md">
            <Layers className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
            brightloop
          </h2>
          <p className="text-zinc-500 text-sm">
            Subscription Management Platform & Customer Portal
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="bg-zinc-100 p-1 rounded-full flex text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-full transition ${
              !isRegisterMode ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Sign In to Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-full transition ${
              isRegisterMode ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Retail Solutions"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Select Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 bg-white"
                  >
                    <option value="CUSTOMER">Customer (Self-service access only)</option>
                    <option value="STAFF">Staff (Internal day-to-day operations)</option>
                    <option value="ADMIN">Admin (Full system control)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
              {isRegisterMode && (
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Each email can belong to only one account.
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-zinc-700">Password</label>
                {!isRegisterMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-950 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
            </div>

            {/* Password Validation Checklist (Brightloop Rule Requirement) */}
            {isRegisterMode && password.length > 0 && (
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-1 text-xs">
                <span className="font-bold text-[11px] text-zinc-700 block mb-1">
                  Brightloop Password Security Requirements:
                </span>
                <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-700' : 'text-zinc-400'}`}>
                  {hasLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>More than 8 characters long (length &gt; 8)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700' : 'text-zinc-400'}`}>
                  {hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-700' : 'text-zinc-400'}`}>
                  {hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>At least one lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700' : 'text-zinc-400'}`}>
                  {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>At least one special character (!@#$%^&*)</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isRegisterMode && !isPasswordValid)}
              className="w-full mt-2 py-3 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-zinc-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-950">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotFeedback(null);
                }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Enter your registered email and a reset link will arrive at your address.
            </p>

            {forgotFeedback ? (
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs text-zinc-800 space-y-2">
                <p>{forgotFeedback}</p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 bg-black text-white rounded-full font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email..."
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-xs focus:ring-2 focus:ring-zinc-950"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white rounded-full font-bold text-xs transition"
                >
                  Dispatch Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
