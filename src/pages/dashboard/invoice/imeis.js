// next
import Head from 'next/head';
// @mui
import {Button, Container, IconButton, SvgIcon, TextField} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import InvoiceNewEditForm from '../../../sections/@dashboard/invoice/form';
import {useState} from "react";

// ----------------------------------------------------------------------

InvoiceCreatePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function InvoiceCreatePage() {
    const {themeStretch} = useSettingsContext();

    const [textArrayCount, setTextArrayCount] = useState(0);
    const [uniqueTextArrayCount, setUniqueTextArrayCount] = useState(0);

    const FileCopySvgIcon = (props) => (
        <SvgIcon {...props}>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z" fill="currentColor"></path>
        </SvgIcon>
    );

    const [text, setText] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const [clickCount, setClickCount] = useState(0);


    const handleTextChange = (event) => {
        const inputText = event.target.value;
        const textArray = inputText.split('\n').map((item) => item.trim());
        setTextArrayCount(textArray.length);
        setText(textArray.join('\n'));
    };

    const handlePrintClick = () => {
        setButtonDisabled(true);
        const textArray = text.split('\n').map((item) => item.trim()).filter(Boolean); // Eliminar líneas vacías

        setTextArrayCount(textArray.length);

        const uniqueTextArray = [...new Set(textArray)]; // Eliminar duplicados usando un Set
        setUniqueTextArrayCount(uniqueTextArray.length);


        const sortedText = uniqueTextArray.sort().join(',\n');
        setText(sortedText);
        console.log(sortedText);
        // Puedes agregar aquí una lógica adicional después de imprimir en la consola, si es necesario

        setClickCount((prevCount) => prevCount + 1);

        if (clickCount >= 1) {
            setButtonDisabled(true);
        }

        // Copiar al portapapeles
        navigator.clipboard.writeText(sortedText).then(() => {
            console.log('Texto copiado al portapapeles');
            // Puedes agregar aquí una lógica adicional después de copiar al portapapeles, si es necesario
        }).finally(() => {
            setButtonDisabled(true);
        });
    };

    const handleClearClick = () => {
        setText('');
        setTextArrayCount(0);
        setUniqueTextArrayCount(0);
        setButtonDisabled(false); // Asegúrate de habilitar el botón después de limpiar.
    };


    return (
        <>
            <Head>
                <title> TEST | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Validación de IMEIs para SAP"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Invoices',
                            href: PATH_DASHBOARD.invoice.list,
                        },
                        {
                            name: 'SAP',
                        },
                    ]}
                />

                <h2>IMEIs</h2>

                <div>

                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <p style={{marginRight: '10px'}}>Líneas ingresadas: {textArrayCount}</p>
                        <p style={{marginRight: '10px', color: "red"}}>TOTAL ITEMs COPIADOS: {uniqueTextArrayCount}</p>

                        <IconButton variant="outlined" onClick={handlePrintClick} disabled={buttonDisabled}>
                            <FileCopySvgIcon/>
                        </IconButton>

                        <Button variant="outlined" onClick={handleClearClick} style={{marginLeft: '10px'}}>
                            Limpiar
                        </Button>
                    </div>

                    <TextField
                        rows={100}
                        fullWidth
                        multiline
                        label="Lista IMEIs SAP"
                        value={text}
                        onChange={handleTextChange}
                        disabled={buttonDisabled}
                    />

                </div>

            </Container>
        </>
    );
}
