import React, { useState } from 'react';
import { useRealtime } from '@/context/RealtimeContext';
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
import { Modal } from '@/components/common/Modal';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck,
  Lock,
  Check,
  X,
  Plus,
  ChevronRight,
  Key,
  Shield,
  Layers,
  Settings,
} from 'lucide-react';

interface PermissionCategory {
  id: string;
  name: string;
  permissions: { id: string; label: string; description: string }[];
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'dashboard',
    name: 'Dashboard & Main View',
    permissions: [
      { id: 'PAGE:DASHBOARD', label: 'View Dashboard & Bookings', description: 'Access live booking stream and KPI summary' },
      { id: 'ACTION:FORCE_UNLOCK', label: 'Emergency Force Unlock', description: 'Trigger hardware solenoid pulse' },
      { id: 'ACTION:SMS_UNLOCK', label: 'Send SMS Fallback Link', description: 'Dispatch customer recovery SMS' },
    ],
  },
  {
    id: 'terminals',
    name: 'Hardware & Terminal Operations',
    permissions: [
      { id: 'PAGE:TERMINALS', label: 'View Terminal Cluster', description: 'Inspect 238 nationwide stations' },
      { id: 'ACTION:TERMINAL_REBOOT', label: 'Restart Terminal', description: 'Soft kiosk reload or full hardware reboot' },
      { id: 'ACTION:BATCH_COMMAND', label: 'Batch Shell Execution', description: 'Run diagnostics across cluster' },
      { id: 'ACTION:S3_FILE_TRANSFER', label: 'Push Software Updates', description: 'Deploy builds via AWS S3 pipeline' },
    ],
  },
  {
    id: 'reports',
    name: 'Financial & Export Control',
    permissions: [
      { id: 'PAGE:REPORTS', label: 'View Reports & BI Analytics', description: 'Access revenue metrics and source share' },
      { id: 'ACTION:REPORTS_EXPORT', label: 'Download Excel / CSV', description: 'Generate regional accounting reports' },
      { id: 'PAGE:REFUNDS', label: 'Manage Refund Requests', description: 'Approve or reject customer refund claims' },
    ],
  },
  {
    id: 'security',
    name: 'Security, Audit & RBAC',
    permissions: [
      { id: 'PAGE:AUDIT_LOGS', label: 'View Audit Trail', description: 'Inspect timestamped operator incident logs' },
      { id: 'ACTION:USER_BLOCK', label: 'Blacklist Customer Numbers', description: 'Restrict phone numbers across network' },
      { id: 'ACTION:ADMIN_MANAGE', label: 'Manage Internal Admins', description: 'Create and assign staff credentials' },
    ],
  },
];

interface RoleDef {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

const initialRoles: RoleDef[] = [
  {
    id: 'ROLE-01',
    name: 'SUPERADMIN',
    description: 'Unrestricted global root privileges across all terminals, billing records, firmware updates, and user management.',
    userCount: 3,
    permissions: ['PAGE:DASHBOARD', 'ACTION:FORCE_UNLOCK', 'ACTION:SMS_UNLOCK', 'PAGE:TERMINALS', 'ACTION:TERMINAL_REBOOT', 'ACTION:BATCH_COMMAND', 'ACTION:S3_FILE_TRANSFER', 'PAGE:REPORTS', 'ACTION:REPORTS_EXPORT', 'PAGE:REFUNDS', 'PAGE:AUDIT_LOGS', 'ACTION:USER_BLOCK', 'ACTION:ADMIN_MANAGE'],
  },
  {
    id: 'ROLE-02',
    name: 'OPERATIONS_LEAD',
    description: 'Ground and station control: reboot terminals, force open stuck doors, inspect locker status, and monitor field employees.',
    userCount: 8,
    permissions: ['PAGE:DASHBOARD', 'ACTION:FORCE_UNLOCK', 'ACTION:SMS_UNLOCK', 'PAGE:TERMINALS', 'ACTION:TERMINAL_REBOOT', 'PAGE:AUDIT_LOGS'],
  },
  {
    id: 'ROLE-03',
    name: 'SUPPORT_SPECIALIST',
    description: 'Customer service desk: inspect customer bookings, trigger remote SMS unlock links, initiate refund review queues.',
    userCount: 14,
    permissions: ['PAGE:DASHBOARD', 'ACTION:SMS_UNLOCK', 'PAGE:REFUNDS'],
  },
  {
    id: 'ROLE-04',
    name: 'FINANCE_AUDITOR',
    description: 'Accounting department: access revenue analytics, download GST tax summaries, and verify staff cash collector balances.',
    userCount: 4,
    permissions: ['PAGE:DASHBOARD', 'PAGE:REPORTS', 'ACTION:REPORTS_EXPORT', 'PAGE:REFUNDS'],
  },
];

export const Roles: React.FC = () => {
  const { showToast } = useRealtime();
  const [roles, setRoles] = useState<RoleDef[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<RoleDef>(initialRoles[0]);
  const [createModal, setCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);

  const handleTogglePerm = (permId: string) => {
    if (selectedRole.name === 'SUPERADMIN') {
      showToast('Superadmin permissions are immutable global defaults', 'warning');
      return;
    }
    const updatedPerms = selectedRole.permissions.includes(permId)
      ? selectedRole.permissions.filter(p => p !== permId)
      : [...selectedRole.permissions, permId];

    const updatedRole = { ...selectedRole, permissions: updatedPerms };
    setSelectedRole(updatedRole);
    setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
    showToast(`Permission updated for ${selectedRole.name}`, 'info');
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;

    const newRole: RoleDef = {
      id: `ROLE-${String(roles.length + 1).padStart(2, '0')}`,
      name: newRoleName.toUpperCase().replace(/\s+/g, '_'),
      description: newRoleDesc || 'Custom role policy definition',
      userCount: 0,
      permissions: newRolePerms,
    };

    setRoles(prev => [...prev, newRole]);
    setSelectedRole(newRole);
    setCreateModal(false);
    setNewRoleName('');
    setNewRoleDesc('');
    setNewRolePerms([]);
    showToast(`Role ${newRole.name} created successfully!`, 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Role Engineering & Granular RBAC</h1>
            <Badge variant="outline" size="sm" className="font-mono">
              SECURITY POLICIES
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Configure fine-grained system access policies, hardware controls, and PII protection slices.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateModal(true)}
        >
          <Plus className="size-4" />
          <span>Create Custom Role</span>
        </Button>
      </div>

      {/* ── Main 2-Column Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Role Selector Cards */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-1">
            Configured System Roles ({roles.length})
          </span>

          {roles.map(r => {
            const isSelected = selectedRole.id === r.id;
            return (
              <Card
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary ring-1 ring-primary/30 bg-orange-50/20 shadow-xs'
                    : 'hover:border-zinc-300 shadow-2xs'
                }`}
              >
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className={`size-4 ${isSelected ? 'text-primary' : 'text-ink-subtle'}`} />
                      <span className="text-sm font-bold text-ink font-mono">{r.name}</span>
                    </div>
                    <Badge variant="secondary" size="sm">
                      {r.userCount} Users
                    </Badge>
                  </div>

                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">{r.description}</p>

                  <div className="pt-2 border-t border-hairline-soft flex items-center justify-between text-[11px]">
                    <span className="text-primary font-semibold font-mono">{r.permissions.length} Permissions</span>
                    <ChevronRight className={`size-3.5 ${isSelected ? 'text-primary' : 'text-ink-subtle'}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Permission Matrix */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="p-5 border-b border-hairline-soft bg-zinc-50/50 flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <CardTitle className="text-sm font-bold text-ink">
                    Permission Matrix: <span className="font-mono text-primary">{selectedRole.name}</span>
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-ink-muted mt-0.5">
                  {selectedRole.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {selectedRole.permissions.length} Allowed
              </Badge>
            </CardHeader>

            <CardContent className="p-5 flex flex-col gap-6">
              {PERMISSION_CATEGORIES.map(category => (
                <div key={category.id} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="size-3.5 text-ink-subtle" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                      {category.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {category.permissions.map(perm => {
                      const isGranted = selectedRole.permissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleTogglePerm(perm.id)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                            isGranted
                              ? 'bg-emerald-50/40 border-emerald-200 text-ink'
                              : 'bg-zinc-50/40 border-hairline-soft text-ink-muted hover:bg-zinc-100/60'
                          }`}
                        >
                          <div
                            className={`size-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isGranted ? 'bg-emerald-600 text-white' : 'border border-hairline bg-white'
                            }`}
                          >
                            {isGranted && <Check className="size-3 stroke-[3]" />}
                          </div>

                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className={`font-semibold ${isGranted ? 'text-ink' : 'text-ink-muted'}`}>
                              {perm.label}
                            </span>
                            <span className="text-[11px] text-ink-subtle leading-tight">
                              {perm.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Create Role Modal ── */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Engineer New RBAC Role"
        subtitle="Define policy name and select base permissions for this role definition"
      >
        <form onSubmit={handleCreateRole} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Role Identifier *</label>
            <Input
              type="text"
              required
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              placeholder="e.g. TERMINAL_TECHNICIAN"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Description</label>
            <Input
              type="text"
              value={newRoleDesc}
              onChange={e => setNewRoleDesc(e.target.value)}
              placeholder="Field hardware maintenance engineer..."
            />
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
              Create Role Policy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
