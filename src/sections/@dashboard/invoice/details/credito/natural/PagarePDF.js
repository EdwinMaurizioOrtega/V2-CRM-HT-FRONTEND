import React from 'react';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet, Image
} from '@react-pdf/renderer';
import {fCurrency} from "../../../../../../utils/formatNumber";

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
            {/*Versión 2*/}
            <Page size="A4" style={styles.page}>

                <View style={styles.section}>
                    <Text style={styles.header}>PAGARÉ A LA ORDEN DE LIDENAR S.A.</Text>

                    <Text style={{ marginBottom: 10 }}>VENCIMIENTO: {dia} {mes} {anio + 1}</Text>
                    <Text style={{ marginBottom: 10 }}>POR: USD. {fCurrency(valor)}</Text>

                    <Text style={styles.text}>
                        Debo y pagaré incondicionalmente, en nombre y representación de la compañía que legalmente represento,
                        a la orden de <Text style={{ fontFamily: 'Times-Bold' }}>LIDENAR S.A.</Text>, en sus oficinas ubicadas en las calles Padre Aguirre 9-68 y Gran Colombia, en la ciudad de Cuenca, provincia del Azuay, la cantidad de USD. {fCurrency(valor)} ({texto}), en la moneda de curso legal que se encuentre vigente en el Ecuador a la fecha de vencimiento señalada en el encabezado del presente documento, o al mero requerimiento verbal del acreedor.
                    </Text>

                    <Text style={styles.text}>
                        La compañía deudora se obliga a pagar los intereses que se calcularán sobre el saldo de capital pendiente, conforme a la tasa de interés ordinaria máxima legal vigente, y en caso de mora, con la tasa moratoria establecida por la Junta de Política y Regulación Monetaria y Financiera.
                    </Text>

                    <Text style={styles.text}>
                        Se obliga también a cubrir todos los impuestos, tasas, gastos judiciales y extrajudiciales, incluidos los honorarios profesionales de los abogados de <Text style={{ fontFamily: 'Times-Bold' }}>LIDENAR S.A.</Text>, que ocasione la ejecución de este pagaré, bastando para su reconocimiento la simple aseveración del acreedor en la correspondiente demanda.
                    </Text>

                    <Text style={styles.text}>
                        El pago no podrá realizarse por partes, y será exigible en su totalidad en caso de incumplimiento, autorizando a <Text style={{ fontFamily: 'Times-Bold' }}>LIDENAR S.A.</Text> a declarar vencida anticipadamente la totalidad de la obligación y a iniciar su recaudación por vía judicial, sin necesidad de requerimiento previo ni notificación adicional, bastando su afirmación de mora en el escrito inicial.
                    </Text>

                    <Text style={styles.text}>
                        Autorizo a <Text style={{ fontFamily: 'Times-Bold' }}>LIDENAR S.A.</Text> a aplicar como pago parcial o total cualquier depósito, valor o documento de propiedad de la compañía deudora que se encuentre en su poder, independientemente de su naturaleza o finalidad.
                    </Text>

                    <Text style={styles.text}>
                        En caso de controversia, las partes se someten expresamente a los jueces de lo Civil del cantón Cuenca, renunciando a cualquier otro fuero o domicilio.
                    </Text>

                    <Text style={styles.text}>
                        Este pagaré se emite sin protesto, con expresa dispensa de presentación para el pago y de aviso por falta de pago.
                    </Text>

                    <Text style={styles.text}>
                        Declaro que, en mi calidad de representante legal de la compañía deudora, cuento con las facultades suficientes para suscribir este pagaré y obligar válidamente a la sociedad. Eximo expresamente a <Text style={{ fontFamily: 'Times-Bold' }}>LIDENAR S.A.</Text> de cualquier responsabilidad por eventuales limitaciones internas o estatutarias que afecten dicha representación.
                    </Text>

                    <Text style={styles.text}>
                        En caso de iniciarse un proceso judicial relacionado con el incumplimiento de pago, la citación podrá efectuarse válidamente mediante boleta enviada al correo electrónico señalado por la compañía deudora, conforme a lo previsto en el artículo 55.1 del Código Orgánico General de Procesos. En consecuencia, el representante legal declara conocer y aceptar expresamente que dicho correo electrónico constituirá el domicilio procesal de la sociedad para efectos de citación y notificación, reconociendo plena validez jurídica a la citación practicada por esa vía.
                    </Text>

                    <Text style={styles.text}>
                        Para tales efectos, señalo como correo electrónico para citación judicial: {data?.data?.empresa?.EMAIL || "____________________________________________"}
                    </Text>

                    <Text style={styles.text}>
                        El presente pagaré será suscrito electrónicamente, mediante el uso de firma electrónica conforme a lo dispuesto en la Ley de Comercio Electrónico, Firmas y Mensajes de Datos, y tendrá la misma validez jurídica y probatoria que si constare en documento físico firmado de puño y letra, en los términos del artículo 12 de dicha Ley y del artículo 35 del Código de Comercio.
                    </Text>

                    <Text style={{ marginTop: 10, fontSize: 10 }}>
                        FECHA: Cuenca, a {dia} de {mes} de {anio}
                    </Text>
                </View>

                <View style={styles.signatureBlock}>
                    <Text style={styles.text}>f. ______________________________</Text>
                    {/* <Text style={styles.text}>Razón Social de la Deudora: {data?.data?.empresa?.NOMBRE || "___________________________"}</Text> */}
                    {/* <Text style={styles.text}>RUC No.: {data?.data?.empresa?.RUC || "___________________________"}</Text> */}
                    <Text style={styles.text}>Representante Legal: {data?.data?.empresa?.NOMBRE_REPRESENTANTE || "___________________________"}</Text>
                    <Text style={styles.text}>C.C.: {data?.data?.empresa?.CEDULA_REPRESENTANTE || "___________________________"}</Text>
                </View>

            </Page>

            {/*Versión 1*/}
            {/* <Page size="A4" style={styles.page}> */}

            {/*     <View style={styles.section}> */}
            {/*         <Text style={styles.header}>PAGARÉ A LA ORDEN DE LIDENAR S.A</Text> */}

            {/*         <Text>Pagaré No.</Text> */}
            {/*         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}> */}
            {/*             <Text>VENCIMIENTO {dia} {mes} {anio + 1}</Text> */}
            {/*             <Text>Por US {fCurrency(valor)}</Text> */}
            {/*         </View> */}

            {/*         <Text style={styles.text}> */}
            {/*             Debo(emos) y pagaré(mos) en la moneda de curso legal solidaria e incondicionalmente, a la orden de la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text>, en su oficina ubicada en la calle Padre Aguirre 9-68 y Gran Colombia, en esta ciudad de Cuenca, */}
            {/*             la cantidad de {texto} o en la moneda de curso legal que se encuentre vigente en el Ecuador, con el interés legal nominal anual, al vencimiento del plazo acordado, al mero requerimiento verbal del acreedor. */}
            {/*         </Text> */}

            {/*         <Text style={styles.text}> */}
            {/*             En la fecha de vencimiento de los antedichos valores, me obligo, además, incondicionalmente a pagar a la compañía */}
            {/*             <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text>, */}
            {/*             los intereses, que se calcularán sobre el saldo del capital pendiente de pago, a la tasa de interés inicial pactada y sus reajustes. */}
            {/*         </Text> */}

            {/*         <Text style={styles.text}> */}
            {/*             En el caso de mora en el pago del valor establecido en el pagaré, convengo expresamente con el acreedor la aceleración o participación de las cuotas no vencidas, pudiendo la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text> declarar de plazo vencido la totalidad de la obligación y proceder a su recaudación por vía judicial, bastando para ello la simple afirmación que la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text> hiciere respecto de la mora en el escrito de demanda, sin perjuicio de la obligación que como deudor tengo que pagar el máximo interés moratorio vigente a la fecha que produzca el vencimiento de la respectiva obligación de acuerdo a lo que establezcan las disposiciones del Directorio del Banco Central del Ecuador, calculándose sobre los valores de capital o fracciones del mismo que estuvieren vencidos y no pagados, desde la fecha en que se hicieron exigibles. */}
            {/*         </Text> */}

            {/*         <Text style={styles.text}> */}
            {/*             Me obligo además a cubrir todos los impuestos, tasas, gastos judiciales y extrajudiciales, inclusive honorarios profesionales de los abogados de la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text>, que ocasione la suscripción de este pagaré a su cobro, siendo suficiente prueba para establecer tales gastos la mera aseveración del acreedor. */}
            {/*         </Text> */}

            {/*         <Text style={styles.text}> */}
            {/*             Todos los suscriptores de este pagaré se obligan solidariamente. Estipulo que el pago de estas obligaciones no podrá hacerse por partes, ni aun por mis herederos o sucesores. */}
            {/*         </Text> */}

            {/*         <Text style={styles.text}> */}
            {/*             Acredito a la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text> para que al vencimiento de las obligaciones que se deriven del presente documento, acredite como pago parcial o total de las mismas, cualquier depósito que por mi cuenta exista en la compañía <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}> LIDENAR S.A</Text>, así como aquellos documentos o valores que existieren en su poder, de cualquier naturaleza que fueren. */}
            {/*         </Text> */}

            {/*         <Text style={styles.text}> */}
            {/*             Siempre que los suscriptores de este pagaré, en sus calidades de deudores o garantes sean más de uno, los términos del presente documento se entenderán en plural. Igualmente, si el deudor es una persona jurídica, las declaraciones se entienden hechas por el representante legal a nombre de ella. */}
            {/*         </Text> */}

            {/*         <Text style={styles.text}> */}
            {/*             En caso de controversia las partes acuerdan someterse a los jueces de lo Civil en la ciudad Cuenca, para lo cual renuncian fuero y domicilio, en la vía ejecutiva o la que la Ley exija. Sin protesto exímase de presentación para el pago y de avisos por falta de pago. */}
            {/*         </Text> */}

            {/*         <Text style={styles.text}> */}
            {/*             Para notificaciones y citaciones judiciales telemáticas derivadas de este título, el (los) deudores(s) acepto(mos) expresamente que las mismas se cumplan por medios telemáticos/electrónicos, para el efecto establezco(cemos) como dirección(es) de correo electrónico el */}
            {/*             (los) siguiente(s): {data?.data?.empresa?.EMAIL} conforme con lo que dispone el Código Orgánico General de Procesos. */}
            {/*         </Text> */}

            {/*         <Text style={{ marginTop: 10, fontSize: 10 }}>Fecha: {dia} {mes} {anio}</Text> */}
            {/*     </View> */}

            {/*     <View style={styles.signatureBlock}> */}
            {/*         <Text style={styles.text}>f) ____________________________                                      f) ____________________________</Text> */}
            {/*         <Text style={styles.text}>Nombre: {data?.data?.empresa?.NOMBRE_REPRESENTANTE}                                      Nombre:</Text> */}
            {/*         <Text style={styles.text}>C.I. {data?.data?.empresa?.CEDULA_REPRESENTANTE}                                                                            C.I.</Text> */}
            {/*     </View> */}

            {/*     <View style={styles.signatureBlock}> */}
            {/*         <Text style={{ marginTop: 10 }}>Visto Bueno</Text> */}
            {/*         <Text style={styles.text}>Cuenca a ...... de ...... de 20......</Text> */}
            {/*         <Text style={{ marginTop: 20, fontSize: 10 }}>f) ____________________________                                      f) ____________________________</Text> */}
            {/*     </View> */}

            {/*     <View style={styles.section}> */}
            {/*         <Text style={styles.text}> */}
            {/*             Por aval garantizo solidariamente el cumplimiento de las obligaciones constantes del suscriptor(ores) constantes en el pagaré que antecede y en sus términos. Acepto que mi obligación como garante será válida aun cuando la obligación principal fuere nula por cualquier causa. Sin protesto exímese de la presentación para el pago, así como de avisos por falta de pago. Fecha ut supra. */}
            {/*         </Text> */}
            {/*         <Text style={styles.text}> */}
            {/*             Para notificaciones y citaciones judiciales telemáticas derivadas de este título, el (los) avalista(s) acepta(mos) expresamente que las mismas se cumplan por medios telemáticos/electrónicos, para el efecto establezco(cemos) como dirección(es) de correo electrónico el (los) siguiente(s): ……………………………………………………………………………… …………………………………………conforme con lo que dispone el Código Orgánico General de Procesos. */}
            {/*         </Text> */}
            {/*         <Text style={{ marginTop: 20 }}>f) ____________________________                                      f) ____________________________</Text> */}
            {/*     </View> */}

            {/* </Page> */}
        </Document>
    );
}
