import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, FileDown, Image, MessageCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { enviarRemisionWhatsApp } from '../utils/whatsapp';

export default function RemisionPDF({ remision, onClose }) {
  const { empresa, clientes } = useApp();
  const ref = useRef();
  const [generating, setGenerating] = useState(null); // 'pdf' | 'jpg' | null
  const cliente = clientes.find(c => c.id === remision.clienteId);

  const money = (n) => (n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const captureCanvas = () => html2canvas(ref.current, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  });

  const handleDownloadPDF = async () => {
    setGenerating('pdf');
    try {
      const canvas = await captureCanvas();
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`${remision.folio}.pdf`);
    } catch (e) {
      alert('Error al generar PDF: ' + e.message);
    }
    setGenerating(null);
  };

  const handleDownloadJPG = async () => {
    setGenerating('jpg');
    try {
      const canvas = await captureCanvas();
      const img = canvas.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = img;
      a.download = `${remision.folio}.jpg`;
      a.click();
    } catch (e) {
      alert('Error al generar imagen: ' + e.message);
    }
    setGenerating(null);
  };

  const handlePrint = () => {
    const content = ref.current.outerHTML;
    const win = window.open('', '', 'width=800,height=900');
    win.document.write(`<html><head><title>${remision.folio}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;padding:24px;color:#111827}
      .doc{max-width:720px;margin:0 auto}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{padding:10px 4px;text-align:left;font-size:13px}
      thead th{border-bottom:2px solid #111827;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280}
      tbody td{border-bottom:1px solid #f0f0f0}
      .text-right{text-align:right}
      img{max-height:56px;object-fit:contain}
      .m-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
      .m-brand{display:flex;align-items:center;gap:14px}
      .m-name{font-size:17px;font-weight:600}
      .m-sub{font-size:11px;color:#6b7280;line-height:1.6;margin-top:2px}
      .m-doc-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;text-align:right}
      .m-folio{font-size:24px;font-weight:700;letter-spacing:-.02em;text-align:right}
      .m-meta{font-size:11px;color:#6b7280;text-align:right;margin-top:4px}
      .m-parties{display:flex;gap:40px;margin-bottom:8px}
      .m-party-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;margin-bottom:4px}
      .m-party-name{font-size:14px;font-weight:600}
      .m-party-info{font-size:11px;color:#6b7280;line-height:1.6}
      .m-totals{display:flex;justify-content:flex-end;margin-top:8px}
      .m-totals-box{min-width:240px}
      .m-total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280}
      .m-total-grand{display:flex;justify-content:space-between;padding:12px 0 0;margin-top:6px;border-top:2px solid #111827;font-size:17px;font-weight:700;color:#111827}
      .m-foot{margin-top:36px;display:flex;justify-content:space-between;gap:32px}
      .m-note-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;margin-bottom:4px}
      .m-note{font-size:12px;color:#4b5563;line-height:1.6;max-width:280px}
      .m-sign{text-align:center;min-width:180px;align-self:flex-end}
      .m-sign-line{border-top:1px solid #111827;padding-top:6px;font-size:11px;color:#6b7280}
      .m-disc{margin-top:32px;padding-top:16px;border-top:1px solid #f0f0f0;font-size:9px;color:#9ca3af;text-align:center;letter-spacing:.03em}
      .m-logo-ph{width:52px;height:52px;border-radius:12px;background:#111827;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700}
    </style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const clienteNombre = cliente?.nombre || remision.clienteNombre || '—';
  const inicial = (empresa.nombre || '?').charAt(0).toUpperCase();

  const handleWhatsApp = () => enviarRemisionWhatsApp(empresa, remision, cliente);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--doc" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nota {remision.folio}</h2>
          <div className="doc-actions">
            <button className="btn btn-whatsapp btn-sm" onClick={handleWhatsApp}><MessageCircle size={15}/> WhatsApp</button>
            <button className="btn btn-outline btn-sm" onClick={handlePrint}><Printer size={15}/> Imprimir</button>
            <button className="btn btn-outline btn-sm" onClick={handleDownloadJPG} disabled={generating}>
              <Image size={15}/> {generating === 'jpg' ? 'Generando...' : 'JPG'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleDownloadPDF} disabled={generating}>
              <FileDown size={15}/> {generating === 'pdf' ? 'Generando...' : 'PDF'}
            </button>
            <button className="modal-close" onClick={onClose}><X size={20}/></button>
          </div>
        </div>
        <div className="modal-body doc-scroll">
          {/* Documento minimalista */}
          <div className="doc doc--minimal" ref={ref}>
            {/* Encabezado */}
            <div className="m-head">
              <div className="m-brand">
                {empresa.logo
                  ? <img src={empresa.logo} alt="logo"/>
                  : <div className="m-logo-ph">{inicial}</div>}
                <div>
                  <div className="m-name">{empresa.nombre}</div>
                  <div className="m-sub">
                    RFC {empresa.rfc}<br/>
                    {[empresa.direccion, empresa.ciudad].filter(Boolean).join(', ')}<br/>
                    {[empresa.telefono, empresa.email].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
              <div>
                <div className="m-doc-label">Nota de remisión</div>
                <div className="m-folio">{remision.folio}</div>
                <div className="m-meta">{remision.fecha}</div>
                <div className="m-meta" style={{ textTransform: 'capitalize' }}>{remision.estado}</div>
              </div>
            </div>

            {/* Cliente */}
            <div className="m-parties">
              <div>
                <div className="m-party-label">Cliente</div>
                <div className="m-party-name">{clienteNombre}</div>
                <div className="m-party-info">
                  {cliente?.empresa && <>{cliente.empresa}<br/></>}
                  {cliente?.rfc && <>RFC {cliente.rfc}<br/></>}
                  {cliente?.telefono && <>{cliente.telefono}<br/></>}
                  {cliente?.direccion && <>{[cliente.direccion, cliente.ciudad, cliente.cp].filter(Boolean).join(', ')}</>}
                </div>
              </div>
            </div>

            {/* Items */}
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th className="text-right">Cant.</th>
                  <th className="text-right">P. Unit.</th>
                  <th className="text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {remision.items?.map((i, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{i.nombre}</div>
                      {i.codigo && <div style={{ fontSize: 11, color: '#9ca3af' }}>{i.codigo}</div>}
                    </td>
                    <td className="text-right">{i.cantidad} {i.unidad || ''}</td>
                    <td className="text-right">{money(i.precio)}</td>
                    <td className="text-right" style={{ fontWeight: 500 }}>{money(i.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total (sin IVA) */}
            <div className="m-totals">
              <div className="m-totals-box">
                <div className="m-total-grand"><span>Total</span><span>{money(remision.subtotal)}</span></div>
              </div>
            </div>

            {/* Pie */}
            <div className="m-foot">
              <div>
                {remision.observaciones && <>
                  <div className="m-note-label">Observaciones</div>
                  <div className="m-note">{remision.observaciones}</div>
                </>}
              </div>
              <div className="m-sign">
                <div className="m-sign-line">Recibí de conformidad</div>
              </div>
            </div>

            <div className="m-disc">Documento no fiscal · Nota de remisión de mercancía</div>
          </div>
        </div>
      </div>
    </div>
  );
}
