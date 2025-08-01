// i18n
import '../locales/i18n';

// scroll bar
import 'simplebar-react/dist/simplebar.min.css';

// lightbox
/* eslint-disable import/no-unresolved */
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

// map
import 'mapbox-gl/dist/mapbox-gl.css';

// editor
import 'react-quill/dist/quill.snow.css';

// slick-carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

//Custom CSS
import '../../styles/CustomHome.css';

// ----------------------------------------------------------------------

import PropTypes from 'prop-types';
import {CacheProvider} from '@emotion/react';
// next
import Head from 'next/head';
// redux
import {Provider as ReduxProvider} from 'react-redux';
// @mui
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
// redux
import {store} from '../redux/store';
// utils
import createEmotionCache from '../utils/createEmotionCache';
// theme
import ThemeProvider from '../theme';
// locales
import ThemeLocalization from '../locales';
// components
import {StyledChart} from '../components/chart';
import ProgressBar from '../components/progress-bar';
import SnackbarProvider from '../components/snackbar';
import {MotionLazyContainer} from '../components/animate';
import {ThemeSettings, SettingsProvider} from '../components/settings';

// Check our docs
// https://docs.minimals.cc/authentication/js-version

import {AuthProvider} from '../auth/JwtContext';
import {useEffect} from "react";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from '@vercel/speed-insights/next';
import {useRouter} from "next/router";
// import { AuthProvider } from '../auth/Auth0Context';
// import { AuthProvider } from '../auth/FirebaseContext';
// import { AuthProvider } from '../auth/AwsCognitoContext';

// ----------------------------------------------------------------------

const clientSideEmotionCache = createEmotionCache();

MyApp.propTypes = {
    Component: PropTypes.elementType,
    pageProps: PropTypes.object,
    emotionCache: PropTypes.object,
};


export default function MyApp(props) {

    //Registrar el Service worker
    // useEffect(() => {
    //     if ('serviceWorker' in navigator) {
    //         navigator.serviceWorker.register('/service-worker.js')
    //             .then(function (registration) {
    //                 // Registro exitoso
    //                 //console.log('Service Worker registrado con éxito:', registration.scope);
    //             })
    //             .catch(function (error) {
    //                 // Error en el registro
    //                 //console.log('Error al registrar el Service Worker:', error);
    //             });
    //     }
    //
    // }, []);

    const {Component, pageProps, emotionCache = clientSideEmotionCache} = props;

    const getLayout = Component.getLayout ?? ((page) => page);

    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width"/>
            </Head>

            <AuthProvider>
                <ReduxProvider store={store}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <SettingsProvider>
                            <MotionLazyContainer>
                                <ThemeProvider>
                                    <ThemeSettings>
                                        <ThemeLocalization>
                                            <SnackbarProvider>
                                                <StyledChart/>
                                                <ProgressBar/>
                                                {getLayout(
                                                    <Component {...pageProps} />
                                                )}
                                                <Analytics/>
                                                <SpeedInsights/>
                                            </SnackbarProvider>
                                        </ThemeLocalization>
                                    </ThemeSettings>
                                </ThemeProvider>
                            </MotionLazyContainer>
                        </SettingsProvider>
                    </LocalizationProvider>
                </ReduxProvider>
            </AuthProvider>
        </CacheProvider>
    );
}
