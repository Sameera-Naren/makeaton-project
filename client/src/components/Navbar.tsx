import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ArrowUpRight, ShieldCheck, UserCheck, Layers, Plus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Quotations', path: '/quotations', highlight: true },
    { name: 'Subscriptions', path: '/subscriptions' },
    { name: 'Invoices', path: '/invoices' },
    { name: 'Payments', path: '/payments' },
    { name: 'Account', path: '/profile' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100">
      {/* Top Demo Bar for Hackathon judges & reviewers */}
      <div className="bg-zinc-900 text-zinc-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-zinc-100">Brightloop Subscription Platform</span>
          <span className="hidden sm:inline text-zinc-500">|</span>
          <span className="hidden sm:inline text-zinc-400">Member 1 &amp; Member 3 Active Modules</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Quick Switch:</span>
          <button
            onClick={() => quickDemoLogin('CUSTOMER')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'CUSTOMER'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Customer (Alex)
          </button>
          <button
            onClick={() => quickDemoLogin('STAFF')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'STAFF'
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Staff (Sarah)
          </button>
          <button
            onClick={() => quickDemoLogin('ADMIN')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'ADMIN'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Admin (Marcus)
          </button>
        </div>
      </div>

      {/* Main Reference Style Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-zinc-950 tracking-tight leading-tight">
                brightloop
              </span>
              <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-semibold">
                Enterprise Suite
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-zinc-950 font-bold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`
              }
            >
              <span>{link.name}</span>
              {link.highlight && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-pastel-blue text-indigo-950">
                  M3
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Quick Create Quote Button (Staff/Admin) */}
          {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
            <Link
              to="/quotations/new"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Quote</span>
            </Link>
          )}

          {user && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-xs text-zinc-700">
              {user.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
              {user.role === 'STAFF' && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
              {user.role === 'CUSTOMER' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              <span className="font-medium text-zinc-900">{user.name}</span>
              <span className="text-zinc-400">({user.role})</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 hover:border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
