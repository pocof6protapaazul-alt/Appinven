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

export function AppProvider({ children }) {
  const load = (key, def) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  };

  const [empresa, setEmpresa] = useState(() => load('empresa', defaultEmpresa));
  const [productos, setProductos] = useState(() => load('productos', defaultProductos));
  const [contactos, setContactos] = useState(() => load('contactos', [...defaultClientes, ...defaultProveedores]));
  const [remisiones, setRemisiones] = useState(() => load('remisiones', defaultRemisiones));
  const [nextId, setNextId] = useState(() => load('nextId', { producto: 6, contacto: 3, remision: 2 }));

  useEffect(() => { localStorage.setItem('empresa', JSON.stringify(empresa)); }, [empresa]);
  useEffect(() => { localStorage.setItem('productos', JSON.stringify(productos)); }, [productos]);
  useEffect(() => { localStorage.setItem('contactos', JSON.stringify(contactos)); }, [contactos]);
  useEffect(() => { localStorage.setItem('remisiones', JSON.stringify(remisiones)); }, [remisiones]);
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

  const clientes = contactos.filter(c => c.tipo === 'cliente');
  const proveedores = contactos.filter(c => c.tipo === 'proveedor');

  return (
    <AppContext.Provider value={{
      empresa, setEmpresa,
      productos, addProducto, updateProducto, deleteProducto,
      contactos, clientes, proveedores, addContacto, updateContacto, deleteContacto,
      remisiones, addRemision, updateRemision, deleteRemision,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
