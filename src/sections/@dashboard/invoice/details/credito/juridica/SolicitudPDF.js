import React from 'react';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet, Image
} from '@react-pdf/renderer';

// Estilos
const styles = StyleSheet.create( {
    page: {
        // padding: 30,
        paddingHorizontal: 30,
        fontSize: 7,
        fontFamily: 'Helvetica',
        lineHeight: 1.5
    },
    section: {
        marginBottom: 10,
    },
    sectionFinal: {
        marginTop: 6,
        alignItems: 'center',
    },
    heading: {
        fontSize: 10,
        marginBottom: 3,
        fontWeight: 'bold'
    },
    text: {
        marginBottom: 4,
        fontSize: 6
    }, row: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    item: {
        marginRight: 10,
        marginBottom: 6
    },





    //CheckBoxes
    section_ch: {
        marginBottom: 12,
    },
    heading_ch: {
        fontSize: 10,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    gridContainer_ch: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem_ch: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    check_ch: {
        fontSize: 7,
        color: 'green',
        marginRight: 4,
        fontFamily: 'Helvetica-Bold',
    },
    cross_ch: {
        fontSize: 7,
        color: 'red',
        marginRight: 4,
        fontFamily: 'Helvetica-Bold',
    },
    item_ch: {
        fontSize: 7,
    },



// Tabla
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        paddingVertical: 1,
    },
    tableCell: {
        fontSize: 7,
        paddingRight: 4,
    },
    col1: {
        width: '25%',
    },
    col2: {
        width: '25%',
    },
    col3: {
        width: '30%',
    },
    col4: {
        width: '20%',
    },

    //Direcciones
    listItem: {
        fontSize: 7,
        marginBottom: 4,
    },

});

export default function SolicitudPDF(data) {
    //console.log("data_data: " + JSON.stringify(data));

    //console.log("data?.empresa?.NOMBRE: "+data?.empresa?.NOMBRE);


    const documentosMap = [
        { label: "Planilla Servicio básico", key: "PLANILLA_SERVICIO_BASICO" },
        { label: "RUC / Cédula de Identidad", key: "RUC_UPLOAD" },
        { label: "Cédula de Identidad", key: "CEDULA_IDENTIDAD" },
        { label: "Nombramiento del Representante Legal", key: "NOMBRAMIENTO_REPRESENTANTE" },
        { label: "Escritura de constitución de la empresa", key: "ESCRITURA_CONSTITUCION" },
        // { label: "Estados Financieros (Año anterior)", key: "ESTADOS_FINANCIEROS" },
        // { label: "Declaración de Impuesto a la Renta (Año anterior)", key: "DECLARACION_IMPUESTOS" },
        { label: "Certificado Bancario", key: "CERTIFICADO_BANCARIO" },
        { label: "Foto del local", key: "FOTO_LOCAL" },
    ];

    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.toLocaleString("es-EC", { month: "long" }); // "abril", "mayo", etc.
    const anio = fechaActual.getFullYear();

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                <View style={[styles.gridContainer, styles.mb40, { position: 'relative'}]}>
                    <Image source="/logo/header.png" style={{ height: 'auto' }} />
                    <Text style={{
                        position: 'absolute',
                        bottom: 0,   // Separación desde abajo
                        right: 50,    // Separación desde la derecha
                        color: '#000000',
                        fontSize: 14,
                    }}>
                        {dia}-{mes}-{anio}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>SOLICITUD DE CREACIÓN Y ACTUALIZACIÓN DE DATOS</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>1. IDENTIFICACIÓN DEL CLIENTE</Text>
                    <Text>Nombre de la empresa o compañia: {data?.data?.data?.empresa?.NOMBRE}</Text>
                <Text>RUC: {data?.data?.data?.empresa?.RUC}</Text>
                <Text>Nombre del representante: {data?.data?.data?.empresa?.NOMBRE_REPRESENTANTE}</Text>
                <Text>E-mail: {data?.data?.data?.empresa?.EMAIL}</Text>
                <Text>Dirección de trabajo: {data?.data?.data?.empresa?.DIRECCION_TRABAJO}</Text>
                <Text>Dirección de domicilio: {data?.data?.data?.empresa?.DIRECCION_DOMICILIO}</Text>
                <Text>Ciudad: {data?.data?.data?.empresa?.CIUDAD}</Text>
                <Text>Provincia: {data?.data?.data?.empresa?.PROVINCIA}</Text>
                </View>

                <View style={styles.section_ch}>
                    <Text style={styles.heading_ch}>DOCUMENTOS ANEXOS: (En copias)</Text>
                    <View style={styles.gridContainer_ch}>
                        {documentosMap.map((doc, index) => {
                            const tieneDocumento =
                                data?.data?.data?.documentos?.[doc.key] &&
                                data?.data?.data?.documentos[doc.key] !== "";

                            return (
                                <View style={styles.gridItem_ch} key={index}>
                                    <Text style={tieneDocumento ? styles.check_ch : styles.cross_ch}>
                                        {tieneDocumento ? "Sí" : "No"}
                                    </Text>
                                    <Text style={styles.item_ch}>{doc.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>2. REFERENCIAS COMERCIALES</Text>

                    {/* Encabezado */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col1]}>Compañía</Text>
                        <Text style={[styles.tableCell, styles.col2]}>Tipo de Crédito</Text>
                        <Text style={[styles.tableCell, styles.col3]}>Persona de Contacto</Text>
                        <Text style={[styles.tableCell, styles.col4]}>Teléfono</Text>
                    </View>
                    {/* Filas dinámicas */}
                    {data?.data?.data?.referencias_comerciales?.map((ref, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={[styles.tableCell, styles.col1]}>{ref.COMPANIA}</Text>
                            <Text style={[styles.tableCell, styles.col2]}>{ref.TIPO_CREDITO}</Text>
                            <Text style={[styles.tableCell, styles.col3]}>{ref.PERSONA_CONTACTO}</Text>
                            <Text style={[styles.tableCell, styles.col4]}>{ref.TELEFONO}</Text>
                        </View>
                    ))}

                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>4. REFERENCIAS BANCARIAS</Text>

                    {/* Encabezado */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col1]}>Entidad Financiera</Text>
                        <Text style={[styles.tableCell, styles.col2]}>Inicio de Relación</Text>
                        <Text style={[styles.tableCell, styles.col3]}>Persona de Contacto</Text>
                        <Text style={[styles.tableCell, styles.col4]}>Teléfono</Text>
                    </View>
                    {/* Filas dinámicas */}
                    {data?.data?.data?.referencias_bancarias?.map((ref, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={[styles.tableCell, styles.col1]}>{ref.ENTIDAD_FINANCIERA}</Text>
                            <Text style={[styles.tableCell, styles.col2]}>{ref.INICIO_RELACION}</Text>
                            <Text style={[styles.tableCell, styles.col3]}>{ref.PERSONA_CONTACTO}</Text>
                            <Text style={[styles.tableCell, styles.col4]}>{ref.TELEFONO}</Text>
                        </View>
                    ))}





                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>3. DIRECCIONES ENVIOS AUTORIZADOS</Text>

                    {data?.data?.data?.direcciones_adicionales
                        ?.filter(dir => dir.DIRECCION && dir.DIRECCION.trim() !== "")
                        .map((dir, index) => (
                            <Text style={styles.listItem} key={dir.ID_DIRECCION}>
                                • {dir.DIRECCION}
                            </Text>
                        ))
                    }
                </View>

                <View style={styles.section}>
                    <Text style={styles.text}>
                        Al firmar el presente formulario, el suscrito autoriza a LIDENAR S.A. para que solicite a la(s)
                        Sociedad(es) de Información Crediticia Nacional(es) o Extranjera(s), que considere necesaria(s),
                        relativa a su historial crediticio. De igual manera, LIDENAR S.A queda autorizado para realizar revisiones
                        periódicas y proporcionar información sobre el historial crediticio a dicha(s) sociedad(es) que considere
                        necesaria(s). Dicha autorización permanecerá en vigencia en tanto las partes sostengan relaciones comerciales.

                        La información proporcionada ratifica que conoce plenamente la naturaleza, alcance y sus consecuencias
                        de la información que se solicitará en forma periódica para su análisis financiero y crediticio. LIDENAR S.A
                        hace del conocimiento del suscrito la política de privacidad y manejo de datos personales, en la que en todo
                        momento buscará que el tratamiento de los mismos sea legítimo, controlado e informado, a efecto de garantizar
                        la privacidad y el derecho a la autodeterminación informativa de sus datos.

                        El suscrito declara que conoce la Ley de Burós de Información Crediticia, así como los derechos que le amparan.
                        El suscrito reconoce que LIDENAR S.A. sólo obtiene los datos personales de sus clientes ya sea directamente y de
                        forma personal del mismo titular, o bien, a través de los medios electrónicos, ópticos, sonoros, visuales, o
                        cualquier otra tecnología con la finalidad de acreditar la identificación del solicitante, con el único propósito
                        de que LIDENAR S.A. se encuentre en posibilidades de celebrar el contrato de crédito que, en su caso y por acuerdo
                        mutuo con el solicitante se pretenda formalizar, para mantener y custodiar el expediente en información respectiva.

                        Asimismo, LIDENAR S.A, podrá usar la información del suscrito en su carácter de solicitante para contactarle,
                        entender mejor sus necesidades, mejorar sus productos u ofertarle nuevos. El suscrito reconoce que LIDENAR S.A
                        podrá compartir los datos personales del suscrito a cualquier empresa que le preste servicios externos, en el
                        entendido de que LIDENAR S.A les proporcionará únicamente la información personal que necesiten para llevar a cabo
                        los servicios, y que LIDENAR S.A les solicita que protejan dicha información y no la utilicen para otros fines.

                        En caso de que el suscrito desee ejercer sus derechos de acceso, rectificación, cancelación u oposición, deberá
                        contactar a LIDENAR S.A.

                        Autorizo mediante este acto a la empresa LIDENAR a compilar, almacenar, tratar, consultar, usar, procesar,
                        compartir, circular y/o suprimir los datos personales de conformidad con los términos y condiciones que se
                        establecen en este formulario y los documentos.

                        Autorizo también a obtener, contrastar, validar y consultar cualquier información y documentación que haya sido
                        proporcionada, dentro del marco de esta contratación. Autorizo el uso, manejo, administración, empleo y verificación
                        de toda la información incluso con fines estadísticos, comerciales, informativos, seguimiento del servicio,
                        mercadeo, notificación y contacto del cliente.

                        En cualquier momento, podré solicitar a la empresa LIDENAR por escrito la modificación de mis datos personales,
                        la misma será aplicable siempre y cuando sea formulada en los términos legales mediante una comunicación escrita.

                        Toda la información que la empresa LIDENAR mantenga, recolecte, reciba u obtenga y que me concierna, de manera
                        directa o indirecta en forma verbal, escrita, gráfica, en medio magnético o bajo cualquier otra forma, que no sea
                        de dominio público, deberá tener una base legal. En consecuencia, la empresa LIDENAR tomará todas las medidas
                        necesarias para que esta información no llegue a manos de terceros no autorizados, se obliga a no utilizarla para
                        ninguna finalidad distinta a la de cumplir con las obligaciones que se deriven directamente de la ejecución y
                        cumplimiento del presente documento.
                    </Text>
                </View>

                <View style={styles.sectionFinal}>
                    <Text>_______________________</Text>
                    <Text>Firma del Solicitante</Text>
                </View>

                <View style={[styles.gridContainer, styles.mb40]}>
                    <Image source="/logo/footer.png" style={{ height: 'auto' }} />
                </View>
            </Page>
        </Document>
    );
}
