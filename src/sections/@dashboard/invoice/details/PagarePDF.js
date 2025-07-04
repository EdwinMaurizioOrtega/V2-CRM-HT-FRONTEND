import React from 'react';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet, Image
} from '@react-pdf/renderer';
import {fCurrency} from "../../../../utils/formatNumber";

// Estilos
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        lineHeight: 1.6,
        fontFamily: 'Times-Roman', // fuente base

    },
    text: {
        fontSize: 10,
        textAlign: 'justify',
        fontFamily: 'Times-Roman', // fuente base
    },
    header: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'Times-Bold', // fuente base
    },
    section: {
        marginBottom: 10,
    },
    signatureBlock: {
        marginTop: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 'auto',
    },
});

export default function PagarePDF({valor, texto, data}) {

    console.log("valor: ", valor);
    console.log("texto: ", texto);

    const fechaActual = new Date();

    const dia = fechaActual.getDate();
    const mes = fechaActual.toLocaleString("es-EC", { month: "long" }); // "abril", "mayo", etc.
    const anio = fechaActual.getFullYear();

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                <View style={styles.section}>
                    <Text style={styles.header}>PAGARÉ A LA ORDEN DE LIDENAR S.A</Text>

                    <Text>Pagaré No.</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Text>VENCIMIENTO {dia} {mes} {anio + 1}</Text>
                        <Text>Por US {fCurrency(valor)}</Text>
                    </View>

                    <Text style={styles.text}>
                        Debo(emos) y pagaré(mos) en la moneda de curso legal solidaria e incondicionalmente, a la orden de la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text>, en su oficina ubicada en la calle Padre Aguirre 9-68 y Gran Colombia, en esta ciudad de Cuenca,
                        la cantidad de {texto} o en la moneda de curso legal que se encuentre vigente en el Ecuador, con el interés legal nominal anual, al vencimiento del plazo acordado, al mero requerimiento verbal del acreedor.
                    </Text>

                    <Text style={styles.text}>
                        En la fecha de vencimiento de los antedichos valores, me obligo, además, incondicionalmente a pagar a la compañía
                        <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text>,
                        los intereses, que se calcularán sobre el saldo del capital pendiente de pago, a la tasa de interés inicial pactada y sus reajustes.
                    </Text>

                    <Text style={styles.text}>
                        En el caso de mora en el pago del valor establecido en el pagaré, convengo expresamente con el acreedor la aceleración o participación de las cuotas no vencidas, pudiendo la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text> declarar de plazo vencido la totalidad de la obligación y proceder a su recaudación por vía judicial, bastando para ello la simple afirmación que la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text> hiciere respecto de la mora en el escrito de demanda, sin perjuicio de la obligación que como deudor tengo que pagar el máximo interés moratorio vigente a la fecha que produzca el vencimiento de la respectiva obligación de acuerdo a lo que establezcan las disposiciones del Directorio del Banco Central del Ecuador, calculándose sobre los valores de capital o fracciones del mismo que estuvieren vencidos y no pagados, desde la fecha en que se hicieron exigibles.
                    </Text>

                    <Text style={styles.text}>
                        Me obligo además a cubrir todos los impuestos, tasas, gastos judiciales y extrajudiciales, inclusive honorarios profesionales de los abogados de la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text>, que ocasione la suscripción de este pagaré a su cobro, siendo suficiente prueba para establecer tales gastos la mera aseveración del acreedor.
                    </Text>

                    <Text style={styles.text}>
                        Todos los suscriptores de este pagaré se obligan solidariamente. Estipulo que el pago de estas obligaciones no podrá hacerse por partes, ni aun por mis herederos o sucesores.
                    </Text>

                    <Text style={styles.text}>
                        Acredito a la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text> para que al vencimiento de las obligaciones que se deriven del presente documento, acredite como pago parcial o total de las mismas, cualquier depósito que por mi cuenta exista en la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text>, así como aquellos documentos o valores que existieren en su poder, de cualquier naturaleza que fueren.
                    </Text>

                    <Text style={styles.text}>
                        Siempre que los suscriptores de este pagaré, en sus calidades de deudores o garantes sean más de uno, los términos del presente documento se entenderán en plural. Igualmente, si el deudor es una persona jurídica, las declaraciones se entienden hechas por el representante legal a nombre de ella.
                    </Text>

                    <Text style={styles.text}>
                        En caso de controversia las partes acuerdan someterse a los jueces de lo Civil en la ciudad Cuenca, para lo cual renuncian fuero y domicilio, en la vía ejecutiva o la que la Ley exija. Sin protesto exímase de presentación para el pago y de avisos por falta de pago.
                    </Text>

                    <Text style={styles.text}>
                        Para notificaciones y citaciones judiciales telemáticas derivadas de este título, el (los) deudores(s) acepto(mos) expresamente que las mismas se cumplan por medios telemáticos/electrónicos, para el efecto establezco(cemos) como dirección(es) de correo electrónico el
                        (los) siguiente(s): {data?.data?.empresa?.EMAIL} conforme con lo que dispone el Código Orgánico General de Procesos.
                    </Text>

                    <Text style={{ marginTop: 10, fontSize: 10 }}>Fecha: {dia} {mes} {anio}</Text>
                </View>

                <View style={styles.signatureBlock}>
                    <Text style={styles.text}>f) ____________________________                                      f) ____________________________</Text>
                    <Text style={styles.text}>Nombre: {data?.data?.empresa?.NOMBRE_REPRESENTANTE}                                      Nombre:</Text>
                    <Text style={styles.text}>C.I. {data?.data?.empresa?.CEDULA_REPRESENTANTE}                                                                            C.I.</Text>
                </View>

                <View style={styles.signatureBlock}>
                    <Text style={{ marginTop: 10 }}>Visto Bueno</Text>
                    <Text style={styles.text}>Cuenca a ...... de ...... de 20......</Text>
                    <Text style={{ marginTop: 20, fontSize: 10 }}>f) ____________________________                                      f) ____________________________</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.text}>
                        Por aval garantizo solidariamente el cumplimiento de las obligaciones constantes del suscriptor(ores) constantes en el pagaré que antecede y en sus términos. Acepto que mi obligación como garante será válida aun cuando la obligación principal fuere nula por cualquier causa. Sin protesto exímese de la presentación para el pago, así como de avisos por falta de pago. Fecha ut supra.
                    </Text>
                    <Text style={styles.text}>
                        Para notificaciones y citaciones judiciales telemáticas derivadas de este título, el (los) avalista(s) acepta(mos) expresamente que las mismas se cumplan por medios telemáticos/electrónicos, para el efecto establezco(cemos) como dirección(es) de correo electrónico el (los) siguiente(s): ……………………………………………………………………………… …………………………………………conforme con lo que dispone el Código Orgánico General de Procesos.
                    </Text>
                    <Text style={{ marginTop: 20 }}>f) ____________________________                                      f) ____________________________</Text>
                </View>

            </Page>
        </Document>
    );
}
