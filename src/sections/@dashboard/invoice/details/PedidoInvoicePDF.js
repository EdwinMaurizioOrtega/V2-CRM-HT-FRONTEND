/* eslint-disable jsx-a11y/alt-text */
import PropTypes from 'prop-types';
import { Page, View, Text, Image, Document } from '@react-pdf/renderer';

//
import styles from './InvoiceStyle';
import { Divider, Link, TableCell } from "@mui/material";

import React, { use } from 'react';
import { fontWeight } from "@mui/system";
import { fCurrency } from "../../../../utils/formatNumber";

// Resto de tu código


// ----------------------------------------------------------------------

PedidoInvoicePDF.propTypes = {
    //invoice: PropTypes.object,
};


export default function PedidoInvoicePDF({ invoice, user, empresa }) {
    // //console.log("invoice: "+ JSON.stringify(invoice));
    // //console.log("invoice: "+ JSON.stringify(invoice[0]));
    // //console.log("invoice: "+ invoice.PEDIDO_PROV);

    //console.log("usergggggg: " + JSON.stringify(user));
    const {
        items = [],
        ID,
        ESTADO,
        FECHACREACION,
        CLIENTEID,
        Nombres,
        Apellidos,
        Cliente,
        Ciudad,
        Celular,
        Tipo,
        VENDEDOR,
        BODEGA,
        FORMADEPAGO,
        CITY,
        ValidComm,
        GLN,
        Balance,
        OBSERVACIONES,
        OBSERVACIONESB,
        DOCNUM
    } = invoice;

    const ivaPorcentaje = 0.15; // Porcentaje de IVA (15% en Ecuador)
    let subtotalTotal = 0;

    if (empresa === "LD") {

        //TOMEBAMBA: VENDEDOR Y EJECUTIVO SOPORTE
        if (user.ROLE === '0' || user.ROLE === '2') {

            items.forEach((row) => {
                const subtotal = row.TM_PRECIO_UNITARIO_VENTA * row.CANTIDAD;
                subtotalTotal += subtotal;
            });

        } else {

            items.forEach((row) => {
                const subtotal = row.PRECIOUNITARIOVENTA * row.CANTIDAD;
                subtotalTotal += subtotal;
            });

        }

    }

    //PDF solo precios de Tomebamba
    if (empresa === "TM") {

        //TOMEBAMBA: Carlos Mendez
        if (user.ROLE === '1') {

            items.forEach((row) => {
                const subtotal = row.TM_PRECIO_UNITARIO_VENTA * row.CANTIDAD;
                subtotalTotal += subtotal;
            });

        }

    }

    const ivaTotal = subtotalTotal * ivaPorcentaje;
    const totalConIva = subtotalTotal + ivaTotal;

    //console.log('Subtotal: ', subtotalTotal);
    //console.log('IVA: ', ivaTotal);
    //console.log('Total incluido IVA: ', totalConIva);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={[styles.gridContainer, { marginBottom: 15 }]} fixed>
                    <Image source="/logo/logo_group_ht.jpeg" style={{ height: 50 }} />
                    <View style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
                        <Text style={[styles.h3, { fontSize: 12 }]}>{status}</Text>
                        <Text style={{ fontSize: 9 }}> {user.EMPRESA == '0992537442001' ? 'Lidenar S.A. RUC: 0992537442001' : 'MovilCelistic S.A. RUC: 1792161037001'} </Text>
                        <Text style={{ fontSize: 9 }}> {`Pedido de Venta: ${ID}`} </Text>
                    </View>
                </View>
                <View style={[styles.gridContainer, { justifyContent: 'center', alignItems: 'center', marginBottom: 10 }]}>
                    <Text style={[styles.h4, { fontSize: 11 }]}>Razón Social: {Cliente}</Text>
                </View>
                <View style={[styles.gridContainer, { marginBottom: 15 }]}>
                    <View style={styles.col6}>
                        <Text style={[styles.body1, { fontSize: 8, marginBottom: 2 }]}>
                            <Text style={{ fontWeight: 'bold' }}>TIPO: </Text>
                            {Tipo}</Text>
                        <Text style={[styles.body1, { fontSize: 8, marginBottom: 2 }]}>

                            <Text style={{ fontWeight: 'bold' }}>CI/RUC: </Text>
                            {CLIENTEID}</Text>
                        <Text style={[styles.body1, { fontSize: 8, marginBottom: 2 }]}>
                            <Text style={{ fontWeight: 'bold' }}>CIUDAD: </Text>
                            {Ciudad}</Text>
                        <Text style={[styles.body1, { fontSize: 8, marginBottom: 2 }]}>
                            <Text style={{ fontWeight: 'bold' }}>TLF: </Text>
                            {Celular}</Text>

                        <Text style={[styles.body1, { fontSize: 8, marginBottom: 2 }]}>
                            <Text style={{ fontWeight: 'bold' }}>ESTABLECIMIENTO: </Text>
                            {/* RUC Lidenar */}
                            {user.EMPRESA === '0992537442001' ?
                                getTextFromCodigo(BODEGA) + ' ' + BODEGA
                                : 
                                getTextFromCodigoMovilCelistic(BODEGA) + ' ' + BODEGA
                            }
                        </Text>

                        <Text style={[styles.body1, { fontSize: 8 }]}>
                            <Text style={{ fontWeight: 'bold' }}>FECHA DE TRASLADO: </Text>
                            {new Date().toLocaleString('es-EC', {
                                timeZone: 'America/Guayaquil',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            })}
                        </Text>

                    </View>

                    <View style={styles.col6}>
                
                        <Text style={[styles.body1, { fontSize: 8 }]}>
                            <Text style={{ fontWeight: 'bold' }}>VENDEDOR: </Text>
                            {VENDEDOR}</Text>
                    </View>
                </View>

                <Text style={[styles.overline, { fontSize: 9, marginBottom: 5 }]}>DETALLES</Text>

                <View style={[styles.table, { marginBottom: 15 }]}>
                    <View style={styles.tableHeader}>
                        <View style={styles.tableRow}>
                            <View style={styles.tableCell_1}>
                                <Text style={[styles.subtitle2, { fontSize: 8 }]}>#</Text>
                            </View>

                            <View style={styles.tableCell_2}>
                                <Text style={[styles.subtitle2, { fontSize: 8 }]}>DESCRIPCIÓN</Text>
                            </View>

                            <View style={styles.tableCell_3}>
                                <Text style={[styles.subtitle2, { fontSize: 8 }]}>TPRECIO</Text>
                            </View>

                            <View style={styles.tableCell_3}>
                                <Text style={[styles.subtitle2, { fontSize: 8 }]}>CANTIDAD</Text>
                            </View>

                            <View style={styles.tableCell_3}>
                                <Text style={[styles.subtitle2, { fontSize: 8 }]}>TOTAL</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.tableBody}>
                        {items.map((item, index) => (
                            <View style={styles.tableRow} key={index + 1}>
                                <View style={styles.tableCell_1}>
                                    <Text style={{ fontSize: 8 }}>{index + 1}</Text>
                                </View>

                                <View style={styles.tableCell_2}>
                                    <Text
                                        style={[styles.subtitle1, { fontSize: 8 }]}>{item.NOMBRE !== null ? item.NOMBRE : 'VALOR DEL ENVIO'}</Text>
                                    <Text style={[styles.subtitle2, { fontSize: 7 }]}>{item.PRODUCTO_ID}</Text>
                                </View>

                                <View style={styles.tableCell_3}>

                                    {empresa === "LD" ? (
                                        user.ROLE === '0' || user.ROLE === '2' ? (
                                            <Text style={{ fontSize: 8 }}>{namePriceType(item.TM_TIPO_PRECIO)}</Text>
                                        ) : (
                                            <Text style={{ fontSize: 8 }}>{namePriceType(item.TIPOPRECIO)}</Text>
                                        )

                                    ) : (

                                        user.ROLE === '1' ? (
                                            <Text style={{ fontSize: 8 }}>{namePriceType(item.TM_TIPO_PRECIO)}</Text>
                                        ) : null
                                    )

                                    }

                                </View>
                            
                                <View style={styles.tableCell_3}>
                                    <Text style={{ fontSize: 8 }}>{item.CANTIDAD}</Text>
                                </View>

                                {empresa === "LD" ? (

                                    user.ROLE === '0' || user.ROLE === '2' ? (
                                        <>
                                            <View style={styles.tableCell_3}>
                                                <Text style={{ fontSize: 8 }}>{fCurrency(item.TM_PRECIO_UNITARIO_VENTA)}</Text>
                                            </View>
                                            <View style={styles.tableCell_3}>
                                                <Text style={{ fontSize: 8 }}>{fCurrency(item.TM_PRECIO_UNITARIO_VENTA * item.CANTIDAD)}</Text>
                                            </View>
                                        </>

                                    ) : (
                                        <>
                                        
                                            <View style={styles.tableCell_3}>
                                                <Text style={{ fontSize: 8 }}>{fCurrency(item.PRECIOUNITARIOVENTA * item.CANTIDAD)}</Text>
                                            </View>
                                        </>

                                    )

                                ) : (
                                    user.ROLE === '1' ? (
                                        <>
                                            <View style={styles.tableCell_3}>
                                                <Text style={{ fontSize: 8 }}>{fCurrency(item.TM_PRECIO_UNITARIO_VENTA)}</Text>
                                            </View>
                                            <View style={styles.tableCell_3}>
                                                <Text style={{ fontSize: 8 }}>{fCurrency(item.TM_PRECIO_UNITARIO_VENTA * item.CANTIDAD)}</Text>
                                            </View>
                                        </>
                                    ) : null

                                )
                                }

                            </View>
                        ))}


                        <View style={[styles.tableRow, styles.noBorder]}>
                            <View style={styles.tableCell_1} />
                            <View style={styles.tableCell_2} />
                            <View style={styles.tableCell_3} />

                        </View>

                        <View style={[styles.tableRow, styles.noBorder]}>

                            <View style={styles.tableCell_1} />
                            <View style={styles.tableCell_2} />
                            <View style={styles.tableCell_3} />
                            <View style={{ width: '20%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 9 }}>SUBTOTAL:</Text>

                            </View>
                            <View style={[styles.tableCell_3, styles.alignRight]}>
                                <Text style={{ fontSize: 9 }}>{fCurrency(subtotalTotal)}</Text>
                            </View>

                        </View>

                        <View style={[styles.tableRow, styles.noBorder]}>

                            <View style={styles.tableCell_1} />
                            <View style={styles.tableCell_2} />
                            <View style={styles.tableCell_3} />
                            <View style={{ width: '20%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 9 }}>IVA:</Text>
                            </View>
                            <View style={[styles.tableCell_3, styles.alignRight]}>
                                <Text style={{ fontSize: 9 }}>{fCurrency(ivaTotal)}</Text>
                            </View>

                        </View>

                        <View style={[styles.tableRow, styles.noBorder]}>

                            <View style={styles.tableCell_1} />
                            <View style={styles.tableCell_2} />
                            <View style={styles.tableCell_3} />
                            <View style={{ width: '20%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 9 }}>TOTAL:</Text>
                            </View>
                            <View style={[styles.tableCell_3, styles.alignRight]}>
                                <Text style={{ fontSize: 9 }}>{fCurrency(totalConIva)}</Text>
                            </View>

                        </View>

                    </View>


                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 9 }}>Observaciones: {OBSERVACIONES}</Text>
                </View>

                <View style={{ marginBottom: 10, marginTop: 5 }}>
                    <Text style={[styles.overline, { fontSize: 7, textAlign: 'justify', lineHeight: 1.3 }]}>El presente documento no sustituye la factura original emitida y registrada ante el Servicio de Rentas Internas (SRI), la cual constituye el comprobante oficial de venta. No obstante, este documento se considera un instrumento complementario y habilitante para efectos de reclamaciones, trámites o gestiones ante aseguradoras, entidades financieras o terceros relacionados con la obligación aquí detallada.
                        Su emisión y entrega implican constancia expresa de recepción por parte del cliente, constituyéndose en un adendum de la factura original, con plena validez jurídica y probatoria respecto al cumplimiento, reclamo o reconocimiento posterior de la deuda o transacción descrita.
                    </Text>
                </View>

                <View style={[styles.gridContainer, { marginTop: 5, marginBottom: 5 }]} fixed>
                    <View style={styles.col6}>
                        <Text style={{ fontSize: 8, marginBottom: 2 }}>____________________</Text>
                        <Text style={{ fontSize: 8 }}>Firma de Recepción</Text>
                    </View>

                    <View style={styles.col6}>
                        <Text style={{ fontSize: 8, marginBottom: 2 }}>____________________</Text>
                        <Text style={{ fontSize: 8 }}>N° de cédula</Text>
                    </View>
                </View>

                {/* Pie de página con numeración */}
                <View style={styles.footer} fixed>
                    <Text
                        style={[styles.body2, { textAlign: 'center', color: '#666' }]}
                        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                        fixed
                    />
                </View>
            </Page>
        </Document>
    );

    function namePriceType(pri) {
        const strings = {
            1: "NE",
            2: "30 U.",
            3: "15 U.",
            4: "Reatil",
            5: "Mayorista",
            6: "PVP",
            7: "TC",
            8: "Militares",
            9: "09",
            10: "10",
        };

        const payActual = strings[pri];
        return payActual || "-";

    }
}


function getTextFromCodigo(rowCodigo) {
    switch (rowCodigo) {
        case '019':
            return "CENTRO_DE_DISTRIBUCION_HT";
        case '002':
            return "MAYORISTAS_CUENCA";
        case '006':
            return "MAYORISTAS_QUITO";
        case '015':
            return "INACTIVA";
        case '024':
            return "MAYORISTAS_MANTA";
        case '030':
            return "MAYORISTAS_GUAYAQUIL";
        case '009':
            return "SAMSUNG_BAHIA";
        case '014':
            return "BODEGA_COMBO";
        case '001':
            return "SAMSUNG_CARACOL_QUITO";
        case '011':
            return "SAMSUNG_CUENCA";
        case '016':
            return "SAMSUNG_MALL_GUAYAQUIL";
        case '017':
            return "SAMSUNG_MALL_CUENCA";
        case '020':
            return "SAMSUNG_MANTA";
        case '022':
            return "SAMSUNG_PORTOVIEJO";
        case '003':
            return "PADRE_AGUIRRE";
        default:
            return "...";
    }
}

function getTextFromCodigoMovilCelistic(rowCodigo) {
    switch (rowCodigo) {
        case 'DISTLF':
            return "CENTRO DISTRIBUCION MOVILCELISTIC";
        case '003':
            return "MAYORISTAS MOVILCELISTIC MACHALA";
        case '004':
            return "MAYORISTAS MOVILCELISTIC CUENCA";
        case 'T1CARACO':
            return "CARACOL XIAOMI TERMINALES";
        case 'T1CUENCA':
            return "CUENCA XIAOMI TERMINALES";
        case 'T1MACHAL':
            return "MACHALA XIAOMI TERMINALES";
        case 'T3CARACO':
            return "CARACOL XIAOMI ACCESORIOS";
        case 'T3CUENCA':
            return "CUENCA XIAOMI ACCESORIOS";
        case 'T3MACHAL':
            return "MACHALA XIAOMI ACCESORIOS";
        case 'T2CARACO':
            return "CARACOL XIAOMI ELECTRODOMESTICOS";
        case 'T2CUENCA':
            return "CARACOL XIAOMI ELECTRODOMESTICOS";
        case 'T2MACHAL':
            return "MACHALA XIAOMI ELECTRODOMESTICOS";

        case '030':
            return "MAYORISTAS MOVILCELISTIC COLON";
        case '024':
            return "MAYORISTAS MOVILCELISTIC MANTA";

        case '020':
            return "MALL GUAYAQUIL";
        case '021':
            return "MALL CUENCA";

        case '005':
            return "⚠️OPERADORAS CARRIER";

        default:
            return "...";
    }
}

