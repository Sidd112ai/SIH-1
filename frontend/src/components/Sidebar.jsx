import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  FileCheck2,
  FolderLock,
  FileText,
  Clock,
  Gift,
  Bot,
  ClipboardList,
  MessageSquareWarning,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  History,
  Layers,
  Users,
  BookOpen,
  HelpCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  Milestone
} from 'lucide-react';

export default function Sidebar({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  onOpenAI
}) {
  const { role, user, business } = useAuth();

  // Navigation structures based on Section 6
  const entrepreneurSections = [
    {
      title: null,
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Business',
      items: [
        { to: '/profile', label: 'Business Profile', icon: Building2 }
      ]
    },
    {
      title: 'Approvals',
      items: [
        { to: '/roadmap', label: 'Roadmap', icon: Milestone },
        { to: '/approvals', label: 'Find Approvals', icon: FileCheck2 },
        { to: '/applications', label: 'My Approvals', icon: Layers }
      ]
    },
    {
      title: 'Documents',
      items: [
        { to: '/documents', label: 'Document Vault', icon: FolderLock },
        { to: '/documents/planner', label: 'Document Planner', icon: FileCheck2 }
      ]
    },
    {
      title: 'Applications',
      items: [
        { to: '/applications', label: 'My Applications', icon: FileText }
      ]
    },
    {
      title: 'Compliance',
      items: [
        { to: '/inspections', label: 'Inspections', icon: CalendarCheck },
        { to: '/renewals', label: 'Renewals', icon: Clock }
      ]
    },
    {
      title: 'Schemes',
      items: [
        { to: '/schemes', label: 'Recommended Schemes', icon: Gift }
      ]
    },
    {
      title: 'Support',
      items: [
        { to: '/grievances', label: 'Grievances', icon: HelpCircle },
        { action: 'ai', label: 'AI Assistant', icon: Bot, badge: 'AI' }
      ]
    }
  ];

  const officerSections = [
    {
      title: null,
      items: [
        { to: '/officer', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Department Scrutiny',
      items: [
        { to: '/officer/applications', label: 'Applications', icon: ClipboardList },
        { to: '/officer/queries', label: 'Queries', icon: MessageSquareWarning },
        { to: '/officer/inspections', label: 'Inspections', icon: CalendarCheck },
        { to: '/notifications', label: 'Notifications', icon: Bell }
      ]
    },
    {
      title: 'Advisory',
      items: [
        { action: 'ai', label: 'AI Assistant', icon: Bot, badge: 'AI' }
      ]
    }
  ];

  const adminSections = [
    {
      title: null,
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Directory & Master Data',
      items: [
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/businesses', label: 'Businesses', icon: Building2 },
        { to: '/admin/approvals', label: 'Approvals', icon: Layers },
        { to: '/admin/knowledge-base', label: 'Knowledge Base', icon: BookOpen }
      ]
    },
    {
      title: 'Operations & Monitoring',
      items: [
        { to: '/admin/applications', label: 'Applications', icon: FileText },
        { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { to: '/admin/grievances', label: 'Grievances', icon: HelpCircle },
        { to: '/admin/audit', label: 'Audit Logs', icon: History }
      ]
    }
  ];

  let sections = entrepreneurSections;
  if (role === 'OFFICER') sections = officerSections;
  if (role === 'ADMIN') sections = adminSections;

  const handleLinkClick = () => {
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleActionClick = (action) => {
    if (action === 'ai' && onOpenAI) {
      onOpenAI();
    }
    handleLinkClick();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-y-auto">
      {/* Brand Header */}
      <div>
        <div className={`p-4 border-b border-slate-800 flex items-center justify-between ${isCollapsed ? 'px-2' : 'px-5'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-900/30 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-bold text-sm text-white leading-tight">SUVIDHA</h1>
                <p className="text-[10px] text-sky-400 font-medium tracking-wide uppercase">State Gateway</p>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business/Context Pill if expanded */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-800/60">
            {role === 'ENTREPRENEUR' && business ? (
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                <p className="font-semibold text-white truncate">{business.name}</p>
                <p className="text-[10px] text-slate-400">{business.sector || 'Food Processing'} • {business.state || 'MH'}</p>
              </div>
            ) : role === 'OFFICER' ? (
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-xs">
                <p className="font-semibold text-amber-200 truncate">{user?.full_name}</p>
                <p className="text-[10px] text-amber-400/80 truncate">{user?.department_name || 'Regulatory Authority'}</p>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs">
                <p className="font-semibold text-emerald-200 truncate">System Administration</p>
                <p className="text-[10px] text-emerald-400/80">Compliance Command Center</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {sec.title && !isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {sec.title}
                </p>
              )}
              {sec.items.map((item, itemIdx) => {
                const Icon = item.icon;
                if (item.action) {
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => handleActionClick(item.action)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                      } rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition group`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-sky-400 group-hover:text-white shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={itemIdx}
                    to={item.to}
                    end={item.to === '/' || item.to === '/officer' || item.to === '/admin'}
                    onClick={handleLinkClick}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                      } rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-sky-600 text-white font-semibold shadow-sm shadow-sky-900/40'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Toggle Desktop Collapse */}
      <div className="p-3 border-t border-slate-800 mt-auto">
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-medium gap-2"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transform transition-transform duration-200 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 transition-all duration-200 select-none ${
          isCollapsed ? 'w-16' : 'w-60 lg:w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
