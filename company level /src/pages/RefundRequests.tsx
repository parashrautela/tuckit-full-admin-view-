import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
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

interface RefundRequest {
  id: string;
  bookingId: string;
  customerName: string;
  phone: string;
  terminalCode: string;
  amount: number;
  reason: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentGatewayRef: string;
}

const initialRequests: RefundRequest[] = [
  { id: 'REF-8012', bookingId: 'BK-99412', customerName: 'Arjun Rao', phone: '+91 9845012345', terminalCode: 'MALL-BLR-01', amount: 240, reason: 'Door failed to open after payment, locker was empty', requestedAt: '16 Aug 2024, 18:30', status: 'PENDING', paymentGatewayRef: 'pay_Nz9823kLm1' },
  { id: 'REF-8013', bookingId: 'BK-99418', customerName: 'Divya N', phone: '+91 9711223344', terminalCode: 'METRO-DEL-04', amount: 150, reason: 'Accidental double payment via UPI', requestedAt: '16 Aug 2024, 19:15', status: 'PENDING', paymentGatewayRef: 'pay_Kp8821aBb2' },
  { id: 'REF-8014', bookingId: 'BK-99425', customerName: 'Sanjay Gupta', phone: '+91 9988776655', terminalCode: 'MALL-MUM-02', amount: 350, reason: 'Cancelled booking within 5 minutes', requestedAt: '16 Aug 2024, 20:00', status: 'PENDING', paymentGatewayRef: 'pay_Mm5431xZz9' },
  { id: 'REF-8015', bookingId: 'BK-99430', customerName: 'Ananya Roy', phone: '+91 9123456780', terminalCode: 'AIRP-HYD-01', amount: 480, reason: 'Terminal rebooted during checkout', requestedAt: '16 Aug 2024, 21:10', status: 'PENDING', paymentGatewayRef: 'pay_Tt1290pQq3' },
];

export const RefundRequests: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'PENDING';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const [requests, setRequests] = useState<RefundRequest[]>(initialRequests);
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'APPROVE' | 'REJECT'; item: RefundRequest | null }>({ isOpen: false, type: 'APPROVE', item: null });
  const [adminNote, setAdminNote] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const handleAction = (status: 'APPROVED' | 'REJECTED') => {
    if (!actionModal.item) return;
    setRequests(prev => prev.map(r => r.id === actionModal.item!.id ? { ...r, status } : r));
    setToastMessage(`Refund ${actionModal.item.id} has been ${status.toLowerCase()} successfully.`);
    setActionModal({ isOpen: false, type: 'APPROVE', item: null });
    setAdminNote('');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search && !r.customerName.toLowerCase().includes(search.toLowerCase()) && !r.phone.includes(search) && !r.bookingId.toLowerCase().includes(search.toLowerCase()) && !r.terminalCode.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Refund Claims Queue</h1>
            <Badge variant={pendingCount > 0 ? 'warning' : 'outline'} size="sm" className="font-mono">
              {pendingCount} PENDING
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Review, audit, approve, or decline customer refund requests and payment reversals.
          </p>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 size-4 text-ink-subtle" />
            <Input
              value={search}
              onChange={e => updateParam('search', e.target.value)}
              placeholder="Search by customer name, phone, booking ID, or terminal..."
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => updateParam('status', e.target.value)}
            className="flex h-9 rounded-md border border-hairline bg-white px-3 py-1 text-xs font-semibold text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full sm:w-56"
          >
            <option value="PENDING">Status: Pending ({pendingCount})</option>
            <option value="APPROVED">Status: Approved</option>
            <option value="REJECTED">Status: Rejected</option>
            <option value="ALL">All Statuses</option>
          </select>
        </CardContent>
      </Card>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:px-6 border-b border-hairline-soft bg-zinc-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-ink">
              Refund Claims List ({filteredRequests.length})
            </CardTitle>
            <CardDescription className="text-xs text-ink-muted">
              Live queue connected to gateway reconciliations
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Refund ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Terminal</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-ink-muted font-medium">
                    No refund requests matching current filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono font-bold text-ink whitespace-nowrap">{r.id}</TableCell>
                    <TableCell className="font-mono font-semibold text-primary whitespace-nowrap">{r.bookingId}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-semibold text-ink">{r.customerName}</div>
                      <div className="text-[11px] text-ink-subtle font-mono">{r.phone}</div>
                    </TableCell>
                    <TableCell className="font-mono text-ink font-medium whitespace-nowrap">{r.terminalCode}</TableCell>
                    <TableCell className="font-bold text-ink font-mono whitespace-nowrap">₹{r.amount}</TableCell>
                    <TableCell className="text-ink-muted max-w-[220px] truncate" title={r.reason}>
                      {r.reason}
                    </TableCell>
                    <TableCell className="text-ink-subtle font-mono text-[11px] whitespace-nowrap">{r.requestedAt}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {r.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setActionModal({ isOpen: true, type: 'APPROVE', item: r })}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-xs font-bold"
                          >
                            <CheckCircle2 className="size-3" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setActionModal({ isOpen: true, type: 'REJECT', item: r })}
                            className="h-7 px-2.5 text-xs font-bold"
                          >
                            <XCircle className="size-3" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      ) : (
                        <Badge variant={r.status === 'APPROVED' ? 'success' : 'destructive'} size="sm" className="font-mono">
                          {r.status}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Action Dialog ── */}
      {actionModal.isOpen && actionModal.item && (
        <Modal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal({ isOpen: false, type: 'APPROVE', item: null })}
          title={`${actionModal.type === 'APPROVE' ? 'Approve' : 'Reject'} Refund ${actionModal.item.id}`}
          subtitle={`Customer: ${actionModal.item.customerName} • Booking ${actionModal.item.bookingId}`}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3.5 bg-zinc-50 border border-hairline rounded-xl flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Claim Amount:</span>
                <span className="font-bold text-ink text-sm">₹{actionModal.item.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Reported Issue:</span>
                <span className="font-semibold text-ink">{actionModal.item.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Gateway Ref:</span>
                <span className="font-mono text-ink-subtle">{actionModal.item.paymentGatewayRef}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                Audit Note / Verification Reason
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="State verification note for financial ledger..."
                rows={2}
                className="w-full p-2.5 bg-white border border-hairline rounded-md text-xs outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline-soft">
              <Button
                variant="ghost"
                onClick={() => setActionModal({ isOpen: false, type: 'APPROVE', item: null })}
              >
                Cancel
              </Button>
              <Button
                variant={actionModal.type === 'APPROVE' ? 'default' : 'destructive'}
                onClick={() => handleAction(actionModal.type === 'APPROVE' ? 'APPROVED' : 'REJECTED')}
                className={actionModal.type === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              >
                Confirm {actionModal.type === 'APPROVE' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
