import React, { useState, useMemo } from 'react';
import { useRealtime } from '@/context/RealtimeContext';
import { StatusBadge } from '@/components/common/StatusBadge';
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
  Building2,
  BatteryCharging,
  Sun,
  Zap,
  Radio,
  Search,
  RefreshCw,
  Power,
  CalendarCheck,
  Layers,
} from 'lucide-react';

interface FutureFirstStation {
  id: string;
  code: string;
  name: string;
  type: 'FUTURE_FIRST' | 'SAAS_LOCKER' | 'FOOTY_LOCKER';
  location: string;
  batteryLevel: number;
  solarWatts: number;
  signalDbm: number;
  totalLockers: number;
  occupiedLockers: number;
  status: 'ONLINE' | 'OFFLINE';
  lastHeartbeat: string;
  activeReservations: number;
}

const initialStations: FutureFirstStation[] = [
  { id: 'FF-01', code: 'FF-BLR-SPORTS-01', name: 'Padukone-Dravid Centre for Sports Excellence', type: 'FUTURE_FIRST', location: 'Bengaluru, Karnataka', batteryLevel: 98, solarWatts: 140, signalDbm: -68, totalLockers: 32, occupiedLockers: 14, status: 'ONLINE', lastHeartbeat: '12s ago', activeReservations: 6 },
  { id: 'FF-02', code: 'FF-MUM-FOOTY-01', name: 'Cooperage Football Ground Arena', type: 'FOOTY_LOCKER', location: 'Mumbai, Maharashtra', batteryLevel: 84, solarWatts: 95, signalDbm: -74, totalLockers: 24, occupiedLockers: 19, status: 'ONLINE', lastHeartbeat: '5s ago', activeReservations: 4 },
  { id: 'FF-03', code: 'FF-DEL-SAAS-01', name: 'Cyber City Corporate Hub Station', type: 'SAAS_LOCKER', location: 'Gurugram, Haryana', batteryLevel: 100, solarWatts: 210, signalDbm: -62, totalLockers: 48, occupiedLockers: 28, status: 'ONLINE', lastHeartbeat: 'Just now', activeReservations: 12 },
  { id: 'FF-04', code: 'FF-HYD-SPORTS-02', name: 'Gachibowli Stadium Training Complex', type: 'FUTURE_FIRST', location: 'Hyderabad, Telangana', batteryLevel: 42, solarWatts: 20, signalDbm: -88, totalLockers: 32, occupiedLockers: 8, status: 'OFFLINE', lastHeartbeat: '14m ago', activeReservations: 0 },
];

export const FutureFirst: React.FC = () => {
  const { showToast } = useRealtime();
  const [stations, setStations] = useState<FutureFirstStation[]>(initialStations);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return stations.filter(s => {
      if (typeFilter !== 'ALL' && s.type !== typeFilter) return false;
      if (search && !s.code.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [stations, search, typeFilter]);

  const totalOccupied = stations.reduce((a, b) => a + b.occupiedLockers, 0);
  const totalCapacity = stations.reduce((a, b) => a + b.totalLockers, 0);
  const totalReservations = stations.reduce((a, b) => a + b.activeReservations, 0);

  const handleRebootStation = (code: string) => {
    showToast(`Remote power cycle signal sent to station ${code}`, 'success');
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">Future First Locker Management</h1>
            <Badge variant="outline" size="sm" className="font-mono text-zinc-600">
              PARTNER ECOSYSTEM
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Dedicated off-grid, solar-hybrid, and SaaS partner locker stations across sport complexes and corporate campuses.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => showToast('Future First station telemetry synced', 'info')}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
        >
          <RefreshCw className="size-3.5 mr-1.5" />
          <span>Sync Telemetry</span>
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Stations</span>
              <Layers className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1">{stations.length}</div>
            <span className="text-[11px] text-zinc-500">3 Active / 1 Maintenance</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Capacity</span>
              <Zap className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1">{totalCapacity}</div>
            <span className="text-[11px] text-zinc-500">{totalOccupied} Currently Occupied</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Active Bookings</span>
              <CalendarCheck className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1">{totalReservations}</div>
            <span className="text-[11px] text-zinc-500">Advance mobile bookings</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Solar Yield</span>
              <Sun className="size-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-1">465 W</div>
            <span className="text-[11px] text-zinc-500">Clean off-grid power</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Filter Bar ── */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search partner stations by code or location..."
              className="pl-9"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="flex h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
          >
            <option value="ALL">All Partner Types</option>
            <option value="FUTURE_FIRST">Future First</option>
            <option value="FOOTY_LOCKER">Footy Locker</option>
            <option value="SAAS_LOCKER">SaaS Locker</option>
          </select>
        </CardContent>
      </Card>

      {/* ── Station Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(s => (
          <Card key={s.id} className="hover:border-zinc-300 transition-all flex flex-col justify-between">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold font-mono text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                  {s.code}
                </span>
                <Badge variant="secondary" size="sm" className="font-mono text-[10px] text-zinc-600">
                  {s.type.replace('_', ' ')}
                </Badge>
              </div>
              <StatusBadge status={s.status} pulse={s.status === 'ONLINE'} />
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-3 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">{s.name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{s.location}</p>
              </div>

              {/* Hardware & Sensor Telemetry */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-zinc-50 rounded-lg border border-zinc-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="size-4 text-zinc-500" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Battery</div>
                    <div className="font-semibold font-mono text-zinc-900">{s.batteryLevel}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Sun className="size-4 text-zinc-500" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Solar</div>
                    <div className="font-semibold font-mono text-zinc-900">{s.solarWatts} W</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Radio className="size-4 text-zinc-500" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Signal</div>
                    <div className="font-semibold font-mono text-zinc-900">{s.signalDbm} dBm</div>
                  </div>
                </div>
              </div>

              {/* Occupancy Progress Track */}
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-500">Locker Occupancy</span>
                  <span className="font-semibold text-zinc-900 font-mono">
                    {s.occupiedLockers} / {s.totalLockers} ({Math.round((s.occupiedLockers / s.totalLockers) * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 rounded-full transition-all"
                    style={{ width: `${(s.occupiedLockers / s.totalLockers) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">Heartbeat: {s.lastHeartbeat}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRebootStation(s.code)}
                  className="h-7 px-2.5 text-xs font-medium border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                >
                  <Power className="size-3 mr-1" />
                  <span>Power Cycle</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
