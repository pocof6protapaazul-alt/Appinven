import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Upload, Save, Check, Trash2, Download, Database } from 'lucide-react';

const regimenes = [
  '601 - General de Ley Personas Morales',
  '603 - Personas Morales con Fines no Lucrativos',
  '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606 - Arrendamiento',
  '612 - Personas Físicas con Actividades Empresariales y Profesionales',
  '621 - Incorporación Fiscal',
  '626 - Régimen Simplificado de Confianza (RESICO)',
];

export default function Empresa() {
  const { empresa, setEmpresa, productos, contactos, remisiones } = useApp();
  const [form, setForm] = useState(empresa);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) return alert('El logo debe pesar menos de 500KB');
    const reader = new FileReader();
    reader.onload = () => setForm(p => ({ ...p, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setEmpresa(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const exportData = () => {
    const data = { empresa, productos, contactos, remisiones, exportado: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="page-content">
      <div className="empresa-layout">
        {/* Logo y datos */}
        <div className="card">
          <div className="card-header"><h2 className="card-title"><Building2 size={18}/> Datos de la Empresa</h2></div>
          <div className="card-body">
            <div className="logo-section">
              <div className="logo-preview">
                {form.logo
                  ? <img src={form.logo} alt="logo"/>
                  : <div className="logo-empty"><Building2 size={40}/><span>Sin logotipo</span></div>}
              </div>
              <div className="logo-actions">
                <input type="file" ref={fileRef} accept="image/*" onChange={handleLogo} style={{display:'none'}}/>
                <button className="btn btn-outline" onClick={()=>fileRef.current.click()}><Upload size={16}/> Subir Logotipo</button>
                {form.logo && <button className="btn btn-ghost btn-danger-text" onClick={()=>setForm(p=>({...p,logo:null}))}><Trash2 size={16}/> Quitar</button>}
                <p className="text-muted small">Formato PNG/JPG · Máx. 500KB · Aparecerá en las remisiones</p>
              </div>
            </div>

            <div className="form-grid" style={{marginTop:'24px'}}>
              <div className="form-group form-group--full">
                <label>Nombre / Razón Social *</label>
                <input className="input" value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label>RFC *</label>
                <input className="input" value={form.rfc} onChange={e=>setForm(p=>({...p,rfc:e.target.value.toUpperCase()}))} maxLength={13}/>
              </div>
              <div className="form-group">
                <label>Régimen Fiscal</label>
                <select className="input" value={form.regimenFiscal} onChange={e=>setForm(p=>({...p,regimenFiscal:e.target.value}))}>
                  {regimenes.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group form-group--full">
                <label>Dirección</label>
                <input className="input" value={form.direccion} onChange={e=>setForm(p=>({...p,direccion:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label>Ciudad / Estado</label>
                <input className="input" value={form.ciudad} onChange={e=>setForm(p=>({...p,ciudad:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label>Código Postal</label>
                <input className="input" value={form.cp} onChange={e=>setForm(p=>({...p,cp:e.target.value}))} maxLength={5}/>
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input className="input" value={form.telefono} onChange={e=>setForm(p=>({...p,telefono:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
              </div>
            </div>

            <div style={{marginTop:'20px',display:'flex',gap:'12px',alignItems:'center'}}>
              <button className={`btn ${saved?'btn-success':'btn-primary'}`} onClick={handleSave}>
                {saved ? <><Check size={16}/> Guardado</> : <><Save size={16}/> Guardar Cambios</>}
              </button>
            </div>
          </div>
        </div>

        {/* Respaldo de datos */}
        <div className="card">
          <div className="card-header"><h2 className="card-title"><Database size={18}/> Respaldo de Datos</h2></div>
          <div className="card-body">
            <p className="text-muted">Toda la información se guarda automáticamente en tu navegador. Puedes descargar un respaldo completo en cualquier momento.</p>
            <div className="backup-stats">
              <div><strong>{productos.length}</strong> productos</div>
              <div><strong>{contactos.length}</strong> contactos</div>
              <div><strong>{remisiones.length}</strong> remisiones</div>
            </div>
            <button className="btn btn-outline" onClick={exportData}><Download size={16}/> Descargar Respaldo (JSON)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
