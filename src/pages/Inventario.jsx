import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Search, AlertTriangle, X, Save, Package } from 'lucide-react';

const emptyProd = { codigo: '', nombre: '', descripcion: '', categoria: '', unidad: 'PZA', precio: '', costo: '', stock: '', stockMin: '', ubicacion: '' };
const categorias = ['Electrónica', 'Accesorios', 'Mobiliario', 'Papelería', 'Limpieza', 'Herramientas', 'Alimentos', 'Ropa', 'Otros'];
const unidades = ['PZA', 'KG', 'LT', 'MT', 'CJA', 'PAQ', 'DOC', 'PAR'];

export default function Inventario() {
  const { productos, addProducto, updateProducto, deleteProducto } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyProd);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [ajusteModal, setAjusteModal] = useState(null);
  const [ajusteCantidad, setAjusteCantidad] = useState('');
  const [ajusteTipo, setAjusteTipo] = useState('entrada');

  const filtered = productos.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
    const matchCat = !catFilter || p.categoria === catFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setForm(emptyProd); setModal('add'); };
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(emptyProd); setEditId(null); };

  const handleSave = () => {
    if (!form.nombre || !form.codigo) return alert('Código y nombre son obligatorios');
    const p = {
      ...form,
      precio: parseFloat(form.precio) || 0,
      costo: parseFloat(form.costo) || 0,
      stock: parseInt(form.stock) || 0,
      stockMin: parseInt(form.stockMin) || 0,
    };
    if (modal === 'add') addProducto(p);
    else updateProducto(editId, p);
    closeModal();
  };

  const handleDelete = () => {
    deleteProducto(confirmDelete);
    setConfirmDelete(null);
  };

  const handleAjuste = () => {
    const cant = parseInt(ajusteCantidad);
    if (!cant || cant <= 0) return;
    const prod = productos.find(p => p.id === ajusteModal);
    const newStock = ajusteTipo === 'entrada' ? prod.stock + cant : Math.max(0, prod.stock - cant);
    updateProducto(ajusteModal, { stock: newStock });
    setAjusteModal(null);
    setAjusteCantidad('');
  };

  const categoriasList = [...new Set(productos.map(p => p.categoria))];

  return (
    <div className="page-content">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={16} />
          <input className="search-input" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-filter" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categoriasList.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Nuevo Producto</button>
      </div>

      {/* Resumen */}
      <div className="inv-summary">
        <span>Total: <strong>{filtered.length}</strong> productos</span>
        <span>Valor: <strong>{filtered.reduce((s,p)=>s+p.stock*p.costo,0).toLocaleString('es-MX',{style:'currency',currency:'MXN'})}</strong></span>
        <span className="text-warning"><AlertTriangle size={14}/> Stock bajo: <strong>{filtered.filter(p=>p.stock<=p.stockMin).length}</strong></span>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th><th>Producto</th><th>Categoría</th><th>Unidad</th>
                <th className="text-right">Costo</th><th className="text-right">Precio</th>
                <th className="text-right">Stock</th><th>Ubicación</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="empty-row"><Package size={40}/><p>No hay productos</p></td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className={p.stock <= p.stockMin ? 'row-warning' : ''}>
                  <td><code>{p.codigo}</code></td>
                  <td>
                    <strong>{p.nombre}</strong>
                    {p.descripcion && <p className="text-muted small">{p.descripcion}</p>}
                  </td>
                  <td><span className="badge badge-gray">{p.categoria}</span></td>
                  <td>{p.unidad}</td>
                  <td className="text-right">{p.costo.toLocaleString('es-MX',{style:'currency',currency:'MXN'})}</td>
                  <td className="text-right"><strong>{p.precio.toLocaleString('es-MX',{style:'currency',currency:'MXN'})}</strong></td>
                  <td className="text-right">
                    <button className="stock-btn" onClick={() => { setAjusteModal(p.id); setAjusteTipo('entrada'); setAjusteCantidad(''); }}>
                      <strong style={{color: p.stock === 0 ? '#ef4444' : p.stock <= p.stockMin ? '#f59e0b' : '#10b981'}}>{p.stock}</strong>
                    </button>
                  </td>
                  <td>{p.ubicacion}</td>
                  <td>
                    {p.stock === 0 ? <span className="badge badge-danger">Agotado</span>
                    : p.stock <= p.stockMin ? <span className="badge badge-warning">Bajo</span>
                    : <span className="badge badge-success">OK</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn icon-btn--edit" onClick={() => openEdit(p)} title="Editar"><Edit2 size={15}/></button>
                      <button className="icon-btn icon-btn--delete" onClick={() => setConfirmDelete(p.id)} title="Eliminar"><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal--lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'add' ? 'Nuevo Producto' : 'Editar Producto'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Código *</label>
                  <input className="input" value={form.codigo} onChange={e=>setForm(p=>({...p,codigo:e.target.value}))} placeholder="P001"/>
                </div>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input className="input" value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} placeholder="Nombre del producto"/>
                </div>
                <div className="form-group form-group--full">
                  <label>Descripción</label>
                  <input className="input" value={form.descripcion} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))} placeholder="Descripción breve"/>
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select className="input" value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))}>
                    <option value="">Seleccionar...</option>
                    {categorias.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Unidad de Medida</label>
                  <select className="input" value={form.unidad} onChange={e=>setForm(p=>({...p,unidad:e.target.value}))}>
                    {unidades.map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Costo (MXN)</label>
                  <input className="input" type="number" min="0" step="0.01" value={form.costo} onChange={e=>setForm(p=>({...p,costo:e.target.value}))} placeholder="0.00"/>
                </div>
                <div className="form-group">
                  <label>Precio de Venta (MXN)</label>
                  <input className="input" type="number" min="0" step="0.01" value={form.precio} onChange={e=>setForm(p=>({...p,precio:e.target.value}))} placeholder="0.00"/>
                </div>
                <div className="form-group">
                  <label>Stock Actual</label>
                  <input className="input" type="number" min="0" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))} placeholder="0"/>
                </div>
                <div className="form-group">
                  <label>Stock Mínimo</label>
                  <input className="input" type="number" min="0" value={form.stockMin} onChange={e=>setForm(p=>({...p,stockMin:e.target.value}))} placeholder="0"/>
                </div>
                <div className="form-group">
                  <label>Ubicación en Almacén</label>
                  <input className="input" value={form.ubicacion} onChange={e=>setForm(p=>({...p,ubicacion:e.target.value}))} placeholder="A1"/>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}><Save size={16}/> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajuste stock */}
      {ajusteModal && (
        <div className="modal-overlay" onClick={()=>setAjusteModal(null)}>
          <div className="modal modal--sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajuste de Stock</h2>
              <button className="modal-close" onClick={()=>setAjusteModal(null)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <p className="mb-2"><strong>{productos.find(p=>p.id===ajusteModal)?.nombre}</strong></p>
              <p className="mb-3 text-muted">Stock actual: <strong>{productos.find(p=>p.id===ajusteModal)?.stock}</strong></p>
              <div className="form-group">
                <label>Tipo de movimiento</label>
                <div className="radio-group">
                  <label className={`radio-btn ${ajusteTipo==='entrada'?'radio-btn--active':''}`}>
                    <input type="radio" value="entrada" checked={ajusteTipo==='entrada'} onChange={()=>setAjusteTipo('entrada')}/> Entrada (+)
                  </label>
                  <label className={`radio-btn ${ajusteTipo==='salida'?'radio-btn--active':''}`}>
                    <input type="radio" value="salida" checked={ajusteTipo==='salida'} onChange={()=>setAjusteTipo('salida')}/> Salida (-)
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Cantidad</label>
                <input className="input" type="number" min="1" value={ajusteCantidad} onChange={e=>setAjusteCantidad(e.target.value)} placeholder="0"/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setAjusteModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAjuste}><Save size={16}/> Aplicar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={()=>setConfirmDelete(null)}>
          <div className="modal modal--sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Confirmar eliminación</h2></div>
            <div className="modal-body"><p>¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={16}/> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
