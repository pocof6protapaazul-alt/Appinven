import { useApp } from '../context/AppContext';
import { Package, Users, FileText, AlertTriangle, TrendingUp, DollarSign, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { productos, clientes, remisiones, compras } = useApp();

  const stockBajo = productos.filter(p => p.stock <= p.stockMin);
  const remisionesHoy = remisiones.filter(r => r.fecha === new Date().toISOString().split('T')[0]);
  const totalInventario = productos.reduce((s, p) => s + (p.stock * p.costo), 0);
  const ventasMes = remisiones.filter(r => r.fecha?.startsWith('2026-09')).reduce((s, r) => s + (r.total || 0), 0);
  const comprasMes = compras.filter(c => c.fecha?.startsWith('2026-09') && c.estado !== 'cancelada').reduce((s, c) => s + (c.total || 0), 0);

  const stats = [
    { label: 'Productos', value: productos.length, icon: Package, color: '#6366f1', bg: '#eef2ff', link: '/inventario' },
    { label: 'Clientes', value: clientes.length, icon: Users, color: '#10b981', bg: '#ecfdf5', link: '/clientes' },
    { label: 'Remisiones', value: remisiones.length, icon: FileText, color: '#3b82f6', bg: '#eff6ff', link: '/remisiones' },
    { label: 'Compras', value: compras.length, icon: ShoppingCart, color: '#f59e0b', bg: '#fffbeb', link: '/compras' },
  ];

  return (
    <div className="page-content">
      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <Link to={s.link} key={s.label} className="stat-card" style={{ '--accent': s.color, '--accent-bg': s.bg }}>
            <div className="stat-icon"><s.icon size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
            <ArrowRight size={16} className="stat-arrow" />
          </Link>
        ))}
      </div>

      {/* Métricas financieras */}
      <div className="metrics-grid">
        <div className="metric-card metric-card--green">
          <div className="metric-header">
            <DollarSign size={20} />
            <span>Ventas del Mes</span>
          </div>
          <p className="metric-value">{ventasMes.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
          <p className="metric-sub">Septiembre 2026</p>
        </div>
        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <TrendingUp size={20} />
            <span>Valor del Inventario</span>
          </div>
          <p className="metric-value">{totalInventario.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
          <p className="metric-sub">Costo total en almacén</p>
        </div>
        <div className="metric-card metric-card--orange">
          <div className="metric-header">
            <AlertTriangle size={20} />
            <span>Stock Bajo</span>
          </div>
          <p className="metric-value">{stockBajo.length}</p>
          <p className="metric-sub">Productos por reabastecer</p>
        </div>
        <div className="metric-card metric-card--purple">
          <div className="metric-header">
            <ShoppingCart size={20} />
            <span>Compras del Mes</span>
          </div>
          <p className="metric-value">{comprasMes.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
          <p className="metric-sub">{remisionesHoy.length} remisiones hoy</p>
        </div>
      </div>

      <div className="dashboard-bottom">
        {/* Productos con stock bajo */}
        {stockBajo.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><AlertTriangle size={18} color="#f59e0b" /> Productos con Stock Bajo</h2>
              <Link to="/inventario" className="btn btn-sm btn-outline">Ver inventario</Link>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Código</th><th>Producto</th><th>Stock Actual</th><th>Stock Mínimo</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {stockBajo.map(p => (
                    <tr key={p.id}>
                      <td><code>{p.codigo}</code></td>
                      <td>{p.nombre}</td>
                      <td><strong style={{ color: p.stock === 0 ? '#ef4444' : '#f59e0b' }}>{p.stock}</strong></td>
                      <td>{p.stockMin}</td>
                      <td><span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>{p.stock === 0 ? 'Agotado' : 'Bajo'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Últimas remisiones */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><FileText size={18} /> Últimas Remisiones</h2>
            <Link to="/remisiones" className="btn btn-sm btn-outline">Ver todas</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Folio</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {remisiones.slice(-5).reverse().map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.folio}</strong></td>
                    <td>{r.fecha}</td>
                    <td>{r.clienteNombre || '—'}</td>
                    <td>{(r.total || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                    <td><span className={`badge badge-${r.estado === 'entregada' ? 'success' : r.estado === 'pendiente' ? 'warning' : 'info'}`}>{r.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
