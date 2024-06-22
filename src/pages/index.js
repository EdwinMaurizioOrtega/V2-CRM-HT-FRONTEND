// next
import Head from 'next/head';
// @mui
import {Box, Button} from '@mui/material';
// layouts
import MainLayout from '../layouts/main';
// components
import ScrollProgress from '../components/scroll-progress';
// sections
import {
    HomeHero,
    HomeMinimal,
    HomeDarkMode,
    HomeLookingFor,
    HomeForDesigner,
    HomeColorPresets,
    HomePricingPlans,
    HomeAdvertisement,
    HomeCleanInterfaces,
    HomeHugePackElements,
} from '../sections/home';
import {useEffect, useState} from "react";

// ----------------------------------------------------------------------

HomePage.getLayout = (page) => <MainLayout> {page} </MainLayout>;

// ----------------------------------------------------------------------

export default function HomePage() {

    // const [result, setResult] = useState(null);
    //
    // useEffect(() => {
    //     const loadWasm = async () => {
    //
    //         try {
    //             const response = await fetch('/wasm_crm_bg.wasm');
    //             const wasmBytes = await response.arrayBuffer();
    //             const wasmModule = await WebAssembly.compile(wasmBytes);
    //             const instance = await WebAssembly.instantiate(wasmModule, {});
    //
    //             // Objeto JavaScript que deseas enviar al módulo WebAssembly
    //             const jsonObject = { field1: 5, field2: 3 };
    //
    //             // Convierte el objeto JavaScript a un ArrayBuffer
    //             const buffer = new Uint8Array(Object.entries(jsonObject).flatMap(([k, v]) => [
    //                 k.length,
    //                 ...new TextEncoder().encode(k),
    //                 typeof v === 'number' ? 1 : 0,
    //                 v
    //             ])).buffer;
    //
    //             // Llama a la función exportada del módulo wasm, pasando el objeto JavaScript
    //             const result = instance.exports.print_object(buffer);
    //
    //             console.log(result); // Resultado de la función WASM
    //
    //             // Almacena el resultado en el estado local
    //             setResult(result);
    //         } catch (error) {
    //             console.error('Error al cargar y ejecutar el módulo WebAssembly:', error);
    //         }
    //
    //     };
    //
    //     loadWasm();
    // }, []);

    return (
        <>
            <Head>
                <title> CRM HT BUSINESS</title>
            </Head>

             {/*<ScrollProgress />*/}

            <HomeHero/>

            {/*{result !== null && (*/}
            {/*    <p>El resultado de la función WebAssembly es: {result}</p>*/}
            {/*)}*/}

            {/*<Button variant="outlined" onClick={loguearse}>*/}
            {/*    Loguearse*/}
            {/*</Button>*/}
            {/*/!*<Button variant="outlined" onClick={activarMensajes}>*!/*/}
            {/*    Recibir noti*/}
            {/*</Button>*/}


             {/*<Box*/}
             {/*  sx={{*/}
             {/*    overflow: 'hidden',*/}
             {/*    position: 'relative',*/}
             {/*    bgcolor: 'background.default',*/}
             {/*  }}*/}
             {/*>*/}
             {/*<HomeMinimal />*/}

            {/* <HomeHugePackElements /> */}

            {/* <HomeForDesigner /> */}

             {/*<HomeDarkMode />*/}

            {/* <HomeColorPresets /> */}

            {/* <HomeCleanInterfaces /> */}

            {/* <HomePricingPlans /> */}

            {/* <HomeLookingFor /> */}

            {/* <HomeAdvertisement /> */}
            {/* </Box>*/}
        </>
    );
}
