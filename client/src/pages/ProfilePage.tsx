import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.customer.updateProfile({
        name,
        companyName,
        phone,
        address,
      });
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">Account details updated successfully!</span>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Account Settings
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
          Customer Profile & Organization
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Manage your contact credentials, company billing address, and role permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Role & Security Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg">
                {user?.name.charAt(0) || 'C'}
              </div>
              <div>
                <h3 className="font-bold text-zinc-950 text-base">{user?.name}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {user?.role} ROLE
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 text-xs text-zinc-600 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>{user?.companyName || 'Standard Account'}</span>
              </div>
            </div>
          </div>

          {/* Access Policy Card */}
          <div className="bg-indigo-50/60 rounded-3xl p-6 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Access & Privacy Policy</span>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed">
              In accordance with Brightloop security guidelines, customers only have visibility into
              their own registered subscriptions, quotes, and billing statements. Internal staff and
              admin accounts require administrative provisioning.
            </p>
          </div>

          {/* Password Security Rules */}
          <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-150 space-y-3">
            <div className="flex items-center gap-2 text-zinc-800 font-bold text-xs uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-zinc-600" />
              <span>Password Policy</span>
            </div>
            <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4">
              <li>Must be more than 8 characters long</li>
              <li>At least one uppercase letter (A-Z)</li>
              <li>At least one lowercase letter (a-z)</li>
              <li>At least one special character (!@#$%^&*)</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6"
          >
            <h3 className="text-lg font-bold text-zinc-950 border-b border-zinc-100 pb-4">
              Personal & Billing Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                  Registered Email (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Each email belongs to only one account.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Retail Solutions Ltd."
                  className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                Official Billing Address
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, Suite, City, State, ZIP..."
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-sm transition"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
