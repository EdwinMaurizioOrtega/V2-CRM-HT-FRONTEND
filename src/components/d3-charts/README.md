# Componentes D3.js

Esta carpeta contiene componentes de visualización de datos construidos con D3.js v7.

## Componentes Disponibles

### 1. D3BarChart
Gráfico de barras horizontal o vertical con zoom y tooltips interactivos.

**Props:**
- `data` (Array): Datos a visualizar
- `xKey` (String): Clave para el eje X
- `yKey` (String): Clave para el eje Y
- `height` (Number): Altura del gráfico (default: 400)
- `color` (String): Color de las barras (default: '#1976d2')
- `horizontal` (Boolean): Si es horizontal o vertical (default: false)

**Características:**
- ✅ Zoom in/out con botones o selección de área
- ✅ Pan para desplazarse
- ✅ Animaciones suaves
- ✅ Tooltips al hacer hover
- ✅ Etiquetas de valores
- ✅ Fuentes legibles (13px)

**Ejemplo:**
```jsx
<D3BarChart
    data={ventasData}
    xKey="vendedor"
    yKey="ventas"
    height={450}
    color="#1976d2"
    horizontal={true}
/>
```

### 2. D3LineChart
Gráfico de líneas múltiples con puntos interactivos y zoom.

**Props:**
- `data` (Array): Datos a visualizar
- `xKey` (String): Clave para el eje X
- `yKeys` (Array<String>): Claves para múltiples líneas
- `height` (Number): Altura del gráfico (default: 400)
- `colors` (Array<String>): Colores para cada línea

**Características:**
- ✅ Múltiples series de datos
- ✅ Animación de dibujo de líneas
- ✅ Puntos interactivos con hover
- ✅ Zoom y pan
- ✅ Leyenda automática
- ✅ Tooltips personalizados

**Ejemplo:**
```jsx
<D3LineChart
    data={evolucionData}
    xKey="fecha"
    yKeys={['utilidad', 'ventas', 'perdidas']}
    height={450}
    colors={['#2e7d32', '#0288d1', '#d32f2f']}
/>
```

### 3. D3PieChart
Gráfico circular (pastel) con animaciones y tooltips.

**Props:**
- `data` (Array): Datos a visualizar
- `labelKey` (String): Clave para las etiquetas
- `valueKey` (String): Clave para los valores
- `height` (Number): Altura del gráfico (default: 400)
- `colors` (Array<String>): Colores personalizados (opcional)

**Características:**
- ✅ Animación de apertura
- ✅ Efecto hover con expansión
- ✅ Tooltips con porcentajes
- ✅ Etiquetas de porcentaje en el gráfico
- ✅ Leyenda lateral
- ✅ Colores personalizables

**Ejemplo:**
```jsx
<D3PieChart
    data={marcasData}
    labelKey="marca"
    valueKey="utilidad"
    height={400}
    colors={['#1976d2', '#dc004e', '#ff9800']}
/>
```

### 4. D3ScatterPlot
Gráfico de dispersión con tamaño variable de puntos y zoom.

**Props:**
- `data` (Array): Datos a visualizar
- `xKey` (String): Clave para el eje X
- `yKey` (String): Clave para el eje Y
- `labelKey` (String): Clave para las etiquetas
- `sizeKey` (String): Clave para el tamaño de los puntos
- `height` (Number): Altura del gráfico (default: 400)
- `color` (String): Color de los puntos (default: '#1976d2')

**Características:**
- ✅ Tamaño de puntos basado en datos
- ✅ Zoom y pan interactivo
- ✅ Tooltips informativos con 4 líneas de datos
- ✅ Animación de entrada
- ✅ Etiquetas de ejes personalizadas
- ✅ Efecto hover

**Ejemplo:**
```jsx
<D3ScatterPlot
    data={clientesData}
    xKey="margen"
    yKey="tasaBajoCosto"
    labelKey="cliente"
    sizeKey="ventas"
    height={450}
    color="#d32f2f"
/>
```

## Ventajas de D3.js vs ApexCharts

1. **Mayor Control**: D3 permite personalización completa del SVG
2. **Mejor Performance**: Renderizado más eficiente para grandes datasets
3. **Zoom Avanzado**: Implementación nativa de zoom y pan
4. **Animaciones Personalizadas**: Control total sobre transiciones
5. **Tooltips Flexibles**: Diseño completamente personalizable
6. **Sin Dependencias Externas**: Menor peso del bundle

## Instalación

```bash
npm install d3 @types/d3 --legacy-peer-deps
```

## Uso en Proyectos

Importar los componentes:
```javascript
import { D3BarChart, D3LineChart, D3PieChart, D3ScatterPlot } from '../../../components/d3-charts';
```

## Notas Técnicas

- Todos los gráficos son responsivos y se ajustan al contenedor padre
- Los botones de zoom están siempre visibles en la parte superior derecha
- Las fuentes tienen un tamaño mínimo de 13px para legibilidad
- Los colores se pueden pasar desde el tema de Material-UI
- Uso de `useRef` y `useEffect` para integración con React

## Futuras Mejoras

- [ ] Exportar gráficos como PNG/SVG
- [ ] Agregar más tipos de gráficos (area, donut, radar)
- [ ] Implementar brushing y linking entre gráficos
- [ ] Agregar transiciones entre datasets
- [ ] Soporte para dark mode
