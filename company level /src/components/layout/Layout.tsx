import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../common/Toast';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import {
  Bell,
  Menu,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Breadcrumb label mapping
const pathLabels: Record<string, string> = {
  '/dashboard': 'Live Fleet Bookings Stream',
  '/reports': 'Reports & Financial Analytics',
  '/device-status': 'Terminal Telemetry & Fleet Status',
  '/locker-status': 'Physical Locker Matrix',
  '/future-first': 'Future First Locker Management',
  '/pesit-terminals': 'PESIT Terminals',
  '/pesit-students': 'Student Directory',
  '/pesit-managers': 'Locker Managers',
  '/refund-requests': 'Refund Requests',
  '/refund-history': 'Refund History & Audit',
  '/pricing': 'Dynamic Pricing Control',
  '/state-gst': 'State GST & Invoicing',
  '/staff-credit': 'Staff Credit Requests',
  '/staff-profiles': 'Staff Directory',
  '/users': 'Customer Directory',
  '/admins': 'Admin Directory',
  '/employee-monitor': 'Employee Monitor',
  '/roles': 'Roles & Permissions (RBAC)',
  '/blacklist-history': 'Blacklist Audit Trail',
  '/audit-logs': 'Immutable Audit Logs',
  '/profile': 'Operator Profile',
  '/alerts': 'System Alerts & Diagnostics',
};

const pathGroups: Record<string, string> = {
  '/dashboard': 'Overview & Fleet',
  '/reports': 'Overview & Fleet',
  '/device-status': 'Overview & Fleet',
  '/locker-status': 'Overview & Fleet',
  '/future-first': 'Overview & Fleet',
  '/pesit-terminals': 'PESIT Campus',
  '/pesit-students': 'PESIT Campus',
  '/pesit-managers': 'PESIT Campus',
  '/refund-requests': 'Revenue & Billing',
  '/refund-history': 'Revenue & Billing',
  '/pricing': 'Revenue & Billing',
  '/state-gst': 'Revenue & Billing',
  '/staff-credit': 'Revenue & Billing',
  '/staff-profiles': 'Revenue & Billing',
  '/users': 'Access & Governance',
  '/admins': 'Access & Governance',
  '/employee-monitor': 'Access & Governance',
  '/roles': 'Access & Governance',
  '/blacklist-history': 'Access & Governance',
  '/audit-logs': 'Access & Governance',
};

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { totalAlertsCount } = useRealtime();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentPath = location.pathname;
  const pageLabel = pathLabels[currentPath] || 'Dashboard';
  const groupLabel = pathGroups[currentPath];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800 flex flex-col antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Nav Drawer */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Shell */}
      <div className="lg:ml-64 flex flex-col min-h-screen transition-all duration-200 flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-neutral-0/95 backdrop-blur-sm border-b border-neutral-200 h-14 flex items-center justify-between px-4 sm:px-6 shrink-0">
          {/* Left: Mobile Menu Toggle + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden shrink-0"
              title="Open Navigation"
            >
              <Menu className="size-4" />
            </Button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs min-w-0 select-none">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-neutral-500 hover:text-neutral-900 transition-colors font-medium shrink-0"
              >
                Tuckit
              </button>
              {groupLabel && (
                <>
                  <ChevronRight className="size-3 text-neutral-400 shrink-0" />
                  <span className="text-neutral-500 shrink-0 font-medium">{groupLabel}</span>
                </>
              )}
              <ChevronRight className="size-3 text-neutral-400 shrink-0" />
              <span className="text-neutral-800 font-semibold truncate">{pageLabel}</span>
            </nav>
          </div>

          {/* Right: Quick Search + Alert Bell + Mobile Avatar */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search Pill */}
            <div
              onClick={() => navigate('/dashboard')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-400 text-xs w-48 lg:w-60 cursor-pointer hover:bg-neutral-200/50 transition-colors"
            >
              <Search className="size-3.5 shrink-0 text-neutral-400" />
              <span className="truncate">Search terminal or user...</span>
            </div>

            {/* Alert Bell */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate('/alerts')}
              className="relative text-neutral-600 hover:text-neutral-900"
              title="System Alerts & Diagnostics"
            >
              <Bell className="size-4" />
              {totalAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-error-500 ring-2 ring-white animate-pulse" />
              )}
            </Button>

            {/* Mobile User Avatar */}
            <div
              onClick={() => navigate('/profile')}
              className="lg:hidden flex items-center cursor-pointer"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-neutral-100 text-neutral-800 font-bold text-xs">
                  {session?.name ? session.name.charAt(0).toUpperCase() : 'P'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-200 bg-neutral-0 py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-success-500" />
            <span>TUCKIT FLEET CONTROL • v2.4.0</span>
          </div>
          <div>AWS IoT ap-south-1 • Telemetry Engine</div>
        </footer>
      </div>

      <ToastContainer />
    </div>
  );
};
