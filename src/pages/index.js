import Head from 'next/head';
import MainLayout from '../layouts/main';
import {useEffect, useRef, useState} from "react";

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
            desktopImage: '/images/Black_Friday_desktop-3.jpg',
            mobileImage: '/images/Black_Friday_mo-3.jpg',
            title: 'Black Friday',
            description: 'Aprovecha las mejores ofertas para todos',
            style: {color: 'white'},
        },
        {
            desktopImage: '/images/New-Desktop_GalaxyS24-FE.webp',
            mobileImage: '/images/New-Mobile_GalaxyS24-FE.webp',
            title: 'Galaxy S24 FE',
            description: '',
            style: {color: 'black'},
        },
        {
            desktopImage: '/images/Tele-desktop.webp',
            mobileImage: '/images/Tele-Mobile.webp',
            title: '¿Buscas una TV para disfrutar de tu contenido favorito?',
            description: '',
            style: {color: 'black'},
        },
        {
            desktopImage: '/images/New-Desktop_GalaxTabS10.jpg',
            mobileImage: '/images/New-Mobile_GalaxTabS10.webp',
            title: 'Serie Galaxy Tab S10',
            description: 'El nuevo estándar de tabletas premium',
            style: {color: 'black'},
        },
        {
            desktopImage: '/images/New-Desktop_GalaxyWatchUltra.webp',
            mobileImage: '/images/New-Ultra_Mob.jpg',
            title: 'Galaxy Watch Ultra',
            description: '',
            style: {color: 'white'},
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


    const [activeTab, setActiveTab] = useState('ramadan'); // El estado para controlar la pestaña activa

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
                                    {/* <p>{slide.description}</p> */}
                                    <div className="baner-btn">
                                        <a className="anchor-info">Más información</a>
                                        <button className="button-comprar">Comprar ahora</button>
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
                            <li>
                                <a
                                    className={activeTab === 'ramadan' ? 'active' : ''}
                                    onClick={() => handleTabClick('ramadan')}
                                >
                                    Destacados
                                </a>
                            </li>
                            <li>
                                <a
                                    className={activeTab === 'mobile' ? 'active' : ''}
                                    onClick={() => handleTabClick('mobile')}
                                >
                                    Mobile
                                </a>
                            </li>
                            <li>
                                <a
                                    className={activeTab === 'tv' ? 'active' : ''}
                                    onClick={() => handleTabClick('tv')}
                                >
                                    TV & AV
                                </a>
                            </li>
                            <li>
                                <a
                                    className={activeTab === 'home' ? 'active' : ''}
                                    onClick={() => handleTabClick('home')}
                                >
                                    Línea Blanca
                                </a>
                            </li>
                            <li>
                                <a
                                    className={activeTab === 'monitors' ? 'active' : ''}
                                    onClick={() => handleTabClick('monitors')}
                                >
                                    Monitores
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="pick-con">
                        <div className={`tab-content ${activeTab === 'ramadan' ? 'active' : ''}`}>
                            <div className="left">
                                <a className={isMobile ? "left-mo" : "left-desk"}>
                                    <img
                                        src={isMobile ? "/images/S24FE_Merchandising_624x352_mo.jpeg" : "/images/S24FE_Merchandising_684x684_pc.jpeg"}
                                        alt=""
                                    />
                                </a>

                                <div className="p-text">
                                    <h3>Galaxy S24 FE</h3>
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
                                        <img src="/images/TabS10_160x160_pc.webp" alt=""/>
                                    </a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Serie Galaxy Tab S10</h3>
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
                                    <a><img src="/images/Watch-Ultra_160x160_pc.webp" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Galaxy Watch Ultra</h3>
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
                                    <a><img src="/images/T_combo_desktop_160X160.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Bespoke AI Laundry Combo</h3>
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
                                    <a><img src="/images/Odyssey_desktop_160X160.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Odyssey OLED G8</h3>
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

                        <div className={`tab-content ${activeTab === 'mobile' ? 'active' : ''}`}>
                            <div className="left">
                                <a className={isMobile ? "left-mo" : "left-desk"}>
                                    <img
                                        src={isMobile ? "/images/HOME_Q6_Merchandising_624x352_mo_LTR.webp" : "/images/HOME_Q6_Merchandising_684x684_pc.webp"}
                                        alt=""
                                    />
                                </a>

                                <div className="p-text">
                                    <h3>Galaxy Z Fold6</h3>
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
                                        <img src="/images/Home_E3_Merchandising_160x160_pc.webp" alt=""/>
                                    </a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Serie Galaxy Tab S10</h3>
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
                                    <a><img src="/images/S24FE_160x160_pc.webp" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Galaxy Watch Ultra</h3>
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
                                    <a><img src="/images/TabS10_160x160_pc.webp" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Bespoke AI Laundry Combo</h3>
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
                                    <a><img src="/images/Watch-Ultra_160x160_pc.webp" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Odyssey OLED G8</h3>
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
                                        src={isMobile ? "/images/TV-HOME_B6_Merchandising_624x352_mo_LTR.jpg" : "/images/TV-HOME_B6_Merchandising_684x684_pc.jpg"}
                                        alt=""
                                    />
                                </a>

                                <div className="p-text">
                                    <h3>The Frame</h3>
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
                                        <img src="/images/HW-Q990B-movi-v2.webp" alt=""/>
                                    </a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Serie Galaxy Tab S10</h3>
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
                                    <a><img src="/images/HW-S800B-movil-v2.webp" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Galaxy Watch Ultra</h3>
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
                                    <a><img src="/images/QN800C_192x192.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Bespoke AI Laundry Combo</h3>
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
                                    <a><img src="/images/QN85C_192x192.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Odyssey OLED G8</h3>
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
                                        src={isMobile ? "/images/Large-Tile-MO-DA-Pre-order.jpg" : "/images/Large-Tile-PC-DA-Pre-order.jpg"}
                                        alt=""
                                    />
                                </a>

                                <div className="p-text">
                                    <h3>Bespoke AI</h3>
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
                                        <img src="/images/Family_Hub_desktop_160X160.png" alt=""/>
                                    </a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Bespoke Family Hub</h3>
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
                                    <a><img src="/images/T_combo_desktop_160X160.webp" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Bespoke AI Laundry Combo</h3>
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
                                    <a><img src="/images/Kitchen_192X192.webp" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Cocina Bespoke</h3>
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
                                    <a><img src="/images/Dishawasher_192x192.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Lavaplatos Bespoke</h3>
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
                                        src={isMobile ? "/images/OLEDG8_HOME_B6_Merchandising_624x352_mo_LTR-.webp" : "/images/OLEDG8_HOME_B6_Merchandising_684x684_pc.jpg"}
                                        alt=""
                                    />
                                </a>

                                <div className="p-text">
                                    <h3>Odyssey OLED G8</h3>
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
                                        <img src="/images/G6mobile_192X192.webp" alt=""/>
                                    </a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Odyssey OLED G6</h3>
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
                                    <a><img src="/images/M7mobile_192X192.webp" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Smart Monitor M7</h3>
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
                                    <a><img src="/images/S7mobile_192X192.png" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>ViewFinity S7</h3>
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
                                    <a><img src="/images/M8mobile_192X192.webp" alt=""/></a>
                                    <h4>Nuevo</h4>
                                    <div className="p-text">
                                        <h3>Smart Monitor M8</h3>
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
                            style={{
                                color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                            }}
                        >Mobile</h1>
                        <ul className="horizontal-scroll">
                            <li>
                                <a className={activeTabTres === 'mobile_uno' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_uno')}>
                                    Galaxy Z Fold6
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_dos' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_dos')}>
                                    Galaxy Z Flip6
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_tres' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_tres')}>
                                    Galaxy S24 FE
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_cuatro' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_cuatro')}>
                                    Serie Galaxy Tab S10
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_cinco' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                       border: activeTabTres === 'mobile_cinco' ? '2px dotted white' : '',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_cinco')}>
                                    Galaxy Watch Ultra
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="mobile-list-bottom">
                        <div className={`tab-content ${activeTabTres === 'mobile_uno' ? 'active' : ''}`}>

                            <h2>Galaxy Z Fold6</h2>
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

                            <h2>Galaxy Z Flip6</h2>
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

                            <h2>Galaxy S24 FE</h2>
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

                            <h2>Serie Galaxy Tab S10</h2>
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
                                style={{
                                    color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                }}
                            >Galaxy Watch Ultra</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a style={{
                                    color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                }}>Más información</a>
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
                            style={{
                                color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                            }}
                        >TV & AV</h1>
                        <ul className="horizontal-scroll">
                            <li>
                                <a className={activeTabTres === 'mobile_uno' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_uno')}>
                                    Samsung AI TV
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_dos' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_dos')}>
                                    Neo QLED 8K
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_tres' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_tres')}>
                                    Neo QLED
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_cuatro' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_cuatro')}>
                                    OLED
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_cinco' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                       border: activeTabTres === 'mobile_cinco' ? '2px dotted white' : '',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_cinco')}>
                                    The Frame
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="mobile-list-bottom">
                        <div className={`tab-content ${activeTabTres === 'mobile_uno' ? 'active' : ''}`}>

                            <h2>Galaxy Z Fold6</h2>
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

                            <h2>Galaxy Z Flip6</h2>
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

                            <h2>Galaxy S24 FE</h2>
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

                            <h2>Serie Galaxy Tab S10</h2>
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
                                style={{
                                    color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                }}
                            >Galaxy Watch Ultra</h2>
                            {/* <p>Get free Galaxy Buds Pro worth AED 739 with every purchase</p> */}
                            <div className="mobile-btn">
                                <a style={{
                                    color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                }}>Más información</a>
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
                            style={{
                                color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                            }}
                        >Línea Blanca</h1>
                        <ul className="horizontal-scroll">
                            <li>
                                <a className={activeTabTres === 'mobile_uno' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_uno')}>
                                    Bespoke AI Laundry Combo
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_dos' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_dos')}>
                                    Bespoke AI ™
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_tres' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_tres')}>
                                    Family Hub
                                </a>
                            </li>
                            <li>
                                <a className={activeTabTres === 'mobile_cuatro' ? 'active' : ''}
                                   style={{
                                       color: activeTabTres === 'mobile_cinco' ? 'white' : 'inherit',
                                   }}
                                   onClick={() => handleTabClickSecTres('mobile_cuatro')}>
                                    Top Mount Freezer
                                </a>
                            </li>

                        </ul>
                    </div>
                    <div className="mobile-list-bottom">
                        <div className={`tab-content ${activeTabTres === 'mobile_uno' ? 'active' : ''}`}>

                            <h2>Galaxy Z Fold6</h2>
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

                            <h2>Galaxy Z Flip6</h2>
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

                            <h2>Galaxy S24 FE</h2>
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

                            <h2>Serie Galaxy Tab S10</h2>
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
            return '/images/New-HOME_Q6_MX-KV_1440x810_pc_LATIN.jpg';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/New-HOME_B6_MX-KV_1440x810_pc_LATIN.jpg';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/New-HOME_R12_MX-KV_1440X810_pc.jpg';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/NewGBM-HOME_TS10-Series_MX-KV_1440x810_pc.jpg';
        case 'mobile_cinco':
            // Aquí defines otras condiciones
            return '/images/New-HOME_TS10-Series_MX-KV_1440x810_pc.jpg';
        default:
            // Imagen por defecto
            return '/images/New-HOME_Q6_MX-KV_1440x810_pc_LATIN.jpg';
    }
};

const getImageNameMobile = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/New-HOME_Q6_MX-KV_720x1280_mo_LATIN.jpg';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/New-HOME_B6_MX-KV_720x1280_mo_LATIN.jpg';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/New-HOME_R12_MX-KV_720X1280_mo.jpg';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/New-HOME_TS10-Series_MX-KV_720x1280_mo.jpg';
        case 'mobile_cinco':
            // Aquí defines otras condiciones
            return '/images/nEW-HOME_GBM-KV_WatchUltra_1440x810_MO_MX.jpg';
        default:
            // Imagen por defecto
            return '/images/New-HOME_Q6_MX-KV_720x1280_mo_LATIN.jpg';
    }
};

// TV
const getImageNameDesktopTV = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/Desktop_AI-Neo-QLED--Pre-order-GBM.jpg';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/NeoQLED8K_GBM_PC.jpg';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/NeoQLED4K_GBM_PC.jpg';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/OLED_GBM_PC.jpg';
        case 'mobile_cinco':
            // Aquí defines otras condiciones
            return '/images/TheFrame_GBM_PC.jpg'
            // Imagen por defecto
            return '/images/Desktop_AI-Neo-QLED--Pre-order-GBM.jpg';
    }
};

const getImageNameMobileTV = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/AI-MO_GBM_NeoQLED_2023_Pre-order.jpg';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/NeoQLED8K_GBM_MO.jpg';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/NeoQLED4K_GBM_MO.jpg';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/OLED_GBM_MO.jpg';
        case 'mobile_cinco':
            // Aquí defines otras condiciones
            return '/images/TheFrame_GBM_MO.jpeg';
        default:
            // Imagen por defecto
            return '/images/AI-MO_GBM_NeoQLED_2023_Pre-order.jpg';
    }
};

// HOME
const getImageNameDesktopHome = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/T-combo-GBM3.jpg';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/BespokeAI-Launch-GBM.jpg';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/Desktop-Family-Hub.jpg';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/TMF-desktop.jpg';
        default:
            // Imagen por defecto
            return '/images/T-combo-GBM3.jpg';
    }
};

const getImageNameMobileHome = (currentImage) => {
    switch (currentImage) {
        case 'mobile_uno':
            // Aquí defines las condiciones para esta imagen
            return '/images/GBM-T-combo-mobile4.jpg';
        case 'mobile_dos':
            // Aquí defines otras condiciones
            return '/images/AI-MO_GBM_BespokeAI_Launch.jpg';
        case 'mobile_tres':
            // Aquí defines otras condiciones
            return '/images/MO-Family-Hub.jpg';
        case 'mobile_cuatro':
            // Aquí defines otras condiciones
            return '/images/GBM-TMF-mobile.jpg';
        default:
            // Imagen por defecto
            return '/images/GBM-T-combo-mobile4.jpg';
    }
};