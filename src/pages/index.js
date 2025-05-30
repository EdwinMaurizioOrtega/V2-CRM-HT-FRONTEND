import Head from 'next/head';
import MainLayout from '../layouts/main';
import {useEffect, useRef, useState} from "react";
import Link from "next/link";

// ----------------------------------------------------------------------

HomePage.getLayout = (page) => <MainLayout> {page} </MainLayout>;

// ----------------------------------------------------------------------

export default function HomePage() {


    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Función para detectar el tamaño de la pantalla
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 767); // Establece a `true` si es móvil
        };

        // Llama a handleResize en el montaje del componente
        handleResize();

        // Agrega un event listener para escuchar cambios en el tamaño de la ventana
        window.addEventListener('resize', handleResize);

        // Limpia el event listener al desmontar el componente
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const slides = [
        {
            desktopImage: '/images/1.jpg',
            mobileImage: '/images/11.jpg',
            title: 'Samsung',
            description: 'Representación oficial de Samsung en el país, garantizando productos auténticos y servicios autorizados en territorio ecuatoriano.',
            style: {color: 'white'},
            destinationUrl: '/dashboard/e-commerce/product/10.03.108'
        },
        {
            desktopImage: '/images/2.jpg',
            mobileImage: '/images/22.jpg',
            title: 'Infinix',
            description: 'Representación oficial de Samsung en el país, garantizando productos auténticos y servicios autorizados en territorio ecuatoriano.',
            style: {color: 'white'},
            destinationUrl: '',
        },
        {
            desktopImage: '/images/3.jpg',
            mobileImage: '/images/33.jpg',
            title: 'Xiaomi',
            description: 'Representación oficial de Samsung en el país, garantizando productos auténticos y servicios autorizados en territorio ecuatoriano.',
            style: {color: 'white'},
            destinationUrl: '',
        },
        {
            desktopImage: '/images/4.jpg',
            mobileImage: '/images/44.jpg',
            title: 'Garantía',
            description: 'Destacando el respaldo oficial que asegura reparaciones o reemplazos de productos dentro de este período, conforme a las políticas del fabricante.',
            style: {color: 'black'},
            destinationUrl: '',
        },
        {
            desktopImage: '/images/5.jpg',
            mobileImage: '/images/55.jpg',
            title: 'BLU',
            description: 'Representación oficial de Blu en el país, garantizando productos auténticos y servicios autorizados en territorio ecuatoriano.',
            style: {color: 'black'},
            destinationUrl: '',
        },

    ];

    // Estado para almacenar el índice de la diapositiva actual
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const slideInterval = useRef(null);

    // Cambia la diapositiva actual cada 5 segundos
    useEffect(() => {
        const startInterval = () => {
            slideInterval.current = setInterval(() => {
                setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
            }, 5000);
        };

        if (isPlaying) {
            startInterval();
        }

        // Limpia el intervalo cuando el componente se desmonta o si isPlaying cambia
        return () => clearInterval(slideInterval.current);
    }, [isPlaying, slides.length]);

    // Funciones para cambiar de diapositiva manualmente
    const goToPreviousSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide === 0 ? slides.length - 1 : prevSlide - 1));
    };

    const goToNextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Función para alternar entre play y pause
    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev);
    };


    const [activeTab, setActiveTab] = useState('mobile'); // El estado para controlar la pestaña activa

    const handleTabClick = (tabName) => {
        setActiveTab(tabName); // Cambiar la pestaña activa
    };

    // Sección tres.
    const [activeTabTres, setActiveTabTres] = useState('mobile_uno'); // El estado para controlar la pestaña activa

    const handleTabClickSecTres = (tabName) => {
        setActiveTabTres(tabName); // Cambiar la pestaña activa
    };

    // Obtener la imagen basada en la condición
    const imageNameDesktop = getImageNameDesktop(activeTabTres);
    const imageNameMobile = getImageNameMobile(activeTabTres);


    const imageNameDesktopTV = getImageNameDesktopTV(activeTabTres);
    const imageNameMobileTV = getImageNameMobileTV(activeTabTres);

    const imageNameDesktopHome = getImageNameDesktopHome(activeTabTres);
    const imageNameMobileHome = getImageNameMobileHome(activeTabTres);


    useEffect(() => {
        // Seleccionar todos los elementos interactivos dentro de .questions
        const questionItems = document.querySelectorAll('.questions div');
        // Seleccionar la imagen principal
        const dynamicImage = document.getElementById('dynamicImage');

        // Verificar si la imagen existe
        if (!dynamicImage) return;

        // Agregar eventos de hover (mouseover y mouseout) a cada elemento
        questionItems.forEach((item) => {
            item.addEventListener('mouseover', () => {
                const newImageSrc = item.getAttribute('data-img');
                if (newImageSrc) dynamicImage.src = newImageSrc;
            });

            item.addEventListener('mouseout', () => {
                // Restaurar la imagen original al salir del hover
                dynamicImage.src = "/images/co15_half-teasher-list-2_pc_684x6841.jpg";
            });
        });

        // Limpiar los eventos al desmontar el componente
        return () => {
            questionItems.forEach((item) => {
                item.removeEventListener('mouseover', () => {});
                item.removeEventListener('mouseout', () => {});
            });
        };
    }, []);


    return (
        <>
            <Head>
                <title>CRM HT BUSINESS</title>
            </Head>

            <main>

                {/* Primera seccion */}
                <div className="baner">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                            style={{display: index === currentSlide ? 'block' : 'none'}}
                        >
                            <a className="baner-desk" href="#">
                                <img
                                    src={isMobile ? slide.mobileImage : slide.desktopImage}
                                    alt=""/>
                            </a>
                            {/* <a className="baner-mobile" href="#"><img src={slide.mobileImage} alt=""/></a> */}
                            <div className="baner-text" style={slide.style}>
                                <div className="baner-text-con">
                                    <h1 className="text-title">{slide.title}</h1>
                                    <p>{slide.description}</p>
                                    <div className="baner-btn">
                                        <a className="anchor-info">Más información</a>
                                        <Link href="/dashboard/e-commerce/product/10.03.108">
                                            <button className="button-comprar">Comprar ahora</button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Botones de navegación */}
                    <button className="prev" onClick={goToPreviousSlide}>
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 4L8 12L16 20" stroke="white" strokeWidth="1" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button className="next" onClick={goToNextSlide}>
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 4L16 12L8 20" stroke="white" strokeWidth="1" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>


                    {/* Puntos de navegación */}
                    <div className="indicator">
                        {slides.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                            ></span>
                        ))}
                        <button
                            className="indicator__controls indicator__controls--play"
                            onClick={togglePlayPause}
                            aria-label={isPlaying ? 'Pause' : 'Play'} // Mejora la accesibilidad
                        >
                            {isPlaying ? (
                                <svg fill="#ff0000" width="800px" height="800px" viewBox="0 0 24 24" id="pause"
                                     data-name="Flat Color" xmlns="http://www.w3.org/2000/svg"
                                     className="icon flat-color">
                                    <path id="primary"
                                          d="M19,4V20a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h2A2,2,0,0,1,19,4ZM9,2H7A2,2,0,0,0,5,4V20a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V4A2,2,0,0,0,9,2Z"
                                    />
                                </svg>
                            ) : (
                                <svg fill="#ff0000" width="800px" height="800px" viewBox="0 0 24 24"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="m.001 1.165v21.669c.052.661.601 1.177 1.271 1.177.225 0 .436-.058.62-.16l-.006.003 21.442-10.8c.4-.192.671-.593.671-1.058s-.271-.867-.664-1.055l-.007-.003-21.442-10.8c-.177-.099-.388-.157-.613-.157-.672 0-1.223.521-1.27 1.181v.004z"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Segunda seccion */}
                <div id="month" className="month-pick">
                    <h2 className="text-block-container__headline">Últimas Ofertas</h2>
                    <div className="scroll-container">
                        <ul className="horizontal-scroll">
                            {/* <li> */}
                            {/*     <button */}
                            {/*         className={activeTab === 'ramadan' ? 'active' : ''} */}
                            {/*         onClick={() => handleTabClick('ramadan')} */}
                            {/*     > */}
                            {/*         Destacados */}
                            {/*         <span className="tab__item-line"></span> */}
                            {/*     </button> */}
                            {/* </li> */}
                            <li>
                                <button
                                    className={activeTab === 'mobile' ? 'active' : ''}
                                    onClick={() => handleTabClick('mobile')}
                                >
                                    Infinix
                                    <span className="tab__item-line"></span>
                                </button>
                            </li>
                            <li>
                                <button
                                    className={activeTab === 'tv' ? 'active' : ''}
                                    onClick={() => handleTabClick('tv')}
                                >
                                    Samsung
                                    <span className="tab__item-line"></span>
                                </button>
                            </li>
                            <li>
                                <button
                                    className={activeTab === 'home' ? 'active' : ''}
                                    onClick={() => handleTabClick('home')}
                                >
                                    Xiaomi
                                    <span className="tab__item-line"></span>
                                </button>
                            </li>
                            <li>
                                <button
                                    className={activeTab === 'monitors' ? 'active' : ''}
                                    onClick={() => handleTabClick('monitors')}
                                >
                                    BLU
                                    <span className="tab__item-line"></span>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="pick-con">
                        {/* <div className={`tab-content ${activeTab === 'ramadan' ? 'active' : ''}`}> */}
                        {/*     <div className="left"> */}
                        {/*         <a className={isMobile ? "left-mo" : "left-desk"}> */}
                        {/*             <img */}
                        {/*                 src={isMobile ? "/images/Large-Tile-MO-BLACK-FRIDAY.webp" : "/images/Large-Tile-PC-BLACK-FRIDAY.webp"} */}
                        {/*                 alt="" */}
                        {/*             /> */}
                        {/*         </a> */}

                        {/*         <div className="p-text"> */}
                        {/*             <h3 style={{ */}
                        {/*                 color: "white" */}
                        {/*             }}>En Black Friday, ¡hasta 50% dto.!</h3> */}
                        {/*             <div className="text-animation"> */}
                        {/*                 /!* <small>Enjoy the season of gifting with amazing discounts up tp 59% off *!/ */}
                        {/*                 /!* </small> *!/ */}
                        {/*                 <button className="button-comprar" */}
                        {/*                 style={{ */}
                        {/*                     backgroundColor: 'white', */}
                        {/*                     color: 'black', */}
                        {/*                 }} */}
                        {/*                 >Comprar ahora */}
                        {/*                     <svg className="custom-svg" viewBox="0 0 96 96" */}
                        {/*                          xmlns="http://www.w3.org/2000/svg" */}
                        {/*                     > */}
                        {/*                         <path */}
                        {/*                             d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z" */}
                        {/*                             fill="black" */}
                        {/*                         ></path> */}
                        {/*                     </svg> */}
                        {/*                 </button> */}
                        {/*             </div> */}
                        {/*         </div> */}
                        {/*     </div> */}
                        {/*     <div className="right"> */}
                        {/*         /!* <-- one --> *!/ */}
                        {/*         <div className="one"> */}
                        {/*             <a> */}
                        {/*                 <img src="/images/TabS10_160x160_pc.webp" alt=""/> */}
                        {/*             </a> */}
                        {/*             <h4>Nuevo</h4> */}
                        {/*             <div className="p-text"> */}
                        {/*                 <h3>Serie Galaxy Tab S10</h3> */}
                        {/*                 <div className="text-animation"> */}
                        {/*                     /!* <small>Enjoy 0% installment plan and free delivery</small> *!/ */}
                        {/*                     {!isMobile && */}
                        {/*                         <button>Comprar ahora */}
                        {/*                             <svg className="custom-svg" viewBox="0 0 96 96" */}
                        {/*                                  xmlns="http://www.w3.org/2000/svg"> */}
                        {/*                                 <path */}
                        {/*                                     d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z" */}
                        {/*                                     fill="white" */}
                        {/*                                 ></path> */}
                        {/*                             </svg> */}
                        {/*                         </button> */}
                        {/*                     } */}
                        {/*                 </div> */}
                        {/*             </div> */}
                        {/*         </div> */}
                        {/*         /!* <-- two --> *!/ */}
                        {/*         <div className="two"> */}
                        {/*             <a><img src="/images/Watch-Ultra_160x160_pc.webp" alt=""/></a> */}
                        {/*             <h4>Nuevo</h4> */}
                        {/*             <div className="p-text"> */}
                        {/*             <h3>Galaxy Watch Ultra</h3> */}
                        {/*                 <div className="text-animation"> */}
                        {/*                     /!* <small>Just for you this Ramadan</small> *!/ */}
                        {/*                     {!isMobile && */}
                        {/*                         <button>Comprar ahora */}
                        {/*                             <svg className="custom-svg" viewBox="0 0 96 96" */}
                        {/*                                  xmlns="http://www.w3.org/2000/svg"> */}
                        {/*                                 <path */}
                        {/*                                     d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z" */}
                        {/*                                     fill="white" */}
                        {/*                                 ></path> */}
                        {/*                             </svg> */}
                        {/*                         </button> */}
                        {/*                     } */}
                        {/*                 </div> */}
                        {/*             </div> */}
                        {/*         </div> */}
                        {/*         /!* <-- three --> *!/ */}
                        {/*         <div className="three"> */}
                        {/*             <a><img src="/images/T_combo_desktop_160X160.png" alt=""/></a> */}
                        {/*             <h4>Nuevo</h4> */}
                        {/*             <div className="p-text"> */}
                        {/*             <h3>Bespoke AI Laundry Combo</h3> */}
                        {/*                 <div className="text-animation"> */}
                        {/*                     /!* <small>With 48H delivery and flexible payment options*</small> *!/ */}
                        {/*                     {!isMobile && */}
                        {/*                         <button>Comprar ahora */}
                        {/*                             <svg className="custom-svg" viewBox="0 0 96 96" */}
                        {/*                                  xmlns="http://www.w3.org/2000/svg"> */}
                        {/*                                 <path */}
                        {/*                                     d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z" */}
                        {/*                                     fill="white" */}
                        {/*                                 ></path> */}
                        {/*                             </svg> */}
                        {/*                         </button> */}
                        {/*                     } */}
                        {/*                 </div> */}
                        {/*             </div> */}
                        {/*         </div> */}
                        {/*         /!* <-- four --> *!/ */}
                        {/*         <div className="four"> */}
                        {/*             <a><img src="/images/Odyssey_desktop_160X160.png" alt=""/></a> */}
                        {/*             <h4>Nuevo</h4> */}
                        {/*             <div className="p-text"> */}
                        {/*             <h3>Odyssey OLED G8</h3> */}
                        {/*                 <div className="text-animation"> */}
                        {/*                     /!* <small>Enjoy the season of gifting with amazing discounts up tp 59% *!/ */}
                        {/*                     /!*     off</small> *!/ */}
                        {/*                     {!isMobile && */}
                        {/*                         <button>Comprar ahora */}
                        {/*                             <svg className="custom-svg" viewBox="0 0 96 96" */}
                        {/*                                  xmlns="http://www.w3.org/2000/svg"> */}
                        {/*                                 <path */}
                        {/*                                     d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z" */}
                        {/*                                     fill="white" */}
                        {/*                                 ></path> */}
                        {/*                             </svg> */}
                        {/*                         </button> */}
                        {/*                     } */}
                        {/*                 </div> */}
                        {/*             </div> */}
                        {/*         </div> */}
                        {/*     </div> */}

                        {/* </div> */}

                        <div className={`tab-content ${activeTab === 'mobile' ? 'active' : ''}`}>
                            <div className="left">
                                <a className={isMobile ? "left-mo" : "left-desk"}>
                                <img
                                        src={isMobile ? "/images/10.43.111-mbl.png" : "/images/10.43.111.png"}
                                        alt=""
                                    />
                                </a>

                                <div className="p-text">
                                    <h3>HOT 50 PRO SLEEK BLACK</h3>
                                    <div className="text-animation">
                                        {/* <small>Enjoy the season of gifting with amazing discounts up tp 59% off */}
                                        {/* </small> */}
                                        <button className="button-comprar">Comprar ahora</button>
                                    </div>
                                </div>
                            </div>
                            <div className="right">
                                {/* <-- one --> */}
                                <div className="one">
                                    <a>
                                        <img src="/images/10.43.109.png" alt=""/>
                                    </a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>SMART 9 NEO TITANIUM</h3>
                                        <div className="text-animation">
                                            {/* <small>Enjoy 0% installment plan and free delivery</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- two --> */}
                                <div className="two">
                                    <a><img src="/images/10.43.110.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>SMART 9 MINT GREEN</h3>
                                        <div className="text-animation">
                                            {/* <small>Just for you this Ramadan</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- three --> */}
                                <div className="three">
                                    <a><img src="/images/10.43.120.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>SMART 9HD METALLIC BLACK</h3>
                                        <div className="text-animation">
                                            {/* <small>With 48H delivery and flexible payment options*</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- four --> */}
                                <div className="four">
                                    <a><img src="/images/10.43.122.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>SMART 9HD MINT GREEN</h3>
                                        <div className="text-animation">
                                            {/* <small>Enjoy the season of gifting with amazing discounts up tp 59% */}
                                            {/*     off</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`tab-content ${activeTab === 'tv' ? 'active' : ''}`}>
                            <div className="left">
                                <a className={isMobile ? "left-mo" : "left-desk"}>
                                    <img
                                        src={isMobile ? "/images/10.02.191-mbl.png" : "/images/10.02.191.png"}
                                        alt=""
                                    />
                                </a>

                                <div className="p-text">
                                    <h3>A06 (4+128GB) LIGHT BLUE</h3>
                                    <div className="text-animation">
                                        {/* <small>Enjoy the season of gifting with amazing discounts up tp 59% off */}
                                        {/* </small> */}
                                        {!isMobile &&
                                            <button>Comprar ahora</button>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="right">
                                {/* <-- one --> */}
                                <div className="one">
                                    <a>
                                        <img src="/images/10.02.141.png" alt=""/>
                                    </a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>A05 (4+128GB) SILVER</h3>
                                        <div className="text-animation">
                                            {/* <small>Enjoy 0% installment plan and free delivery</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- two --> */}
                                <div className="two">
                                    <a><img src="/images/10.02.152.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>A15 (6+128GB) BLACK</h3>
                                        <div className="text-animation">
                                            {/* <small>Just for you this Ramadan</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- three --> */}
                                <div className="three">
                                    <a><img src="/images/10.02.151.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>A15 (6+128GB) LIGHT BLUE</h3>
                                        <div className="text-animation">
                                            {/* <small>With 48H delivery and flexible payment options*</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- four --> */}
                                <div className="four">
                                    <a><img src="/images/10.02.202.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>A15 (4+128GB) BLACK</h3>
                                        <div className="text-animation">
                                            {/* <small>Enjoy the season of gifting with amazing discounts up tp 59% */}
                                            {/*     off</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`tab-content ${activeTab === 'home' ? 'active' : ''}`}>
                            <div className="left">
                                <a className={isMobile ? "left-mo" : "left-desk"}>
                                    <img
                                        src={isMobile ? "/images/10.19.163-mbl.png" : "/images/10.19.163.png"}
                                        alt=""
                                    />
                                </a>

                                <div className="p-text">
                                    <h3>REDMI A3 MIDNIGHT BLACK</h3>
                                    <div className="text-animation">
                                        {/* <small>Enjoy the season of gifting with amazing discounts up tp 59% off */}
                                        {/* </small> */}
                                        <button className="button-comprar">Comprar ahora</button>
                                    </div>
                                </div>
                            </div>
                            <div className="right">
                                {/* <-- one --> */}
                                <div className="one">
                                    <a>
                                        <img src="/images/10.19.133.png" alt=""/>
                                    </a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>XIAOMI 12 5G (8+256GB) BLUE</h3>
                                        <div className="text-animation">
                                            {/* <small>Enjoy 0% installment plan and free delivery</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- two --> */}
                                <div className="two">
                                    <a><img src="/images/10.19.164.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>XIAOMI REDMI A3 (4+128GB) STAR BLUE</h3>
                                        <div className="text-animation">
                                            {/* <small>Just for you this Ramadan</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- three --> */}
                                <div className="three">
                                    <a><img src="/images/10.19.128.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>XIAOMI 12 5G (8+256GB) GRAY</h3>
                                        <div className="text-animation">
                                            {/* <small>With 48H delivery and flexible payment options*</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- four --> */}
                                <div className="four">
                                    <a><img src="/images/10.19.176.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>XIAOMI REDMI 14C AZUL ASTRAL</h3>
                                        <div className="text-animation">
                                            {/* <small>Enjoy the season of gifting with amazing discounts up tp 59% */}
                                            {/*     off</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`tab-content ${activeTab === 'monitors' ? 'active' : ''}`}>
                            <div className="left">
                                <a className={isMobile ? "left-mo" : "left-desk"}>
                                    <img
                                        src={isMobile ? "/images/10.03.110-mbl.png" : "/images/10.03.110.png"}
                                        alt=""
                                    />
                                </a>

                                <div className="p-text">
                                    <h3>BLU C9 LTE (2+64GB) PURPLE</h3>
                                    <div className="text-animation">
                                        {/* <small>Enjoy the season of gifting with amazing discounts up tp 59% off */}
                                        {/* </small> */}
                                        <button className="button-comprar">Comprar ahora</button>
                                    </div>
                                </div>
                            </div>
                            <div className="right">
                                {/* <-- one --> */}
                                <div className="one">
                                    <a>
                                        <img src="/images/10.03.95.png" alt=""/>
                                    </a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>C5L MAX (3+32GB) BLUE</h3>
                                        <div className="text-animation">
                                            {/* <small>Enjoy 0% installment plan and free delivery</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- two --> */}
                                <div className="two">
                                    <a><img src="/images/10.03.112.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>C9 LTE (2+64GB) GREEN</h3>
                                        <div className="text-animation">
                                            {/* <small>Just for you this Ramadan</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- three --> */}
                                <div className="three">
                                    <a><img src="/images/10.03.108.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>C9 LTE (2+64GB) BLACK</h3>
                                        <div className="text-animation">
                                            {/* <small>With 48H delivery and flexible payment options*</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <-- four --> */}
                                <div className="four">
                                    <a><img src="/images/10.03.111.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>BLU C9 LTE (2+64GB) WHITE</h3>
                                        <div className="text-animation">
                                            {/* <small>Enjoy the season of gifting with amazing discounts up tp 59% */}
                                            {/*     off</small> */}
                                            {!isMobile &&
                                                <button>Comprar ahora</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Tercera seccion */}
                <div id="mobile" className="mobile">

                    <a className={isMobile ? "mobile-mo" : "mobile-desk"}>
                        <img src={isMobile ? imageNameMobile : imageNameDesktop} alt=""/>
                    </a>

                    <div className="mobile-list">
                        <h1 className="text-block-container__headline"
                            // style={{
                            //     color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                            // }}
                        >Infinix</h1>
                        <ul className="horizontal-scroll">
                            <li>
                                <button className={activeTabTres === 'mobile_uno' ? 'active' : ''}
                                        // style={{
                                        //     color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                        // }}
                                        onClick={() => handleTabClickSecTres('mobile_uno')}>
                                    HOT 50 PRO
                                    <span className="tab__item-line"></span>

                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_dos' ? 'active' : ''}
                                        // style={{
                                        //     color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                        // }}
                                        onClick={() => handleTabClickSecTres('mobile_dos')}>
                                    SMART 9HD MINT GREEN
                                    <span className="tab__item-line"></span>

                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_tres' ? 'active' : ''}
                                        // style={{
                                        //     color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                        // }}
                                        onClick={() => handleTabClickSecTres('mobile_tres')}>
                                    SMART 9HD METALLIC BLACK
                                    <span className="tab__item-line"></span>

                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_cuatro' ? 'active' : ''}
                                        // style={{
                                        //     color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                        // }}
                                        onClick={() => handleTabClickSecTres('mobile_cuatro')}>
                                    SMART 9 MINT GREEN
                                    <span className="tab__item-line"></span>

                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_cinco' ? 'active' : ''}
                                        // style={{
                                        //     color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                        //     border: activeTabTres === 'mobile_cinco' ? '2px dotted white' : '',
                                        // }}
                                        onClick={() => handleTabClickSecTres('mobile_cinco')}>
                                    SMART 9 NEO TITANIUM
                                    <span className="tab__item-line"
                                    // style={{
                                    //     background: 'white'
                                    // }}
                                    ></span>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="mobile-list-bottom">
                        <div className={`tab-content ${activeTabTres === 'mobile_uno' ? 'active' : ''}`}>

                            <h2>HOT 50 PRO SLEEK BLACK</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a>Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_dos' ? 'active' : ''}`}>

                            <h2>SMART 9HD MINT GREEN</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a>Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_tres' ? 'active' : ''}`}>

                            <h2>SMART 9HD METALLIC</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a>Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_cuatro' ? 'active' : ''}`}>

                            <h2>SMART 9 MINT GREEN</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a>Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_cinco' ? 'active' : ''}`}>

                            <h2
                                // style={{
                                //     color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                // }}
                            >SMART 9 NEO TITANIUM</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a
                                //     style={{
                                //     color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                // }}
                                >Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cuarta seccion */}
                <div id="tv" className="tv">

                    <a className={isMobile ? "mobile-mo" : "mobile-desk"}>
                        <img src={isMobile ? imageNameMobileTV : imageNameDesktopTV} alt=""/>
                    </a>

                    <div className="mobile-list">
                        <h1 className="text-block-container__headline"
                        >SAMSUNG</h1>
                        <ul className="horizontal-scroll">
                            <li>
                                <button className={activeTabTres === 'mobile_uno' ? 'active' : ''}
                                        onClick={() => handleTabClickSecTres('mobile_uno')}>
                                    Samsung AI TV
                                    <span className="tab__item-line"
                                    ></span>
                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_dos' ? 'active' : ''}

                                        onClick={() => handleTabClickSecTres('mobile_dos')}>
                                    Neo QLED 8K
                                    <span className="tab__item-line"

                                    ></span>
                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_tres' ? 'active' : ''}
                                        onClick={() => handleTabClickSecTres('mobile_tres')}>
                                    Neo QLED
                                    <span className="tab__item-line"
                                    ></span>
                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_cuatro' ? 'active' : ''}
                                        onClick={() => handleTabClickSecTres('mobile_cuatro')}>
                                    OLED
                                    <span className="tab__item-line"
                                    ></span>
                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_cinco' ? 'active' : ''}

                                        onClick={() => handleTabClickSecTres('mobile_cinco')}>
                                    The Frame
                                    <span className="tab__item-line"
                                    ></span>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="mobile-list-bottom">
                        <div className={`tab-content ${activeTabTres === 'mobile_uno' ? 'active' : ''}`}>

                            <h2 >Eleva cada momento</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a >Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_dos' ? 'active' : ''}`}>

                            <h2 >Neo QLED 8K</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a >Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_tres' ? 'active' : ''}`}>

                            <h2 >Neo QLED</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a >Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_cuatro' ? 'active' : ''}`}>

                            <h2 >OLED</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a >Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_cinco' ? 'active' : ''}`}>

                            <h2
                            >The Frame</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a >Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quinta seccion */}
                <div id="home" className="home">

                    <a className={isMobile ? "mobile-mo" : "mobile-desk"}>
                        <img src={isMobile ? imageNameMobileHome : imageNameDesktopHome} alt=""/>
                    </a>

                    <div className="mobile-list">
                        <h1 className="text-block-container__headline"
                        >XIAOMI</h1>
                        <ul className="horizontal-scroll">
                            <li>
                                <button className={activeTabTres === 'mobile_uno' ? 'active' : ''}
                                        onClick={() => handleTabClickSecTres('mobile_uno')}>
                                    Bespoke AI Laundry Combo
                                    <span className="tab__item-line"></span>
                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_dos' ? 'active' : ''}
                                        onClick={() => handleTabClickSecTres('mobile_dos')}>
                                    Bespoke AI ™
                                    <span className="tab__item-line"></span>
                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_tres' ? 'active' : ''}
                                        onClick={() => handleTabClickSecTres('mobile_tres')}>
                                    Family Hub
                                    <span className="tab__item-line"></span>
                                </button>
                            </li>
                            <li>
                                <button className={activeTabTres === 'mobile_cuatro' ? 'active' : ''}
                                        onClick={() => handleTabClickSecTres('mobile_cuatro')}>
                                    Top Mount Freezer
                                    <span className="tab__item-line"></span>
                                </button>
                            </li>

                        </ul>
                    </div>
                    <div className="mobile-list-bottom">
                        <div className={`tab-content ${activeTabTres === 'mobile_uno' ? 'active' : ''}`}>

                            <h2>Bespoke AI Laundry Combo</h2>
                            <p>El lavado y secado perfecto en 98 min con AI</p>
                            <div className="mobile-btn">
                                <a>Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_dos' ? 'active' : ''}`}>

                            <h2>Bespoke AI ™</h2>
                            <p>Las convenientes soluciones de AI te brindan más tiempo libre y más ahorro de energía.</p>
                            <div className="mobile-btn">
                                <a>Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_tres' ? 'active' : ''}`}>

                            <h2>Family Hub</h2>
                            <p>Nuevos productos con AI</p>
                            <div className="mobile-btn">
                                <a>Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={`tab-content ${activeTabTres === 'mobile_cuatro' ? 'active' : ''}`}>

                            <h2>Top Mount Freezer</h2>
                            <p>Nuevos productos con AI</p>
                            <div className="mobile-btn">
                                <a>Más información</a>
                                <a>Comprar ahora
                                    <svg className="custom-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M81.436 14.564v54.285h-8V28.221L18.22 83.436l-5.656-5.656L67.78 22.563l-40.629.001v-8z"
                                            fill="white"
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Sexta seecion */}
                <div className="explore">
                    <h2>Explore #Hipertronics</h2>
                    <div className="explore-con">
                        <a >
                            <img id="dynamicImage" src="/images/co15_half-teasher-list-2_pc_684x6841.jpg"
                                 alt="Imagen principal"/>
                        </a>
                        <div className="questions">
                            <div data-img="/images/co15_half-teasher-list-2_pc_684x6841.jpg">
                            <p>01. Descubre cómo nuestra AI te empodera</p>
                                <button>Conoce más</button>
                            </div>
                            <div data-img="/images/global0029_home-explore-banner_pc_684x684.webp">
                                <p>02. Sostenibilidad para las generaciones futuras y dirigida por ellas</p>
                                <button>Conoce más</button>
                            </div>
                            <div data-img="/images/da0055_home_explore_banner_pc_684x684.jpg">
                                <p>03. Rollos de repollo con salsa de tomate</p>
                                <button>Conoce más</button>
                            </div>
                            <div data-img="/images/home_smart-home_684x684_pc.webp">
                                <p>04. ¡Tu Casa Inteligente te está esperando!</p>
                                <button>Conoce más</button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </>
    );
}

// Mobile
const getImageNameDesktop = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/10.43.111-desk.png';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/10.43.122-desk.png';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/10.43.120-desk.png';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/10.43.110-desk.png';
        case 'mobile_cinco':
            // Aquí defines otras condiciones
            return '/images/10.43.109-desk.png';
        default:
            // Imagen por defecto
            return '/images/10.43.111-desk.png';
    }
};

const getImageNameMobile = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/10.43.111-mbl1.png';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/10.43.122-mbl.png';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/10.43.120-mbl.png';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/10.43.110-mbl.png';
        case 'mobile_cinco':
            // Aquí defines otras condiciones
            return '/images/10.43.109-mbl.png';
        default:
            // Imagen por defecto
            return '/images/10.43.111-mbl1.png';
    }
};

// TV
const getImageNameDesktopTV = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/10.02.141-desk1.png';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/10.02.152-desk.png';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/10.02.191-desk.png';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/10.02.151-desk.png';
        case 'mobile_cinco':
            // Aquí defines otras condiciones
            return '/images/10.02.202-desk.png'
            // Imagen por defecto
            return '/images/10.02.141-desk1.png'
    }
};

const getImageNameMobileTV = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/10.02.141-mbl.png';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/10.02.152-mbl.png';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/10.02.191-mbl1.png';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/10.02.151-mbl.png';
        case 'mobile_cinco':
            // Aquí defines otras condiciones
            return '/images/10.02.202-mbl.png'
            // Imagen por defecto
            return '/images/10.02.141-mbl.png';
    }
};

// HOME
const getImageNameDesktopHome = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/10.19.163-desk.png';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/10.19.164-desk.png';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/10.19.128-desk.png';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/10.19.176-desk.png';
        default:
            // Imagen por defecto
            return '/images/10.19.163-desk.png';
    }
};

const getImageNameMobileHome = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/10.19.163-mbl1.png';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/10.19.164-mbl.png';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/10.19.128-mbl.png';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/10.19.176-mbl.png';
        default:
            // Imagen por defecto
            return '/images/10.19.163-mbl1.pngg';
    }
};