import { m } from 'framer-motion';
// @mui
import { Box, Container, Typography, Stack } from '@mui/material';
// components
import Image from '../../components/image';
import { MotionViewport, varFade } from '../../components/animate';

// ----------------------------------------------------------------------

export default function AboutVision() {
  return (
    <Container component={MotionViewport} sx={{ mt: 10 }}>
      <Box
        sx={{
          mb: 10,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Image src="/assets/images/about/vision.jpg" alt="about-vision" />

        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="center"
          sx={{
            bottom: { xs: 24, md: 40 },
            width: 1,
            opacity: 0.48,
            position: 'absolute',
          }}
        >
          {['ibm', 'lya', 'spotify', 'netflix', 'hbo', 'amazon'].map((logo) => (
            <m.div key={logo} variants={varFade().in}>
              <Image
                alt={logo}
                src={`/assets/icons/brands/ic_brand_${logo}.svg`}
                sx={{
                  m: { xs: 1.5, md: 2.5 },
                  height: { xs: 24, md: 40 },
                }}
              />
            </m.div>
          ))}
        </Stack>
      </Box>

      <m.div variants={varFade().inUp}>
        <Typography variant="h3" sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            Nuestra Visión: Liderar el mercado electrónico impactando la vida de nuestros clientes a través de la tecnología y servicio. Mejorar la experiencia de nuestros proveedores a través de las diferentes plataformas ONLINE construyendo una marca en donde las personas puedan depositar su confianza.
        </Typography>
      </m.div>
    </Container>
  );
}
