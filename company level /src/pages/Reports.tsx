import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRealtime } from '@/context/RealtimeContext';
import { Modal } from '@/components/common/Modal';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  CreditCard,
  IndianRupee,
  Layers,
  ArrowDownToLine,
  Monitor,
  ShieldCheck,
  Smartphone,
  Globe,
  MessageSquare,
  QrCode,
} from 'lucide-react';

interface ExportModalConfig {
  isOpen: boolean;
  type: 'daily' | 'monthly' | 'cancellation';
  title: string;
}

const ALL_EXPORT_COLUMNS = [
  { id: 'bookingId', label: 'Booking ID / Serial', defaultChecked: true },
  { id: 'invoiceNumber', label: 'Invoice Number', defaultChecked: true },
  { id: 'customerName', label: 'Customer Name', defaultChecked: true },
  { id: 'customerPhone', label: 'Customer Mobile', defaultChecked: true },
  { id: 'dateOfBirth', label: 'Date of Birth (PII)', defaultChecked: false },
  { id: 'terminalCode', label: 'Terminal Code', defaultChecked: true },
  { id: 'siteName', label: 'Site / Location Name', defaultChecked: true },
  { id: 'city', label: 'City', defaultChecked: true },
  { id: 'state', label: 'State Jurisdiction', defaultChecked: true },
  { id: 'lockerDoorNumber', label: 'Locker Door #', defaultChecked: true },
  { id: 'lockerSize', label: 'Locker Size / Type', defaultChecked: true },
  { id: 'bookingSource', label: 'Booking Source (Kiosk/Web/App)', defaultChecked: true },
  { id: 'checkinTime', label: 'Check-in Timestamp', defaultChecked: true },
  { id: 'duration', label: 'Total Duration (Hours)', defaultChecked: true },
  { id: 'amount', label: 'Base Amount (₹)', defaultChecked: true },
  { id: 'extraCharges', label: 'Overdue / Excess Charges (₹)', defaultChecked: true },
  { id: 'totalPaid', label: 'Net Total Paid (₹)', defaultChecked: true },
  { id: 'paymentMethod', label: 'Payment Mode (UPI/Cash/Card)', defaultChecked: true },
  { id: 'transactionRef', label: 'Gateway Transaction Ref', defaultChecked: true },
  { id: 'status', label: 'Final Booking Status', defaultChecked: true },
];

export const Reports: React.FC = () => {
  const { terminals, bookings, showToast } = useRealtime();
  const [searchParams, setSearchParams] = useSearchParams();

  // Header Filters (URL-synced)
  const selectedState = searchParams.get('state') || 'ALL';
  const startDate = searchParams.get('startDate') || '2024-08-01';
  const endDate = searchParams.get('endDate') || '2024-08-16';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const setSelectedState = (val: string) => updateParam('state', val);
  const setStartDate = (val: string) => updateParam('startDate', val);
  const setEndDate = (val: string) => updateParam('endDate', val);

  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Export Card Dates
  const [dailyDate, setDailyDate] = useState('2024-08-16');
  const [monthlyMonth, setMonthlyMonth] = useState('08');
  const [monthlyYear, setMonthlyYear] = useState('2024');
  const [cancellationDate, setCancellationDate] = useState('2024-08-16');

  // Terminal-Wise Report Cascade
  const [twState, setTwState] = useState('');
  const [twCity, setTwCity] = useState('');
  const [twTerminalId, setTwTerminalId] = useState('');
  const [twMonth, setTwMonth] = useState('08');
  const [twYear, setTwYear] = useState('2024');
  const [isDownloadingTw, setIsDownloadingTw] = useState(false);

  // Column Customization Modal
  const [exportModal, setExportModal] = useState<ExportModalConfig>({ isOpen: false, type: 'daily', title: '' });
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    ALL_EXPORT_COLUMNS.filter(c => c.defaultChecked).map(c => c.id)
  );
  const [exportStateScope, setExportStateScope] = useState('ALL');
  const [isDownloading, setIsDownloading] = useState(false);

  const uniqueStates = useMemo(() => [...new Set(terminals.map(t => t.state))].sort(), [terminals]);

  const twAvailableCities = useMemo(() => {
    if (!twState) return [];
    return [...new Set(terminals.filter(t => t.state === twState).map(t => t.city))].sort();
  }, [terminals, twState]);

  const twAvailableTerminals = useMemo(() => {
    return terminals.filter(t => {
      if (twState && t.state !== twState) return false;
      if (twCity && t.city !== twCity) return false;
      return true;
    });
  }, [terminals, twState, twCity]);

  // Executive KPI summary calculations
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (selectedState !== 'ALL' && b.state !== selectedState) return false;
      return true;
    });
  }, [bookings, selectedState]);

  const netRevenue = useMemo(() => {
    return filteredBookings.reduce((sum, b) => sum + (b.amount || 0) + (b.extraCharges || 0), 0);
  }, [filteredBookings]);

  const totalTransactions = filteredBookings.length;
  const totalRefundAmount = 4350;
  const refundCount = 18;
  const manualRevenue = useMemo(() => {
    return filteredBookings.filter(b => b.paymentMethod === 'CASH' || b.paymentMethod === 'Manual Rev.').reduce((s, b) => s + b.amount, 0);
  }, [filteredBookings]);

  // Source share data
  const sourceStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Touchscreen': 0,
      'Web': 0,
      'Mobile App': 0,
      'WhatsApp': 0,
      'Offline Payment / QR': 0,
    };
    filteredBookings.forEach(b => {
      const src = b.bookingSource || 'Touchscreen';
      counts[src] = (counts[src] || 0) + 1;
    });
    const total = filteredBookings.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [filteredBookings]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date().toLocaleTimeString());
      setIsRefreshing(false);
      showToast('Report analytics synced from live transaction streams', 'success');
    }, 600);
  };

  const openExportModal = (type: 'daily' | 'monthly' | 'cancellation', title: string) => {
    setExportModal({ isOpen: true, type, title });
  };

  const toggleColumn = (id: string) => {
    setSelectedColumns(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]));
  };

  const handleSelectAllColumns = (all: boolean) => {
    if (all) {
      setSelectedColumns(ALL_EXPORT_COLUMNS.map(c => c.id));
    } else {
      setSelectedColumns(['bookingId', 'customerName', 'totalPaid', 'status']);
    }
  };

  const handleExecuteExport = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setExportModal({ isOpen: false, type: 'daily', title: '' });

      const fileName =
        exportModal.type === 'daily'
          ? `transactions_${exportStateScope}_${dailyDate}.xlsx`
          : exportModal.type === 'monthly'
          ? `transactions_${exportStateScope}_${monthlyYear}_${monthlyMonth}.xlsx`
          : `cancellations_${cancellationDate}.csv`;

      // Trigger synthetic download
      const element = document.createElement('a');
      const file = new Blob([
        `Tuckit Report: ${exportModal.title}\nDate Scope: ${dailyDate}\nState Scope: ${exportStateScope}\nColumns: ${selectedColumns.join(', ')}\nTotal Rows: ${filteredBookings.length}\n\nGenerated by Tuckit Admin Control Center`,
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      showToast(`${fileName} downloaded successfully`, 'success');
    }, 1200);
  };

  const handleTerminalReportDownload = () => {
    if (!twTerminalId) {
      showToast('Please select a terminal first', 'warning');
      return;
    }
    const tObj = terminals.find(t => t.id === twTerminalId || t.code === twTerminalId);
    const code = tObj ? tObj.code : 'terminal';
    setIsDownloadingTw(true);

    setTimeout(() => {
      setIsDownloadingTw(false);
      const fileName = `invoice_report_${code}_${twYear}_${twMonth}.xlsx`;
      const element = document.createElement('a');
      const file = new Blob([
        `Tuckit Terminal Monthly Report\nTerminal: ${code}\nYear-Month: ${twYear}-${twMonth}\nSite: ${tObj?.siteName}\nGenerated at: ${new Date().toISOString()}`,
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      showToast(`${fileName} downloaded successfully`, 'success');
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── Header & Global Report Scope Filter ── */}
      <Card>
        <CardContent className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Reports & Financial Analytics</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Executive business intelligence, revenue realizations, and audit-ready data exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Global State Scope */}
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="flex h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-800 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 font-medium"
            >
              <option value="ALL">All States (National)</option>
              {uniqueStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Date Scope */}
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-md p-1 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-transparent px-2 py-0.5 outline-none text-xs font-mono text-zinc-800"
              />
              <span className="text-zinc-400 font-medium text-[11px]">to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-transparent px-2 py-0.5 outline-none text-xs font-mono text-zinc-800"
              />
            </div>

            {/* Sync Button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync: {lastRefreshed}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 5 Executive KPI Summary Cards (Clean, Consistent Monochromatic Palette) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Net Revenue</span>
              <IndianRupee className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">₹{netRevenue.toLocaleString()}</div>
            <span className="text-[11px] text-zinc-500">Post-refund realized</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Success Count</span>
              <CreditCard className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">{totalTransactions}</div>
            <span className="text-[11px] text-zinc-500">Successful deposits</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Refund</span>
              <RotateCcw className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">₹{totalRefundAmount.toLocaleString()}</div>
            <span className="text-[11px] text-zinc-500">1.8% of gross volume</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Refund Count</span>
              <ShieldCheck className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">{refundCount}</div>
            <span className="text-[11px] text-zinc-500">Resolved claims</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Manual Rev.</span>
              <Layers className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">₹{manualRevenue.toLocaleString()}</div>
            <span className="text-[11px] text-zinc-500">Cash desk & OTC</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Booking Channel Share & Adoption Trends ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Share */}
        <Card>
          <CardHeader className="p-4 pb-2 border-b border-zinc-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-zinc-700" />
              <CardTitle className="text-sm font-semibold text-zinc-900">Booking Channel Distribution</CardTitle>
            </div>
            <Badge variant="outline" size="sm" className="text-zinc-500 font-normal">Current Period</Badge>
          </CardHeader>

          <CardContent className="p-4 pt-3 flex flex-col gap-3">
            {sourceStats.map(s => (
              <div key={s.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-700 flex items-center gap-2">
                    {s.name === 'Touchscreen' && <Monitor className="size-3.5 text-zinc-400" />}
                    {s.name === 'Web' && <Globe className="size-3.5 text-zinc-400" />}
                    {s.name === 'Mobile App' && <Smartphone className="size-3.5 text-zinc-400" />}
                    {s.name === 'WhatsApp' && <MessageSquare className="size-3.5 text-zinc-400" />}
                    {s.name === 'Offline Payment / QR' && <QrCode className="size-3.5 text-zinc-400" />}
                    {s.name}
                  </span>
                  <span className="font-mono text-zinc-900 font-semibold">
                    {s.count} ({s.pct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Adoption Trends */}
        <Card>
          <CardHeader className="p-4 pb-2 border-b border-zinc-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-zinc-700" />
              <CardTitle className="text-sm font-semibold text-zinc-900">Channel Growth & Insight</CardTitle>
            </div>
            <Badge variant="outline" size="sm" className="text-zinc-500 font-normal">6-Month Trend</Badge>
          </CardHeader>

          <CardContent className="p-4 pt-3 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 text-center">
                <div className="text-[10px] text-zinc-500 font-semibold uppercase">Touchscreen</div>
                <div className="text-lg font-bold text-zinc-900 mt-1">68.4%</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Primary Kiosk UI</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 text-center">
                <div className="text-[10px] text-zinc-500 font-semibold uppercase">Mobile App</div>
                <div className="text-lg font-bold text-zinc-900 mt-1">19.2%</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">iOS & Android</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 text-center">
                <div className="text-[10px] text-zinc-500 font-semibold uppercase">WhatsApp Bot</div>
                <div className="text-lg font-bold text-zinc-900 mt-1">12.4%</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Auto Check-in</div>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200/80">
              <strong className="text-zinc-900 font-semibold">Executive Insight:</strong> App and WhatsApp adoption rates grew by 32% across Tier-1 airports and metro stations in Q3, reducing kiosk touch latency by 45 seconds per check-in.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Export Control Center Section ── */}
      <div className="flex items-center gap-2 pt-2">
        <ArrowDownToLine className="size-4 text-zinc-700" />
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Export Control Center</h2>
          <p className="text-xs text-zinc-500">
            Generate itemized XLSX/CSV records for regional compliance, daily cash closing, and tax reporting.
          </p>
        </div>
      </div>

      {/* 4 Dedicated Export Cards (Consistent, Clean Neutral Cards) */}
      <div className="grid grid-cols-1 gap-3.5">
        {/* Card 1: Daily Transaction Report */}
        <Card>
          <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-zinc-100 text-zinc-700 rounded-lg shrink-0 mt-0.5">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Daily Transaction Itemized Report</h3>
                <p className="text-xs text-zinc-500 mt-0.5 max-w-xl">
                  Full itemized record of all successful payments, extensions, and refunds for a single day.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="date"
                    value={dailyDate}
                    onChange={e => setDailyDate(e.target.value)}
                    className="h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-mono font-medium text-zinc-800 outline-none focus:border-zinc-950"
                  />
                  <span className="text-[11px] text-zinc-400">Selected Date</span>
                </div>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => openExportModal('daily', 'Daily Transaction Report')}
              className="bg-zinc-900 hover:bg-zinc-800 text-white shrink-0 self-start md:self-center font-medium"
            >
              <Download className="size-3.5 mr-1.5" />
              <span>Configure & Export</span>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Monthly Financial Summary */}
        <Card>
          <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-zinc-100 text-zinc-700 rounded-lg shrink-0 mt-0.5">
                <Calendar className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Monthly Financial & State Tax Summary</h3>
                <p className="text-xs text-zinc-500 mt-0.5 max-w-xl">
                  Consolidated transaction logs grouped by state. Essential for monthly accounts and tax auditing.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={monthlyMonth}
                    onChange={e => setMonthlyMonth(e.target.value)}
                    className="h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium text-zinc-800 outline-none focus:border-zinc-950"
                  >
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                  <select
                    value={monthlyYear}
                    onChange={e => setMonthlyYear(e.target.value)}
                    className="h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium text-zinc-800 outline-none focus:border-zinc-950"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => openExportModal('monthly', 'Monthly Financial Summary')}
              className="bg-zinc-900 hover:bg-zinc-800 text-white shrink-0 self-start md:self-center font-medium"
            >
              <Download className="size-3.5 mr-1.5" />
              <span>Configure & Export</span>
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Cancellation Audit Log */}
        <Card>
          <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-zinc-100 text-zinc-700 rounded-lg shrink-0 mt-0.5">
                <RotateCcw className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Cancellation & Refund Audit Log</h3>
                <p className="text-xs text-zinc-500 mt-0.5 max-w-xl">
                  Security-focused summary of manually and automatically cancelled bookings for the selected date.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="date"
                    value={cancellationDate}
                    onChange={e => setCancellationDate(e.target.value)}
                    className="h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-mono font-medium text-zinc-800 outline-none focus:border-zinc-950"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => openExportModal('cancellation', 'Cancellation Audit Log')}
              className="bg-zinc-900 hover:bg-zinc-800 text-white shrink-0 self-start md:self-center font-medium"
            >
              <Download className="size-3.5 mr-1.5" />
              <span>Configure & Export</span>
            </Button>
          </CardContent>
        </Card>

        {/* Card 4: Terminal-Wise Monthly Invoice Report */}
        <Card>
          <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-zinc-100 text-zinc-700 rounded-lg shrink-0 mt-0.5">
                <Monitor className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Terminal-Wise Monthly Invoice Report</h3>
                <p className="text-xs text-zinc-500 mt-0.5 max-w-xl">
                  Download a detailed financial summary for a specific terminal node with State, City, and Terminal filtering.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-zinc-100">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  State
                </label>
                <select
                  value={twState}
                  onChange={e => {
                    setTwState(e.target.value);
                    setTwCity('');
                    setTwTerminalId('');
                  }}
                  className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium text-zinc-800 outline-none focus:border-zinc-950"
                >
                  <option value="">Select State</option>
                  {uniqueStates.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  City
                </label>
                <select
                  value={twCity}
                  disabled={!twState}
                  onChange={e => {
                    setTwCity(e.target.value);
                    setTwTerminalId('');
                  }}
                  className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium text-zinc-800 outline-none focus:border-zinc-950 disabled:opacity-50"
                >
                  <option value="">Select City</option>
                  {twAvailableCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Terminal Code
                </label>
                <select
                  value={twTerminalId}
                  onChange={e => setTwTerminalId(e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-mono font-medium text-zinc-800 outline-none focus:border-zinc-950"
                >
                  <option value="">Select Terminal ({twAvailableTerminals.length} Available)</option>
                  {twAvailableTerminals.map(t => (
                    <option key={t.id} value={t.code}>
                      {t.code} — {t.siteName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Month & Year
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={twMonth}
                    onChange={e => setTwMonth(e.target.value)}
                    className="flex-1 h-9 px-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium text-zinc-800 outline-none focus:border-zinc-950"
                  >
                    <option value="01">Jan</option>
                    <option value="02">Feb</option>
                    <option value="03">Mar</option>
                    <option value="04">Apr</option>
                    <option value="05">May</option>
                    <option value="06">Jun</option>
                    <option value="07">Jul</option>
                    <option value="08">Aug</option>
                    <option value="09">Sep</option>
                    <option value="10">Oct</option>
                    <option value="11">Nov</option>
                    <option value="12">Dec</option>
                  </select>
                  <select
                    value={twYear}
                    onChange={e => setTwYear(e.target.value)}
                    className="h-9 px-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium text-zinc-800 outline-none focus:border-zinc-950"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="default"
                  onClick={handleTerminalReportDownload}
                  disabled={isDownloadingTw}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
                >
                  <Download className="size-3.5 mr-1.5" />
                  <span>{isDownloadingTw ? 'Downloading...' : 'Download Report'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Column Customization Modal ── */}
      <Modal
        isOpen={exportModal.isOpen}
        onClose={() => setExportModal({ isOpen: false, type: 'daily', title: '' })}
        title={`Configure & Export: ${exportModal.title}`}
        subtitle="Customize your regional scope and selected data columns before download"
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4 text-xs">
          {/* Regional Scope */}
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                State Jurisdiction Scope
              </label>
              <Badge variant="outline" size="sm" className="font-mono text-zinc-600">
                {exportStateScope === 'ALL' ? 'Multi-Sheet Excel' : 'Single State CSV'}
              </Badge>
            </div>
            <select
              value={exportStateScope}
              onChange={e => setExportStateScope(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-zinc-200 rounded-md text-xs font-medium text-zinc-800 outline-none focus:border-zinc-950"
            >
              <option value="ALL">All States (Multi-Sheet Excel Workbook)</option>
              {uniqueStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Column Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-800">
                Visible Export Columns ({selectedColumns.length} of {ALL_EXPORT_COLUMNS.length} selected)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAllColumns(true)}
                  className="text-[11px] text-zinc-800 font-semibold hover:underline"
                >
                  Select All
                </button>
                <span className="text-zinc-300">•</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllColumns(false)}
                  className="text-[11px] text-zinc-500 font-medium hover:underline"
                >
                  Clear Non-Essential
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 border border-zinc-200 rounded-lg bg-zinc-50/50 custom-scrollbar">
              {ALL_EXPORT_COLUMNS.map(col => {
                const checked = selectedColumns.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer select-none transition-all ${
                      checked
                        ? 'bg-white border-zinc-300 text-zinc-900 font-medium shadow-xs'
                        : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleColumn(col.id)}
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950 size-3.5"
                    />
                    <span className="truncate">{col.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <Button
              variant="ghost"
              onClick={() => setExportModal({ isOpen: false, type: 'daily', title: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleExecuteExport}
              disabled={isDownloading || selectedColumns.length === 0}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
            >
              <Download className="size-3.5 mr-1.5" />
              <span>{isDownloading ? 'Generating File...' : 'Generate & Download'}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
