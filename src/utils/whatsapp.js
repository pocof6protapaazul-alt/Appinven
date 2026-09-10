// Genera y abre un mensaje de WhatsApp con el resumen de una remisión (sin IVA).
// - empresa: datos de la empresa emisora
// - remision: la nota (usa el subtotal como total, ya que se maneja sin IVA)
// - cliente: contacto del cliente (opcional; si tiene teléfono se abre el chat directo)

const money = (n) => (n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const soloDigitos = (tel) => (tel || '').replace(/\D/g, '');

export function enviarRemisionWhatsApp(empresa, remision, cliente) {
  const clienteNombre = cliente?.nombre || remision.clienteNombre || '—';
  const lineas = [];

  lineas.push(`*${empresa?.nombre || 'Nota de remisión'}*`);
  lineas.push(`Nota de remisión ${remision.folio}`);
  lineas.push(`Fecha: ${remision.fecha}`);
  lineas.push('');
  lineas.push(`*Cliente:* ${clienteNombre}`);
  lineas.push('');
  lineas.push('*Productos:*');
  remision.items?.forEach((i) => {
    lineas.push(`• ${i.cantidad} ${i.unidad || ''} — ${i.nombre}: ${money(i.subtotal)}`);
  });
  lineas.push('');
  lineas.push(`*TOTAL: ${money(remision.subtotal)}*`);
  if (remision.observaciones) {
    lineas.push('');
    lineas.push(`_${remision.observaciones}_`);
  }
  lineas.push('');
  lineas.push('¡Gracias por su compra!');

  const texto = encodeURIComponent(lineas.join('\n'));
  const tel = soloDigitos(cliente?.telefono);
  const url = tel ? `https://wa.me/${tel}?text=${texto}` : `https://wa.me/?text=${texto}`;
  window.open(url, '_blank');
}
