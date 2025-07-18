import React from 'react';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet, Image
} from '@react-pdf/renderer';

// Estilos
const styles = StyleSheet.create({

    section_cero: {
        padding: 40,
        fontSize: 12,
        lineHeight: 1.5,
    },
    section: {
        paddingHorizontal: 40,
        // padding: 10,
        fontSize: 12,
        lineHeight: 1.5,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    text: {
        marginBottom: 6,
    },
    line: {
        marginBottom: 6,
        textDecoration: 'underline',
    },
    paragraph: {
        marginTop: 10,
        textAlign: 'justify',
    },
});

export default function AutorizacionPDF(data) {

    //console.log("data_autorizacion: " + JSON.stringify(data));

    //console.log("data?.empresa?.NOMBRE: "+data?.empresa?.NOMBRE);

    const fechaActual = new Date();


    const dia = fechaActual.getDate();
    const mes = fechaActual.toLocaleString("es-EC", { month: "long" }); // "abril", "mayo", etc.
    const anio = fechaActual.getFullYear();

    return (
        <Document>
            <Page size="A4" style={styles.page}>



                <View style={styles.section_cero}>

                    <View style={[styles.gridContainer, styles.mb40]}>
                        <Image source="/logo/logo_aut.png" style={{ height: 'auto' }} />
                    </View>

                </View>
                <View style={styles.section}>
                    <Text style={styles.title}>AUTORIZACIÓN PERSONAS NATURALES</Text>
                    <Text style={styles.text}>Cuenca, {dia} de {mes} del {anio}</Text>

                    <Text style={styles.text}>Yo,</Text>
                    <Text style={styles.line}>{data?.data?.data?.empresa?.NOMBRE_REPRESENTANTE}</Text>
                    <Text style={styles.text}>con número de cédula: {data?.data?.data?.empresa?.CEDULA_REPRESENTANTE}</Text>
                    {/* <Text style={styles.text}>Representante Legal de {data?.data?.data?.empresa?.NOMBRE}</Text> */}
                    {/* <Text style={styles.text}>Con número de RUC {data?.data?.data?.empresa?.RUC}</Text> */}

                    <Text style={styles.paragraph}>
                        <Text style={{ fontStyle: 'italic' }}>
                            Autorizo (amos) expresa e irrevocablemente a LIDENAR SA para que obtenga cuantas veces sean necesarias,
                            de cualquier fuente de información, incluidos los burós de crédito, mi información de riesgos crediticios,
                            de igual LIDENAR SA queda expresamente autorizado para que pueda transferir o entregar dicha información
                            a los burós de crédito y/o a la Central de Riesgos si fuere pertinente”.
                        </Text>
                    </Text>

                    <Text style={[styles.text, { marginTop: 20 }]}>Atentamente,</Text>

                    {/* <Text style={styles.line}>{data?.data?.data?.empresa?.NOMBRE_REPRESENTANTE}</Text> */}
                    <Text style={styles.text}>Nombre: {data?.data?.data?.empresa?.NOMBRE_REPRESENTANTE}</Text>
                    <Text style={styles.text}>CI.: {data?.data?.data?.empresa?.CEDULA_REPRESENTANTE}</Text>
                </View>

            </Page>
        </Document>
    );
}
