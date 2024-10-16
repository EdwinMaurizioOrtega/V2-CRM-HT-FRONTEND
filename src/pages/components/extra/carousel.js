import Head from 'next/head';
import {Stack, Container, CardHeader} from '@mui/material';
import {Masonry} from '@mui/lab';
import MainLayout from '../../../layouts/main';
import {
    CarouselBasic3,
    CarouselAnimation,
    CarouselThumbnail,
    CarouselCenterMode,
} from '../../../sections/_examples/extra/carousel';

// ----------------------------------------------------------------------

DemoCarouselsPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

// ----------------------------------------------------------------------

export default function DemoCarouselsPage() {
    return (
        <>
            <Head>
                <title>HIPERTRONICS</title>
            </Head>
            <Container sx={{my: 10}}>
                <Stack spacing={3}>
                        <CardHeader
                            title="Distribuidor Autorizado"
                            subheader="Samsung, Infinix, Xiaomi y BLU"
                        />
                            <CarouselAnimation data={_carouselSsectionOne}/>
                        <CardHeader title="Promociones Exclusivas"
                                    subheader="En todoo el mes de Octubre"
                                    style={{textAlign: 'center'}}
                        />
                            <CarouselThumbnail data={_carouselSsectionTwo}/>
                        <CardHeader title="Lo más vendido"
                                    subheader="Próximamente mas stock"
                        />
                            <CarouselCenterMode data={_carouselsExample}/>
                </Stack>
                <Stack spacing={3}>
                    <Masonry columns={{xs: 1}} spacing={3}>
                            <CardHeader title="Nuestros clientes"
                                        subheader="Computron, TIA, Jaher, RM, etc."
                                        style={{textAlign: 'center'}}
                            />
                                <CarouselBasic3 data={_carouselsCustomers}/>
                    </Masonry>
                </Stack>

            </Container>
        </>
    );
}

// ----------------------------------------------------------------------

const _carouselsExample = [
    {
        id: 1,
        title: 'SAMSUNG',
        image: 'https://imagen.hipertronics.us/ht/cloud/uploads/2024/10/lfntrWP7nrU2dVopQfrc.png',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/16-samsung',
    },
    {
        id: 2,
        title: 'INFINIX',
        image: 'https://imagen.hipertronics.us/ht/cloud/uploads/2024/10/Wydq4p9k0rZMAqcdejaA.png',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/17-infinix',
    },
    {
        id: 3,
        title: 'SAMSUNG',
        image: 'https://imagen.hipertronics.us/ht/cloud/uploads/2024/10/RK4z8SThlge9c2Lme8L1.png',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/16-samsung',
    },
    {
        id: 4,
        title: 'INFINIX',
        image: 'https://imagen.hipertronics.us/ht/cloud/uploads/2024/09/FebPSq4U46xMixDU1HiA.png',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/17-infinix',
    },
    {
        id: 5,
        title: 'INFINIX',
        image: 'https://imagen.hipertronics.us/ht/cloud/uploads/2024/09/I4XA6M6w305dRDcRtBJ3.png',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/17-infinix',
    }
]

const _carouselSsectionOne = [
    {
        id: 1,
        title: 'SAMSUNG',
        image: '/assets/images/home/section-one/dit-aut-samsung.jpg',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/16-samsung',
    },
    {
        id: 2,
        title: 'INFINIX',
        image: '/assets/images/home/section-one/dit-aut-infinix.jpg',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/17-infinix',
    },
    {
        id: 3,
        title: 'XIAOMI',
        image: '/assets/images/home/section-one/dit-aut-xiaomi.jpg',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/',
    },
    {
        id: 4,
        title: 'BLU',
        image: '/assets/images/home/section-one/banner-blu-aut.jpg',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/',
    },
    {
        id: 5,
        title: 'GARANTIA',
        image: '/assets/images/home/section-one/banner-garantia.jpg',
        description: '1 año de garantia en todos nuestros productos.',
        link: 'https://mecompras.ec/',
    },

]

const _carouselSsectionTwo = [
    {
        id: 1,
        title: 'SAMSUNG',
        image: '/assets/images/home/section-two/banner_1.png',
        description: 'Distribuidor autorizado',

    },
    {
        id: 2,
        title: 'INFINIX',
        image: '/assets/images/home/section-two/banner_2.png',
        description: 'Distribuidor autorizado',

    },
    {
        id: 1,
        title: 'SAMSUNG',
        image: '/assets/images/home/section-two/banner_1.png',
        description: 'Distribuidor autorizado',

    },
    {
        id: 2,
        title: 'INFINIX',
        image: '/assets/images/home/section-two/banner_2.png',
        description: 'Distribuidor autorizado',

    },
]

const _carouselsCustomers = [
    {
        id: 111,
        title: 'a',
        image: '/assets/images/home/customers/computron.jpg',
        description: 'a',
        link: 'https://www.computron.com.ec/',
    },
    {
        id: 222,
        title: 'b',
        image: '/assets/images/home/customers/tia.jpg',
        description: 'b',
        link: 'https://www.tia.com.ec/',
    },
    {
        id: 333,
        title: 'c',
        image: '/assets/images/home/customers/jaher.jpg',
        description: 'c',
        link: 'https://www.jaher.com.ec/',
    },
    {
        id: 444,
        title: 'd',
        image: '/assets/images/home/customers/rm.jpg',
        description: 'd',
        link: 'https://www.modarm.com/',
    }
]