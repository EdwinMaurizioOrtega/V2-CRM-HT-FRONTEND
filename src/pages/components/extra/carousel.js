// next
import Head from 'next/head';
// @mui
import {Box, Stack, Card, Container, CardHeader, CardContent} from '@mui/material';
import {Masonry} from '@mui/lab';
// routes
import {PATH_PAGE} from '../../../routes/paths';
// _mock
import _mock from '../../../_mock';
// layouts
import MainLayout from '../../../layouts/main';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import {
    CarouselBasic1,
    CarouselBasic2,
    CarouselBasic3,
    CarouselBasic4,
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

            {/* <Box */}
            {/*   sx={{ */}
            {/*     pt: 6, */}
            {/*     pb: 1, */}
            {/*     bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'), */}
            {/*   }} */}
            {/* > */}
            {/*   <Container> */}
            {/*     <CustomBreadcrumbs */}
            {/*       heading="Carousel" */}
            {/*       links={[ */}
            {/*         { */}
            {/*           name: 'Components', */}
            {/*           href: PATH_PAGE.components, */}
            {/*         }, */}
            {/*         { name: 'Carousel' }, */}
            {/*       ]} */}
            {/*       moreLink={['https://react-slick.neostack.com']} */}
            {/*     /> */}
            {/*   </Container> */}
            {/* </Box> */}

            <Container sx={{my: 10}}>
                <Stack spacing={3}>
                    <Card>
                        <CardHeader
                            title="Distribuidor Autorizado"
                            subheader="Samsung, Infinix, Xiaomi y BLU"
                        />
                        <CardContent>
                            <CarouselAnimation data={_carouselSsectionOne}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Promociones Exclusivas"
                                    subheader="En todoo el mes de Octubre"
                                    style={{ textAlign: 'center' }}
                        />
                        <CardContent>
                            <CarouselThumbnail data={_carouselSsectionTwo}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Lo más vendido"
                                    subheader="Próximamente mas stock"
                        />
                        <CardContent>
                            <CarouselCenterMode data={_carouselsExample}/>
                        </CardContent>
                    </Card>
                </Stack>

                <Stack spacing={3}>
                    <Masonry columns={{xs: 1}} spacing={3}>
                        {/* <Card> */}
                        {/*     <CardHeader title="Carousel Basic 1"/> */}
                        {/*     <CardContent> */}
                        {/*         <CarouselBasic1 data={_carouselsExample}/> */}
                        {/*     </CardContent> */}
                        {/* </Card> */}

                        {/* <Card> */}
                        {/*     <CardHeader title="Categorias"/> */}
                        {/*     <CardContent> */}
                        {/*         <CarouselBasic2 data={_carouselsExample}/> */}
                        {/*     </CardContent> */}
                        {/* </Card> */}

                        <Card>
                            <CardHeader title="Nuestros clientes"
                                        subheader="Computron, TIA, Jaher, RM, etc."
                                        style={{ textAlign: 'center' }}
                            />
                            <CardContent>
                                <CarouselBasic3 data={_carouselsCustomers}/>
                            </CardContent>
                        </Card>

                        {/* <Card> */}
                        {/*     <CardHeader title="Carousel Basic 4"/> */}
                        {/*     <CardContent> */}
                        {/*         <CarouselBasic4 data={_carouselsExample}/> */}
                        {/*     </CardContent> */}
                        {/* </Card> */}
                    </Masonry>
                </Stack>

            </Container>
        </>
    );
}


// ----------------------------------------------------------------------

const _carouselsExample = [...Array(5)].map((_, index) => ({
    id: _mock.id(index),
    title: _mock.text.title(index),
    image: _mock.image.cover(index),
    description: _mock.text.description(index),
}));

const _carouselSsectionOne = [
    {
        id: 1,
        title: 'SAMSUNG',
        image: '/assets/images/home/section-one/banner1.jpg',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/16-samsung',
    },
    {
        id: 2,
        title: 'INFINIX',
        image: '/assets/images/home/section-one/banner2.jpg',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/17-infinix',
    },
    {
        id: 3,
        title: 'XIAOMI',
        image: '/assets/images/home/section-one/banner3.jpg',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/',
    },
    {
        id: 4,
        title: 'BLU',
        image: '/assets/images/home/section-one/banner4.jpg',
        description: 'Distribuidor autorizado',
        link: 'https://mecompras.ec/',
    },

]

const _carouselSsectionTwo = [
    {
        id: 1,
        title: 'SAMSUNG',
        image: '/assets/images/home/section-two/1.jpg',
        description: 'Distribuidor autorizado',

    },
    {
        id: 2,
        title: 'INFINIX',
        image: '/assets/images/home/section-two/2.jpg',
        description: 'Distribuidor autorizado',

    },


]


const _carouselsCustomers = [
    {
        id: 1,
        title: 'a',
        image: '/assets/images/home/customers/computron.jpg',
        description: 'a',
        link: 'https://www.computron.com.ec/',
    },
    {
        id: 2,
        title: 'b',
        image: '/assets/images/home/customers/tia.jpg',
        description: 'b',
        link: 'https://www.tia.com.ec/',
    },
    {
        id: 3,
        title: 'c',
        image: '/assets/images/home/customers/jaher.jpg',
        description: 'c',
        link: 'https://www.jaher.com.ec/',
    },
    {
        id: 4,
        title: 'd',
        image: '/assets/images/home/customers/rm.jpg',
        description: 'd',
        link: 'https://www.modarm.com/',
    },
]
