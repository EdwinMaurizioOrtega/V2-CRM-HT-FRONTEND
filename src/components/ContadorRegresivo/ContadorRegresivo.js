import { useState, useEffect } from 'react';
import {Alert, AlertTitle, Stack} from "@mui/material";
import {Block} from "../../sections/_examples/Block";

function ContadorRegresivo() {
    //const fechaObjetivo = new Date();
    const fechaObjetivo = new Date('Tue Sep 05 2023 10:00:00 GMT-0500'); // Establecer la fecha objetivo
    ////console.log("fechaObjetivo: "+fechaObjetivo);

    fechaObjetivo.setDate(fechaObjetivo.getDate() + 15); // Sumar 15 días a la fecha actual

    const [tiempoRestante, setTiempoRestante] = useState(calcularTiempoRestante());

    function calcularTiempoRestante() {
        const diferencia = fechaObjetivo - new Date();

        const segundos = Math.max(Math.floor((diferencia / 1000) % 60), 0);
        const minutos = Math.max(Math.floor((diferencia / 1000 / 60) % 60), 0);
        const horas = Math.max(Math.floor((diferencia / 1000 / 60 / 60) % 24), 0);
        const dias = Math.max(Math.floor(diferencia / 1000 / 60 / 60 / 24), 0);

        return { dias, horas, minutos, segundos };
    }

    useEffect(() => {
        const intervalo = setInterval(() => {
            const tiempo = calcularTiempoRestante();
            setTiempoRestante(tiempo);

            if (tiempo.dias === 0 && tiempo.horas === 0 && tiempo.minutos === 0 && tiempo.segundos === 0) {
                clearInterval(intervalo);
            }
        }, 1000);

        return () => clearInterval(intervalo);
    }, []);

    return (


    <Block title="Actualización direcciones clientes VENDEDORES MAYORISTAS.">
        <Stack spacing={2}>
            <Alert key="error" severity="error" onClose={() => {}}>
                <AlertTitle sx={{ textTransform: 'capitalize' }}> Esta opción será obligatoria. </AlertTitle>
                Faltan — <strong> {tiempoRestante.dias} días, {tiempoRestante.horas} horas, {tiempoRestante.minutos} minutos, {tiempoRestante.segundos} segundos!</strong>
            </Alert>

        </Stack>
    </Block>
    );
}

export default ContadorRegresivo;
