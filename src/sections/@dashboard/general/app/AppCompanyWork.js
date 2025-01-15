import {Box, Card, FormControl, FormControlLabel, Radio, RadioGroup, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useAuthContext} from "../../../../auth/useAuthContext";


export default function AppCompanyWork({title, subheader, tableData, tableLabels, ...other}) {

    const {user, updateUser} = useAuthContext();

    const [selectedValue, setSelectedValue] = useState(''); // Estado inicial sin valor

    // Sincroniza el estado con el valor de EMPRESA del contexto
    useEffect(() => {
        if (user?.EMPRESA) {
            setSelectedValue(user.EMPRESA);
        }
    }, [user]);

    // Maneja el cambio de selección en el RadioGroup
    const handleChange = (event) => {
        const newValue = event.target.value;
        setSelectedValue(newValue);

        // Lógica para cambiar EMPRESA basado en la selección
        updateUser({EMPRESA: newValue});
    };
    return (


        <Box
            sx={{
                textAlign: 'center',
                mx: 'auto', // Center horizontally
                my: 2, // Add margin top and bottom
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >

            {(user?.ROLE === '9' || user?.ROLE === '10' || user?.ROLE === '8' || user?.ROLE === '7') && (
                <Typography sx={{fontSize: '25px'}}>
                    <Box component="span" sx={{color: 'red'}}>
                        ¡ALERTA!
                    </Box>
                    {' Esta es una  '}
                    <Box component="span" sx={{fontWeight: 'bold'}}>
                        versión preliminar
                    </Box>, que estará disponible próximamente.
                </Typography>
            )}
            <FormControl component="fieldset" sx={{mb: 2}}>
                <RadioGroup row value={selectedValue} onChange={handleChange}>

                    {user?.COMPANY === 'HT' ? (
                        <>
                            <FormControlLabel
                                value="0992537442001"
                                control={<Radio/>}
                                label={
                                    <>
                                        Samsung/Infinix
                                        {(user?.ROLE === '9' || user?.ROLE === '10' || user?.ROLE === '8') && (
                                            <>
                                                {' | '}<strong>LIDENAR</strong>
                                            </>
                                        )}
                                    </>
                                }
                            />
                            <FormControlLabel
                                value="1792161037001"
                                control={<Radio/>}
                                label={
                                    <>
                                        Xiaomi
                                        {(user?.ROLE === '9' ||
                                            user?.ROLE === '10' ||
                                            user?.ROLE === '8') && (
                                            <>
                                                {' | '} <strong>MOVILCELISTIC</strong>
                                            </>

                                        )}
                                    </>
                                }
                            />
                        </>
                    ) : null}

                    {/* {user?.COMPANY === 'INFINIX' || user?.COMPANY === 'TOMEBAMBA' ? ( */}
                    {/*     <FormControlLabel */}
                    {/*         value="0992537442001" */}
                    {/*         control={<Radio/>} */}
                    {/*         label="HIPERTRONICS" */}
                    {/*     /> */}
                    {/* ) : null} */}

                    {/* {user?.COMPANY === 'ALPHACELL' ? ( */}
                    {/*     <FormControlLabel */}
                    {/*         value="0992264373001" */}
                    {/*         control={<Radio size="small"/>} */}
                    {/*         label="ALPHACELL" */}
                    {/*     /> */}
                    {/* ) : null} */}

                    {/* {user?.COMPANY === 'MC' ? ( */}
                    {/*     <FormControlLabel */}
                    {/*         value="1792161037001" */}
                    {/*         control={<Radio/>} */}
                    {/*         label="MOVILCELISTIC" */}
                    {/*     /> */}
                    {/* ) : null} */}

                </RadioGroup>
            </FormControl>

            {/* <Typography variant="h5" component="h5" gutterBottom> */}
            {/*     ¡EMPRESA EN LA QUE VAS A TRABAJAR! */}
            {/* </Typography> */}
            {/* <Typography component="span"> */}
            {/*     RUC: {`${user?.EMPRESA || 'Ninguno'}`} */}
            {/* </Typography> */}
        </Box>

    );
}
