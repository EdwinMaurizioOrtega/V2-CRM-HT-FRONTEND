import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #00AB55',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00AB55',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#637381',
  },
  infoSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    backgroundColor: '#F4F6F8',
    padding: 10,
    borderRadius: 4,
  },
  infoItem: {
    width: '50%',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 8,
    color: '#637381',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
    color: '#212B36',
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#00AB55',
    padding: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 9,
  },
  colNum: { width: '6%' },
  colCode: { width: '18%' },
  colDesc: { width: '36%' },
  colQty: { width: '15%', textAlign: 'center' },
  colSeries: { width: '25%', textAlign: 'center' },
  seriesSection: {
    marginTop: 5,
    marginBottom: 15,
    paddingLeft: 10,
  },
  seriesProductTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#007B55',
    marginBottom: 4,
    marginTop: 8,
  },
  seriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  seriesItem: {
    width: '33%',
    fontSize: 8,
    padding: 2,
    fontFamily: 'Courier',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTop: '1px solid #E0E0E0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#919EAB',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgeSuccess: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  badgeWarning: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  totalRow: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: '#C8FACD',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});

const ESTADOS_MAP = {
  0: 'Pendiente Aprobación',
  1: 'Pendiente Series',
  2: 'Pendiente Recepción',
  3: 'Completada',
  4: 'Cancelada',
};

export default function TransferenciaPDF({ transferencia, productos, series }) {
  const fechaSolicitud = transferencia?.FECHA_SOLICITUD
    ? new Date(transferencia.FECHA_SOLICITUD).toLocaleString('es-EC', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const estadoLabel = ESTADOS_MAP[transferencia?.ESTADO] || 'Desconocido';

  // Calculate totals
  const totalProductos = productos?.length || 0;
  const totalCantidad = productos?.reduce((sum, p) => sum + (p.CANTIDAD_SOLICITADA || 0), 0) || 0;
  const totalSeriesCargadas = productos?.reduce((sum, p) => sum + (p.SERIES_CARGADAS || 0), 0) || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transferencia TRF-{transferencia?.ID}</Text>
          <Text style={styles.subtitle}>Reporte de transferencia de stock con series</Text>
        </View>

        {/* Info General */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estado</Text>
            <Text style={styles.infoValue}>{estadoLabel}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha Solicitud</Text>
            <Text style={styles.infoValue}>{fechaSolicitud}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Bodega Origen</Text>
            <Text style={styles.infoValue}>{transferencia?.BODEGA_ORIGEN || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Bodega Destino</Text>
            <Text style={styles.infoValue}>{transferencia?.BODEGA_DESTINO || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Solicitante</Text>
            <Text style={styles.infoValue}>{transferencia?.SOLICITANTE_NOMBRE || 'N/A'}</Text>
          </View>
          {transferencia?.OBSERVACIONES && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Observaciones</Text>
              <Text style={styles.infoValue}>{transferencia.OBSERVACIONES}</Text>
            </View>
          )}
        </View>

        {/* Productos Table */}
        <Text style={styles.sectionTitle}>
          Productos ({totalProductos}) — Total unidades: {totalCantidad} — Series cargadas: {totalSeriesCargadas}
        </Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNum]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colCode]}>Código</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Cantidad</Text>
            <Text style={[styles.tableHeaderCell, styles.colSeries]}>Series Cargadas</Text>
          </View>

          {/* Table Rows */}
          {productos
            ?.slice()
            .sort((a, b) => (a.ITEM_NAME || '').localeCompare(b.ITEM_NAME || ''))
            .map((producto, index) => {
              const seriesCargadas = producto.SERIES_CARGADAS || 0;
              const isAlt = index % 2 === 1;

              return (
                <View key={producto.ID || index} style={isAlt ? styles.tableRowAlt : styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colNum]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, styles.colCode, { fontWeight: 'bold' }]}>
                    {producto.ITEM_CODE}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDesc]}>{producto.ITEM_NAME}</Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{producto.CANTIDAD_SOLICITADA}</Text>
                  <Text style={[styles.tableCell, styles.colSeries]}>
                    {seriesCargadas} / {producto.CANTIDAD_SOLICITADA}
                  </Text>
                </View>
              );
            })}

          {/* Total Row */}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.colNum]} />
            <Text style={[styles.totalLabel, styles.colCode]} />
            <Text style={[styles.totalLabel, styles.colDesc]}>TOTAL</Text>
            <Text style={[styles.totalLabel, styles.colQty]}>{totalCantidad}</Text>
            <Text style={[styles.totalLabel, styles.colSeries]}>{totalSeriesCargadas} / {totalCantidad}</Text>
          </View>
        </View>

        {/* Series Detail */}
        {series && Object.keys(series).length > 0 && (
          <View style={styles.seriesSection}>
            <Text style={styles.sectionTitle}>Detalle de Series / IMEIs</Text>
            {productos
              ?.slice()
              .sort((a, b) => (a.ITEM_NAME || '').localeCompare(b.ITEM_NAME || ''))
              .map((producto) => {
                const seriesProducto = series[producto.ID] || [];
                if (seriesProducto.length === 0) return null;

                return (
                  <View key={producto.ID}>
                    <Text style={styles.seriesProductTitle}>
                      {producto.ITEM_CODE} - {producto.ITEM_NAME} ({seriesProducto.length} series)
                    </Text>
                    <View style={styles.seriesGrid}>
                      {seriesProducto.map((serie, idx) => (
                        <Text key={idx} style={styles.seriesItem}>
                          {idx + 1}. {serie.SERIE_IMEI}
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generado el {new Date().toLocaleString('es-EC')}
          </Text>
          <Text style={styles.footerText}>CRM HT - Gestión de Transferencias</Text>
        </View>
      </Page>
    </Document>
  );
}
