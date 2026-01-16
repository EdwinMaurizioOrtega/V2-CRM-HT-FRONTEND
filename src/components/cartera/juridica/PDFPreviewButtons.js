import {pdf} from '@react-pdf/renderer';
import {Box, Button, Card, Stack, TextField} from '@mui/material';
import SolicitudPDF from "../../../sections/@dashboard/invoice/details/credito/juridica/SolicitudPDF";
import AutorizacionPDF from "../../../sections/@dashboard/invoice/details/credito/juridica/AutorizacionPDF";
import PagarePDF from "../../../sections/@dashboard/invoice/details/credito/juridica/PagarePDF";
import {useState} from "react";
import {useAuthContext} from "../../../auth/useAuthContext";
import axios from "../../../utils/axios";
// import SolicitudPDF from './pdfs/SolicitudPDF';
// import OtroPDF from './pdfs/OtroPDF';
// import TercerPDF from './pdfs/TercerPDF';
import n2words from 'n2words';

export default function PDFPreviewButtons(data) {

    const {user} = useAuthContext();

    //console.log("user-aaa: ", user);

    const [pdfUrl, setPdfUrl] = useState(null);

    const abrirBlob = async (docComponent) => {
        const blob = await pdf(docComponent).toBlob();
        const url = URL.createObjectURL(blob);
        //window.open(url, '_blank');

        setPdfUrl(url); // 👉 muestra el PDF en vista embebida

    };


    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // base64 sin prefijo
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const getPdfBase64 = async (docComponent) => {
        const blob = await pdf(docComponent).toBlob();
        const base64 = await blobToBase64(blob);
        return base64;
    };

    const enviarUANATACA = async () => {

        //console.log("dataE: " + JSON.stringify(data.data.empresa.CEDULA_REPRESENTANTE));

        const solicitudBase64 = await getPdfBase64(<SolicitudPDF data={data} user={user}/>);
        const autorizacionBase64 = await getPdfBase64(<AutorizacionPDF data={data}/>);


        const nombre = data.data.empresa.NOMBRE_REPRESENTANTE || "";
        const partes = nombre.trim().split(" ");

        const jsonParaUanataca = {
            flowType: "-NXk9JhsCP7KvP9eQa_11_hpp",
            userData: {
                cedula: data.data.empresa.CEDULA_REPRESENTANTE,
                email: data.data.empresa.EMAIL,
                nombres: partes.slice(0, 2).join(" "),
                apellido: partes[2] || "",
                apellido2: partes[3] || "",
                telef: data.data.empresa.NUM_TELEFONO,
                dirDom: data.data.empresa.DIRECCION_DOMICILIO,
                ciudad: data.data.empresa.CIUDAD,
                prov: data.data.empresa.PROVINCIA,
                pais: "EC"
            },
            customData: {
                subject: "Prueba firmar PDF con Oneshot",
                msg: "Hola " + data.data.empresa.NOMBRE_REPRESENTANTE || "" + "por favor utiliza el siguiente enlace para acceder al proceso de firma electrónica: <%=link_sso%>",
                channel: "ninguno",
                channelNotify: "no",
                endpointNotify: "no",
                enforceDNI: "si",
                qrString: "Puedes validar las firmas de este documento en https://vol.uanataca.com/es",
                transactionId: "test_hps_2",
                files: [
                    {
                        base64: solicitudBase64,
                        filename: "solicitud.pdf",
                        markQR: false,
                        page: 0,
                        posX: 50,
                        posY: 50
                    },
                    {
                        base64: autorizacionBase64,
                        filename: "autorizacion.pdf",
                        markQR: false,
                        page: 0,
                        posX: 50,
                        posY: 50
                    }
                ]
            }
        };

        //console.log("JSON para UANATACA:", JSON.stringify(jsonParaUanataca, null, 2));
        // Puedes ahora enviar 'documentos' a tu backend si lo necesitas

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("x-nexxit-key", "7e8eb93efa0cc0fcf5f82d72d620613abfb74b99f00c64b218ec2b17eabd8d1c"); // <-- reemplaza con tu clave real

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(jsonParaUanataca),
            redirect: "follow"
        };

        try {
            const response = await fetch("https://wfapi.nexxit.dev/wf/flow", requestOptions);
            const result = await response.json(); // usar .json() para obtener objeto

            if (result.status === 201) {
                const sessionId = result.details?.sessionId;
                const sso = result.details?.sso;

                //Guardamos en la base de datos.
                try {
                    const response = await axios.post(`/hanadb/api/customers/guardar_session_id_uanataca`, {
                        session_id: sessionId,
                        sso: sso,
                        empresa_id: data.data.empresa.ID_EMPRESA
                    });

                    if (response.status === 200) {
                        //console.log(response);

                        //Creamos el enlace y lo abrimos en una nueva pestaña.
                        const link_sso = `https://hypertronics.nexxit.dev/#sso/${sso}`;
                        //console.log("Link para firma:", link_sso);

                        // Si quieres mostrarlo en la UI o hacer algo con él:
                        //alert(`Link de firma: ${link_sso}`);
                        // Abrir en nueva pestaña
                        window.open(link_sso, "_blank");

                    } else {
                        // La solicitud POST no se realizó correctamente
                        console.error('Error en la solicitud POST:', response.status);
                    }


                } catch (error) {
                    console.error('Error fetching data:', error);
                }


            } else {
                console.error("Error en la respuesta:", result);
            }


        } catch (error) {
            console.error("Error al enviar a UANATACA:", error);
        }

    };

    const [valor, setValor] = useState('');
    const [texto, setTexto] = useState('');

    // Función para formatear número a moneda US$
    const formatearMoneda = (num) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const handleChange = (e) => {
        let input = e.target.value.replace(',', '.');
        setValor(input);

        const numero = parseFloat(input);
        if (!isNaN(numero)) {
            const entero = Math.floor(numero);
            const decimal = Math.round((numero - entero) * 100);

            // Convierte números a texto (en minúsculas)
            const enteroTexto = n2words(entero, {lang: 'es'});
            const decimalTexto = n2words(decimal, {lang: 'es'});

            const textoCompleto = `${enteroTexto} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA CON ${decimalTexto} CENTAVO${decimal !== 1 ? 'S' : ''}`;

            setTexto(textoCompleto.toUpperCase());
            //console.log(textoCompleto);
        } else {
            setTexto('');
        }
    };

    const enviarPagareUANATACA = async () => {

        //console.log("dataE: " + JSON.stringify(data.data.empresa.CEDULA_REPRESENTANTE));

        const pagareBase64 = await getPdfBase64(<PagarePDF valor={valor} texto={texto} data={data}/>);


        const nombre = data.data.empresa.NOMBRE_REPRESENTANTE || "";
        const partes = nombre.trim().split(" ");

        const jsonParaUanataca = {
            flowType: "-NXk9JhsCP7KvP9eQa_11_hpp",
            userData: {
                cedula: data.data.empresa.CEDULA_REPRESENTANTE,
                email: data.data.empresa.EMAIL,
                nombres: partes.slice(0, 2).join(" "),
                apellido: partes[2] || "",
                apellido2: partes[3] || "",
                telef: data.data.empresa.NUM_TELEFONO,
                dirDom: data.data.empresa.DIRECCION_DOMICILIO,
                ciudad: data.data.empresa.CIUDAD,
                prov: data.data.empresa.PROVINCIA,
                pais: "EC"
            },
            customData: {
                subject: "Prueba firmar PDF con Oneshot",
                msg: "Hola " + data.data.empresa.NOMBRE_REPRESENTANTE || "" + "por favor utiliza el siguiente enlace para acceder al proceso de firma electrónica: <%=link_sso%>",
                channel: "ninguno",
                channelNotify: "no",
                endpointNotify: "no",
                enforceDNI: "si",
                qrString: "Puedes validar las firmas de este documento en https://vol.uanataca.com/es",
                transactionId: "test_hps_2",
                files: [
                    {
                        base64: pagareBase64,
                        filename: "pagare.pdf",
                        markQR: false,
                        page: 0,
                        posX: 50,
                        posY: 150
                    },
                ]
            }
        };

        //console.log("JSON para UANATACA:", JSON.stringify(jsonParaUanataca, null, 2));
        // Puedes ahora enviar 'documentos' a tu backend si lo necesitas

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("x-nexxit-key", "7e8eb93efa0cc0fcf5f82d72d620613abfb74b99f00c64b218ec2b17eabd8d1c"); // <-- reemplaza con tu clave real

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(jsonParaUanataca),
            redirect: "follow"
        };

        try {
            const response = await fetch("https://wfapi.nexxit.dev/wf/flow", requestOptions);
            const result = await response.json(); // usar .json() para obtener objeto

            if (result.status === 201) {
                const sessionId = result.details?.sessionId;
                const sso = result.details?.sso;

                //Guardamos en la base de datos.
                try {
                    const response = await axios.post(`/hanadb/api/customers/guardar_session_id_uanataca_pagare`, {
                        session_id: sessionId,
                        sso: sso,
                        empresa_id: data.data.empresa.ID_EMPRESA
                    });

                    if (response.status === 200) {
                        //console.log(response);

                        //Creamos el enlace y lo abrimos en una nueva pestaña.
                        const link_sso = `https://hypertronics.nexxit.dev/#sso/${sso}`;
                        //console.log("Link para firma:", link_sso);

                        // Si quieres mostrarlo en la UI o hacer algo con él:
                        //alert(`Link de firma: ${link_sso}`);
                        // Abrir en nueva pestaña
                        window.open(link_sso, "_blank");

                    } else {
                        // La solicitud POST no se realizó correctamente
                        console.error('Error en la solicitud POST:', response.status);
                    }


                } catch (error) {
                    console.error('Error fetching data:', error);
                }


            } else {
                console.error("Error en la respuesta:", result);
            }


        } catch (error) {
            console.error("Error al enviar a UANATACA:", error);
        }

    };

    return (
        <>

            <Stack spacing={2} direction="row">

                {/* { user ? ( */}
                <>
                    <Button variant="contained" color="primary" onClick={() => abrirBlob(<SolicitudPDF data={data} user={user} />)}>
                        Solicitud Creación/Actualización Datos
                    </Button>
                    <Button variant="contained" color="secondary"
                            onClick={() => abrirBlob(<AutorizacionPDF data={data} user={user} />)}>
                        Autorización
                    </Button>

                    <Button
                            onClick={() => enviarUANATACA()}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <img
                                src="/images/uanataca-logo.png"
                                alt="UANATACA"
                                style={{
                                    height: '50px',
                                    width: 'auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                    </Button>

                    <TextField
                        label="VALOR DEL PAGARÉ"
                        variant="outlined"
                        fullWidth
                        onChange={handleChange}

                    />

                    <Button variant="contained" color="success"
                            onClick={() => abrirBlob(<PagarePDF valor={valor} texto={texto} data={data} user={user} />)}>
                        PAGARÉ
                    </Button>

                    <Button
                        onClick={() => enviarPagareUANATACA()}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <img
                                src="/images/uanataca-logo.png"
                                alt="UANATACA"
                                style={{
                                    height: '50px',
                                    width: 'auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                    </Button>

                </>

                {/* ) : null } */}

            </Stack>

            {/* 📄 Vista embebida del PDF */}
            {pdfUrl && (
                <Box mt={4} height={600} width={'100%'} border="1px solid #ccc">
                    <iframe
                        src={pdfUrl}
                        width="100%"
                        height="100%"
                        style={{border: 'none'}}
                        title="Vista previa del PDF"
                    />
                </Box>
            )}


        </>
    );
}
