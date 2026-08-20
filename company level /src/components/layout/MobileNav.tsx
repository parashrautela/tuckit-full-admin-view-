import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import {
  Building2,
  Layers,
  GraduationCap,
  CircleDollarSign,
  Shield,
  Bell,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavSubItem {
  path: string;
  label: string;
  badge?: number;
}

interface NavMenuItem {
  key: string;
  title: string;
  icon: React.ElementType;
  path?: string;
  items?: NavSubItem[];
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavMenuItem[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { session, logout } = useAuth();
  const { pendingRefundsCount, pendingStaffCreditsCount, totalAlertsCount } = useRealtime();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    fleet: true,
    pesit: false,
    revenue: false,
    access: false,
  });

  const navGroups: NavGroup[] = [
    {
      label: 'Platform',
      items: [
        {
          key: 'fleet',
          title: 'Overview & Fleet',
          icon: Layers,
          items: [
            { path: '/dashboard', label: 'Live Fleet Bookings Stream' },
            { path: '/reports', label: 'Reports & Financial Analytics' },
            { path: '/device-status', label: 'Terminal Telemetry & Fleet Status' },
            { path: '/locker-status', label: 'Physical Locker Matrix' },
            { path: '/future-first', label: 'Future First Locker Management' },
          ],
        },
        {
          key: 'pesit',
          title: 'PESIT Lockers',
          icon: GraduationCap,
          items: [
            { path: '/pesit-terminals', label: 'PESIT Hardware Terminals' },
            { path: '/pesit-students', label: 'Student Directory' },
            { path: '/pesit-managers', label: 'Locker Managers' },
          ],
        },
        {
          key: 'revenue',
          title: 'Revenue & Operations',
          icon: CircleDollarSign,
          badge: (pendingRefundsCount || 0) + (pendingStaffCreditsCount || 0),
          items: [
            { path: '/refund-requests', label: 'Refund Requests', badge: pendingRefundsCount },
            { path: '/refund-history', label: 'Refund Logs & History' },
            { path: '/pricing', label: 'Dynamic Pricing Control' },
            { path: '/state-gst', label: 'State GST & Invoicing' },
            { path: '/staff-credit', label: 'Staff Credit Requests', badge: pendingStaffCreditsCount },
            { path: '/staff-profiles', label: 'Staff Directory' },
          ],
        },
        {
          key: 'access',
          title: 'Access & Governance',
          icon: Shield,
          items: [
            { path: '/users', label: 'Customer Directory' },
            { path: '/admins', label: 'Admin Directory' },
            { path: '/employee-monitor', label: 'Employee Monitor' },
            { path: '/roles', label: 'Roles & Permissions (RBAC)' },
            { path: '/blacklist-history', label: 'Blacklist Audit Trail' },
            { path: '/audit-logs', label: 'Immutable Audit Logs' },
          ],
        },
      ],
    },
    {
      label: 'Tools & Diagnostics',
      items: [
        {
          key: 'alerts',
          title: 'System Alerts',
          icon: Bell,
          path: '/alerts',
          badge: totalAlertsCount,
        },
      ],
    },
  ];

  useEffect(() => {
    navGroups.forEach(g => {
      g.items.forEach(item => {
        if (item.items?.some(sub => sub.path === currentPath)) {
          setOpenItems(prev => ({ ...prev, [item.key]: true }));
        }
      });
    });
  }, [currentPath]);

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-neutral-100 shadow-xl flex flex-col z-10 animate-in slide-in-from-left duration-200 select-none">
        {/* Top Header / Team Switcher */}
        <div className="p-2 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2 px-1">
            <div className="size-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <Building2 className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-neutral-800 truncate leading-tight">
                Tuckit Inc
              </span>
              <span className="text-[11px] text-neutral-500 truncate leading-tight">
                Enterprise Console
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1">
              <div className="px-2 py-1 text-xs font-medium text-neutral-500">
                {group.label}
              </div>

              {group.items.map(item => {
                const Icon = item.icon;
                const isOpen = openItems[item.key];
                const hasSubItems = item.items && item.items.length > 0;
                const isDirectActive = item.path && currentPath === item.path;
                const isChildActive = item.items?.some(sub => sub.path === currentPath);

                if (!hasSubItems) {
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => item.path && go(item.path)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left font-medium",
                        isDirectActive
                          ? "bg-primary-50 text-primary-700 font-semibold"
                          : "text-neutral-700 hover:bg-neutral-200/50 hover:text-neutral-900"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isDirectActive ? "text-primary-500" : "text-neutral-500")} />
                      <span className="truncate flex-1">{item.title}</span>
                      {item.badge && item.badge > 0 ? (
                        <span className="bg-error-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                }

                return (
                  <div key={item.key} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.key)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left font-medium",
                        (isChildActive && !isOpen) || isDirectActive
                          ? "bg-primary-50 text-primary-700 font-semibold"
                          : "text-neutral-700 hover:bg-neutral-200/50 hover:text-neutral-900"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isChildActive ? "text-primary-500" : "text-neutral-500")} />
                      <span className="truncate flex-1">{item.title}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="bg-error-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none mr-1">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={cn(
                          "size-4 text-neutral-400 transition-transform duration-200",
                          isOpen && "rotate-90"
                        )}
                      />
                    </button>

                    {/* Sub-items rail */}
                    {isOpen && item.items && (
                      <div className="ml-3.5 pl-3 border-l border-neutral-200 flex flex-col gap-0.5 my-1">
                        {item.items.map(subItem => {
                          const isSubActive = currentPath === subItem.path;
                          return (
                            <button
                              key={subItem.path}
                              type="button"
                              onClick={() => go(subItem.path)}
                              className={cn(
                                "w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between",
                                isSubActive
                                  ? "bg-primary-50 text-primary-700 font-semibold"
                                  : "text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900"
                              )}
                            >
                              <span className="truncate pr-1">{subItem.label}</span>
                              {subItem.badge && subItem.badge > 0 && (
                                <span className="bg-error-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                  {subItem.badge > 9 ? '9+' : subItem.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom User & Logout */}
        <div className="p-2 border-t border-neutral-200 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2.5 p-1.5">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-neutral-800 text-white font-semibold text-xs">
                {session?.name ? session.name.charAt(0).toUpperCase() : 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-neutral-800 truncate leading-tight">
                {session?.name || 'Parash Rautela'}
              </span>
              <span className="text-[11px] text-neutral-500 truncate leading-tight">
                {session?.username ? `${session.username}@tuckit.in` : 'parash@tuckit.in'}
              </span>
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onClose();
              handleLogout();
            }}
            className="w-full justify-center text-xs font-semibold"
          >
            <LogOut className="size-3.5" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
