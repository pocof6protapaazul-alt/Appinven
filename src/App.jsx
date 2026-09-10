import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Contactos from './pages/Contactos';
import Remisiones from './pages/Remisiones';
import Compras from './pages/Compras';
import Reportes from './pages/Reportes';
import Empresa from './pages/Empresa';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/clientes" element={<Contactos tipo="cliente" />} />
            <Route path="/proveedores" element={<Contactos tipo="proveedor" />} />
            <Route path="/remisiones" element={<Remisiones />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/empresa" element={<Empresa />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
