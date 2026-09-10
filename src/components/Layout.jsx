import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, Truck, FileText,
  Settings, Menu, X, ChevronRight, Building2, BarChart3, ShoppingCart
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventario', label: 'Inventario', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/remisiones', label: 'Notas de Remisión', icon: FileText },
  { to: '/compras', label: 'Compras', icon: ShoppingCart },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/empresa', label: 'Mi Empresa', icon: Building2 },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { empresa } = useApp();
  const location = useLocation();
  const current = navItems.find(n => n.to === location.pathname);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          {empresa.logo
            ? <img src={empresa.logo} alt="logo" className="sidebar-logo" />
            : <div className="sidebar-logo-placeholder"><Building2 size={28} /></div>
          }
          <div className="sidebar-company">
            <span className="sidebar-company-name">{empresa.nombre}</span>
            <span className="sidebar-rfc">{empresa.rfc}</span>
          </div>
          <button className="sidebar-close" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={20} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/empresa" className="nav-item nav-item-settings" onClick={() => setOpen(false)}>
            <Settings size={18} />
            <span>Configuración</span>
          </NavLink>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="main-wrapper">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="page-title">{current?.label || 'Control Empresarial'}</h1>
          <div className="topbar-right">
            <span className="topbar-date">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
