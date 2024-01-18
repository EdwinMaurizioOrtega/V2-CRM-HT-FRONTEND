/* eslint-disable jsx-a11y/alt-text */
import PropTypes from 'prop-types';
import {Page, View, Text, Image, Document} from '@react-pdf/renderer';

//
import styles from './InvoiceStyle';
import {Divider, Link} from "@mui/material";

import React from 'react';
import {fontWeight} from "@mui/system";
import {fCurrency} from "../../../../utils/formatNumber";

// Resto de tu código


// ----------------------------------------------------------------------

PedidoInvoicePDF.propTypes = {
    //invoice: PropTypes.object,
};


export default function PedidoInvoicePDF({invoice}) {
    // console.log("invoice: "+ JSON.stringify(invoice));
    // console.log("invoice: "+ JSON.stringify(invoice[0]));
    // console.log("invoice: "+ invoice.PEDIDO_PROV);

    console.log("invoice: " + invoice);
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


    const ivaPorcentaje = 0.12; // Porcentaje de IVA (12% en Ecuador)
    let subtotalTotal = 0;

    items.forEach((row) => {
        const subtotal = row.PRECIOUNITARIOVENTA * row.CANTIDAD;
        subtotalTotal += subtotal;
    });

    const ivaTotal = subtotalTotal * ivaPorcentaje;
    const totalConIva = subtotalTotal + ivaTotal;

    console.log('Subtotal: ', subtotalTotal);
    console.log('IVA: ', ivaTotal);
    console.log('Total incluido IVA: ', totalConIva);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={[styles.gridContainer, styles.mb40]}>
                    <Image source="/logo/ht_bit.png" style={{height: 32}}/>
                    <View style={{alignItems: 'flex-end', flexDirection: 'column'}}>
                        <Text style={styles.h3}>{status}</Text>
                        <Text> {`PEDIDO: ${ID}`} </Text>
                        {/* <Text> {`SAP: ${DOCNUM}`} </Text> */}
                    </View>
                </View>
                <View style={[styles.gridContainer, styles.mb8, {justifyContent: 'center', alignItems: 'center'}]}>
                    <Text style={styles.h4}>{Cliente}</Text>
                </View>
                <View style={[styles.gridContainer, styles.mb40]}>
                    <View style={styles.col6}>
                        {/*<Text style={[styles.overline, styles.mb8]}>Invoice from</Text>*/}
                        {/*<Text style={styles.body1}>{PROCEDENCIA}</Text>*/}
                        <Text style={styles.body1}>
                            <Text style={{fontWeight: 'bold'}}>TIPO: </Text>
                            {Tipo}</Text>
                        <Text style={styles.body1}>

                            <Text style={{fontWeight: 'bold'}}>CI/RUC: </Text>
                            {CLIENTEID}</Text>
                        <Text style={styles.body1}>
                            <Text style={{fontWeight: 'bold'}}>CIUDAD: </Text>
                            {Ciudad}</Text>
                        <Text style={styles.body1}>
                            <Text style={{fontWeight: 'bold'}}>TLF: </Text>
                            {Celular}</Text>
                        {/*<Text style={styles.body1}>CANTIDAD: {CANTIDAD}</Text>*/}
                        {/*<Text style={styles.body1}>TOTAL: {TOTAL}</Text>*/}
                    </View>

                    <View style={styles.col6}>
                        {/*<Text style={[styles.overline, styles.mb8]}>Invoice to</Text>*/}

                        {/*<Text style={styles.body1}>DESCRIPCION: {DESCRIPCION}</Text>*/}
                        {/*<Text style={styles.body1}>USUARIO: {USUARIO}</Text>*/}
                        <Text style={styles.body1}>
                            <Text style={{fontWeight: 'bold'}}>VENDEDOR: </Text>
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
                                <Text style={styles.subtitle2}>CPRECIO</Text>
                            </View>
                            <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>%DESC.</Text>
                            </View>

                            <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>CANTIDAD</Text>
                            </View>

                            {/*<View style={[styles.tableCell_3, styles.alignRight]}>*/}
                            {/*  <Text style={styles.subtitle2}>Total</Text>*/}
                            {/*</View>*/}
                            <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>PUNIT.</Text>
                            </View>
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
                                    <Text>{namePriceType(item.TIPOPRECIO)}</Text>
                                </View>
                                <View style={styles.tableCell_3}>
                                    <Text>{item.COMENTARIOPRECIO}</Text>
                                </View>

                                <View style={styles.tableCell_3}>
                                    <Text>{item.DISCOUNTPERCENTSAP}</Text>
                                </View>
                                <View style={styles.tableCell_3}>
                                    <Text>{item.CANTIDAD}</Text>
                                </View>

                                {/*<View style={[styles.tableCell_3, styles.alignRight]}>*/}
                                {/*  <Text>{fCurrency(item.price * item.quantity)}</Text>*/}
                                {/*</View>*/}
                                <View style={styles.tableCell_3}>
                                    <Text>{fCurrency(item.PRECIOUNITARIOVENTA)}</Text>
                                </View>
                                <View style={styles.tableCell_3}>
                                    <Text>{fCurrency(item.PRECIOUNITARIOVENTA * item.CANTIDAD)}</Text>
                                </View>
                            </View>
                        ))}


                        <View style={[styles.tableRow, styles.noBorder]}>
                            <View style={styles.tableCell_1}/>
                            <View style={styles.tableCell_2}/>
                            <View style={styles.tableCell_3}/>

                        </View>

                        <View style={[styles.tableRow, styles.noBorder]}>

                            <View style={styles.tableCell_1}/>
                            <View style={styles.tableCell_2}/>
                            <View style={styles.tableCell_3}/>
                            <View style={{width: '20%'}}>
                                <Text style={{fontWeight: 'bold'}}>SUBTOTAL:</Text>

                            </View>
                            <View style={[styles.tableCell_3, styles.alignRight]}>
                                <Text>{fCurrency(subtotalTotal)}</Text>
                            </View>

                        </View>

                        <View style={[styles.tableRow, styles.noBorder]}>

                            <View style={styles.tableCell_1}/>
                            <View style={styles.tableCell_2}/>
                            <View style={styles.tableCell_3}/>
                            <View style={{width: '20%'}}>
                                <Text style={{fontWeight: 'bold'}}>IVA:</Text>
                            </View>
                            <View style={[styles.tableCell_3, styles.alignRight]}>
                                <Text>{fCurrency(ivaTotal)}</Text>
                            </View>

                        </View>

                        <View style={[styles.tableRow, styles.noBorder]}>

                            <View style={styles.tableCell_1}/>
                            <View style={styles.tableCell_2}/>
                            <View style={styles.tableCell_3}/>
                            <View style={{width: '20%'}}>
                                <Text style={{fontWeight: 'bold'}}>TOTAL:</Text>
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

                {/* <View style={[styles.gridContainer, styles.mb8]}> */}
                {/*     <Text style={[styles.overline, styles.mb8]}>FAVOR DE REVISAR QUE EL PEDIDO SEA ENTREGADO CONFORME A LAS */}
                {/*         ESPECIFICACIONES ABAJO MENCIONADAS, ASI COMO LLENAR LA INFORMACION SOLICITADA.</Text> */}
                {/* </View> */}

                {/* <View style={[styles.gridContainer, styles.mb40]}> */}
                {/*     <View style={styles.col6}> */}
                {/*         /!*<Text style={[styles.overline, styles.mb8]}>Invoice from</Text>*!/ */}
                {/*         /!*<Text style={styles.body1}>{PROCEDENCIA}</Text>*!/ */}
                {/*         <Text style={styles.body1}>NÚMERO DE CAJAS RECIBIDAS: ___________________________</Text> */}
                {/*         <Text style={styles.body1}>FECHA DE RECIBIDO: ______________________________________</Text> */}
                {/*         <Text style={styles.body1}>NOMBRE DE QUIEN RECIBE: _______________________________</Text> */}
                {/*         <Text style={styles.body1}>FIRMA: ___________________________________________________</Text> */}
                {/*         <Text style={styles.body1}>OBSERVACIONES: _________________________________________</Text> */}
                {/*         /!*<Text style={styles.body1}>TOTAL: {TOTAL}</Text>*!/ */}
                {/*     </View> */}

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
        return payActual || "Tipo no definido.";

    }
}
