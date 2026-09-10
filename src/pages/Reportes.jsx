import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, Package, DollarSign, Award } from 'lucide-react';

export default function Reportes() {
  const { productos, remisiones } = useApp();
  const money = (n) => (n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const remValidas = remisiones.filter(r => r.estado !== 'cancelada');
  const totalVentas = remValidas.reduce((s, r) => s + (r.total || 0), 0);
  const valorInventario = productos.reduce((s, p) => s + p.stock * p.costo, 0);
  const valorVentaInv = productos.reduce((s, p) => s + p.stock * p.precio, 0);
  const margenPotencial = valorVentaInv - valorInventario;

  // Productos más vendidos
  const ventasPorProd = {};
  remValidas.forEach(r => r.items?.forEach(i => {
    if (!ventasPorProd[i.nombre]) ventasPorProd[i.nombre] = { cantidad: 0, total: 0 };
    ventasPorProd[i.nombre].cantidad += i.cantidad;
    ventasPorProd[i.nombre].total += i.subtotal;
  }));
  const topProductos = Object.entries(ventasPorProd).sort((a,b)=>b[1].total-a[1].total).slice(0,5);

  // Ventas por cliente
  const ventasPorCliente = {};
  remValidas.forEach(r => {
    const n = r.clienteNombre || 'Sin cliente';
    ventasPorCliente[n] = (ventasPorCliente[n] || 0) + (r.total || 0);
  });
  const topClientes = Object.entries(ventasPorCliente).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Inventario por categoría
  const porCategoria = {};
  productos.forEach(p => {
    if (!porCategoria[p.categoria]) porCategoria[p.categoria] = { productos: 0, valor: 0 };
    porCategoria[p.categoria].productos += 1;
    porCategoria[p.categoria].valor += p.stock * p.costo;
  });

  const maxProd = topProductos[0]?.[1].total || 1;
  const maxCli = topClientes[0]?.[1] || 1;

  return (
    <div className="page-content">
      <div className="metrics-grid">
        <div className="metric-card metric-card--green">
          <div className="metric-header"><DollarSign size={20}/><span>Ventas Totales</span></div>
          <p className="metric-value">{money(totalVentas)}</p>
          <p className="metric-sub">{remValidas.length} remisiones válidas</p>
        </div>
        <div className="metric-card metric-card--blue">
          <div className="metric-header"><Package size={20}/><span>Valor Inventario (costo)</span></div>
          <p className="metric-value">{money(valorInventario)}</p>
          <p className="metric-sub">Precio venta: {money(valorVentaInv)}</p>
        </div>
        <div className="metric-card metric-card--purple">
          <div className="metric-header"><TrendingUp size={20}/><span>Margen Potencial</span></div>
          <p className="metric-value">{money(margenPotencial)}</p>
          <p className="metric-sub">Utilidad estimada en inventario</p>
        </div>
        <div className="metric-card metric-card--orange">
          <div className="metric-header"><Award size={20}/><span>Ticket Promedio</span></div>
          <p className="metric-value">{money(remValidas.length ? totalVentas/remValidas.length : 0)}</p>
          <p className="metric-sub">Por remisión</p>
        </div>
      </div>

      <div className="reportes-grid">
        {/* Top productos */}
        <div className="card">
          <div className="card-header"><h2 className="card-title"><BarChart3 size={18}/> Productos Más Vendidos</h2></div>
          <div className="card-body">
            {topProductos.length === 0 ? <p className="text-muted">Sin datos de ventas aún</p> :
              topProductos.map(([nombre, data]) => (
                <div key={nombre} className="bar-row">
                  <div className="bar-label"><span>{nombre}</span><strong>{money(data.total)}</strong></div>
                  <div className="bar-track"><div className="bar-fill" style={{width:`${(data.total/maxProd)*100}%`,background:'#6366f1'}}/></div>
                  <span className="bar-meta">{data.cantidad} unidades vendidas</span>
                </div>
              ))}
          </div>
        </div>

        {/* Top clientes */}
        <div className="card">
          <div className="card-header"><h2 className="card-title"><Award size={18}/> Mejores Clientes</h2></div>
          <div className="card-body">
            {topClientes.length === 0 ? <p className="text-muted">Sin datos de ventas aún</p> :
              topClientes.map(([nombre, total]) => (
                <div key={nombre} className="bar-row">
                  <div className="bar-label"><span>{nombre}</span><strong>{money(total)}</strong></div>
                  <div className="bar-track"><div className="bar-fill" style={{width:`${(total/maxCli)*100}%`,background:'#10b981'}}/></div>
                </div>
              ))}
          </div>
        </div>

        {/* Inventario por categoría */}
        <div className="card card--full">
          <div className="card-header"><h2 className="card-title"><Package size={18}/> Inventario por Categoría</h2></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Categoría</th><th className="text-right">Productos</th><th className="text-right">Valor (costo)</th></tr></thead>
              <tbody>
                {Object.entries(porCategoria).map(([cat, d]) => (
                  <tr key={cat}>
                    <td><span className="badge badge-gray">{cat}</span></td>
                    <td className="text-right">{d.productos}</td>
                    <td className="text-right"><strong>{money(d.valor)}</strong></td>
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
