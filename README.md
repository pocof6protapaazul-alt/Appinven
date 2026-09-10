# 🏢 Control Empresarial

Aplicación web completa para el control de una empresa: inventarios, notas de remisión, clientes, proveedores y reportes. Incluye configuración de logotipo, RFC y datos fiscales.

## ✨ Funciones

### 📊 Dashboard
- Resumen de productos, clientes, proveedores y remisiones
- Métricas: ventas del mes, valor del inventario, stock bajo, remisiones del día
- Alertas de productos por reabastecer
- Últimas remisiones emitidas

### 📦 Inventario
- Alta, edición y eliminación de productos
- Campos: código, nombre, descripción, categoría, unidad, costo, precio, stock, stock mínimo y ubicación
- Ajuste rápido de stock (entradas y salidas) haciendo clic en la cantidad
- Búsqueda y filtro por categoría
- Alertas visuales de stock bajo / agotado

### 👥 Clientes y Proveedores
- Fichas con nombre, empresa, RFC, email, teléfono y dirección
- Búsqueda instantánea
- Alta, edición y eliminación

### 📄 Notas de Remisión
- Creación con selección de cliente y productos del inventario
- Cálculo automático de subtotal, IVA (16%, opcional) y total
- Edición de cantidades y precios por línea
- Cambio de estado: pendiente / entregada / cancelada
- **Vista previa e impresión**
- **Descarga en PDF** con el logotipo, RFC y datos fiscales de la empresa

### 📈 Reportes
- Ventas totales, valor del inventario y margen potencial
- Ticket promedio
- Productos más vendidos (gráfico de barras)
- Mejores clientes
- Inventario por categoría

### ⚙️ Mi Empresa
- Carga de **logotipo** (aparece en las remisiones)
- **RFC**, razón social y régimen fiscal
- Dirección, teléfono y correo
- Respaldo de todos los datos en formato JSON

## 💾 Almacenamiento
Todos los datos se guardan automáticamente en el navegador (localStorage). No requiere servidor ni base de datos para empezar a usarse.

## 🚀 Cómo ejecutar

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # generar versión de producción
npm run preview  # previsualizar la versión de producción
```

## 🛠️ Tecnologías
- React 19 + Vite
- React Router
- lucide-react (iconos)
- jsPDF + html2canvas (generación de PDF)

## 📝 Nota
Las notas de remisión **no son un comprobante fiscal (CFDI)**. Son documentos de entrega de mercancía. Para facturación electrónica formal se requeriría integración con un PAC autorizado por el SAT.
