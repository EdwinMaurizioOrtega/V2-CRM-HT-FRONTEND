import { pdf } from '@react-pdf/renderer';
import {Box, Button, Stack} from '@mui/material';
import SolicitudPDF from "../../sections/@dashboard/invoice/details/SolicitudPDF";
import {useState} from "react";
// import SolicitudPDF from './pdfs/SolicitudPDF';
// import OtroPDF from './pdfs/OtroPDF';
// import TercerPDF from './pdfs/TercerPDF';

export default function PDFPreviewButtons(data) {

    const [pdfUrl, setPdfUrl] = useState(null);


    const abrirBlob = async (docComponent) => {
        const blob = await pdf(docComponent).toBlob();
        const url = URL.createObjectURL(blob);
        //window.open(url, '_blank');

        setPdfUrl(url); // 👉 muestra el PDF en vista embebida

    };

    return (
        <>



        <Stack spacing={2} direction="row">
            <Button variant="contained" onClick={() => abrirBlob(<SolicitudPDF data={data}/>)}>
                Ver Solicitud PDF
            </Button>
            {/* <Button variant="contained" color="secondary" onClick={() => abrirBlob(<OtroPDF />)}> */}
            {/*     Ver Otro PDF */}
            {/* </Button> */}
            {/* <Button variant="contained" color="success" onClick={() => abrirBlob(<TercerPDF />)}> */}
            {/*     Ver Tercer PDF */}
            {/* </Button> */}
        </Stack>



            {/* 📄 Vista embebida del PDF */}
            {pdfUrl && (
                <Box mt={4} height={600} border="1px solid #ccc">
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
