import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Modal } from '@/components/common/Modal';
import {
  ShieldCheck,
  Search,
  Download,
  Eye,
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminRole: string;
  action: string;
  target: string;
  ipAddress: string;
  details: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}

const initialAuditLogs: AuditLog[] = [
  { id: 'LOG-9921', timestamp: '16 Aug 2024, 21:04:12', adminName: 'parash', adminRole: 'SUPERADMIN', action: 'FORCE_UNLOCK_LOCKER', target: 'Terminal: MALL-BLR-01 (Door #3)', ipAddress: '106.51.24.112', details: 'Authorized emergency manual unlock for customer ticket #99412', severity: 'WARN' },
  { id: 'LOG-9922', timestamp: '16 Aug 2024, 20:30:00', adminName: 'parash', adminRole: 'SUPERADMIN', action: 'UPDATE_PRICING_RULE', target: 'Rule: PRC-03 (Mall Large)', ipAddress: '106.51.24.112', details: 'Changed initial rate from ₹100 to ₹120', severity: 'INFO' },
  { id: 'LOG-9923', timestamp: '16 Aug 2024, 19:45:18', adminName: 'rohit_ops', adminRole: 'OPERATIONS', action: 'TERMINAL_REMOTE_REBOOT', target: 'Terminal: METRO-DEL-02', ipAddress: '49.36.128.4', details: 'Reboot triggered following 4 consecutive WS socket disconnects', severity: 'CRITICAL' },
  { id: 'LOG-9924', timestamp: '16 Aug 2024, 18:15:33', adminName: 'kavita_fin', adminRole: 'FINANCE', action: 'APPROVE_REFUND', target: 'Refund: REF-7999 (₹300)', ipAddress: '182.73.19.88', details: 'Approved double transaction refund claim via Razorpay API', severity: 'INFO' },
  { id: 'LOG-9925', timestamp: '16 Aug 2024, 17:00:21', adminName: 'parash', adminRole: 'SUPERADMIN', action: 'BLACKLIST_PHONE', target: 'Phone: +91 9988223344', ipAddress: '106.51.24.112', details: 'Physical door tamper detected on kiosk telemetry', severity: 'CRITICAL' },
];

export const AuditLogs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const severityFilter = searchParams.get('severity') || 'ALL';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const [logs] = useState<AuditLog[]>(initialAuditLogs);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filtered = logs.filter(l => {
    if (severityFilter !== 'ALL' && l.severity !== severityFilter) return false;
    if (
      search &&
      !l.adminName.toLowerCase().includes(search.toLowerCase()) &&
      !l.action.toLowerCase().includes(search.toLowerCase()) &&
      !l.target.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Enterprise Audit Trail</h1>
            <Badge variant="outline" size="sm" className="font-mono">
              IMMUTABLE LOGS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Cryptographically signed event trail: hardware commands, overrides, pricing changes, and admin actions.
          </p>
        </div>

        <Button variant="default" size="sm">
          <Download className="size-3.5" />
          <span>Export Audit Log</span>
        </Button>
      </div>

      {/* ── Filter Row ── */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 size-4 text-ink-subtle" />
            <Input
              value={search}
              onChange={e => updateParam('search', e.target.value)}
              placeholder="Search by actor, action, or target asset..."
              className="pl-9"
            />
          </div>

          <select
            value={severityFilter}
            onChange={e => updateParam('severity', e.target.value)}
            className="flex h-9 rounded-md border border-hairline bg-white px-3 py-1 text-xs font-semibold text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full sm:w-48"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARN">Warning Only</option>
            <option value="INFO">Info Only</option>
          </select>
        </CardContent>
      </Card>

      {/* ── Audit Logs Table ── */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:px-6 border-b border-hairline-soft bg-zinc-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-ink">Security Event Stream ({filtered.length})</CardTitle>
            <CardDescription className="text-xs text-ink-muted">
              Live AWS CloudWatch & PostgreSQL event streams
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor / Role</TableHead>
                <TableHead>Action Executed</TableHead>
                <TableHead>Target Asset</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-ink-muted font-medium">
                    No audit logs matching current filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono font-bold text-ink whitespace-nowrap">{l.id}</TableCell>
                    <TableCell className="text-ink-muted font-mono text-[11px] whitespace-nowrap">{l.timestamp}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-semibold text-ink">{l.adminName}</div>
                      <div className="text-[10px] font-bold text-primary uppercase font-mono">{l.adminRole}</div>
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-ink whitespace-nowrap">{l.action}</TableCell>
                    <TableCell className="text-ink-muted font-mono text-xs max-w-[200px] truncate">{l.target}</TableCell>
                    <TableCell className="font-mono text-ink-subtle text-xs whitespace-nowrap">{l.ipAddress}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          l.severity === 'CRITICAL'
                            ? 'destructive'
                            : l.severity === 'WARN'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                        className="font-mono"
                      >
                        {l.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setSelectedLog(l)}
                        className="text-ink-muted hover:text-ink"
                        title="View Full Details"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Log Details Modal ── */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Log Entry — ${selectedLog.id}`}
          subtitle={`${selectedLog.action} executed by ${selectedLog.adminName} at ${selectedLog.timestamp}`}
        >
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3.5 bg-zinc-50 border border-hairline rounded-xl flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Action:</span>
                <span className="font-mono font-bold text-ink">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Target Asset:</span>
                <span className="font-mono text-ink">{selectedLog.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Operator IP:</span>
                <span className="font-mono text-ink-subtle">{selectedLog.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Severity:</span>
                <Badge
                  variant={
                    selectedLog.severity === 'CRITICAL'
                      ? 'destructive'
                      : selectedLog.severity === 'WARN'
                      ? 'warning'
                      : 'info'
                  }
                  size="sm"
                >
                  {selectedLog.severity}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-hairline flex flex-col gap-1">
              <span className="text-[10px] font-bold text-ink-subtle uppercase">Payload & Event Details</span>
              <p className="text-ink leading-relaxed font-mono text-[11px]">{selectedLog.details}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
