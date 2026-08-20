import React, { useState, useMemo } from 'react';
import { useRealtime } from '@/context/RealtimeContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PrintQrModal } from '@/components/control-center/PrintQrModal';
import { ScreenCaptureModal } from '@/components/control-center/ScreenCaptureModal';
import { Terminal } from '@/types';
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
import {
  MonitorCheck,
  Wifi,
  WifiOff,
  Activity,
  RefreshCw,
  Search,
  LayoutGrid,
  List,
  Printer,
  Camera,
  Signal,
  ChevronLeft,
  ChevronRight,
  Radio,
  Network,
} from 'lucide-react';

export const DeviceStatus: React.FC = () => {
  const {
    terminals,
    stateCoverage,
    totalTerminals,
    onlineDevices,
    offlineDevices,
    onlinePercentage,
    wsConnectedCount,
    connectionDistribution,
    lastCheckedTime,
    refreshFeed,
  } = useRealtime();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [siteTypeFilter, setSiteTypeFilter] = useState('ALL');
  const [lockerTypeFilter, setLockerTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [networkFilter, setNetworkFilter] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 24 : 20;

  const [printQrTerminal, setPrintQrTerminal] = useState<Terminal | null>(null);
  const [captureTerminal, setCaptureTerminal] = useState<Terminal | null>(null);

  const filteredTerminals = useMemo(() => {
    return terminals.filter(t => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.code.toLowerCase().includes(q) &&
          !t.siteName.toLowerCase().includes(q) &&
          !t.city.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (stateFilter !== 'ALL' && t.state !== stateFilter) return false;
      if (cityFilter !== 'ALL' && t.city !== cityFilter) return false;
      if (siteTypeFilter !== 'ALL' && t.siteType !== siteTypeFilter) return false;
      if (lockerTypeFilter !== 'ALL' && t.lockerType !== lockerTypeFilter) return false;
      if (statusFilter !== 'ALL' && t.connectivityStatus !== statusFilter) return false;
      if (networkFilter !== 'ALL' && t.networkType !== networkFilter) return false;
      return true;
    });
  }, [terminals, searchQuery, stateFilter, cityFilter, siteTypeFilter, lockerTypeFilter, statusFilter, networkFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTerminals.length / itemsPerPage));
  const paginatedTerminals = filteredTerminals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uniqueStates = useMemo(() => [...new Set(terminals.map(t => t.state))].sort(), [terminals]);
  const uniqueCities = useMemo(() => [...new Set(terminals.map(t => t.city))].sort(), [terminals]);

  const slowNetCount = useMemo(
    () => terminals.filter(t => t.connectivityStatus === 'ONLINE' && t.heartbeatSecondsAgo > 15).length,
    [terminals]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Terminal Telemetry & Fleet Status</h1>
            <Badge variant="success" size="sm" className="font-mono">
              MQTT LIVE FEED
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Real-time ping, telemetry, WebSocket state, and remote diagnostics for all deployed kiosks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={refreshFeed}
          >
            <RefreshCw className="size-3.5" />
            <span>Poll Telemetry</span>
          </Button>
        </div>
      </div>

      {/* ── 5 Metric KPI Cards (Clean Monochromatic Palette) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Nodes</span>
              <MonitorCheck className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1">{totalTerminals}</div>
            <span className="text-[11px] text-zinc-500">{onlineDevices} configured active</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Online Nodes</span>
              <Wifi className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1">{onlineDevices}</div>
            <span className="text-[11px] text-zinc-500">{onlinePercentage}% network uptime</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Offline Nodes</span>
              <WifiOff className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1">{offlineDevices}</div>
            <span className="text-[11px] text-zinc-500">Requires attention</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Connection Types</span>
              <Signal className="size-3.5 text-zinc-400" />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block">LAN/WS</span>
                <span className="font-semibold text-zinc-900 font-mono">{connectionDistribution.lan}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">4G SIM</span>
                <span className="font-semibold text-zinc-900 font-mono">{connectionDistribution.sim}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">WiFi</span>
                <span className="font-semibold text-zinc-900 font-mono">{connectionDistribution.wifi}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Sync State</span>
              <Activity className="size-3.5 text-zinc-400" />
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-zinc-900">LIVE SYNC</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono truncate">Checked: {lastCheckedTime}</span>
          </CardContent>
        </Card>
      </div>

      {/* ── State-wise Coverage Section ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Regional Telemetry & State Coverage
          </h2>
          {stateFilter !== 'ALL' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStateFilter('ALL')}
              className="text-xs text-primary"
            >
              Clear state filter ({stateFilter})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {stateCoverage.map(sc => {
            const onlinePct = sc.total > 0 ? Math.round((sc.online / sc.total) * 100) : 0;
            const isSelected = stateFilter === sc.state;

            return (
              <button
                key={sc.state}
                type="button"
                onClick={() => setStateFilter(isSelected ? 'ALL' : sc.state)}
                className={`flex flex-col gap-2 bg-white rounded-xl border p-3.5 text-left transition-all relative overflow-hidden select-none ${
                  isSelected
                    ? 'border-primary ring-1 ring-primary/30 bg-orange-50/20 shadow-2xs'
                    : 'border-hairline hover:border-zinc-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink truncate">{sc.state}</span>
                  <span className="text-xs font-mono font-bold text-ink-muted">{sc.total}</span>
                </div>

                {/* Progress track */}
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${onlinePct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-emerald-600">{sc.online} Online</span>
                  <span className={sc.offline > 0 ? 'text-red-500' : 'text-ink-subtle'}>
                    {sc.offline} Offline
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search, Filters & View Toggle ── */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-2.5 size-4 text-ink-subtle" />
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search terminals by code, site name, city, state..."
                className="pl-9"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-hairline shrink-0">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7 px-2.5 text-xs font-semibold"
              >
                <LayoutGrid className="size-3.5" />
                <span>Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-7 px-2.5 text-xs font-semibold"
              >
                <List className="size-3.5" />
                <span>List</span>
              </Button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-hairline-soft">
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="flex h-8 rounded-md border border-hairline bg-white px-2.5 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="ALL">All States</option>
              {uniqueStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="flex h-8 rounded-md border border-hairline bg-white px-2.5 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="ALL">All Cities</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={siteTypeFilter}
              onChange={e => setSiteTypeFilter(e.target.value)}
              className="flex h-8 rounded-md border border-hairline bg-white px-2.5 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="ALL">All Site Types</option>
              <option value="Mall">Mall</option>
              <option value="Metro">Metro</option>
              <option value="Railway">Railway</option>
              <option value="Airport">Airport</option>
              <option value="Campus">Campus</option>
              <option value="Temple">Temple</option>
              <option value="Commercial">Commercial</option>
            </select>

            <select
              value={lockerTypeFilter}
              onChange={e => setLockerTypeFilter(e.target.value)}
              className="flex h-8 rounded-md border border-hairline bg-white px-2.5 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="ALL">All Locker Types</option>
              <option value="BAGGAGE">Baggage</option>
              <option value="MOBILE">Mobile</option>
              <option value="HYBRID">Hybrid</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex h-8 rounded-md border border-hairline bg-white px-2.5 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="ALL">All Status</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>

            <select
              value={networkFilter}
              onChange={e => setNetworkFilter(e.target.value)}
              className="flex h-8 rounded-md border border-hairline bg-white px-2.5 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="ALL">All Network</option>
              <option value="LAN">LAN</option>
              <option value="SIM">SIM</option>
              <option value="WiFi">WiFi</option>
              <option value="WS">WS</option>
            </select>

            <div className="ml-auto text-xs text-ink-muted self-center font-mono">
              {filteredTerminals.length} of {totalTerminals} nodes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Terminal Card Grid or List View ── */}
      {viewMode === 'grid' ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedTerminals.map(t => (
              <Card key={t.id} className="hover:border-zinc-300 transition-all flex flex-col justify-between">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-ink bg-zinc-100 px-1.5 py-0.5 rounded border border-hairline">
                      {t.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={t.connectivityStatus} pulse={t.connectivityStatus === 'ONLINE'} />
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 flex flex-col gap-2.5">
                  <div>
                    <h4 className="text-xs font-semibold text-ink truncate">{t.siteName}</h4>
                    <p className="text-[11px] text-ink-muted truncate">{t.city}, {t.state}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] p-2.5 bg-zinc-50 rounded-lg border border-hairline-soft">
                    <div>
                      <span className="text-ink-subtle text-[10px] block uppercase">Network</span>
                      <span className="font-bold font-mono text-ink">{t.networkType}</span>
                    </div>
                    <div>
                      <span className="text-ink-subtle text-[10px] block uppercase">Firmware</span>
                      <span className="font-bold font-mono text-ink">{t.firmwareVersion}</span>
                    </div>
                    <div>
                      <span className="text-ink-subtle text-[10px] block uppercase">Hardware</span>
                      <span className="font-bold text-ink">{t.deviceType}</span>
                    </div>
                    <div>
                      <span className="text-ink-subtle text-[10px] block uppercase">Heartbeat</span>
                      <span
                        className={`font-mono font-bold ${
                          t.heartbeatSecondsAgo < 15
                            ? 'text-emerald-600'
                            : t.heartbeatSecondsAgo < 60
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {t.heartbeatSecondsAgo < 60
                          ? `${t.heartbeatSecondsAgo}s ago`
                          : `${Math.floor(t.heartbeatSecondsAgo / 60)}m ago`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPrintQrTerminal(t)}
                      className="flex-1 text-[11px]"
                    >
                      <Printer className="size-3" />
                      <span>Print QR</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCaptureTerminal(t)}
                      className="flex-1 text-[11px]"
                    >
                      <Camera className="size-3" />
                      <span>Capture</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grid View Pagination */}
          <div className="p-3 bg-white rounded-xl border border-hairline flex items-center justify-between text-xs text-ink-muted">
            <span>
              Showing {filteredTerminals.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(filteredTerminals.length, currentPage * itemsPerPage)} of{' '}
              {filteredTerminals.length} nodes
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </Button>
              <span className="px-3 py-1 font-mono font-bold text-ink bg-zinc-50 border border-hairline rounded-md">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Terminal List Table View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Site Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Firmware</TableHead>
                  <TableHead>Device Type</TableHead>
                  <TableHead>Heartbeat</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTerminals.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono font-bold text-ink whitespace-nowrap">
                      {t.code}
                    </TableCell>
                    <TableCell className="text-ink font-medium max-w-[200px] truncate">
                      {t.siteName}
                    </TableCell>
                    <TableCell className="text-ink-muted">{t.state}</TableCell>
                    <TableCell className="text-ink-muted">{t.city}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.connectivityStatus} pulse={t.connectivityStatus === 'ONLINE'} />
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-ink">{t.networkType}</TableCell>
                    <TableCell className="font-mono text-ink-muted">{t.firmwareVersion}</TableCell>
                    <TableCell className="text-ink-muted">{t.deviceType}</TableCell>
                    <TableCell>
                      <span
                        className={`font-mono font-bold ${
                          t.heartbeatSecondsAgo < 15
                            ? 'text-emerald-600'
                            : t.heartbeatSecondsAgo < 60
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {t.heartbeatSecondsAgo < 60 ? `${t.heartbeatSecondsAgo}s` : `${Math.floor(t.heartbeatSecondsAgo / 60)}m`}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setPrintQrTerminal(t)}
                          title="Print QR"
                        >
                          <Printer className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setCaptureTerminal(t)}
                          title="Screen Capture"
                        >
                          <Camera className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-3 sm:px-6 border-t border-hairline-soft flex items-center justify-between bg-zinc-50/50">
            <span className="text-xs text-ink-muted">
              Showing {filteredTerminals.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(filteredTerminals.length, currentPage * itemsPerPage)} of{' '}
              {filteredTerminals.length} nodes
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </Button>
              <span className="px-3 py-1 font-mono font-bold text-ink bg-white border border-hairline rounded-md text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Modals ── */}
      <PrintQrModal isOpen={!!printQrTerminal} onClose={() => setPrintQrTerminal(null)} terminal={printQrTerminal} />
      <ScreenCaptureModal isOpen={!!captureTerminal} onClose={() => setCaptureTerminal(null)} terminal={captureTerminal} />
    </div>
  );
};
