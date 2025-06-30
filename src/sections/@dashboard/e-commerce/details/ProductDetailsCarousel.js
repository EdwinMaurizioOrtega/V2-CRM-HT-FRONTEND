import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
// @mui
import { alpha, useTheme, styled } from '@mui/material/styles';
import { Box } from '@mui/material';
// utils
import { bgGradient } from '../../../../utils/cssStyles';
// components
import Image from '../../../../components/image';
import Lightbox from '../../../../components/lightbox';
import Carousel, { CarouselArrowIndex } from '../../../../components/carousel';

// ----------------------------------------------------------------------

const THUMB_SIZE = 64;

const StyledThumbnailsContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'length',
})(({ length, theme }) => ({
  margin: theme.spacing(0, 'auto'),
  position: 'relative',

  '& .slick-slide': {
    opacity: 0.48,
    '&.slick-current': {
      opacity: 1,
    },
    '& > div': {
      padding: theme.spacing(0, 0.75),
    },
  },

  ...(length === 1 && {
    maxWidth: THUMB_SIZE * 1 + 16,
  }),
  ...(length === 2 && {
    maxWidth: THUMB_SIZE * 2 + 32,
  }),
  ...((length === 3 || length === 4) && {
    maxWidth: THUMB_SIZE * 3 + 48,
  }),
  ...(length >= 5 && {
    maxWidth: THUMB_SIZE * 6,
  }),
  ...(length > 2 && {
    '&:before, &:after': {
      ...bgGradient({
        direction: 'to left',
        startColor: `${alpha(theme.palette.background.default, 0)} 0%`,
        endColor: `${theme.palette.background.default} 100%`,
      }),
      top: 0,
      zIndex: 9,
      content: "''",
      height: '100%',
      position: 'absolute',
      width: (THUMB_SIZE * 2) / 3,
    },
    '&:after': {
      right: 0,
      transform: 'scaleX(-1)',
    },
  }),
}));

// ----------------------------------------------------------------------

ProductDetailsCarousel.propTypes = {
  product: PropTypes.object,
};

export default function ProductDetailsCarousel({ product }) {
  const theme = useTheme();

  const carousel1 = useRef(null);

  const carousel2 = useRef(null);

  const [nav1, setNav1] = useState();

  const [nav2, setNav2] = useState();

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedImage, setSelectedImage] = useState(-1);

  const imagesLightbox = JSON.parse(product.IMAGES)?.map((img) => ({ src: img.URL }));

  const handleOpenLightbox = (imageUrl) => {
    const imageIndex = imagesLightbox.findIndex((image) => image.src === imageUrl);
    setSelectedImage(imageIndex);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(-1);
  };

  const carouselSettings1 = {
    dots: false,
    arrows: false,
    slidesToShow: 1,
    draggable: false,
    slidesToScroll: 1,
    adaptiveHeight: true,
    beforeChange: (current, next) => setCurrentIndex(next),
  };

  const carouselSettings2 = {
    dots: false,
    arrows: false,
    centerMode: true,
    swipeToSlide: true,
    focusOnSelect: true,
    variableWidth: true,
    centerPadding: '0px',
    // slidesToShow: product.images.length > 3 ? 3 : product.images.length,
  };

  useEffect(() => {
    if (carousel1.current) {
      setNav1(carousel1.current);
    }
    if (carousel2.current) {
      setNav2(carousel2.current);
    }
  }, []);

  useEffect(() => {
    carousel1.current?.slickGoTo(currentIndex);
  }, [currentIndex]);

  const handlePrev = () => {
    carousel2.current?.slickPrev();
  };

  const handleNext = () => {
    carousel2.current?.slickNext();
  };

  const handleShare = (url) => {
    //console.log('Compartiendo:', url);

    const image = new window.Image();
    image.crossOrigin = 'Anonymous'; // Establecer CORS para la imagen
    image.src = url;

    const watermark = new window.Image(); // Crear una nueva instancia para la marca de agua
    watermark.src = '/logo/logo-ht.png'; // Ruta de la imagen de la marca de agua

    // Esperar a que ambas imágenes se carguen
    let imagesLoaded = 0;

    const checkImagesLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        drawImages();
      }
    };

    image.onload = checkImagesLoaded;
    watermark.onload = checkImagesLoaded;

    const drawImages = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = image.width;
      canvas.height = image.height;

      // Establecer fondo blanco
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);

      // Calcular la posición de la marca de agua (ajusta según sea necesario)
      const watermarkWidth = 100; // Ancho de la marca de agua
      const watermarkHeight = 50; // Alto de la marca de agua
      const x = canvas.width - watermarkWidth - 10; // Posición en X (10px de margen)
      const y = canvas.height - watermarkHeight - 10; // Posición en Y (10px de margen)

      // Dibujar la imagen de la marca de agua con opacidad
      ctx.globalAlpha = 0.5; // Ajustar la opacidad de la marca de agua
      ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight); // Dibujar la marca de agua
      ctx.globalAlpha = 1.0; // Restablecer la opacidad

      // Crear un enlace para descargar la imagen procesada
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = product.CODIGO + '.png';

      // Simular un clic en el enlace
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Manejo de errores
    image.onerror = (err) => {
      console.error('Error al cargar la imagen:', err);
    };

    watermark.onerror = (err) => {
      console.error('Error al cargar la marca de agua:', err);
    };
  };


  const renderLargeImg = (
    <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      <Carousel {...carouselSettings1} asNavFor={nav2} ref={carousel1}>
        {JSON.parse(product.IMAGES)?.map((img) => (
          <Image
            key={img}
            alt="product"
            src={img.URL}
            ratio="1/1"
            onClick={() => handleShare(img.URL)}
            // sx={{ cursor: 'zoom-in' }}
          />
        ))}
      </Carousel>

      <CarouselArrowIndex
        index={currentIndex}
        total={JSON.parse(product.IMAGES)?.length}
        onNext={handleNext}
        onPrevious={handlePrev}
      />
    </Box>
  );

  const renderThumbnails = (
    <StyledThumbnailsContainer length={JSON.parse(product.IMAGES)?.length}>
      <Carousel {...carouselSettings2} asNavFor={nav1} ref={carousel2}>
        {JSON.parse(product.IMAGES)?.map((img, index) => (
          <Image
            key={img}
            disabledEffect
            alt="thumbnail"
            src={img.URL}
            sx={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: 1.5,
              cursor: 'pointer',
              ...(currentIndex === index && {
                border: `solid 2px ${theme.palette.primary.main}`,
              }),
            }}
          />
        ))}
      </Carousel>
    </StyledThumbnailsContainer>
  );

  return (
    <>
      <Box
        sx={{
          '& .slick-slide': {
            float: theme.direction === 'rtl' ? 'right' : 'left',
          },
        }}
      >
        {renderLargeImg}

        {renderThumbnails}
      </Box>

      <Lightbox
        index={selectedImage}
        slides={imagesLightbox}
        open={selectedImage >= 0}
        close={handleCloseLightbox}
        onGetCurrentIndex={(index) => setCurrentIndex(index)}
      />
    </>
  );
}
