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

    console.log("usergggggg: " + JSON.stringify(user));
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
                <View style={[styles.gridContainer, styles.mb40]}>
                    <Image source="/logo/logo_group_ht.jpeg" style={{ height: 62 }} />
                    <View style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
                        <Text style={styles.h3}>{status}</Text>
                        <Text> {user.EMPRESA == '0992537442001' ? 'Lidenar S.A. RUC: 0992537442001' : 'MovilCelistic S.A. RUC: 1792161037001'} </Text>
                        <Text> {`Pedido de Venta: ${ID}`} </Text>
                        {/* <Text> {`SAP: ${DOCNUM}`} </Text> */}
                    </View>
                </View>
                <View style={[styles.gridContainer, styles.mb8, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={styles.h4}>Razón Social: {Cliente}</Text>
                </View>
                <View style={[styles.gridContainer, styles.mb40]}>
                    <View style={styles.col6}>
                        {/*<Text style={[styles.overline, styles.mb8]}>Invoice from</Text>*/}
                        {/*<Text style={styles.body1}>{PROCEDENCIA}</Text>*/}
                        <Text style={styles.body1}>
                            <Text style={{ fontWeight: 'bold' }}>TIPO: </Text>
                            {Tipo}</Text>
                        <Text style={styles.body1}>

                            <Text style={{ fontWeight: 'bold' }}>CI/RUC: </Text>
                            {CLIENTEID}</Text>
                        <Text style={styles.body1}>
                            <Text style={{ fontWeight: 'bold' }}>CIUDAD: </Text>
                            {Ciudad}</Text>
                        <Text style={styles.body1}>
                            <Text style={{ fontWeight: 'bold' }}>TLF: </Text>
                            {Celular}</Text>
                        {/* <Text style={styles.body1}>
                            <Text style={{ fontWeight: 'bold' }}>ESTABLECIMIENTO: </Text>
                            {BODEGA}
                        </Text> */}

                        <Text style={styles.body1}>
                            <Text style={{ fontWeight: 'bold' }}>ESTABLECIMIENTO: </Text>
                            {/* RUC Lidenar */}
                            {user.EMPRESA === '0992537442001' ?
                                getTextFromCodigo(BODEGA) + ' ' + BODEGA
                                : 
                                getTextFromCodigoMovilCelistic(BODEGA) + ' ' + BODEGA
                            }
                        </Text>

                        <Text style={styles.body1}>
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


                        {/*<Text style={styles.body1}>TOTAL: {TOTAL}</Text>*/}
                    </View>

                    <View style={styles.col6}>
                        {/*<Text style={[styles.overline, styles.mb8]}>Invoice to</Text>*/}

                        {/*<Text style={styles.body1}>DESCRIPCION: {DESCRIPCION}</Text>*/}
                        {/*<Text style={styles.body1}>USUARIO: {USUARIO}</Text>*/}
                        <Text style={styles.body1}>
                            <Text style={{ fontWeight: 'bold' }}>VENDEDOR: </Text>
                            {VENDEDOR}</Text>
                        {/*<Text style={styles.body1}>DIMENSIONES: {DATO4}</Text>*/}
                    </View>
                </View>

                {/*<View style={[styles.gridContainer, styles.mb40]}>*/}
                {/*  <View style={styles.col6}>*/}
                {/*    <Text style={[styles.overline, styles.mb8]}>Date create</Text>*/}
                {/*    <Text style={styles.body1}>{fDate(FEC_INGRESO)}</Text>*/}
                {/*  </View>*/}
                {/*  <View style={styles.col6}>*/}
                {/*    <Text style={[styles.overline, styles.mb8]}>Due date</Text>*/}
                {/*    <Text style={styles.body1}>{fDate(FEC_INGRESO)}</Text>*/}
                {/*  </View>*/}
                {/*</View>*/}

                <Text style={[styles.overline, styles.mb8]}>DETALLES</Text>

                <View style={[styles.table, styles.mb40]}>
                    <View style={styles.tableHeader}>
                        <View style={styles.tableRow}>
                            <View style={styles.tableCell_1}>
                                <Text style={styles.subtitle2}>#</Text>
                            </View>

                            {/*<View style={styles.tableCell_3}>*/}
                            {/*  <Text style={styles.subtitle2}>PEDIDO_PROV</Text>*/}
                            {/*</View>*/}

                            <View style={styles.tableCell_2}>
                                <Text style={styles.subtitle2}>DESCRIPCIÓN</Text>
                            </View>

                            <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>TPRECIO</Text>
                            </View>
                            
                            <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>COMENTARIO</Text>
                            </View>
                            {/*
                            <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>%DESC.</Text>
                            </View> */}

                            <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>CANTIDAD</Text>
                            </View>

                            {/*<View style={[styles.tableCell_3, styles.alignRight]}>*/}
                            {/*  <Text style={styles.subtitle2}>Total</Text>*/}
                            {/*</View>*/}
                            {/* <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>PUNIT.</Text>
                            </View> */}
                            <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>TOTAL</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.tableBody}>
                        {items.map((item, index) => (
                            <View style={styles.tableRow} key={index + 1}>
                                <View style={styles.tableCell_1}>
                                    <Text>{index + 1}</Text>
                                </View>

                                {/*<View style={styles.tableCell_3}>*/}
                                {/*  <Text>{item.PEDIDO_PROV}</Text>*/}
                                {/*</View>*/}

                                <View style={styles.tableCell_2}>
                                    <Text
                                        style={styles.subtitle1}>{item.NOMBRE !== null ? item.NOMBRE : 'VALOR DEL ENVIO'}</Text>
                                    <Text style={styles.subtitle2}>{item.PRODUCTO_ID}</Text>
                                    {/*<Text>{item.ARTICULO}</Text>*/}
                                </View>

                                <View style={styles.tableCell_3}>

                                    {empresa === "LD" ? (
                                        user.ROLE === '0' || user.ROLE === '2' ? (
                                            <Text>{namePriceType(item.TM_TIPO_PRECIO)}</Text>
                                        ) : (
                                            <Text>{namePriceType(item.TIPOPRECIO)}</Text>
                                        )

                                    ) : (

                                        user.ROLE === '1' ? (
                                            <Text>{namePriceType(item.TM_TIPO_PRECIO)}</Text>
                                        ) : null
                                    )

                                    }

                                </View>
                                <View style={styles.tableCell_3}>
                                    <Text>{item.COMENTARIOPRECIO}</Text>
                                </View>
{/* 
                                <View style={styles.tableCell_3}>
                                    <Text>{item.DISCOUNTPERCENTSAP}</Text>
                                </View> */}
                                <View style={styles.tableCell_3}>
                                    <Text>{item.CANTIDAD}</Text>
                                </View>

                                {/*<View style={[styles.tableCell_3, styles.alignRight]}>*/}
                                {/*  <Text>{fCurrency(item.price * item.quantity)}</Text>*/}
                                {/*</View>*/}

                                {empresa === "LD" ? (

                                    user.ROLE === '0' || user.ROLE === '2' ? (
                                        <>
                                            <View style={styles.tableCell_3}>
                                                <Text>{fCurrency(item.TM_PRECIO_UNITARIO_VENTA)}</Text>
                                            </View>
                                            <View style={styles.tableCell_3}>
                                                <Text>{fCurrency(item.TM_PRECIO_UNITARIO_VENTA * item.CANTIDAD)}</Text>
                                            </View>
                                        </>

                                    ) : (
                                        <>
                                            {/* <View style={styles.tableCell_3}>
                                                <Text>{fCurrency(item.PRECIOUNITARIOVENTA)}</Text>
                                            </View> */}
                                            <View style={styles.tableCell_3}>
                                                <Text>{fCurrency(item.PRECIOUNITARIOVENTA * item.CANTIDAD)}</Text>
                                            </View>
                                        </>

                                    )

                                ) : (
                                    user.ROLE === '1' ? (
                                        <>
                                            <View style={styles.tableCell_3}>
                                                <Text>{fCurrency(item.TM_PRECIO_UNITARIO_VENTA)}</Text>
                                            </View>
                                            <View style={styles.tableCell_3}>
                                                <Text>{fCurrency(item.TM_PRECIO_UNITARIO_VENTA * item.CANTIDAD)}</Text>
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
                                <Text style={{ fontWeight: 'bold' }}>SUBTOTAL:</Text>

                            </View>
                            <View style={[styles.tableCell_3, styles.alignRight]}>
                                <Text>{fCurrency(subtotalTotal)}</Text>
                            </View>

                        </View>

                        <View style={[styles.tableRow, styles.noBorder]}>

                            <View style={styles.tableCell_1} />
                            <View style={styles.tableCell_2} />
                            <View style={styles.tableCell_3} />
                            <View style={{ width: '20%' }}>
                                <Text style={{ fontWeight: 'bold' }}>IVA:</Text>
                            </View>
                            <View style={[styles.tableCell_3, styles.alignRight]}>
                                <Text>{fCurrency(ivaTotal)}</Text>
                            </View>

                        </View>

                        <View style={[styles.tableRow, styles.noBorder]}>

                            <View style={styles.tableCell_1} />
                            <View style={styles.tableCell_2} />
                            <View style={styles.tableCell_3} />
                            <View style={{ width: '20%' }}>
                                <Text style={{ fontWeight: 'bold' }}>TOTAL:</Text>
                            </View>
                            <View style={[styles.tableCell_3, styles.alignRight]}>
                                <Text>{fCurrency(totalConIva)}</Text>
                            </View>

                        </View>

                        {/*<View style={[styles.tableRow, styles.noBorder]}>*/}
                        {/*    <View style={styles.tableCell_3}>*/}
                        {/*        <Text style={styles.h4}>NÚM. CAJAS/BULTOS</Text>*/}
                        {/*    </View>*/}
                        {/*    <View style={[styles.tableCell_3, styles.alignRight]}>*/}
                        {/*        <Text style={styles.h4}>{fCurrency(100)}</Text>*/}
                        {/*    </View>*/}
                        {/*  <View style={styles.tableCell_1} />*/}
                        {/*  <View style={styles.tableCell_2} />*/}
                        {/*  <View style={styles.tableCell_3} />*/}

                        {/*</View>*/}
                    </View>


                </View>

                <View style={[styles.gridContainer, styles.mb8]}>
                    <Text style={[styles.overline, styles.mb8, { textAlign: 'justify' }]}>El presente documento no sustituye la factura original emitida y registrada ante el Servicio de Rentas Internas (SRI), la cual constituye el comprobante oficial de venta. No obstante, este documento se considera un instrumento complementario y habilitante para efectos de reclamaciones, trámites o gestiones ante aseguradoras, entidades financieras o terceros relacionados con la obligación aquí detallada.
                        Su emisión y entrega implican constancia expresa de recepción por parte del cliente, constituyéndose en un adendum de la factura original, con plena validez jurídica y probatoria respecto al cumplimiento, reclamo o reconocimiento posterior de la deuda o transacción descrita.
                    </Text>
                </View>

                <View style={[styles.gridContainer, styles.mb40]}>
                    <View style={styles.col6}>
                        <Text style={styles.body1}>___________________________</Text>
                        <Text style={styles.body1}>Firma de Recepción.</Text>
                    </View>

                    <View style={styles.col6}>
                        <Text style={styles.body1}>___________________________</Text>
                        <Text style={styles.body1}>N de cedula.</Text>
                    </View>
                </View>

                {/*     <View style={styles.col6}> */}
                {/*         /!*<Text style={[styles.overline, styles.mb8]}>Invoice to</Text>*!/ */}

                {/*         /!*<Text style={styles.body1}>DESCRIPCION: {DESCRIPCION}</Text>*!/ */}
                {/*         /!*<Text style={styles.body1}>USUARIO: {USUARIO}</Text>*!/ */}
                {/*         <Text style={styles.body1}>CANTIDAD DE TERMINALES: _______________________________</Text> */}
                {/*         <Text style={styles.body1}>HORA DE RECIBIDO: _______________________________________</Text> */}
                {/*         <Text style={styles.body1}>CARGO: ___________________________________________________</Text> */}
                {/*     </View> */}
                {/* </View> */}

                {/* <View style={[styles.gridContainer, styles.footer]}> */}

                {/*     <View style={styles.col8}> */}
                {/*         <Text style={styles.subtitle2}>NOTAS: </Text> */}
                {/*         /!*<Text>*!/ */}
                {/*         /!*  We appreciate your business. Should you need us to add VAT or extra notes let us know!*!/ */}
                {/*         /!*</Text>*!/ */}
                {/*     </View> */}
                {/*     <View style={[styles.col4, styles.alignRight]}> */}
                {/*         <Text style={styles.subtitle2}>USUARIO: </Text> */}
                {/*         /!*<Text style={styles.body1}>USUARIO: {USUARIO}</Text>*!/ */}
                {/*         /!*<Text>{USUARIO}</Text>*!/ */}
                {/*     </View> */}
                {/* </View> */}

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

