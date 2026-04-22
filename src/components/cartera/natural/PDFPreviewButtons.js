import { pdf } from '@react-pdf/renderer';
import { Box, Button, Card, Stack, TextField } from '@mui/material';
import SolicitudPDF from "../../../sections/@dashboard/invoice/details/credito/natural/SolicitudPDF";
import AutorizacionPDF from "../../../sections/@dashboard/invoice/details/credito/natural/AutorizacionPDF";
import PagarePDF from "../../../sections/@dashboard/invoice/details/credito/natural/PagarePDF";
import { useState } from "react";
import { useAuthContext } from "../../../auth/useAuthContext";
import axios from "../../../utils/axios";
// import SolicitudPDF from './pdfs/SolicitudPDF';
// import OtroPDF from './pdfs/OtroPDF';
// import TercerPDF from './pdfs/TercerPDF';
import n2words from 'n2words';
import {
    createFlow as uanatacaCreateFlow,
    buildCarteraFlowBody,
    buildPagareFlowBody,
    buildFlowStatusUrl,
} from "../../../api/uanataca";

export default function PDFPreviewButtons(data) {

    const { user } = useAuthContext();

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
        try {
            const cliente = data.data.empresa;
            const rucEmpresa = user?.EMPRESA;

            const solicitudBase64 = await getPdfBase64(<SolicitudPDF data={data} user={user} />);
            const autorizacionBase64 = await getPdfBase64(<AutorizacionPDF data={data} />);

            const body = buildCarteraFlowBody({
                rucEmpresa,
                cliente,
                solicitudBase64,
                autorizacionBase64,
                transactionId: `cartera-${cliente.ID_EMPRESA}`,
            });

            const result = await uanatacaCreateFlow(rucEmpresa, body);
            const flowId = result?.id;
            if (!flowId) {
                throw new Error('Uanataca no devolvió un flowId válido.');
            }

            await axios.post(`/hanadb/api/customers/guardar_session_id_uanataca`, {
                session_id: flowId,
                sso: buildFlowStatusUrl(flowId),
                empresa_id: cliente.ID_EMPRESA,
            });

            alert(`Flujo de firma creado correctamente. Se envió el correo/WhatsApp al cliente (${cliente.EMAIL || 'sin email'}) para firmar los documentos.\nFlow ID: ${flowId}`);
        } catch (error) {
            console.error("Error al enviar a UANATACA (cartera):", error);
            alert(`Error al iniciar firma: ${error.message || error}`);
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
            const enteroTexto = n2words(entero, { lang: 'es' });
            const decimalTexto = n2words(decimal, { lang: 'es' });

            const textoCompleto = `${enteroTexto} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA CON ${decimalTexto} CENTAVO${decimal !== 1 ? 'S' : ''}`;

            setTexto(textoCompleto.toUpperCase());
            //console.log(textoCompleto);
        } else {
            setTexto('');
        }
    };

    const enviarPagareUANATACA = async () => {
        try {
            const cliente = data.data.empresa;
            const rucEmpresa = user?.EMPRESA;

            const pagareBase64 = await getPdfBase64(<PagarePDF valor={valor} texto={texto} data={data} user={user} />);

            const body = buildPagareFlowBody({
                rucEmpresa,
                cliente,
                pagareBase64,
                transactionId: `pagare-${cliente.ID_EMPRESA}`,
            });

            const result = await uanatacaCreateFlow(rucEmpresa, body);
            const flowId = result?.id;
            if (!flowId) {
                throw new Error('Uanataca no devolvió un flowId válido.');
            }

            await axios.post(`/hanadb/api/customers/guardar_session_id_uanataca_pagare`, {
                session_id: flowId,
                sso: buildFlowStatusUrl(flowId),
                empresa_id: cliente.ID_EMPRESA,
            });

            alert(`Pagaré enviado a firma. Se notificó al cliente (${cliente.EMAIL || 'sin email'}).\nFlow ID: ${flowId}`);
        } catch (error) {
            console.error("Error al enviar a UANATACA (pagaré):", error);
            alert(`Error al iniciar firma del pagaré: ${error.message || error}`);
        }
    };

    return (
        <>

            <Stack spacing={2} direction="row">

                {(user?.ROLE === '9' || user?.ROLE === '10' || user?.ROLE === '7') && (
                    <>
                        <Button variant="contained" color="primary" onClick={() => abrirBlob(<SolicitudPDF data={data} user={user} />)}>
                            Solicitud Creación/Actualización Datos
                        </Button>
                        <Button variant="contained" color="secondary"
                            onClick={() => abrirBlob(<AutorizacionPDF data={data} user={user} />)}>
                            Autorización
                        </Button>
                    </>
                )}

                {(user?.ROLE === '9' || user?.ROLE === '10') && (
                    <>

                        <Button
                            onClick={() => enviarUANATACA()}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
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
                            <div style={{ display: 'flex', alignItems: 'center' }}>
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
                )}
            </Stack>

            {/* 📄 Vista embebida del PDF */}
            {pdfUrl && (
                <Box mt={4} height={600} width={'100%'} border="1px solid #ccc">
                    <iframe
                        src={pdfUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title="Vista previa del PDF"
                    />
                </Box>
            )}


        </>
    );
}
