import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Lock, LogOut, RefreshCw, Trash2, Search, Inbox, PhoneCall,
  CheckCircle2, Mail, Phone, Home, Loader2, ShieldAlert,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://saivilla-backend.onrender.com';
const TOKEN_KEY = 'saivilla_admin_token';

const STATUS_META = {
  new: { label: 'New', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  contacted: { label: 'Contacted', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  closed: { label: 'Closed', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};

function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable — session lives in memory only
  }
}

async function apiFetch(path, { method = 'GET', body, isLogin = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // A 401 on a login attempt means bad credentials, not an expired session.
  if (response.status === 401 && !isLogin) {
    setToken(null);
    const error = new Error('Session expired. Please log in again.');
    error.isAuthError = true;
    throw error;
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${response.status})`);
  }
  return response.json();
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function AdminLogin({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password) return;
    setIsSubmitting(true);
    setError('');
    try {
      const data = await apiFetch('/admin/login', { method: 'POST', body: { password }, isLogin: true });
      setToken(data.token);
      onLoggedIn();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#14110a] via-[#1d1810] to-[#0d0b06] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[#d4af37] tracking-[0.35em] uppercase text-xs mb-2">Saivilla Dreamhouse</p>
          <h1 className="text-white text-3xl font-black">Admin Panel</h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.06] backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl"
          aria-label="Admin login"
        >
          <div className="w-12 h-12 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-5 h-5 text-[#d4af37]" />
          </div>
          <label htmlFor="admin-password" className="block text-white/70 text-sm mb-2">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg bg-black/30 border border-white/15 text-white px-4 py-3 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-colors"
            placeholder="Enter admin password"
          />
          {error && (
            <p role="alert" className="flex items-center gap-2 text-red-400 text-sm mt-3">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full mt-6 rounded-lg bg-[#d4af37] hover:bg-[#b8941f] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign in
          </button>
        </form>
        <a href="#/" className="block text-center text-white/40 hover:text-white/70 text-sm mt-6 transition-colors">
          ← Back to website
        </a>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 leading-none">{value ?? '—'}</div>
        <div className="text-gray-500 text-xs uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
}

function InquiryRow({ inquiry, onStatusChange, onDelete, isBusy }) {
  const meta = STATUS_META[inquiry.status] || STATUS_META.new;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-gray-900">{inquiry.name}</h3>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${meta.badge}`}>
              {meta.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-gray-600">
            <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1.5 hover:text-[#b8941f]">
              <Mail className="w-3.5 h-3.5" /> {inquiry.email}
            </a>
            <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1.5 hover:text-[#b8941f]">
              <Phone className="w-3.5 h-3.5" /> {inquiry.phone}
            </a>
            {inquiry.propertyInterest && (
              <span className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> {inquiry.propertyInterest}
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">{formatDate(inquiry.createdAt)}</div>
      </div>

      <p className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 whitespace-pre-wrap">
        {inquiry.message}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor={`status-${inquiry.id}`} className="text-xs text-gray-500">Status:</label>
          <select
            id={`status-${inquiry.id}`}
            value={inquiry.status}
            disabled={isBusy}
            onChange={(event) => onStatusChange(inquiry.id, event.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none disabled:opacity-50"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(inquiry)}
          className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  );
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

function AdminDashboard({ onLogout }) {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [inquiryList, statData] = await Promise.all([
        apiFetch('/inquiries/?limit=500'),
        apiFetch('/admin/stats'),
      ]);
      setInquiries(inquiryList);
      setStats(statData);
    } catch (err) {
      if (err.isAuthError) {
        onLogout();
        return;
      }
      setError(err.message || 'Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (inquiryId, newStatus) => {
    setBusyId(inquiryId);
    try {
      await apiFetch(`/inquiries/${inquiryId}/status?new_status=${newStatus}`, { method: 'PATCH' });
      setInquiries((current) =>
        current.map((item) => (item.id === inquiryId ? { ...item, status: newStatus } : item))
      );
      const statData = await apiFetch('/admin/stats');
      setStats(statData);
    } catch (err) {
      if (err.isAuthError) return onLogout();
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (inquiry) => {
    const confirmed = window.confirm(`Delete inquiry from ${inquiry.name} (${inquiry.email})? This cannot be undone.`);
    if (!confirmed) return;
    setBusyId(inquiry.id);
    try {
      await apiFetch(`/inquiries/${inquiry.id}`, { method: 'DELETE' });
      setInquiries((current) => current.filter((item) => item.id !== inquiry.id));
      const statData = await apiFetch('/admin/stats');
      setStats(statData);
    } catch (err) {
      if (err.isAuthError) return onLogout();
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const visibleInquiries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      if (filter !== 'all' && inquiry.status !== filter) return false;
      if (!query) return true;
      return [inquiry.name, inquiry.email, inquiry.phone, inquiry.propertyInterest, inquiry.message]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query));
    });
  }, [inquiries, filter, search]);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-[#14110a] border-b border-[#d4af37]/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[#d4af37] tracking-[0.3em] uppercase text-[10px]">Saivilla Dreamhouse</p>
            <h1 className="text-white font-black text-lg leading-tight">Enquiry Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg px-3 py-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Inbox} label="Total enquiries" value={stats?.total} accent="bg-gray-100 text-gray-700" />
          <StatCard icon={ShieldAlert} label="New" value={stats?.byStatus?.new} accent="bg-amber-100 text-amber-700" />
          <StatCard icon={PhoneCall} label="Contacted" value={stats?.byStatus?.contacted} accent="bg-blue-100 text-blue-700" />
          <StatCard icon={CheckCircle2} label="Closed" value={stats?.byStatus?.closed} accent="bg-emerald-100 text-emerald-700" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-[#d4af37] text-black'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone, property…"
              className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
            <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <section aria-label="Enquiries" className="mt-5 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading enquiries…
            </div>
          ) : visibleInquiries.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              No enquiries {filter !== 'all' ? `with status "${filter}"` : ''} found.
            </div>
          ) : (
            visibleInquiries.map((inquiry) => (
              <InquiryRow
                key={inquiry.id}
                inquiry={inquiry}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                isBusy={busyId === inquiry.id}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(() => Boolean(getToken()));

  const handleLogout = useCallback(() => {
    setToken(null);
    setIsAuthed(false);
  }, []);

  if (!isAuthed) {
    return <AdminLogin onLoggedIn={() => setIsAuthed(true)} />;
  }
  return <AdminDashboard onLogout={handleLogout} />;
}
