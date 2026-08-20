import React, { useState } from 'react';
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
  Shield,
  Plus,
  Search,
  Edit2,
  UserCheck,
} from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'OPERATIONS' | 'SUPPORT_AGENT' | 'FINANCE';
  lastLogin: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

const initialAdmins: AdminUser[] = [
  { id: 'ADM-01', username: 'parash', name: 'Parash Rautela', email: 'parash@tuckit.in', role: 'SUPERADMIN', lastLogin: 'Just now', status: 'ACTIVE' },
  { id: 'ADM-02', username: 'rohit_ops', name: 'Rohit Verma', email: 'rohit.v@tuckit.in', role: 'OPERATIONS', lastLogin: '16 Aug 2024, 17:30', status: 'ACTIVE' },
  { id: 'ADM-03', username: 'sneha_sup', name: 'Sneha Patel', email: 'sneha.p@tuckit.in', role: 'SUPPORT_AGENT', lastLogin: '16 Aug 2024, 18:45', status: 'ACTIVE' },
  { id: 'ADM-04', username: 'kavita_fin', name: 'Kavita Iyer', email: 'kavita.i@tuckit.in', role: 'FINANCE', lastLogin: '15 Aug 2024, 11:20', status: 'ACTIVE' },
];

export const Admins: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', name: '', email: '', role: 'OPERATIONS', password: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.email) return;
    const added: AdminUser = {
      id: `ADM-${String(admins.length + 1).padStart(2, '0')}`,
      username: newAdmin.username,
      name: newAdmin.name || newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role as any,
      lastLogin: 'Never',
      status: 'ACTIVE',
    };
    setAdmins(prev => [added, ...prev]);
    setCreateModal(false);
    setNewAdmin({ username: '', name: '', email: '', role: 'OPERATIONS', password: '' });
  };

  const filtered = admins.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.username.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Internal Admin Accounts</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Manage system administrators, role assignments, and dashboard access credentials.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateModal(true)}
        >
          <Plus className="size-4" />
          <span>Provision Admin</span>
        </Button>
      </div>

      {/* ── Search Bar ── */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-ink-subtle" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search admin name, username or email..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Admins Table ── */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:px-6 border-b border-hairline-soft bg-zinc-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-ink">Operator Directory ({filtered.length})</CardTitle>
            <CardDescription className="text-xs text-ink-muted">
              Active security principals with dashboard access
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin ID</TableHead>
                <TableHead>Username / Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono font-bold text-ink whitespace-nowrap">{a.id}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-semibold text-ink">{a.name}</div>
                    <div className="text-[11px] text-primary font-mono font-medium">@{a.username}</div>
                  </TableCell>
                  <TableCell className="text-ink-muted font-mono text-xs">{a.email}</TableCell>
                  <TableCell>
                    <Badge variant="default" size="sm" className="font-mono text-[10px]">
                      {a.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-ink-muted font-mono text-[11px] whitespace-nowrap">{a.lastLogin}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === 'ACTIVE' ? 'success' : 'destructive'} size="sm">
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" className="text-ink-muted hover:text-ink">
                      <Edit2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Provision Modal ── */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Provision New Admin Account"
        subtitle="Create an internal staff operator account with designated role privileges"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Username *</label>
            <Input
              type="text"
              required
              value={newAdmin.username}
              onChange={e => setNewAdmin(p => ({ ...p, username: e.target.value }))}
              placeholder="e.g. anand_ops"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Full Name</label>
            <Input
              type="text"
              value={newAdmin.name}
              onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Anand Sharma"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Email Address *</label>
            <Input
              type="email"
              required
              value={newAdmin.email}
              onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))}
              placeholder="anand@tuckit.in"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Assigned Role</label>
            <select
              value={newAdmin.role}
              onChange={e => setNewAdmin(p => ({ ...p, role: e.target.value }))}
              className="flex h-9 rounded-md border border-hairline bg-white px-3 py-1 text-xs text-ink shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="OPERATIONS">OPERATIONS (Fleet Diagnostics & Overrides)</option>
              <option value="SUPPORT_AGENT">SUPPORT_AGENT (Customer Service & Unlock)</option>
              <option value="FINANCE">FINANCE (Reports & Refunds)</option>
              <option value="SUPERADMIN">SUPERADMIN (Full Root Privileges)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline-soft">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
