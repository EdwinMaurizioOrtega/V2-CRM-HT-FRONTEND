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

const _carouselsExample = [...Array(5)].map((_, index) => ({
    id: _mock.id(index),
    title: _mock.text.title(index),
    image: _mock.image.cover(index),
    description: _mock.text.description(index),
}));

// ----------------------------------------------------------------------

DemoCarouselsPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

// ----------------------------------------------------------------------

export default function DemoCarouselsPage() {
    return (
        <>
            <Head>
                <title> Extra Components: Carousels | HT</title>
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
                            // title="Carousel Animation"
                        />
                        <CardContent>
                            <CarouselAnimation data={_carouselsExample}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Promociones Exclusivas"/>
                        <CardContent>
                            <CarouselThumbnail data={_carouselsExample}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Lo más vendido" subheader="Customs shape & icon button"/>
                        <CardContent>
                            <CarouselCenterMode data={_carouselsExample}/>
                        </CardContent>
                    </Card>
                </Stack>

                <Stack spacing={3}>
                    <Masonry columns={{xs: 1, md: 2}} spacing={3}>
                        {/* <Card> */}
                        {/*     <CardHeader title="Carousel Basic 1"/> */}
                        {/*     <CardContent> */}
                        {/*         <CarouselBasic1 data={_carouselsExample}/> */}
                        {/*     </CardContent> */}
                        {/* </Card> */}

                        <Card>
                            <CardHeader title="Categorias"/>
                            <CardContent>
                                <CarouselBasic2 data={_carouselsExample}/>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader title="Marcas"/>
                            <CardContent>
                                <CarouselBasic3 data={_carouselsExample}/>
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
