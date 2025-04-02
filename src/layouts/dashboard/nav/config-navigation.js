// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// components
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
    <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{width: 1, height: 1}}/>
);

const ICONS = {
    blog: icon('ic_blog'),
    cart: icon('ic_cart'),
    chat: icon('ic_chat'),
    mail: icon('ic_mail'),
    user: icon('ic_user'),
    file: icon('ic_file'),
    lock: icon('ic_lock'),
    label: icon('ic_label'),
    blank: icon('ic_blank'),
    kanban: icon('ic_kanban'),
    folder: icon('ic_folder'),
    banking: icon('ic_banking'),
    booking: icon('ic_booking'),
    invoice: icon('ic_invoice'),
    calendar: icon('ic_calendar'),
    disabled: icon('ic_disabled'),
    external: icon('ic_external'),
    menuItem: icon('ic_menu_item'),
    ecommerce: icon('ic_ecommerce'),
    analytics: icon('ic_analytics'),
    dashboard: icon('ic_dashboard'),
};

const navConfig = [
    // 0 - GENERAL
    // ----------------------------------------------------------------------
    {
        subheader: 'overview',
        items: [
            {title: 'app', path: PATH_DASHBOARD.general.app, icon: ICONS.dashboard},
            {
                title: 'Power BI',
                path: PATH_DASHBOARD.powerBI.root,
                icon: ICONS.analytics,
                children: [
                    {title: 'Gerencia', path: PATH_DASHBOARD.powerBI.gerencia},
                    {title: 'Administrativo', path: PATH_DASHBOARD.powerBI.administrativo},
                    {title: 'Cartera', path: PATH_DASHBOARD.powerBI.cartera},

                    // {title: 'Vendedor', path: PATH_DASHBOARD.powerBI.vendedor},

                    // {title: 'David Granda', path: PATH_DASHBOARD.powerBI.david_granda},
                    // {title: 'Alexandra Nuñez', path: PATH_DASHBOARD.powerBI.alexandra_nunez},
                    // {title: 'Michelle Calderón', path: PATH_DASHBOARD.powerBI.michelle_calderon},
                ],

            },
            {
                title: 'calendar M.',
                path: PATH_DASHBOARD.calendar,
                icon: ICONS.calendar,
            },
        ],
    },

    // 1 - MANAGEMENT
    // ----------------------------------------------------------------------
    {
        subheader: 'management',
        items: [
            // USER
            {
                title: 'Usuarios/Clientes',
                path: PATH_DASHBOARD.user.root,
                icon: ICONS.user,
                children: [
                    {title: 'Tracking', path: PATH_DASHBOARD.user.tracking},
                ],
            },

            // E-COMMERCE
            {
                title: 'ecommerce',
                path: PATH_DASHBOARD.eCommerce.root,
                icon: ICONS.cart,
                children: [
                    {title: 'Power BI', path: PATH_DASHBOARD.powerBI.vendedor},
                    {title: 'tienda', path: PATH_DASHBOARD.eCommerce.list},
                    {title: 'carrito de compras', path: PATH_DASHBOARD.eCommerce.checkout},
                    {title: 'Catálogo', path: PATH_DASHBOARD.eCommerce.catalogo},
                    {title: 'Clientes', path: PATH_DASHBOARD.eCommerce.clientes},
                    {title: 'Crear Cliente', path: PATH_DASHBOARD.eCommerce.client},
                    {title: 'Imágenes', path: PATH_DASHBOARD.eCommerce.images},

                ],
            },

            // INVOICE
            {
                title: 'Pedidos',
                path: PATH_DASHBOARD.invoice.root,
                icon: ICONS.invoice,
                children: [
                    {title: 'Lista', path: PATH_DASHBOARD.invoice.list},
                    {title: 'IMEIs', path: PATH_DASHBOARD.invoice.sap},
                    {title: 'Cargar Evidencia', path: PATH_DASHBOARD.invoice.cargar_evidencia},
                    {title: 'Validar Evidencia', path: PATH_DASHBOARD.invoice.validar_evidencia},
                    {title: 'SAP Series', path: PATH_DASHBOARD.invoice.series},
                ],
            },

            // BLOG
            {
                title: 'Gestión',
                path: PATH_DASHBOARD.gestion.root,
                icon: ICONS.blog,
                children: [
                    {title: 'Mayoristas', path: PATH_DASHBOARD.gestion.mayorista},
                    {title: 'C. Finales', path: PATH_DASHBOARD.gestion.cfinal},
                ],
            },


        ],
    },

    // 2 - INFINIX
    // ----------------------------------------------------------------------
    {
        subheader: 'INFINIX',
        items: [
            {title: 'tienda', path: PATH_DASHBOARD.eCommerce.list, icon: ICONS.calendar,},
            {title: 'Clientes', path: PATH_DASHBOARD.eCommerce.clientes, icon: ICONS.kanban,},
            {title: 'Lista', path: PATH_DASHBOARD.invoice.list, icon: ICONS.banking,},
        ],
    },

    // 3 - ALPHACELL
    // ----------------------------------------------------------------------
    {
        subheader: 'ALPHACELL',
        items: [
            {title: 'tienda', path: PATH_DASHBOARD.eCommerce.list, icon: ICONS.analytics},
            {title: 'ordenes', path: PATH_DASHBOARD.invoice.list, icon: ICONS.analytics},
            {title: 'Catálogo', path: PATH_DASHBOARD.eCommerce.catalogo, icon: ICONS.analytics},
            {title: 'Tracking', path: PATH_DASHBOARD.user.tracking, icon: ICONS.analytics},
        ],
    },

    // 4 - TOMEBAMBA
    // ----------------------------------------------------------------------
    {
        subheader: 'TOMEBAMBA',
        items: [
            {title: 'tienda', path: PATH_DASHBOARD.eCommerce.list, icon: ICONS.analytics},
            {title: 'ordenes', path: PATH_DASHBOARD.invoice.list, icon: ICONS.analytics},
            {title: 'catalogo', path: PATH_DASHBOARD.eCommerce.tomebamba_catalogo, icon: ICONS.analytics},
        ],
    },

    // 5 - SERVICIO TÉCNICO
    // ----------------------------------------------------------------------
    {
        subheader: 'SERVICIO TÉCNICO',
        items: [
            {title: 'Ingresar Orden', path: PATH_DASHBOARD.st.ingresarOrden, icon: ICONS.external},
            {title: 'Servientrega', path: PATH_DASHBOARD.st.garantia, icon: ICONS.folder},
            {title: 'Gestión Orden', path: PATH_DASHBOARD.st.gestionOrden, icon: ICONS.file},
            {title: 'Crear NC SAP', path: PATH_DASHBOARD.st.crearNC, icon: ICONS.blank},
            {title: 'Reporte ST', path: PATH_DASHBOARD.st.reporteOrden, icon: ICONS.disabled},
            // { title: 'create', path: PATH_DASHBOARD.blog.new },
        ],
    },


    // 6 - CLIENTES
    // ----------------------------------------------------------------------
    {
        subheader: 'CLIENTES',
        items: [
            {title: 'dashboard', path: PATH_DASHBOARD.root, icon: ICONS.analytics},
            {title: 'tienda', path: PATH_DASHBOARD.eCommerce.shop, icon: ICONS.cart},
            {title: 'ordenes', path: PATH_DASHBOARD.invoice.list, icon: ICONS.booking},
            {title: 'Servicio Técnico', path: PATH_DASHBOARD.st.ingresarOrden, icon: ICONS.chat},
            {title: 'Programa HT Recompensas', path: PATH_DASHBOARD.customer.root, icon: ICONS.banking},
        ],
    },

    // 7 - CRÉDITO PVP
    // ----------------------------------------------------------------------
    {
        subheader: 'CRÉDITO PVP',
        items: [
            {title: 'Cliente', path: PATH_DASHBOARD.blank, icon: ICONS.analytics},
            {title: 'Equifax', path: PATH_DASHBOARD.blank, icon: ICONS.blog},
            {title: 'Perfil Económico', path: PATH_DASHBOARD.blank, icon: ICONS.cart},
            {title: 'Referencias', path: PATH_DASHBOARD.blank, icon: ICONS.file},
            {title: 'Productos', path: PATH_DASHBOARD.blank, icon: ICONS.user},
            {title: 'Documentos Imprimir', path: PATH_DASHBOARD.blank, icon: ICONS.banking},
        ],
    },

    // 8 - RRHH
    // ----------------------------------------------------------------------
    {
        subheader: 'RRHH',
        items: [
            {title: 'Marcar', path: PATH_DASHBOARD.rrhh.marcar, icon: ICONS.analytics},
            {title: 'Reporte', path: PATH_DASHBOARD.rrhh.reporte_rrhh, icon: ICONS.blog},
        ],
    },

    // 9 - GENERAR DOCUMENTOS CREDITO
    // ----------------------------------------------------------------------
    {
        subheader: 'CREADOR DOCUMENTOS ONLINE',
        items: [
            {title: 'Validar', path: PATH_DASHBOARD.credito.cargar, icon: ICONS.analytics},
            {title: 'Estados', path: PATH_DASHBOARD.rrhh.reporte_rrhh, icon: ICONS.blog},
            {title: 'Consultar', path: PATH_DASHBOARD.rrhh.reporte_rrhh, icon: ICONS.blog},
        ],
    },

    // DEMO MENU STATES
    {
        subheader: '-_-',
        items: [
            {
                title: 'item_by_roles',
                path: PATH_DASHBOARD.permissionDenied,
                icon: ICONS.lock,
                roles: ['admin'],
                caption: 'only_admin_can_see_this_item',
            },
        ],
    },
];

export default navConfig;
