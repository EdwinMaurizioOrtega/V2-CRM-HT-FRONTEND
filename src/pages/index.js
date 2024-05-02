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
import {useSnackbar} from "notistack";
import {getAuth, signInAnonymously} from "firebase/auth";
import {initializeApp} from "firebase/app";
import {getToken, getMessaging, onMessage} from "firebase/messaging";
import {useEffect} from "react";

// ----------------------------------------------------------------------

HomePage.getLayout = (page) => <MainLayout> {page} </MainLayout>;

// ----------------------------------------------------------------------


const firebaseConfig = {
    apiKey: "AIzaSyCvc6HQvKcOtGarHYoHjQT6vuCb4G5mIpc",
    authDomain: "lidenar.firebaseapp.com",
    projectId: "lidenar",
    storageBucket: "lidenar.appspot.com",
    messagingSenderId: "952981137697",
    appId: "1:952981137697:web:43e329941177ac27163660",
    measurementId: "G-VLT5Z6YCXW"
};

const app = initializeApp(firebaseConfig);
//const messaging = getMessaging(app);

export default function HomePage() {

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const loguearse = () => {
            signInAnonymously(getAuth()).then(usuario => console.log(usuario));
        }

        const activarMensajes = async () => {
            // Move Firebase initialization outside this function
            if (typeof window !== 'undefined') {
                const messaging = getMessaging(app);

                onMessage(messaging, message => {
                    console.log("Tu mensaje:", message);
                    enqueueSnackbar(message.notification.title +  message.notification.body
                    );

                });

                const token = await getToken(messaging, {
                    vapidKey: "BIL93U6wkfalvhCEqIIQJn_ZX9yEnzPEUJLUePWUzb6DXrnLe0QGf_fMWD4ikgF8IVxmOdFeiShisGHM0S-n-_U"
                }).catch(error => console.log("Error al generar el token:", error));

                if (token) console.log("Tu token:", token);
                else console.log("No tienes token.");
            }
        };

        loguearse(); // Call your sign-in function if necessary
        activarMensajes(); // Call the function to activate messages
    }, []);


    return (
        <>
            <Head>
                <title> CRM HT BUSINESS</title>
            </Head>

            {/* <ScrollProgress /> */}

            <HomeHero/>

            {/*<Button variant="outlined" onClick={loguearse}>*/}
            {/*    Loguearse*/}
            {/*</Button>*/}
            {/*<Button variant="outlined" onClick={activarMensajes}>*/}
            {/*    Recibir noti*/}
            {/*</Button>*/}


            {/* <Box */}
            {/*   sx={{ */}
            {/*     overflow: 'hidden', */}
            {/*     position: 'relative', */}
            {/*     bgcolor: 'background.default', */}
            {/*   }} */}
            {/* > */}
            {/* <HomeMinimal /> */}

            {/* <HomeHugePackElements /> */}

            {/* <HomeForDesigner /> */}

            {/* <HomeDarkMode /> */}

            {/* <HomeColorPresets /> */}

            {/* <HomeCleanInterfaces /> */}

            {/* <HomePricingPlans /> */}

            {/* <HomeLookingFor /> */}

            {/* <HomeAdvertisement /> */}
            {/* </Box> */}
        </>
    );
}
