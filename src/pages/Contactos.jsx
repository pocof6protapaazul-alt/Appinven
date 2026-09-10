import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Search, X, Save, Users, Truck, Mail, Phone, MapPin } from 'lucide-react';

const empty = { nombre: '', empresa: '', rfc: '', email: '', telefono: '', direccion: '', ciudad: '', cp: '' };

export default function Contactos({ tipo }) {
  const { contactos, addContacto, updateContacto, deleteContacto } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const esCliente = tipo === 'cliente';
  const items = contactos.filter(c => c.tipo === tipo);
  const filtered = items.filter(c => {
    const q = search.toLowerCase();
    return !q || c.nombre.toLowerCase().includes(q) || (c.empresa||'').toLowerCase().includes(q) || (c.rfc||'').toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(empty); setModal('add'); };
  const openEdit = (c) => { setForm({...c}); setEditId(c.id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(empty); setEditId(null); };

  const handleSave = () => {
    if (!form.nombre) return alert('El nombre es obligatorio');
    if (modal === 'add') addContacto({ ...form, tipo });
    else updateContacto(editId, form);
    closeModal();
  };

  const Icon = esCliente ? Users : Truck;

  return (
    <div className="page-content">
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={16} />
          <input className="search-input" placeholder={`Buscar ${esCliente?'cliente':'proveedor'}...`} value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/> Nuevo {esCliente?'Cliente':'Proveedor'}</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Icon size={48}/>
          <p>No hay {esCliente?'clientes':'proveedores'} registrados</p>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/> Agregar el primero</button>
        </div>
      ) : (
        <div className="contact-grid">
          {filtered.map(c => (
            <div key={c.id} className="contact-card">
              <div className="contact-card-head">
                <div className="contact-avatar" style={{background: esCliente?'#eef2ff':'#fffbeb', color: esCliente?'#6366f1':'#f59e0b'}}>
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="contact-title">
                  <strong>{c.nombre}</strong>
                  {c.empresa && <span className="text-muted small">{c.empresa}</span>}
                </div>
                <div className="action-btns">
                  <button className="icon-btn icon-btn--edit" onClick={()=>openEdit(c)}><Edit2 size={15}/></button>
                  <button className="icon-btn icon-btn--delete" onClick={()=>setConfirmDelete(c.id)}><Trash2 size={15}/></button>
                </div>
              </div>
              <div className="contact-card-body">
                {c.rfc && <div className="contact-row"><span className="rfc-badge">RFC</span> {c.rfc}</div>}
                {c.email && <div className="contact-row"><Mail size={14}/> {c.email}</div>}
                {c.telefono && <div className="contact-row"><Phone size={14}/> {c.telefono}</div>}
                {(c.direccion || c.ciudad) && <div className="contact-row"><MapPin size={14}/> {[c.direccion, c.ciudad, c.cp].filter(Boolean).join(', ')}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal--lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal==='add'?'Nuevo':'Editar'} {esCliente?'Cliente':'Proveedor'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre / Contacto *</label>
                  <input className="input" value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label>Empresa / Razón Social</label>
                  <input className="input" value={form.empresa} onChange={e=>setForm(p=>({...p,empresa:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label>RFC</label>
                  <input className="input" value={form.rfc} onChange={e=>setForm(p=>({...p,rfc:e.target.value.toUpperCase()}))} maxLength={13}/>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input className="input" value={form.telefono} onChange={e=>setForm(p=>({...p,telefono:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label>Código Postal</label>
                  <input className="input" value={form.cp} onChange={e=>setForm(p=>({...p,cp:e.target.value}))} maxLength={5}/>
                </div>
                <div className="form-group form-group--full">
                  <label>Dirección</label>
                  <input className="input" value={form.direccion} onChange={e=>setForm(p=>({...p,direccion:e.target.value}))}/>
                </div>
                <div className="form-group form-group--full">
                  <label>Ciudad / Estado</label>
                  <input className="input" value={form.ciudad} onChange={e=>setForm(p=>({...p,ciudad:e.target.value}))}/>
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

      {confirmDelete && (
        <div className="modal-overlay" onClick={()=>setConfirmDelete(null)}>
          <div className="modal modal--sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Confirmar eliminación</h2></div>
            <div className="modal-body"><p>¿Eliminar este {esCliente?'cliente':'proveedor'}?</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={()=>{deleteContacto(confirmDelete);setConfirmDelete(null);}}><Trash2 size={16}/> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
