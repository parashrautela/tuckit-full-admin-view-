import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import {
  ChevronRight,
  ChevronsUpDown,
  Sliders,
  Bell,
  LogOut,
  User,
  ShieldAlert,
  Building2,
  GraduationCap,
  CircleDollarSign,
  Shield,
  Layers,
  Check,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ControlCenterDrawer } from '../control-center/ControlCenterDrawer';
import { BlacklistUserModal } from '../modals/BlacklistUserModal';
import { cn } from '@/lib/utils';

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

export const Sidebar: React.FC = () => {
  const { session, logout } = useAuth();
  const { pendingRefundsCount, pendingStaffCreditsCount, totalAlertsCount } = useRealtime();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);

  // Track expanded menu items
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    fleet: true,
    pesit: false,
    revenue: false,
    access: false,
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  const orgMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (orgMenuRef.current && !orgMenuRef.current.contains(e.target as Node)) {
        setIsOrgMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-expand parent if current route is inside
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
    if (isCollapsed) return;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  return (
    <>
      {/* Desktop Sidebar (warm neutral-100 bg, neutral-200 border) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-neutral-100 border-r border-neutral-200 fixed left-0 top-0 z-40 transition-all duration-200 ease-in-out select-none",
          sidebarWidth
        )}
      >
        {/* ── Top Header / Team Switcher ── */}
        <div className="p-2 border-b border-neutral-200/80 shrink-0">
          <div ref={orgMenuRef} className="relative">
            <button
              type="button"
              onClick={() => !isCollapsed && setIsOrgMenuOpen(!isOrgMenuOpen)}
              className={cn(
                "w-full flex items-center gap-2 rounded-lg p-1.5 transition-colors text-left hover:bg-neutral-200/60",
                isCollapsed && "justify-center p-1"
              )}
            >
              {/* Org Icon Badge in primary-500 */}
              <div className="size-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <Building2 className="size-4" />
              </div>

              {!isCollapsed && (
                <>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-neutral-800 truncate leading-tight">
                      Tuckit Inc
                    </span>
                    <span className="text-[11px] text-neutral-500 truncate leading-tight">
                      Enterprise Console
                    </span>
                  </div>
                  <ChevronsUpDown className="size-4 text-neutral-400 shrink-0" />
                </>
              )}
            </button>

            {/* Org Switcher Popover */}
            {isOrgMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-neutral-0 border border-neutral-200 rounded-xl shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Select Workspace
                </div>
                <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-primary-50 border border-primary-100 font-medium text-neutral-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold">
                      T
                    </div>
                    <span className="text-primary-700 font-semibold">Tuckit Inc (Production)</span>
                  </div>
                  <Check className="size-3.5 text-primary-500" />
                </div>
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-50 text-neutral-600 cursor-pointer transition-colors mt-0.5">
                  <div className="size-5 rounded bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px] font-bold">
                    S
                  </div>
                  <span>PESIT Staging Cluster</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Nav Groups ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1">
              {!isCollapsed && (
                <div className="px-2 py-1 text-xs font-medium text-neutral-500">
                  {group.label}
                </div>
              )}

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
                      onClick={() => item.path && navigate(item.path)}
                      title={isCollapsed ? item.title : undefined}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left font-medium",
                        isCollapsed && "justify-center p-2",
                        isDirectActive
                          ? "bg-primary-50 text-primary-700 font-semibold"
                          : "text-neutral-700 hover:bg-neutral-200/50 hover:text-neutral-900"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isDirectActive ? "text-primary-500" : "text-neutral-500")} />
                      {!isCollapsed && (
                        <>
                          <span className="truncate flex-1">{item.title}</span>
                          {item.badge && item.badge > 0 ? (
                            <span className="bg-error-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </button>
                  );
                }

                return (
                  <div key={item.key} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.key)}
                      title={isCollapsed ? item.title : undefined}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left font-medium",
                        isCollapsed && "justify-center p-2",
                        (isChildActive && !isOpen) || isDirectActive
                          ? "bg-primary-50 text-primary-700 font-semibold"
                          : "text-neutral-700 hover:bg-neutral-200/50 hover:text-neutral-900"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isChildActive ? "text-primary-500" : "text-neutral-500")} />
                      {!isCollapsed && (
                        <>
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
                        </>
                      )}
                    </button>

                    {/* Sub-items with warm neutral vertical guide rail */}
                    {!isCollapsed && isOpen && item.items && (
                      <div className="ml-3.5 pl-3 border-l border-neutral-200 flex flex-col gap-0.5 my-1">
                        {item.items.map(subItem => {
                          const isSubActive = currentPath === subItem.path;
                          return (
                            <button
                              key={subItem.path}
                              type="button"
                              onClick={() => navigate(subItem.path)}
                              className={cn(
                                "w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between",
                                isSubActive
                                  ? "bg-primary-50 text-primary-700 font-semibold"
                                  : "text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900 font-normal"
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

        {/* ── Bottom Section ── */}
        <div className="p-2 border-t border-neutral-200/80 flex flex-col gap-1.5 shrink-0">
          {/* Hardware Control Center Action */}
          <Button
            variant="secondary"
            size={isCollapsed ? 'icon-sm' : 'sm'}
            onClick={() => setIsControlCenterOpen(true)}
            className={cn(
              "w-full justify-start text-xs font-semibold gap-2 border-neutral-200 text-neutral-700 hover:bg-neutral-200/50",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? 'Hardware Control Center' : undefined}
          >
            <Sliders className="size-3.5 text-primary-500 shrink-0" />
            {!isCollapsed && <span>Control Center</span>}
          </Button>

          {/* User Profile Pill */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg p-1.5 transition-colors text-left hover:bg-neutral-200/60",
                isCollapsed && "justify-center p-1"
              )}
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-neutral-800 text-white font-semibold text-xs">
                  {session?.name ? session.name.charAt(0).toUpperCase() : 'P'}
                </AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-neutral-800 truncate leading-tight">
                      {session?.name || 'Parash Rautela'}
                    </span>
                    <span className="text-[11px] text-neutral-500 truncate leading-tight">
                      {session?.username ? `${session.username}@tuckit.in` : 'parash@tuckit.in'}
                    </span>
                  </div>
                  <ChevronsUpDown className="size-4 text-neutral-400 shrink-0" />
                </>
              )}
            </button>

            {/* Profile Popover */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-56 bg-neutral-0 border border-neutral-200 rounded-xl shadow-lg p-1 z-50 animate-in fade-in slide-in-from-bottom-1 text-xs">
                <div className="px-3 py-2 border-b border-neutral-100">
                  <div className="font-semibold text-neutral-800">{session?.name || 'Parash Rautela'}</div>
                  <div className="text-[11px] text-neutral-500">{session?.username ? `${session.username}@tuckit.in` : 'parash@tuckit.in'}</div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 rounded-md text-neutral-700 text-left transition-colors"
                  >
                    <User className="size-3.5 text-neutral-500" />
                    <span>Account Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsBlacklistModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-error-50 rounded-md text-error-700 text-left transition-colors"
                  >
                    <ShieldAlert className="size-3.5 text-error-500" />
                    <span>Blacklist Customer</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-error-50 text-error-700 rounded-md text-left transition-colors font-medium"
                  >
                    <LogOut className="size-3.5 text-error-500" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Control Center Drawer */}
      <ControlCenterDrawer
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
      />

      {/* Blacklist User Modal */}
      <BlacklistUserModal
        isOpen={isBlacklistModalOpen}
        onClose={() => setIsBlacklistModalOpen(false)}
      />
    </>
  );
};
