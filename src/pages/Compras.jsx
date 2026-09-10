import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Search, X, Save, ShoppingCart, PackageCheck } from 'lucide-react';

const emptyCompra = () => ({
  fecha: new Date().toISOString().split('T')[0],
  proveedorId: '',
  estado: 'pendiente',
  observaciones: '',
  aplicaIva: true,
  items: [],
});

export default function Compras() {
  const { compras, productos, proveedores, addCompra, updateCompra, setEstadoCompra, deleteCompra } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCompra());
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [prodSel, setProdSel] = useState('');
  const [cantSel, setCantSel] = useState('1');

  const money = (n) => (n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const filtered = compras.filter(c => {
    const q = search.toLowerCase();
    return !q || c.folio.toLowerCase().includes(q) || (c.proveedorNombre || '').toLowerCase().includes(q);
  }).reverse();

  const openAdd = () => { setForm(emptyCompra()); setModal('add'); };
  const openEdit = (c) => { setForm({ ...c, aplicaIva: c.iva > 0 }); setEditId(c.id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(emptyCompra()); setEditId(null); setProdSel(''); setCantSel('1'); };

  const addItem = () => {
    if (!prodSel) return;
    const prod = productos.find(p => p.id === parseInt(prodSel));
    const cant = parseInt(cantSel) || 1;
    const existing = form.items.find(i => i.productoId === prod.id);
    if (existing) {
      setForm(f => ({ ...f, items: f.items.map(i => i.productoId === prod.id ? { ...i, cantidad: i.cantidad + cant, subtotal: (i.cantidad + cant) * i.costo } : i) }));
    } else {
      setForm(f => ({ ...f, items: [...f.items, { productoId: prod.id, nombre: prod.nombre, codigo: prod.codigo, unidad: prod.unidad, cantidad: cant, costo: prod.costo, subtotal: cant * prod.costo }] }));
    }
    setProdSel(''); setCantSel('1');
  };

  const updateItemCant = (idx, cant) => {
    const c = parseInt(cant) || 1;
    setForm(f => ({ ...f, items: f.items.map((i, x) => x === idx ? { ...i, cantidad: c, subtotal: c * i.costo } : i) }));
  };
  const updateItemCosto = (idx, costo) => {
    const p = parseFloat(costo) || 0;
    setForm(f => ({ ...f, items: f.items.map((i, x) => x === idx ? { ...i, costo: p, subtotal: i.cantidad * p } : i) }));
  };
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, x) => x !== idx) }));

  const subtotal = form.items.reduce((s, i) => s + i.subtotal, 0);
  const iva = form.aplicaIva ? subtotal * 0.16 : 0;
  const total = subtotal + iva;

  const handleSave = () => {
    if (!form.proveedorId) return alert('Selecciona un proveedor');
    if (form.items.length === 0) return alert('Agrega al menos un producto');
    const prov = proveedores.find(p => p.id === parseInt(form.proveedorId));
    const data = {
      ...form,
      proveedorId: parseInt(form.proveedorId),
      proveedorNombre: prov?.nombre,
      subtotal, iva, total,
    };
    if (modal === 'add') addCompra(data);
    else updateCompra(editId, data);
    closeModal();
  };

  return (
    <div className="page-content">
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={16} />
          <input className="search-input" placeholder="Buscar por folio o proveedor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Nueva Compra</button>
      </div>

      <div className="inv-summary">
        <span>Órdenes: <strong>{filtered.length}</strong></span>
        <span>Total comprado: <strong>{money(compras.filter(c => c.estado !== 'cancelada').reduce((s, c) => s + (c.total || 0), 0))}</strong></span>
        <span className="text-success"><PackageCheck size={14} /> Recibidas: <strong>{compras.filter(c => c.estado === 'recibida').length}</strong></span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Folio</th><th>Fecha</th><th>Proveedor</th><th>Productos</th><th className="text-right">Total</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty-row"><ShoppingCart size={40} /><p>No hay compras registradas</p></td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.folio}</strong></td>
                  <td>{c.fecha}</td>
                  <td>{c.proveedorNombre || '—'}</td>
                  <td>{c.items?.length || 0} items</td>
                  <td className="text-right"><strong>{money(c.total)}</strong></td>
                  <td>
                    <select className="badge-select" value={c.estado} onChange={e => setEstadoCompra(c.id, e.target.value)} title="Al marcar 'Recibida' se suma al inventario">
                      <option value="pendiente">Pendiente</option>
                      <option value="recibida">Recibida</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn icon-btn--edit" onClick={() => openEdit(c)} title="Editar"><Edit2 size={15} /></button>
                      <button className="icon-btn icon-btn--delete" onClick={() => setConfirmDelete(c.id)} title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal--xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Nueva Orden de Compra' : `Editar ${form.folio || 'Compra'}`}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Fecha</label>
                  <input className="input" type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Proveedor *</label>
                  <select className="input" value={form.proveedorId} onChange={e => setForm(p => ({ ...p, proveedorId: e.target.value }))}>
                    <option value="">Seleccionar proveedor...</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}{p.empresa ? ` - ${p.empresa}` : ''}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select className="input" value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                    <option value="pendiente">Pendiente</option>
                    <option value="recibida">Recibida (suma al stock)</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {proveedores.length === 0 && (
                <p className="hint-box">⚠️ No tienes proveedores registrados. Agrégalos en la sección <strong>Proveedores</strong> primero.</p>
              )}

              {/* Agregar productos */}
              <div className="add-item-bar">
                <select className="input" value={prodSel} onChange={e => setProdSel(e.target.value)}>
                  <option value="">Agregar producto...</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre} (costo {money(p.costo)})</option>)}
                </select>
                <input className="input input-cant" type="number" min="1" value={cantSel} onChange={e => setCantSel(e.target.value)} placeholder="Cant." />
                <button className="btn btn-primary" onClick={addItem}><Plus size={16} /> Agregar</button>
              </div>

              {/* Items */}
              <div className="table-wrap">
                <table className="table table-items">
                  <thead>
                    <tr><th>Código</th><th>Producto</th><th>Cantidad</th><th className="text-right">Costo Unit.</th><th className="text-right">Subtotal</th><th></th></tr>
                  </thead>
                  <tbody>
                    {form.items.length === 0 && <tr><td colSpan={6} className="empty-row small">Sin productos agregados</td></tr>}
                    {form.items.map((i, idx) => (
                      <tr key={idx}>
                        <td><code>{i.codigo}</code></td>
                        <td>{i.nombre}</td>
                        <td><input className="input input-inline" type="number" min="1" value={i.cantidad} onChange={e => updateItemCant(idx, e.target.value)} /></td>
                        <td className="text-right"><input className="input input-inline text-right" type="number" min="0" step="0.01" value={i.costo} onChange={e => updateItemCosto(idx, e.target.value)} /></td>
                        <td className="text-right"><strong>{money(i.subtotal)}</strong></td>
                        <td><button className="icon-btn icon-btn--delete" onClick={() => removeItem(idx)}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rem-bottom">
                <div className="form-group form-group--full">
                  <label>Observaciones</label>
                  <textarea className="input" rows={3} value={form.observaciones} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))} placeholder="Notas, condiciones de pago, número de factura del proveedor..." />
                </div>
                <div className="rem-totals">
                  <label className="check-row">
                    <input type="checkbox" checked={form.aplicaIva} onChange={e => setForm(p => ({ ...p, aplicaIva: e.target.checked }))} /> Aplicar IVA (16%)
                  </label>
                  <div className="total-row"><span>Subtotal:</span><strong>{money(subtotal)}</strong></div>
                  <div className="total-row"><span>IVA (16%):</span><strong>{money(iva)}</strong></div>
                  <div className="total-row total-row--grand"><span>TOTAL:</span><strong>{money(total)}</strong></div>
                </div>
              </div>

              {form.estado === 'recibida' && (
                <p className="hint-box hint-box--ok"><PackageCheck size={15} /> Al guardar como <strong>Recibida</strong>, las cantidades se sumarán automáticamente al inventario y se actualizará el costo de cada producto.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Guardar Compra</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Confirmar eliminación</h2></div>
            <div className="modal-body">
              <p>¿Eliminar esta orden de compra?</p>
              {compras.find(c => c.id === confirmDelete)?.stockAplicado &&
                <p className="hint-box">Esta compra fue recibida. Al eliminarla se descontará su cantidad del inventario.</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { deleteCompra(confirmDelete); setConfirmDelete(null); }}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
