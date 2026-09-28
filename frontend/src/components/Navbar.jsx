import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, Sparkles, LogOut, Search, Menu, 
  ShieldAlert, UserCheck, Briefcase, UserCog, 
  Info, ExternalLink, ChevronDown, Check 
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Modal from './ui/Modal';
import GlobalSearchModal from './GlobalSearchModal';

export default function Navbar({ onOpenAI, onToggleMobileSidebar }) {
  const { user, role, switchRole, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 25000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleSwitch = async (targetRole) => {
    setRoleMenuOpen(false);
    try {
      await switchRole(targetRole);
      if (targetRole === 'OFFICER') navigate('/officer');
      else if (targetRole === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  // Determine current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/profile') return 'Business Profile';
    if (path.startsWith('/approvals')) return 'Approval Clearances';
    if (path === '/documents/planner') return 'Document Planner';
    if (path.startsWith('/documents')) return 'Document Vault';
    if (path.startsWith('/applications')) return 'Applications Tracking';
    if (path === '/inspections') return 'Site Inspections';
    if (path === '/renewals') return 'Renewals Tracker';
    if (path === '/schemes') return 'Incentive Schemes';
    if (path === '/grievances') return 'Grievances & Support';
    if (path === '/officer') return 'Officer Dashboard';
    if (path === '/officer/queries') return 'Regulatory Queries';
    if (path === '/officer/inspections') return 'Site Inspections';
    if (path.startsWith('/officer/applications')) return 'Scrutiny Filings';
    if (path === '/admin') return 'Admin Command Center';
    if (path === '/admin/users') return 'User Directory';
    if (path === '/admin/businesses') return 'Industrial Registry';
    if (path === '/admin/knowledge-base') return 'Regulatory Knowledge Base';
    if (path === '/admin/analytics') return 'Bottleneck Analytics';
    if (path === '/admin/audit') return 'Audit Trail';
    return 'SUVIDHA';
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Mobile hamburger + Page Title / Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-tight">
              {getPageTitle()}
            </h2>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>SUVIDHA</span>
              <span>•</span>
              <span className="capitalize">{role.toLowerCase()} Portal</span>
            </div>
          </div>
        </div>

        {/* Right Section: Search 🔍, Notifications 🔔, Demo Pill, Role Switcher, Profile 👤 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition font-medium"
            title="Search Platform (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline-block text-[9px] font-semibold bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Compact DEMO MODE Badge (Section 9) */}
          <button
            onClick={() => setDemoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold tracking-wide transition shadow-xs"
            title="Click to view Demo Mode info"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>DEMO MODE</span>
          </button>

          {/* SIH DEMO ROLE SWITCHER (Section 10) */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-xs transition"
            >
              <span className="hidden lg:inline text-slate-400 font-normal">Role:</span>
              <span className="text-indigo-700 capitalize">{role.toLowerCase()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Demo Persona
                </div>

                <button
                  onClick={() => handleRoleSwitch('ENTREPRENEUR')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition ${
                    role === 'ENTREPRENEUR' ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>Entrepreneur</span>
                  </div>
                  {role === 'ENTREPRENEUR' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                <button
                  onClick={() => handleRoleSwitch('OFFICER')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition ${
                    role === 'OFFICER' ? 'font-bold text-amber-600 bg-amber-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Officer</span>
                  </div>
                  {role === 'OFFICER' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>

                <button
                  onClick={() => handleRoleSwitch('ADMIN')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition ${
                    role === 'ADMIN' ? 'font-bold text-emerald-600 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCog className="w-3.5 h-3.5 text-slate-500" />
                    <span>Admin</span>
                  </div>
                  {role === 'ADMIN' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              </div>
            )}
          </div>

          {/* AI Compliance Advisor button */}
          <button
            onClick={onOpenAI}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200/80 text-sky-700 hover:from-sky-100 hover:to-indigo-100 text-xs font-semibold transition shadow-xs"
            title="Ask AI Compliance Advisor"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden xl:inline">AI Advisor</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 relative transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Notifications ({unreadCount} new)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-sky-600 hover:text-sky-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-slate-400 text-center">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs hover:bg-slate-50 transition ${
                          !n.is_read ? 'bg-sky-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />}
                        </div>
                        <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => setShowNotifs(false)}
                            className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 font-medium mt-1.5"
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Sign Out */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Demo Mode Explanation Modal (Section 9) */}
      <Modal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        title="Prototype Demonstration Mode"
        subtitle="AI-Driven Industrial Approval & Compliance Management Platform"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-semibold">Notice for Evaluators & Judges:</p>
              <p className="text-xs text-rose-700 mt-1">
                This application is running with fictional demo regulatory data for prototype testing and evaluation.
              </p>
            </div>
          </div>

          <p>
            The seeded environment models an operational <strong>Demo Food Processing Unit</strong> in Maharashtra with:
          </p>
          <ul className="space-y-1.5 list-disc pl-5 text-xs text-slate-700">
            <li>5 statutory clearances (FSSAI, DISH Factory Plan, MPCB CTE, Fire NOC, MIDC Trade)</li>
            <li>Real simulated document verification with simulated OCR extraction</li>
            <li>Single-Window PDF Package compilation and dynamic compression</li>
            <li>Real-time role switching between Entrepreneur, Inspecting Officer, and Admin</li>
          </ul>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
            >
              Close Information
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
