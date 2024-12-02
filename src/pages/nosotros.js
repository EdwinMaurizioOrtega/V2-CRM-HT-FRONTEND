// next
import Head from 'next/head';
// @mui
import {Box, Divider} from '@mui/material';
// layouts
import MainLayout from '../layouts/main';
// sections
import { AboutHero, AboutWhat, AboutTeam, AboutVision, AboutTestimonials } from '../sections/about';

// ----------------------------------------------------------------------

AboutPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

// ----------------------------------------------------------------------

export default function AboutPage() {
  return (
    <>
      <Head>
        <title> Nosotros | HT</title>
      </Head>

      {/* <AboutHero /> */}

      {/* <AboutWhat /> */}

      {/* <AboutVision /> */}

      {/* <Divider orientation="vertical" sx={{ my: 10, mx: 'auto', width: 2, height: 40 }} /> */}

      {/* <AboutTeam /> */}

      {/* <AboutTestimonials /> */}

        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                backgroundColor: '#000', // Fondo negro para un efecto cinematográfico
            }}
        >
            <video
                src="/videos/2024.mp4"
                autoPlay
                muted
                loop
                controls
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                }}
            />
        </Box>

    </>
  );
}
