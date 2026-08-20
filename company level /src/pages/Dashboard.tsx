import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
<<<<<<< HEAD
import { useRealtime } from '../context/RealtimeContext';
import { Booking } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatCard } from '@/components/ui/stat-card';
import { DateRangePicker } from '../components/common/DateRangePicker';
import { Modal } from '../components/common/Modal';
import { ForceUnlockModal } from '../components/control-center/ForceUnlockModal';
=======
import { useRealtime } from '@/context/RealtimeContext';
import { Booking } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { Modal } from '@/components/common/Modal';
import { ForceUnlockModal } from '@/components/control-center/ForceUnlockModal';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
>>>>>>> tuckit-test
import {
  Search,
  RotateCw,
  FileSpreadsheet,
  KeyRound,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Bookmark,
  BookmarkPlus,
  X,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
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
  { id: 'view-touchscreen', name: 'Touchscreen Kiosks Only', isBuiltIn: true, params: { source: 'Touchscreen' } },
  { id: 'view-blr', name: 'Bengaluru Hubs', isBuiltIn: true, params: { city: 'Bengaluru' } },
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

  const activeCount = bookings.filter(b => b.bookingStatus === 'ACTIVE').length;
  const completedCount = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
  const overdueCount = bookings.filter(b => b.bookingStatus === 'OVERDUE').length;

  return (
<<<<<<< HEAD
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
=======
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Live Fleet Bookings Stream</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Real-time audit log of active reservations, locker assignments, and penalty alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sensitive PII Toggle */}
          <Button
            variant={showSensitiveData ? 'accent' : 'outline'}
            size="sm"
            onClick={handleToggleSensitiveData}
            title="Toggle unmasking of Passcodes & DOB"
          >
            {showSensitiveData ? (
              <>
                <EyeOff className="size-3.5 text-primary" />
                <span>Mask Passcodes</span>
              </>
            ) : (
              <>
                <Eye className="size-3.5 text-ink-muted" />
                <span>Reveal Passcodes</span>
              </>
>>>>>>> tuckit-test
            )}
          </Button>

          {/* Export Dialog */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowExportModal(true)}
          >
            <FileSpreadsheet className="size-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ── 4 KPI Metric Cards (Clean, Consistent Monochromatic Palette) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Total Bookings</span>
              <Layers className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{bookings.length}</div>
            <span className="text-[11px] text-zinc-500">All logged reservations</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Active Lockers</span>
              <Activity className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{activeCount}</div>
            <span className="text-[11px] text-zinc-500">Occupied in real-time</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Checked Out</span>
              <CheckCircle2 className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{completedCount}</div>
            <span className="text-[11px] text-zinc-500">Retrieved safely</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Overdue Alerts</span>
              <AlertCircle className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{overdueCount}</div>
            <span className="text-[11px] text-zinc-500">Excess duration accrued</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Filter & Search Panel ── */}
      <Card>
        <CardHeader className="pb-3 border-b border-hairline-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold text-ink">Fleet Filters & Scope</CardTitle>
              {activeFiltersCount > 0 && (
                <Badge variant="primary" size="sm">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(s, e) => setDateRange(s, e)}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveViewModal(true)}
                title="Save current filters as custom view"
              >
                <BookmarkPlus className="size-3.5 text-primary" />
                <span>Save View</span>
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-ink-muted hover:text-ink"
                >
                  Reset
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Simple Filters' : 'Advanced Filters'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 flex flex-col gap-4">
          {/* Saved Views Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Bookmark className="size-3" /> Views:
            </span>
            {allSavedViews.map(view => {
              const isMatch = Object.entries(view.params).every(([k, v]) => searchParams.get(k) === v);
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => applyView(view)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all whitespace-nowrap ${
                    isMatch
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-ink-muted border-hairline'
                  }`}
                >
                  <span>{view.name}</span>
                  {!view.isBuiltIn && (
                    <span
                      onClick={(e) => handleDeleteSavedView(view.id, e)}
                      className="p-0.5 text-zinc-400 hover:text-red-400 rounded ml-0.5 cursor-pointer"
                      title="Delete saved view"
                    >
                      <X className="size-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar border-t border-hairline-soft pt-3">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider shrink-0 mr-1">
              Presets:
            </span>
            {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Year'].map(preset => {
              const isActive = activePreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-2xs'
                      : 'bg-zinc-50 text-ink-muted border-hairline hover:bg-orange-50 hover:text-primary hover:border-orange-200'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {/* Primary Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                Search Customer / Mobile
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-ink-subtle" />
                <Input
                  type="text"
                  value={mobileFilter}
                  onChange={e => updateFilter('mobile', e.target.value)}
                  placeholder="Mobile number or name..."
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                Booking Source
              </label>
              <select
                value={sourceFilter}
                onChange={e => updateFilter('source', e.target.value)}
                className="flex h-9 w-full rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="ALL">All Sources</option>
                <option value="Touchscreen">Touchscreen (Kiosk)</option>
                <option value="Web">Web Portal</option>
                <option value="Mobile App">Mobile App</option>
                <option value="WhatsApp">WhatsApp Bot</option>
                <option value="Offline Payment / QR">Offline Payment / QR</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                Locker Type
              </label>
              <select
                value={typeFilter}
                onChange={e => updateFilter('type', e.target.value)}
                className="flex h-9 w-full rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="ALL">All Types</option>
                <option value="BAGGAGE">Baggage Locker</option>
                <option value="MOBILE">Mobile Phone Locker</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                Booking Status
              </label>
              <select
                value={statusFilter}
                onChange={e => updateFilter('status', e.target.value)}
                className="flex h-9 w-full rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>
          </div>

          {/* Advanced Filter Grid (State, City, SiteType, Terminal) */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-hairline-soft">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">State</label>
                <select
                  value={stateFilter}
                  onChange={e => updateFilter('state', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">City</label>
                <select
                  value={cityFilter}
                  onChange={e => updateFilter('city', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Site Type</label>
                <select
                  value={siteTypeFilter}
                  onChange={e => updateFilter('siteType', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Terminal Node</label>
                <select
                  value={terminalFilter}
                  onChange={e => updateFilter('terminal', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        </CardContent>
      </Card>

      {/* ── Main Bookings Stream Table ── */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:px-6 border-b border-hairline-soft bg-zinc-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-ink">
              Live Reservations Stream ({filteredBookings.length} total)
            </CardTitle>
            <CardDescription className="text-xs text-ink-muted">
              Auto-syncing realtime MQTT telemetry feed
            </CardDescription>
          </div>

          <Badge variant="outline" className="font-mono text-[11px]">
            Page {currentPage} of {totalPages}
          </Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Terminal</TableHead>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Check-In Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Door</TableHead>
                <TableHead>Passcode</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((b, idx) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-ink-subtle">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-ink whitespace-nowrap">
                      <span className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-[11px] border border-hairline-soft">
                        {b.terminalCode}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-ink-muted whitespace-nowrap">
                      {b.invoiceNumber}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-semibold text-ink">{b.customerName}</div>
                      <div className="text-[11px] text-ink-subtle font-mono">{b.mobileNumber}</div>
                    </TableCell>
                    <TableCell className="font-mono text-ink-muted whitespace-nowrap">
                      {b.openDateTime}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={b.bookingStatus} pulse={b.bookingStatus === 'ACTIVE'} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary" size="sm">
                        {b.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono whitespace-nowrap">
                      {b.dateOfBirth ? (
                        showSensitiveData ? (
                          <span className="text-ink font-medium">{b.dateOfBirth}</span>
                        ) : (
                          <span className="text-ink-subtle">••••-••-••</span>
                        )
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-zinc-700 whitespace-nowrap">
                      {b.lockName}
                    </TableCell>
                    <TableCell className="font-mono whitespace-nowrap">
                      {showSensitiveData ? (
                        <span className="font-semibold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                          {b.passcode}
                        </span>
                      ) : (
                        <span className="text-zinc-400">••••</span>
                      )}
                    </TableCell>
                    <TableCell className="text-ink-muted whitespace-nowrap">{b.duration}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-ink whitespace-nowrap">
                      ₹{b.amount}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setSelectedBooking(b);
                            setShowDetailsModal(true);
                          }}
                          className="text-ink-muted hover:text-ink"
                          title="View Details"
                        >
                          <FileText className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setForceUnlockBooking(b)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Emergency Force Unlock"
                        >
                          <KeyRound className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} className="py-12 text-center text-ink-muted">
                    <AlertTriangle className="size-8 mx-auto text-ink-subtle mb-2" />
                    <p className="font-semibold text-sm text-ink">No bookings match the active filter criteria</p>
                    <p className="text-xs text-ink-subtle mt-0.5">Try resetting or adjusting the filter conditions above.</p>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={resetFilters}
                      className="mt-3"
                    >
                      Clear All Filters
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Table Pagination Bar ── */}
        <div className="p-3 sm:px-6 border-t border-hairline-soft flex items-center justify-between bg-zinc-50/50">
          <span className="text-xs text-ink-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of{' '}
            {filteredBookings.length} entries
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('page', String(Math.max(1, currentPage - 1)))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
              <span>Previous</span>
            </Button>
            <span className="px-3 py-1 text-xs font-semibold text-ink bg-white border border-hairline rounded-md">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('page', String(Math.min(totalPages, currentPage + 1)))}
              disabled={currentPage === totalPages}
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Booking Details Modal ── */}
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
          <div className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-50 rounded-xl border border-hairline">
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase">Customer Name</span>
                <p className="font-bold text-ink text-sm mt-0.5">{selectedBooking.customerName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase">Mobile Number</span>
                <p className="font-mono font-bold text-ink mt-0.5">{selectedBooking.mobileNumber}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase">Date of Birth</span>
                <p className="font-mono font-bold text-ink mt-0.5">
                  {selectedBooking.dateOfBirth ? (
                    showSensitiveData ? (
                      selectedBooking.dateOfBirth
                    ) : (
                      <span className="text-ink-subtle">••••-••-•• (Masked)</span>
                    )
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase">Door Passcode</span>
                <p className="font-mono font-bold text-ink mt-0.5">
                  {showSensitiveData ? (
                    <span className="text-primary font-black">{selectedBooking.passcode}</span>
                  ) : (
                    <span className="text-ink-subtle">•••• (Masked)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-zinc-50 rounded-lg border border-hairline">
                <span className="text-[10px] text-ink-muted font-bold uppercase">Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedBooking.bookingStatus} />
                </div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-hairline">
                <span className="text-[10px] text-ink-muted font-bold uppercase">Payment Mode</span>
                <p className="font-bold text-ink mt-1">{selectedBooking.paymentMethod}</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-hairline">
                <span className="text-[10px] text-ink-muted font-bold uppercase">Total Charged</span>
                <p className="font-bold text-emerald-600 mt-1 text-sm">₹{selectedBooking.amount}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Save View Modal ── */}
      {showSaveViewModal && (
        <Modal
          isOpen={showSaveViewModal}
          onClose={() => setShowSaveViewModal(false)}
          title="Save Current Filter View"
          subtitle="Save this filter and search configuration for quick access later"
        >
          <form onSubmit={handleSaveView} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                View Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={newViewName}
                onChange={e => setNewViewName(e.target.value)}
                placeholder="e.g. Bangalore Active Malls"
                required
                autoFocus
              />
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-hairline text-xs flex flex-col gap-1 text-ink-muted">
              <span className="font-bold text-ink">Included Parameters:</span>
              <p className="font-mono text-[11px] text-ink-subtle truncate">
                {searchParams.toString() || 'All default filters'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline-soft">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSaveViewModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Save View
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Force Unlock Modal ── */}
      {forceUnlockBooking && (
        <ForceUnlockModal
          isOpen={!!forceUnlockBooking}
          onClose={() => setForceUnlockBooking(null)}
          initialCode={forceUnlockBooking.terminalCode}
          initialLock={forceUnlockBooking.lockName}
        />
      )}

      {/* ── Export Options Modal ── */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Bookings Dataset"
          subtitle={`Generate formatted CSV of ${filteredBookings.length} filtered reservations`}
        >
          <div className="flex flex-col gap-4">
            <div className="p-3.5 bg-zinc-50 border border-hairline rounded-xl flex flex-col gap-2">
              <span className="text-xs font-bold text-ink block">Export Data Scope:</span>
              <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted">
                <div>• Total Rows: <strong className="text-ink">{filteredBookings.length}</strong></div>
                <div>• Format: <strong className="text-ink">CSV / Excel Compatible</strong></div>
                <div>• Active Source: <strong className="text-ink">{sourceFilter}</strong></div>
                <div>• Active Status: <strong className="text-ink">{statusFilter}</strong></div>
              </div>
            </div>

            {/* PII Unmasking Checkbox with Audit Warning */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col gap-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exportIncludeSensitive}
                  onChange={e => setExportIncludeSensitive(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-300 text-primary focus:ring-primary size-4"
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline-soft">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleExecuteExport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Download CSV ({filteredBookings.length} Rows)</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
