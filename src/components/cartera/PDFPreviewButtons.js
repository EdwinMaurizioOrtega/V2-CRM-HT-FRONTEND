import {pdf} from '@react-pdf/renderer';
import {Box, Button, Stack} from '@mui/material';
import SolicitudPDF from "../../sections/@dashboard/invoice/details/SolicitudPDF";
import AutorizacionPDF from "../../sections/@dashboard/invoice/details/AutorizacionPDF";
import {useState} from "react";
import {useAuthContext} from "../../auth/useAuthContext";
// import SolicitudPDF from './pdfs/SolicitudPDF';
// import OtroPDF from './pdfs/OtroPDF';
// import TercerPDF from './pdfs/TercerPDF';

export default function PDFPreviewButtons(data) {

    const {user} = useAuthContext();

    console.log("user-aaa: ", user);

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

    const testEnviar = async () => {
        const solicitudBase64 = await getPdfBase64(<SolicitudPDF data={data} />);
        const autorizacionBase64 = await getPdfBase64(<AutorizacionPDF data={data} />);

        const documentos = [
            {
                nombre: 'solicitud.pdf',
                contenido: solicitudBase64
            },
            {
                nombre: 'autorizacion.pdf',
                contenido: autorizacionBase64
            }
        ];

        console.log("JSON con documentos base64:", JSON.stringify(documentos));
        // Puedes ahora enviar 'documentos' a tu backend si lo necesitas
    };

    return (
        <>


            <Stack spacing={2} direction="row">

                {/* { user ? ( */}
                    <>
                        <Button variant="contained" onClick={() => abrirBlob(<SolicitudPDF data={data}/>)}>
                            Solicitud Creación/Actualización Datos
                        </Button>
                        <Button variant="contained" color="secondary"
                                onClick={() => abrirBlob(<AutorizacionPDF data={data}/>)}>
                            Autorización
                        </Button>

                        <Button variant="contained" color="secondary"
                                onClick={() => testEnviar()}>
                            Test Enviar
                        </Button>


                        {/* <Button variant="contained" color="success" onClick={() => abrirBlob(<TercerPDF />)}> */}
                        {/*     Ver Tercer PDF */}
                        {/* </Button> */}



                    </>

                {/* ) : null } */}

            </Stack>


            {/* 📄 Vista embebida del PDF */}
            {pdfUrl && (
                <Box mt={4} height={600} border="1px solid #ccc">
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
