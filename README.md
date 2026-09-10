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

### 🛒 Compras (órdenes a proveedores)
- Registro de órdenes de compra con selección de proveedor y productos
- Cálculo automático de subtotal, IVA (16%, opcional) y total
- Estados: pendiente / recibida / cancelada
- **Al marcar una compra como "Recibida", el stock del inventario aumenta automáticamente** y se actualiza el costo del producto
- Si se cancela o elimina una compra recibida, el stock se revierte automáticamente
- Búsqueda por folio o proveedor

### 📈 Reportes
- Ventas totales, valor del inventario y margen potencial
- Compras totales y **balance** (ventas − compras)
- Productos más vendidos (gráfico de barras)
- Mejores clientes y principales proveedores
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

## 📲 Instalar como app (PWA)

La aplicación es una **PWA**: se puede instalar como app en el teléfono o el escritorio y funciona sin conexión (los datos se guardan en el dispositivo).

1. Publica la app en un hosting con HTTPS (por ejemplo **Vercel** o **Netlify**, conectando este repositorio). La PWA requiere HTTPS.
2. Abre la URL publicada en el navegador:
   - **Android / Chrome:** aparece el aviso "Instalar app" o entra al menú ⋮ → *Instalar aplicación*.
   - **iPhone / Safari:** botón *Compartir* → *Agregar a pantalla de inicio*.
   - **Escritorio / Chrome o Edge:** ícono de instalación ⊕ en la barra de direcciones.
3. Quedará como un ícono independiente y se abrirá en pantalla completa, como una app nativa.

> Para probar la PWA localmente usa `npm run build && npm run preview` (el service worker solo se activa en la versión de producción).

Si cambias el diseño del ícono, edita `scripts/icon-source.svg` y regenera los PNG con:
```bash
node scripts/generate-icons.mjs
```

## 🛠️ Tecnologías
- React 19 + Vite
- React Router
- lucide-react (iconos)
- jsPDF + html2canvas (generación de PDF)

## 📝 Nota
Las notas de remisión **no son un comprobante fiscal (CFDI)**. Son documentos de entrega de mercancía. Para facturación electrónica formal se requeriría integración con un PAC autorizado por el SAT.
