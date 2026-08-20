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
import { BlacklistUserModal } from '@/components/modals/BlacklistUserModal';
import { User, Search, ShieldAlert, ShieldCheck } from 'lucide-react';

interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
  lastActive: string;
  status: 'ACTIVE' | 'BLACKLISTED';
  joinedDate: string;
}

const initialUsers: CustomerUser[] = [
  { id: 'USR-10921', name: 'Rahul Sharma', phone: '+91 9845011223', email: 'rahul.s@gmail.com', totalBookings: 18, totalSpent: 2840, lastActive: '16 Aug 2024, 19:40', status: 'ACTIVE', joinedDate: '12 Jan 2023' },
  { id: 'USR-10922', name: 'Pooja Nair', phone: '+91 9711889900', email: 'pooja.nair@yahoo.com', totalBookings: 32, totalSpent: 5120, lastActive: '16 Aug 2024, 18:22', status: 'ACTIVE', joinedDate: '04 Mar 2023' },
  { id: 'USR-10923', name: 'Venkatesh Rao', phone: '+91 9988223344', email: 'v.rao@outlook.com', totalBookings: 4, totalSpent: 640, lastActive: '12 Aug 2024, 11:15', status: 'BLACKLISTED', joinedDate: '18 Jun 2023' },
  { id: 'USR-10924', name: 'Ananya Roy', phone: '+91 9123456780', email: 'ananya.roy@gmail.com', totalBookings: 12, totalSpent: 1980, lastActive: '15 Aug 2024, 21:05', status: 'ACTIVE', joinedDate: '09 Sep 2023' },
  { id: 'USR-10925', name: 'Siddharth Jain', phone: '+91 9880123456', email: 'sid.jain@gmail.com', totalBookings: 24, totalSpent: 4100, lastActive: '16 Aug 2024, 15:30', status: 'ACTIVE', joinedDate: '22 Nov 2023' },
];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<CustomerUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [blacklistModalUser, setBlacklistModalUser] = useState<string | null>(null);

  const toggleBlacklist = (user: CustomerUser) => {
    if (user.status === 'ACTIVE') {
      setBlacklistModalUser(user.phone);
    } else {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'ACTIVE' } : u));
    }
  };

  const handleBlacklistSuccess = () => {
    if (blacklistModalUser) {
      setUsers(prev => prev.map(u => u.phone === blacklistModalUser ? { ...u, status: 'BLACKLISTED' } : u));
      setBlacklistModalUser(null);
    }
  };

  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Customer Directory & User Management</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Search consumer accounts, inspect lifetime usage history, and handle security flags.
          </p>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-ink-subtle" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search user by name, phone, or email..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Users Table ── */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:px-6 border-b border-hairline-soft bg-zinc-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-ink">Registered Consumer Profiles ({filtered.length})</CardTitle>
            <CardDescription className="text-xs text-ink-muted">
              Lifetime booking profiles across all channels
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Lifetime Spent</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Security Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono font-bold text-ink whitespace-nowrap">{u.id}</TableCell>
                  <TableCell className="font-semibold text-ink whitespace-nowrap">{u.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-mono text-ink text-xs font-semibold">{u.phone}</div>
                    <div className="text-[11px] text-ink-subtle">{u.email}</div>
                  </TableCell>
                  <TableCell className="font-semibold text-ink">{u.totalBookings}</TableCell>
                  <TableCell className="font-bold text-primary font-mono whitespace-nowrap">
                    ₹{u.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-ink-muted font-mono text-[11px] whitespace-nowrap">{u.lastActive}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'destructive'} size="sm">
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant={u.status === 'ACTIVE' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => toggleBlacklist(u)}
                      className="h-7 px-2.5 text-xs font-semibold"
                    >
                      {u.status === 'ACTIVE' ? (
                        <>
                          <ShieldAlert className="size-3" />
                          <span>Blacklist User</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-3 text-emerald-600" />
                          <span>Remove Flag</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <BlacklistUserModal
        isOpen={!!blacklistModalUser}
        onClose={() => setBlacklistModalUser(null)}
        initialPhone={blacklistModalUser || undefined}
        onSuccess={handleBlacklistSuccess}
      />
    </div>
  );
};
