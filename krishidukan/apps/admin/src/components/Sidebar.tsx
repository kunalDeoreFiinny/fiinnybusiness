import { NavLink } from 'react-router-dom';
<<<<<<< Updated upstream
import { LayoutDashboard, Store, BarChart3, LogOut, UserPlus } from 'lucide-react';
=======
import { LayoutDashboard, Store, BarChart3, LogOut, Sprout } from 'lucide-react';
>>>>>>> Stashed changes
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shops', label: 'Shops', icon: Store },
  { to: '/retailers/new', label: 'Add Retailer', icon: UserPlus },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="w-56 bg-primary min-h-screen flex flex-col border-r border-primary-container/20">
      <div className="px-5 py-6 border-b border-primary-container/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <Sprout className="w-5 h-5 text-on-primary-container" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Krishidukan</span>
        </div>
        <div className="text-xs font-semibold text-white/50 ml-10">Admin Portal</div>
      </div>

      <nav className="flex-1 py-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', fontSize: 14, textDecoration: 'none',
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              borderLeft: isActive ? '3px solid #9dd090' : '3px solid transparent',
              fontWeight: isActive ? 700 : 500,
            })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-primary-container/20">
        <div className="text-xs text-white/40 mb-3 overflow-hidden text-ellipsis whitespace-nowrap">{(user as any)?.email}</div>
        <button onClick={() => void logout()}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
