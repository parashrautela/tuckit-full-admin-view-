import React, { useState, useMemo } from 'react';
import { useRealtime } from '@/context/RealtimeContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Drawer } from '@/components/common/Drawer';
import { ForceUnlockModal } from '@/components/control-center/ForceUnlockModal';
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
import { Separator } from '@/components/ui/separator';
import {
  Grid,
  Search,
  Unlock,
  User,
  Wrench,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';

interface SelectedLockerInfo {
  terminalCode: string;
  terminalSite: string;
  doorNumber: string;
  size: string;
  status: string;
  occupantName?: string;
  occupantPhone?: string;
  startTime?: string;
  passcode?: string;
  amount?: number;
}

export const LockerStatus: React.FC = () => {
  const { terminals, showToast, addAuditLog } = useRealtime();
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [selectedLocker, setSelectedLocker] = useState<SelectedLockerInfo | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPasscodeInDrawer, setShowPasscodeInDrawer] = useState(false);
  const [forceUnlockDoor, setForceUnlockDoor] = useState<{ terminalCode: string; lockName: string } | null>(null);

  // Pagination for fleet scale
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const sizes = ['SMALL', 'MEDIUM', 'LARGE', 'XL', '2 PHONE', '4 PHONE', '8 PHONE'] as const;
  const uniqueStates = useMemo(() => [...new Set(terminals.map(t => t.state))].sort(), [terminals]);

  const filteredTerminals = useMemo(() => {
    return terminals.filter(t => {
      if (stateFilter !== 'ALL' && t.state !== stateFilter) return false;
      if (search && !t.code.toLowerCase().includes(search.toLowerCase()) && !t.siteName.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [terminals, search, stateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTerminals.length / itemsPerPage));
  const paginatedTerminals = filteredTerminals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const lockerData = useMemo(() => {
    return paginatedTerminals.map(t => {
      const lockers = Array.from({ length: t.totalLockers }, (_, i) => {
        const idx = i + 1;
        const name = `LKR-${String(idx).padStart(2, '0')}`;
        const size = t.lockerType === 'MOBILE' ? sizes[4 + (i % 3)] : sizes[i % 4];
        const isOccupied = i < t.occupiedLockers;
        const status = isOccupied ? 'OCCUPIED' : (i === t.totalLockers - 1 && t.connectivityStatus === 'OFFLINE' ? 'MAINTENANCE' : 'AVAILABLE');

        const occupantName = isOccupied ? ['Aarav Sharma', 'Pooja Iyer', 'Rahul Verma', 'Sneha Nair', 'Karthik Rao'][i % 5] : undefined;
        const occupantPhone = isOccupied ? `+91 ${9845000000 + i * 1111}` : undefined;
        const startTime = isOccupied ? `${Math.floor(i % 12) + 1} hours ago` : undefined;
        const passcode = isOccupied ? `${1000 + ((i * 357) % 9000)}` : undefined;
        const amount = isOccupied ? (size === 'SMALL' ? 50 : size === 'MEDIUM' ? 80 : 120) : undefined;

        return { name, size, status, occupantName, occupantPhone, startTime, passcode, amount };
      });
      return { terminal: t, lockers };
    });
  }, [paginatedTerminals]);

  const handleLockerClick = (terminal: any, locker: any) => {
    setShowPasscodeInDrawer(false);
    setSelectedLocker({
      terminalCode: terminal.code,
      terminalSite: terminal.siteName,
      doorNumber: locker.name,
      size: locker.size,
      status: locker.status,
      occupantName: locker.occupantName,
      occupantPhone: locker.occupantPhone,
      startTime: locker.startTime,
      passcode: locker.passcode,
      amount: locker.amount,
    });
    setIsDrawerOpen(true);
  };

  const handleToggleDrawerPasscode = () => {
    const next = !showPasscodeInDrawer;
    setShowPasscodeInDrawer(next);
    if (next && selectedLocker) {
      addAuditLog('PII_REVEAL', 'LOCKER_PASSCODE', `${selectedLocker.terminalCode}/${selectedLocker.doorNumber}`, 'Revealed door passcode in locker inspector drawer', 'WARNING');
      showToast('Passcode revealed — Logged in audit trail', 'warning');
    }
  };

  const handleVacate = () => {
    if (!selectedLocker) return;
    addAuditLog('LOCKER_VACATE_MANUAL', 'LOCKER', `${selectedLocker.terminalCode}/${selectedLocker.doorNumber}`, 'Manually vacated and released locker reservation');
    showToast(`Locker ${selectedLocker.doorNumber} at ${selectedLocker.terminalCode} vacated & released`, 'success');
    setSelectedLocker(prev => prev ? { ...prev, status: 'AVAILABLE', occupantName: undefined, occupantPhone: undefined, passcode: undefined } : null);
  };

  const handleToggleMaintenance = () => {
    if (!selectedLocker) return;
    const nextStatus = selectedLocker.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    addAuditLog('LOCKER_MAINTENANCE_TOGGLE', 'LOCKER', `${selectedLocker.terminalCode}/${selectedLocker.doorNumber}`, `Set status to ${nextStatus}`);
    setSelectedLocker(prev => prev ? { ...prev, status: nextStatus } : null);
    showToast(`Locker ${selectedLocker.doorNumber} updated to ${nextStatus}`, 'info');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header & Legend ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Physical Locker Matrix</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Interactive visual matrix of physical hardware locker doors across all {terminals.length} live IoT kiosks.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-lg border border-hairline text-xs font-semibold shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            <span className="text-ink-muted">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500 ring-2 ring-red-100" />
            <span className="text-ink-muted">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" />
            <span className="text-ink-muted">Maintenance</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 size-4 text-ink-subtle" />
              <Input
                type="text"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by terminal code or site..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={stateFilter}
                onChange={e => {
                  setStateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex h-9 rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="ALL">All States ({uniqueStates.length})</option>
                {uniqueStates.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <select
                value={sizeFilter}
                onChange={e => setSizeFilter(e.target.value)}
                className="flex h-9 rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="ALL">All Door Sizes</option>
                {sizes.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pagination Navigator */}
          <div className="flex items-center gap-2 text-xs text-ink-muted shrink-0">
            <span>
              Showing {filteredTerminals.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
              {Math.min(filteredTerminals.length, currentPage * itemsPerPage)} of{' '}
              {filteredTerminals.length} terminals
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="px-2 font-mono font-bold text-ink">
                {currentPage}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Terminal Kiosks Matrix ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {lockerData.map(({ terminal, lockers }) => (
          <Card key={terminal.id} className="hover:border-zinc-300 transition-all flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 border-b border-hairline-soft flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink text-xs bg-zinc-100 px-1.5 py-0.5 rounded border border-hairline">
                    {terminal.code}
                  </span>
                  <span className="text-[10px] text-ink-muted font-mono">({terminal.city})</span>
                </div>
                <div className="text-xs font-semibold text-ink truncate max-w-[220px] mt-0.5">
                  {terminal.siteName}
                </div>
              </div>
              <StatusBadge status={terminal.connectivityStatus} pulse={terminal.connectivityStatus === 'ONLINE'} />
            </CardHeader>

            <CardContent className="p-4 pt-3 flex flex-col gap-2">
              <div className="grid grid-cols-6 gap-1.5">
                {lockers
                  .filter(l => sizeFilter === 'ALL' || l.size === sizeFilter)
                  .map(l => (
                    <button
                      key={l.name}
                      type="button"
                      onClick={() => handleLockerClick(terminal, l)}
                      className={`aspect-square rounded-md border flex flex-col items-center justify-center p-1 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        l.status === 'AVAILABLE'
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          : l.status === 'OCCUPIED'
                          ? 'bg-red-50/80 border-red-200 text-red-800 hover:bg-red-100'
                          : 'bg-amber-50/80 border-amber-200 text-amber-800 hover:bg-amber-100'
                      }`}
                      title={`${l.name} (${l.size}) — ${l.status}`}
                    >
                      <span className="text-[11px] font-bold font-mono leading-none">
                        {l.name.replace('LKR-', '')}
                      </span>
                      <span className="text-[8px] font-bold text-ink-subtle uppercase tracking-tighter mt-1 truncate">
                        {l.size}
                      </span>
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Locker Details Slide-Over Drawer ── */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Locker Door ${selectedLocker?.doorNumber}`}
        subtitle={`Terminal: ${selectedLocker?.terminalCode} (${selectedLocker?.terminalSite})`}
      >
        {selectedLocker && (
          <div className="flex flex-col gap-5 text-xs">
            {/* Status Pill */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-hairline">
              <div>
                <span className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider block">DOOR STATUS</span>
                <span className="text-sm font-bold text-ink">{selectedLocker.status}</span>
              </div>
              <StatusBadge status={selectedLocker.status} />
            </div>

            {/* Hardware Specs */}
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-hairline flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">Locker Size:</span>
                <span className="font-bold text-ink">{selectedLocker.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Terminal Code:</span>
                <span className="font-mono font-bold text-ink">{selectedLocker.terminalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Lock Relay Channel:</span>
                <span className="font-mono text-ink">CH-{selectedLocker.doorNumber.replace('LKR-', '')}</span>
              </div>
            </div>

            {/* Occupant Details if Occupied */}
            {selectedLocker.status === 'OCCUPIED' && (
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200 flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 uppercase tracking-wider">
                  <User className="size-3.5 text-primary" /> Active Customer Occupant
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-ink-muted">Name:</span>
                  <span className="font-bold text-ink">{selectedLocker.occupantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Mobile:</span>
                  <span className="font-mono font-bold text-ink">{selectedLocker.occupantPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Check-in Duration:</span>
                  <span className="font-bold text-emerald-700">{selectedLocker.startTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-ink-muted">Door Passcode:</span>
                    <button
                      type="button"
                      onClick={handleToggleDrawerPasscode}
                      className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                    >
                      {showPasscodeInDrawer ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                      {showPasscodeInDrawer ? 'Mask' : 'Reveal'}
                    </button>
                  </div>
                  <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded-md border border-orange-200">
                    {showPasscodeInDrawer ? selectedLocker.passcode : '••••'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Accrued Amount:</span>
                  <span className="font-bold text-ink">₹{selectedLocker.amount}</span>
                </div>
              </div>
            )}

            {/* Operational Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-hairline-soft">
              <Button
                variant="default"
                onClick={() => {
                  setForceUnlockDoor({
                    terminalCode: selectedLocker.terminalCode,
                    lockName: selectedLocker.doorNumber,
                  });
                }}
                className="w-full justify-center"
              >
                <Unlock className="size-4 text-primary" />
                <span>Emergency Force Open Door</span>
              </Button>

              {selectedLocker.status === 'OCCUPIED' && (
                <Button
                  variant="outline"
                  onClick={handleVacate}
                  className="w-full justify-center text-emerald-700 hover:text-emerald-800"
                >
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Release / Vacate Locker</span>
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={handleToggleMaintenance}
                className="w-full justify-center"
              >
                <Wrench className="size-4 text-amber-600" />
                <span>{selectedLocker.status === 'MAINTENANCE' ? 'Clear Maintenance Mode' : 'Set to Maintenance Mode'}</span>
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Force Unlock Modal */}
      {forceUnlockDoor && (
        <ForceUnlockModal
          isOpen={!!forceUnlockDoor}
          onClose={() => setForceUnlockDoor(null)}
          terminalCode={forceUnlockDoor.terminalCode}
          lockName={forceUnlockDoor.lockName}
        />
      )}
    </div>
  );
};
