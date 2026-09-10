import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Search, X, Save, FileText, Printer, MessageCircle } from 'lucide-react';
import RemisionPDF from '../components/RemisionPDF';
import { enviarRemisionWhatsApp } from '../utils/whatsapp';

const emptyRem = () => ({
  fecha: new Date().toISOString().split('T')[0],
  clienteId: '',
  estado: 'pendiente',
  observaciones: '',
  items: [],
});

export default function Remisiones() {
  const { empresa, remisiones, productos, clientes, addRemision, updateRemision, deleteRemision } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyRem());
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prodSel, setProdSel] = useState('');
  const [cantSel, setCantSel] = useState('1');

  const filtered = remisiones.filter(r => {
    const q = search.toLowerCase();
    return !q || r.folio.toLowerCase().includes(q) || (r.clienteNombre||'').toLowerCase().includes(q);
  }).reverse();

  const openAdd = () => { setForm(emptyRem()); setModal('add'); };
  const openEdit = (r) => {
    setForm({ ...r });
    setEditId(r.id); setModal('edit');
  };
  const closeModal = () => { setModal(null); setForm(emptyRem()); setEditId(null); setProdSel(''); setCantSel('1'); };

  const addItem = () => {
    if (!prodSel) return;
    const prod = productos.find(p => p.id === parseInt(prodSel));
    const cant = parseInt(cantSel) || 1;
    const existing = form.items.find(i => i.productoId === prod.id);
    if (existing) {
      setForm(f => ({ ...f, items: f.items.map(i => i.productoId === prod.id ? { ...i, cantidad: i.cantidad + cant, subtotal: (i.cantidad + cant) * i.precio } : i) }));
    } else {
      setForm(f => ({ ...f, items: [...f.items, { productoId: prod.id, nombre: prod.nombre, codigo: prod.codigo, unidad: prod.unidad, cantidad: cant, precio: prod.precio, subtotal: cant * prod.precio }] }));
    }
    setProdSel(''); setCantSel('1');
  };

  const updateItemCant = (idx, cant) => {
    const c = parseInt(cant) || 1;
    setForm(f => ({ ...f, items: f.items.map((i, x) => x === idx ? { ...i, cantidad: c, subtotal: c * i.precio } : i) }));
  };
  const updateItemPrecio = (idx, precio) => {
    const p = parseFloat(precio) || 0;
    setForm(f => ({ ...f, items: f.items.map((i, x) => x === idx ? { ...i, precio: p, subtotal: i.cantidad * p } : i) }));
  };
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, x) => x !== idx) }));

  const subtotal = form.items.reduce((s, i) => s + i.subtotal, 0);
  const total = subtotal; // Las notas se manejan sin IVA

  const handleSave = () => {
    if (!form.clienteId) return alert('Selecciona un cliente');
    if (form.items.length === 0) return alert('Agrega al menos un producto');
    const cliente = clientes.find(c => c.id === parseInt(form.clienteId));
    const data = {
      ...form,
      clienteId: parseInt(form.clienteId),
      clienteNombre: cliente?.nombre,
      subtotal, iva: 0, total,
    };
    if (modal === 'add') addRemision(data);
    else updateRemision(editId, data);
    closeModal();
  };

  return (
    <div className="page-content">
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={16}/>
          <input className="search-input" placeholder="Buscar por folio o cliente..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/> Nueva Remisión</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Folio</th><th>Fecha</th><th>Cliente</th><th>Productos</th><th className="text-right">Total</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty-row"><FileText size={40}/><p>No hay remisiones</p></td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.folio}</strong></td>
                  <td>{r.fecha}</td>
                  <td>{r.clienteNombre || '—'}</td>
                  <td>{r.items?.length || 0} items</td>
                  <td className="text-right"><strong>{(r.total||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'})}</strong></td>
                  <td>
                    <select className="badge-select" value={r.estado} onChange={e=>updateRemision(r.id,{estado:e.target.value})}>
                      <option value="pendiente">Pendiente</option>
                      <option value="entregada">Entregada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn icon-btn--wa" onClick={()=>enviarRemisionWhatsApp(empresa, r, clientes.find(c=>c.id===r.clienteId))} title="Enviar por WhatsApp"><MessageCircle size={15}/></button>
                      <button className="icon-btn icon-btn--view" onClick={()=>setPreview(r)} title="Ver / Imprimir"><Printer size={15}/></button>
                      <button className="icon-btn icon-btn--edit" onClick={()=>openEdit(r)} title="Editar"><Edit2 size={15}/></button>
                      <button className="icon-btn icon-btn--delete" onClick={()=>setConfirmDelete(r.id)} title="Eliminar"><Trash2 size={15}/></button>
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
          <div className="modal modal--xl" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal==='add'?'Nueva Remisión':`Editar ${form.folio||'Remisión'}`}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Fecha</label>
                  <input className="input" type="date" value={form.fecha} onChange={e=>setForm(p=>({...p,fecha:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label>Cliente *</label>
                  <select className="input" value={form.clienteId} onChange={e=>setForm(p=>({...p,clienteId:e.target.value}))}>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}{c.empresa?` - ${c.empresa}`:''}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select className="input" value={form.estado} onChange={e=>setForm(p=>({...p,estado:e.target.value}))}>
                    <option value="pendiente">Pendiente</option>
                    <option value="entregada">Entregada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Agregar productos */}
              <div className="add-item-bar">
                <select className="input" value={prodSel} onChange={e=>setProdSel(e.target.value)}>
                  <option value="">Agregar producto...</option>
                  {productos.map(p=><option key={p.id} value={p.id}>{p.codigo} - {p.nombre} ({p.precio.toLocaleString('es-MX',{style:'currency',currency:'MXN'})})</option>)}
                </select>
                <input className="input input-cant" type="number" min="1" value={cantSel} onChange={e=>setCantSel(e.target.value)} placeholder="Cant."/>
                <button className="btn btn-primary" onClick={addItem}><Plus size={16}/> Agregar</button>
              </div>

              {/* Items */}
              <div className="table-wrap">
                <table className="table table-items">
                  <thead>
                    <tr><th>Código</th><th>Producto</th><th>Cantidad</th><th className="text-right">Precio Unit.</th><th className="text-right">Subtotal</th><th></th></tr>
                  </thead>
                  <tbody>
                    {form.items.length === 0 && <tr><td colSpan={6} className="empty-row small">Sin productos agregados</td></tr>}
                    {form.items.map((i, idx) => (
                      <tr key={idx}>
                        <td><code>{i.codigo}</code></td>
                        <td>{i.nombre}</td>
                        <td><input className="input input-inline" type="number" min="1" value={i.cantidad} onChange={e=>updateItemCant(idx, e.target.value)}/></td>
                        <td className="text-right"><input className="input input-inline text-right" type="number" min="0" step="0.01" value={i.precio} onChange={e=>updateItemPrecio(idx, e.target.value)}/></td>
                        <td className="text-right"><strong>{i.subtotal.toLocaleString('es-MX',{style:'currency',currency:'MXN'})}</strong></td>
                        <td><button className="icon-btn icon-btn--delete" onClick={()=>removeItem(idx)}><Trash2 size={14}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rem-bottom">
                <div className="form-group form-group--full">
                  <label>Observaciones</label>
                  <textarea className="input" rows={3} value={form.observaciones} onChange={e=>setForm(p=>({...p,observaciones:e.target.value}))} placeholder="Notas adicionales, condiciones de entrega..."/>
                </div>
                <div className="rem-totals">
                  <div className="total-row total-row--grand"><span>TOTAL:</span><strong>{total.toLocaleString('es-MX',{style:'currency',currency:'MXN'})}</strong></div>
                  <p className="text-muted small" style={{marginTop:'4px'}}>Precios sin IVA</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}><Save size={16}/> Guardar Remisión</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview / imprimir */}
      {preview && <RemisionPDF remision={preview} onClose={()=>setPreview(null)} />}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={()=>setConfirmDelete(null)}>
          <div className="modal modal--sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Confirmar eliminación</h2></div>
            <div className="modal-body"><p>¿Eliminar esta remisión?</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={()=>{deleteRemision(confirmDelete);setConfirmDelete(null);}}><Trash2 size={16}/> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
