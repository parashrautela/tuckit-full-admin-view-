import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRealtime } from '../context/RealtimeContext';
import { Booking } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatCard } from '@/components/ui/stat-card';
import { DateRangePicker } from '../components/common/DateRangePicker';
import { Modal } from '../components/common/Modal';
import { ForceUnlockModal } from '../components/control-center/ForceUnlockModal';
import {
  Search,
  Filter,
  RotateCw,
  FileSpreadsheet,
  MoreVertical,
  KeyRound,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Lock,
  Eye,
  EyeOff,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Check,
  X,
} from 'lucide-react';

interface SavedView {
  id: string;
  name: string;
  isBuiltIn?: boolean;
  params: Record<string, string>;
}

const BUILT_IN_VIEWS: SavedView[] = [
  { id: 'view-all', name: 'Default (All Bookings)', isBuiltIn: true, params: {} },
  { id: 'view-active', name: 'Active Occupied Lockers', isBuiltIn: true, params: { status: 'ACTIVE' } },
  { id: 'view-overdue', name: 'Overdue Penalty Alerts', isBuiltIn: true, params: { status: 'OVERDUE' } },
  { id: 'view-touchscreen', name: 'Touchscreen Kiosk Only', isBuiltIn: true, params: { source: 'Touchscreen' } },
  { id: 'view-blr', name: 'Bengaluru Metro & Malls', isBuiltIn: true, params: { city: 'Bengaluru' } },
];

const SAVED_VIEWS_STORAGE_KEY = 'tuckit_saved_views_dashboard';

const computePresetDates = (preset: string): { start: string; end: string } => {
  const today = new Date();
  const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  switch (preset) {
    case 'Today': {
      const s = format(today);
      return { start: s, end: s };
    }
    case 'Yesterday': {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const s = format(y);
      return { start: s, end: s };
    }
    case 'Last 7 Days': {
      const past = new Date(today);
      past.setDate(today.getDate() - 6);
      return { start: format(past), end: format(today) };
    }
    case 'Last 30 Days': {
      const past = new Date(today);
      past.setDate(today.getDate() - 29);
      return { start: format(past), end: format(today) };
    }
    case 'This Month': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: format(first), end: format(today) };
    }
    case 'This Year': {
      const first = new Date(today.getFullYear(), 0, 1);
      return { start: format(first), end: format(today) };
    }
    default:
      return { start: 'Aug 01, 2026', end: 'Aug 16, 2026' };
  }
};

export const Dashboard: React.FC = () => {
  const { bookings, terminals, showToast, addAuditLog } = useRealtime();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-backed filter states
  const mobileFilter = searchParams.get('mobile') || '';
  const sourceFilter = searchParams.get('source') || 'ALL';
  const typeFilter = searchParams.get('type') || 'ALL';
  const statusFilter = searchParams.get('status') || 'ALL';
  const stateFilter = searchParams.get('state') || 'ALL';
  const cityFilter = searchParams.get('city') || 'ALL';
  const siteTypeFilter = searchParams.get('siteType') || 'ALL';
  const terminalFilter = searchParams.get('terminal') || 'ALL';
  const startDate = searchParams.get('startDate') || 'Aug 01, 2026';
  const endDate = searchParams.get('endDate') || 'Aug 16, 2026';
  const activePreset = searchParams.get('preset') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [showAdvanced, setShowAdvanced] = useState(true);

  // Single source of truth for PII reveal state (Passcodes & DOB)
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportIncludeSensitive, setExportIncludeSensitive] = useState(false);

  // Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [forceUnlockBooking, setForceUnlockBooking] = useState<Booking | null>(null);

  // Saved Views State
  const [customViews, setCustomViews] = useState<SavedView[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_VIEWS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  const allSavedViews = useMemo(() => [...BUILT_IN_VIEWS, ...customViews], [customViews]);

  const itemsPerPage = 8;

  // Helper to update a single search param
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL' || (key === 'page' && value === '1')) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const setDateRange = (s: string, e: string, presetName?: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('startDate', s);
    next.set('endDate', e);
    if (presetName) {
      next.set('preset', presetName);
    } else {
      next.delete('preset');
    }
    next.delete('page');
    setSearchParams(next);
  };

  const handleSelectPreset = (preset: string) => {
    const { start, end } = computePresetDates(preset);
    setDateRange(start, end, preset);
    showToast(`Filter set to: ${preset}`, 'info');
  };

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (mobileFilter) count++;
    if (sourceFilter !== 'ALL') count++;
    if (typeFilter !== 'ALL') count++;
    if (statusFilter !== 'ALL') count++;
    if (stateFilter !== 'ALL') count++;
    if (cityFilter !== 'ALL') count++;
    if (siteTypeFilter !== 'ALL') count++;
    if (terminalFilter !== 'ALL') count++;
    if (activePreset) count++;
    return count;
  }, [mobileFilter, sourceFilter, typeFilter, statusFilter, stateFilter, cityFilter, siteTypeFilter, terminalFilter, activePreset]);

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
    showToast('Filters cleared', 'info');
  };

  // Save / Apply Views
  const handleSaveView = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) return;

    const paramsSnapshot: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      paramsSnapshot[key] = val;
    });

    const newView: SavedView = {
      id: `view-custom-${Date.now()}`,
      name: newViewName.trim(),
      params: paramsSnapshot,
    };

    const updated = [...customViews, newView];
    setCustomViews(updated);
    try {
      localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setNewViewName('');
    setShowSaveViewModal(false);
    showToast(`Saved view "${newView.name}"`, 'success');
  };

  const handleDeleteSavedView = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customViews.filter(v => v.id !== id);
    setCustomViews(updated);
    try {
      localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    showToast('Saved view removed', 'info');
  };

  const applyView = (view: SavedView) => {
    const next = new URLSearchParams();
    Object.entries(view.params).forEach(([k, v]) => {
      if (v && v !== 'ALL') next.set(k, v);
    });
    setSearchParams(next);
    showToast(`Applied view: "${view.name}"`, 'success');
  };

  const handleToggleSensitiveData = () => {
    const next = !showSensitiveData;
    setShowSensitiveData(next);
    if (next) {
      addAuditLog('PII_REVEAL', 'BOOKING_DATA', 'FLEET_VIEW', 'Operator unmasked sensitive PII (Passcodes & DOB) in table/session', 'WARNING');
      showToast('Sensitive fields (Passcodes & DOB) unmasked — Access logged to audit trail', 'warning');
    } else {
      showToast('Sensitive fields masked', 'info');
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (mobileFilter && !b.mobileNumber.includes(mobileFilter) && !b.customerName.toLowerCase().includes(mobileFilter.toLowerCase())) {
        return false;
      }
      if (sourceFilter !== 'ALL' && b.bookingSource !== sourceFilter) return false;
      if (typeFilter !== 'ALL' && b.bookingType !== typeFilter) return false;
      if (statusFilter !== 'ALL' && b.bookingStatus !== statusFilter) return false;
      if (stateFilter !== 'ALL' && b.state !== stateFilter) return false;
      if (cityFilter !== 'ALL' && b.city !== cityFilter) return false;
      if (siteTypeFilter !== 'ALL' && b.siteType !== siteTypeFilter) return false;
      if (terminalFilter !== 'ALL' && b.terminalCode !== terminalFilter) return false;
      return true;
    });
  }, [bookings, mobileFilter, sourceFilter, typeFilter, statusFilter, stateFilter, cityFilter, siteTypeFilter, terminalFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExecuteExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'SL,TERMINAL CODE,INVOICE NUMBER,CUSTOMER NAME,MOBILE,OPEN DATE TIME,STATUS,PAYMENT,DOB,LOCK,PASSCODE,DURATION,AMOUNT',
        ...filteredBookings.map(b => {
          const dobVal = b.dateOfBirth ? (exportIncludeSensitive ? b.dateOfBirth : '••••-••-••') : '';
          const passVal = exportIncludeSensitive ? b.passcode : '••••';
          return `${b.serialNumber},"${b.terminalCode}","${b.invoiceNumber}","${b.customerName}","${b.mobileNumber}","${b.openDateTime}","${b.bookingStatus}","${b.paymentMethod}","${dobVal}","${b.lockName}","${passVal}","${b.duration}",${b.amount}`;
        }),
      ].join('\n');

    if (exportIncludeSensitive) {
      addAuditLog('PII_EXPORT_UNMASKED', 'EXPORT_CSV', `${filteredBookings.length} records`, 'Exported bookings dataset with unmasked DOB and Passcodes', 'WARNING');
      showToast(`Exported ${filteredBookings.length} records with unmasked PII — Event logged`, 'warning');
    } else {
      addAuditLog('BOOKINGS_EXPORT', 'EXPORT_CSV', `${filteredBookings.length} records`, 'Exported bookings dataset with masked PII');
      showToast(`Exported ${filteredBookings.length} records (PII masked)`, 'success');
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tuckit_bookings_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total bookings"
          value={bookings.length}
          description="All fleet records"
        />

        <StatCard
          label="Active lockers"
          value={bookings.filter(b => b.bookingStatus === 'ACTIVE').length}
          description="Occupied in real time"
          tone="emphasis"
          emphasisColor="warning"
        />

        <StatCard
          label="Retrieved / done"
          value={bookings.filter(b => b.bookingStatus === 'COMPLETED').length}
          description="Checked out safely"
        />

        <StatCard
          label="Overdue alerts"
          value={bookings.filter(b => b.bookingStatus === 'OVERDUE').length}
          description="Excess time accrued"
          tone="emphasis"
          emphasisColor="danger"
        />
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs p-5 space-y-4">
        {/* Filter Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-zinc-900">Filters</h2>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 text-primary rounded-full text-[10px] font-black">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Refine your search and find bookings quickly (URL-synced)</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => setDateRange(s, e)}
            />

            <button
              type="button"
              onClick={() => setShowSaveViewModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
              title="Save current filters as custom view"
            >
              <BookmarkPlus className="h-3.5 w-3.5 text-primary" />
              <span>Save View</span>
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-2 text-xs font-bold text-primary bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              {showAdvanced ? 'Show Less' : 'Advanced'}
            </button>
          </div>
        </div>

        {/* Saved Views Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Bookmark className="h-3 w-3" /> Views:
          </span>
          {allSavedViews.map(view => {
            const isMatch = Object.entries(view.params).every(([k, v]) => searchParams.get(k) === v);
            return (
              <div
                key={view.id}
                onClick={() => applyView(view)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border cursor-pointer transition-all whitespace-nowrap select-none ${
                  isMatch
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                <span>{view.name}</span>
                {!view.isBuiltIn && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSavedView(view.id, e)}
                    className="p-0.5 text-zinc-400 hover:text-red-500 rounded transition-colors ml-0.5"
                    title="Delete saved view"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Date Range Preset Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar border-t border-zinc-100 pt-2.5">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
            Presets:
          </span>
          {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Year'].map(preset => {
            const isActive = activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-orange-50 hover:text-primary hover:border-orange-200'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>

        {/* Filter Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Search Customer / Mobile
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={mobileFilter}
                onChange={e => updateFilter('mobile', e.target.value)}
                placeholder="Mobile number or name..."
                className="w-full pl-9 pr-3 h-9 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-800 focus:bg-white focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Booking Source
            </label>
            <select
              value={sourceFilter}
              onChange={e => updateFilter('source', e.target.value)}
              className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:bg-white focus:border-primary outline-none"
            >
              <option value="ALL">All Sources</option>
              <option value="Touchscreen">Touchscreen (Kiosk)</option>
              <option value="Web">Web Portal</option>
              <option value="Mobile App">Mobile App</option>
              <option value="WhatsApp">WhatsApp Bot</option>
              <option value="Offline Payment / QR">Offline Payment / QR</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Mobile / Baggage
            </label>
            <select
              value={typeFilter}
              onChange={e => updateFilter('type', e.target.value)}
              className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:bg-white focus:border-primary outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="BAGGAGE">Baggage Locker</option>
              <option value="MOBILE">Mobile Phone Locker</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Booking Status
            </label>
            <select
              value={statusFilter}
              onChange={e => updateFilter('status', e.target.value)}
              className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:bg-white focus:border-primary outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>
        </div>

        {/* Filter Row 2 (Expandable) */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-zinc-100">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">State</label>
              <select
                value={stateFilter}
                onChange={e => updateFilter('state', e.target.value)}
                className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:bg-white focus:border-primary outline-none"
              >
                <option value="ALL">All States</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">City</label>
              <select
                value={cityFilter}
                onChange={e => updateFilter('city', e.target.value)}
                className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:bg-white focus:border-primary outline-none"
              >
                <option value="ALL">All Cities</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Chennai">Chennai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Site Type</label>
              <select
                value={siteTypeFilter}
                onChange={e => updateFilter('siteType', e.target.value)}
                className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:bg-white focus:border-primary outline-none"
              >
                <option value="ALL">All Facility Types</option>
                <option value="AIRPORT">Airport</option>
                <option value="MALL">Shopping Mall</option>
                <option value="METRO">Metro Station</option>
                <option value="COLLEGE">University / College</option>
                <option value="TEMPLE">Temple / Religious</option>
                <option value="RAILWAY">Railway Junction</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Terminal</label>
              <select
                value={terminalFilter}
                onChange={e => updateFilter('terminal', e.target.value)}
                className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:bg-white focus:border-primary outline-none"
              >
                <option value="ALL">All Terminals ({terminals.length})</option>
                {terminals.map(t => (
                  <option key={t.id} value={t.code}>
                    {t.code} — {t.siteName} ({t.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Bookings Data Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 sm:px-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Live Fleet Bookings Stream ({filteredBookings.length} Total)
            </h3>
            <p className="text-xs text-zinc-500">
              Real-time audit log of active, completed, and penalty-incurred reservations
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* PII Masking Toggle Button */}
            <button
              type="button"
              onClick={handleToggleSensitiveData}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showSensitiveData
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {showSensitiveData ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                  <span>Mask Passcodes & DOB</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Reveal Passcodes & DOB</span>
                </>
              )}
            </button>

            {/* Export Dialog Button */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Export CSV...</span>
            </button>
          </div>
        </div>

        {/* Data Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Sl</th>
                <th className="py-3 px-4">Terminal</th>
                <th className="py-3 px-4">Invoice / ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">DOB</th>
                <th className="py-3 px-4">Lock</th>
                <th className="py-3 px-4">Passcode</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900 whitespace-nowrap">
                      <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-[11px]">
                        {b.terminalCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600 whitespace-nowrap">
                      {b.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-zinc-800">{b.customerName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{b.mobileNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600 whitespace-nowrap">
                      {b.openDateTime}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={b.bookingStatus} pulse={b.bookingStatus === 'ACTIVE'} />
                    </td>
                    <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-bold">
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      {b.dateOfBirth ? (
                        showSensitiveData ? (
                          <span className="text-zinc-800 font-semibold">{b.dateOfBirth}</span>
                        ) : (
                          <span className="text-zinc-400">••••-••-••</span>
                        )
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">
                      {b.lockName}
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      {showSensitiveData ? (
                        <span className="font-bold text-zinc-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {b.passcode}
                        </span>
                      ) : (
                        <span className="text-zinc-400">••••</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 whitespace-nowrap">{b.duration}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                      ₹{b.amount}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBooking(b);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setForceUnlockBooking(b)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Force Unlock"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-zinc-400">
                    <AlertTriangle className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
                    <p className="font-semibold text-sm">No bookings match the active filter criteria</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <span className="text-xs text-zinc-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of{' '}
            {filteredBookings.length} entries
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateFilter('page', String(Math.max(1, currentPage - 1)))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-zinc-800 bg-white border border-zinc-200 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => updateFilter('page', String(Math.min(totalPages, currentPage + 1)))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          title={`Booking ${selectedBooking.invoiceNumber}`}
          subtitle={`${selectedBooking.terminalCode} • Lock ${selectedBooking.lockName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Customer Name</span>
                <p className="font-bold text-zinc-900 text-sm">{selectedBooking.customerName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Mobile Number</span>
                <p className="font-mono font-bold text-zinc-800">{selectedBooking.mobileNumber}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Date of Birth</span>
                <p className="font-mono font-bold text-zinc-800">
                  {selectedBooking.dateOfBirth ? (
                    showSensitiveData ? (
                      selectedBooking.dateOfBirth
                    ) : (
                      <span className="text-zinc-400">••••-••-•• (Masked)</span>
                    )
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Door Passcode</span>
                <p className="font-mono font-bold text-zinc-800">
                  {showSensitiveData ? (
                    <span className="text-primary font-black">{selectedBooking.passcode}</span>
                  ) : (
                    <span className="text-zinc-400">•••• (Masked)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedBooking.bookingStatus} />
                </div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Payment Mode</span>
                <p className="font-bold text-zinc-900 mt-1">{selectedBooking.paymentMethod}</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Charged</span>
                <p className="font-bold text-emerald-600 mt-1 text-sm">₹{selectedBooking.amount}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Save View Modal */}
      {showSaveViewModal && (
        <Modal
          isOpen={showSaveViewModal}
          onClose={() => setShowSaveViewModal(false)}
          title="Save Current Filter View"
          subtitle="Save this filter and search configuration for quick access later"
        >
          <form onSubmit={handleSaveView} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                View Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newViewName}
                onChange={e => setNewViewName(e.target.value)}
                placeholder="e.g. Bangalore Active Malls"
                className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900 focus:border-primary outline-none"
                required
                autoFocus
              />
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 text-xs space-y-1 text-zinc-600">
              <span className="font-bold text-zinc-800">Included Parameters:</span>
              <p className="font-mono text-[11px] text-zinc-500 truncate">
                {searchParams.toString() || 'All default filters'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setShowSaveViewModal(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Save View
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Force Unlock Modal */}
      {forceUnlockBooking && (
        <ForceUnlockModal
          isOpen={!!forceUnlockBooking}
          onClose={() => setForceUnlockBooking(null)}
          initialCode={forceUnlockBooking.terminalCode}
          initialLock={forceUnlockBooking.lockName}
        />
      )}

      {/* Export Options Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Bookings Dataset"
          subtitle={`Generate formatted CSV of ${filteredBookings.length} filtered reservations`}
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-zinc-900 block">Export Data Scope:</span>
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
                <div>• Total Rows: <strong>{filteredBookings.length}</strong></div>
                <div>• Format: <strong>CSV / Excel Compatible</strong></div>
                <div>• Active Source: <strong>{sourceFilter}</strong></div>
                <div>• Active Status: <strong>{statusFilter}</strong></div>
              </div>
            </div>

            {/* PII Unmasking Checkbox with Audit Warning */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exportIncludeSensitive}
                  onChange={e => setExportIncludeSensitive(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-300 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Include Unmasked Sensitive PII (Date of Birth & Passcodes)
                  </span>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    By default, customer DOB and door passcodes are exported as masked bullets (••••). Unmasking sensitive credentials will be logged in the system audit trail.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Download CSV ({filteredBookings.length} Rows)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
