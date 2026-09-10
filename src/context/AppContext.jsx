import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const defaultEmpresa = {
  nombre: 'Mi Empresa S.A. de C.V.',
  rfc: 'MEM123456ABC',
  direccion: 'Calle Principal #123, Col. Centro',
  ciudad: 'Ciudad de México, CDMX',
  cp: '06000',
  telefono: '55 1234 5678',
  email: 'contacto@miempresa.com',
  logo: null,
  regimenFiscal: '601 - General de Ley Personas Morales',
};

const defaultProductos = [
  { id: 1, codigo: 'P001', nombre: 'Laptop HP 14"', descripcion: 'Laptop HP 14 pulgadas Intel i5', categoria: 'Electrónica', unidad: 'PZA', precio: 12500, costo: 9500, stock: 15, stockMin: 3, ubicacion: 'A1' },
  { id: 2, codigo: 'P002', nombre: 'Mouse Inalámbrico', descripcion: 'Mouse inalámbrico Logitech', categoria: 'Accesorios', unidad: 'PZA', precio: 350, costo: 220, stock: 40, stockMin: 10, ubicacion: 'B2' },
  { id: 3, codigo: 'P003', nombre: 'Teclado Mecánico', descripcion: 'Teclado mecánico RGB', categoria: 'Accesorios', unidad: 'PZA', precio: 890, costo: 600, stock: 8, stockMin: 5, ubicacion: 'B3' },
  { id: 4, codigo: 'P004', nombre: 'Monitor 27"', descripcion: 'Monitor LED 27 pulgadas Full HD', categoria: 'Electrónica', unidad: 'PZA', precio: 5800, costo: 4200, stock: 6, stockMin: 2, ubicacion: 'A2' },
  { id: 5, codigo: 'P005', nombre: 'Silla de Oficina', descripcion: 'Silla ergonómica de oficina', categoria: 'Mobiliario', unidad: 'PZA', precio: 3200, costo: 2100, stock: 2, stockMin: 2, ubicacion: 'C1' },
];

const defaultClientes = [
  { id: 1, tipo: 'cliente', nombre: 'Juan Pérez García', empresa: 'Distribuidora Pérez', rfc: 'PEGJ800101ABC', email: 'juan@distribuidora.com', telefono: '55 9876 5432', direccion: 'Av. Reforma #456', ciudad: 'CDMX', cp: '06600' },
  { id: 2, tipo: 'cliente', nombre: 'María López Silva', empresa: 'Comercial López', rfc: 'LOSM750215XYZ', email: 'maria@comercial.com', telefono: '33 2345 6789', direccion: 'Calle 5 #789', ciudad: 'Guadalajara, Jal.', cp: '44100' },
];

const defaultProveedores = [
  { id: 1, tipo: 'proveedor', nombre: 'Carlos Ramírez', empresa: 'Tecnologías CR', rfc: 'RACL900101DEF', email: 'carlos@tecno.com', telefono: '81 3456 7890', direccion: 'Av. Industrial #100', ciudad: 'Monterrey, NL', cp: '64000' },
];

const defaultRemisiones = [
  { id: 1, folio: 'REM-001', fecha: '2026-09-01', clienteId: 1, estado: 'entregada', observaciones: 'Entrega en oficinas del cliente', items: [{ productoId: 1, nombre: 'Laptop HP 14"', cantidad: 2, precio: 12500, subtotal: 25000 }], subtotal: 25000, iva: 4000, total: 29000 },
];

const defaultCompras = [
  { id: 1, folio: 'OC-001', fecha: '2026-09-02', proveedorId: 1, proveedorNombre: 'Carlos Ramírez', estado: 'recibida', observaciones: 'Reabastecimiento mensual', items: [{ productoId: 2, nombre: 'Mouse Inalámbrico', codigo: 'P002', unidad: 'PZA', cantidad: 20, costo: 220, subtotal: 4400 }], subtotal: 4400, iva: 704, total: 5104, stockAplicado: true },
];

export function AppProvider({ children }) {
  const load = (key, def) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  };

  const [empresa, setEmpresa] = useState(() => load('empresa', defaultEmpresa));
  const [productos, setProductos] = useState(() => load('productos', defaultProductos));
  const [contactos, setContactos] = useState(() => load('contactos', [...defaultClientes, ...defaultProveedores]));
  const [remisiones, setRemisiones] = useState(() => load('remisiones', defaultRemisiones));
  const [compras, setCompras] = useState(() => load('compras', defaultCompras));
  const [nextId, setNextId] = useState(() => load('nextId', { producto: 6, contacto: 3, remision: 2, compra: 2 }));

  useEffect(() => { localStorage.setItem('empresa', JSON.stringify(empresa)); }, [empresa]);
  useEffect(() => { localStorage.setItem('productos', JSON.stringify(productos)); }, [productos]);
  useEffect(() => { localStorage.setItem('contactos', JSON.stringify(contactos)); }, [contactos]);
  useEffect(() => { localStorage.setItem('remisiones', JSON.stringify(remisiones)); }, [remisiones]);
  useEffect(() => { localStorage.setItem('compras', JSON.stringify(compras)); }, [compras]);
  useEffect(() => { localStorage.setItem('nextId', JSON.stringify(nextId)); }, [nextId]);

  const genId = (tipo) => {
    const id = nextId[tipo];
    setNextId(p => ({ ...p, [tipo]: p[tipo] + 1 }));
    return id;
  };

  // Productos
  const addProducto = (p) => setProductos(prev => [...prev, { ...p, id: genId('producto') }]);
  const updateProducto = (id, data) => setProductos(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deleteProducto = (id) => setProductos(prev => prev.filter(p => p.id !== id));

  // Contactos
  const addContacto = (c) => setContactos(prev => [...prev, { ...c, id: genId('contacto') }]);
  const updateContacto = (id, data) => setContactos(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  const deleteContacto = (id) => setContactos(prev => prev.filter(c => c.id !== id));

  // Remisiones
  const addRemision = (r) => {
    const id = genId('remision');
    const folio = `REM-${String(id).padStart(3, '0')}`;
    setRemisiones(prev => [...prev, { ...r, id, folio }]);
    return folio;
  };
  const updateRemision = (id, data) => setRemisiones(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  const deleteRemision = (id) => setRemisiones(prev => prev.filter(r => r.id !== id));

  // Compras — ajusta el stock del inventario según los items recibidos
  const aplicarStock = (items, signo) => {
    setProductos(prev => prev.map(p => {
      const item = items.find(i => i.productoId === p.id);
      if (!item) return p;
      const nuevoStock = Math.max(0, p.stock + signo * item.cantidad);
      // Al recibir mercancía, se actualiza el último costo de compra
      if (signo > 0 && item.costo > 0) return { ...p, stock: nuevoStock, costo: item.costo };
      return { ...p, stock: nuevoStock };
    }));
  };

  const addCompra = (c) => {
    const id = genId('compra');
    const folio = `OC-${String(id).padStart(3, '0')}`;
    const recibida = c.estado === 'recibida';
    if (recibida) aplicarStock(c.items, +1);
    setCompras(prev => [...prev, { ...c, id, folio, stockAplicado: recibida }]);
    return folio;
  };

  const updateCompra = (id, data) => {
    setCompras(prev => prev.map(c => {
      if (c.id !== id) return c;
      const merged = { ...c, ...data };
      const eraRecibida = c.stockAplicado === true;
      const seraRecibida = merged.estado === 'recibida';
      // Revertir stock anterior si estaba aplicado
      if (eraRecibida) aplicarStock(c.items, -1);
      // Aplicar stock nuevo si queda como recibida
      if (seraRecibida) aplicarStock(merged.items, +1);
      return { ...merged, stockAplicado: seraRecibida };
    }));
  };

  // Cambia solo el estado (usado desde la tabla) y ajusta stock según corresponda
  const setEstadoCompra = (id, estado) => {
    setCompras(prev => prev.map(c => {
      if (c.id !== id) return c;
      const eraRecibida = c.stockAplicado === true;
      const seraRecibida = estado === 'recibida';
      if (eraRecibida && !seraRecibida) aplicarStock(c.items, -1);
      if (!eraRecibida && seraRecibida) aplicarStock(c.items, +1);
      return { ...c, estado, stockAplicado: seraRecibida };
    }));
  };

  const deleteCompra = (id) => {
    setCompras(prev => {
      const compra = prev.find(c => c.id === id);
      if (compra?.stockAplicado) aplicarStock(compra.items, -1);
      return prev.filter(c => c.id !== id);
    });
  };

  const clientes = contactos.filter(c => c.tipo === 'cliente');
  const proveedores = contactos.filter(c => c.tipo === 'proveedor');

  return (
    <AppContext.Provider value={{
      empresa, setEmpresa,
      productos, addProducto, updateProducto, deleteProducto,
      contactos, clientes, proveedores, addContacto, updateContacto, deleteContacto,
      remisiones, addRemision, updateRemision, deleteRemision,
      compras, addCompra, updateCompra, setEstadoCompra, deleteCompra,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
