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
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
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
                icon: ICONS.ecommerce,
                children: [
                    {title: 'Power BI', path: PATH_DASHBOARD.powerBI.vendedor},
                    {title: 'tienda', path: PATH_DASHBOARD.eCommerce.list},
                    {title: 'carrito de compras', path: PATH_DASHBOARD.eCommerce.checkout},
                    {title: 'Catálogo', path: PATH_DASHBOARD.eCommerce.catalogo},
                    {title: 'Clientes', path: PATH_DASHBOARD.eCommerce.clientes},
                    {title: 'Crear Cliente SAP', path: PATH_DASHBOARD.eCommerce.client},
                    {title: 'Imágenes', path: PATH_DASHBOARD.eCommerce.images},

                ],
            },

            // INVOICE
            {
                title: 'Pedidos',
                path: PATH_DASHBOARD.invoice.root,
                icon: ICONS.order,
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
                icon: ICONS.folder,
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
            {title: 'tienda', path: PATH_DASHBOARD.eCommerce.list, icon: ICONS.ecommerce},
            {title: 'Clientes', path: PATH_DASHBOARD.eCommerce.clientes, icon: ICONS.user},
            {title: 'Lista', path: PATH_DASHBOARD.invoice.list, icon: ICONS.order},
        ],
    },

    // 3 - ALPHACELL
    // ----------------------------------------------------------------------
    {
        subheader: 'ALPHACELL',
        items: [
            {title: 'tienda', path: PATH_DASHBOARD.eCommerce.list, icon: ICONS.ecommerce},
            {title: 'ordenes', path: PATH_DASHBOARD.invoice.list, icon: ICONS.order},
            {title: 'Catálogo', path: PATH_DASHBOARD.eCommerce.catalogo, icon: ICONS.product},
            {title: 'Tracking', path: PATH_DASHBOARD.user.tracking, icon: ICONS.label},
        ],
    },

    // 4 - TOMEBAMBA
    // ----------------------------------------------------------------------
    {
        subheader: 'TOMEBAMBA',
        items: [
            {title: 'tienda', path: PATH_DASHBOARD.eCommerce.list, icon: ICONS.ecommerce},
            {title: 'ordenes', path: PATH_DASHBOARD.invoice.list, icon: ICONS.order},
            {title: 'catalogo', path: PATH_DASHBOARD.eCommerce.tomebamba_catalogo, icon: ICONS.product},
        ],
    },

    // 5 - SERVICIO TÉCNICO
    // ----------------------------------------------------------------------
    {
        subheader: 'SERVICIO TÉCNICO',
        items: [
            {title: 'Ingresar Orden', path: PATH_DASHBOARD.st.ingresarOrden, icon: ICONS.order},
            {title: 'Servientrega', path: PATH_DASHBOARD.st.garantia, icon: ICONS.external},
            {title: 'Gestión Orden', path: PATH_DASHBOARD.st.gestionOrden, icon: ICONS.params},
            {title: 'Crear NC SAP', path: PATH_DASHBOARD.st.crearNC, icon: ICONS.invoice},
            {title: 'Reporte ST', path: PATH_DASHBOARD.st.reporteOrden, icon: ICONS.analytics},
            // { title: 'create', path: PATH_DASHBOARD.blog.new },
        ],
    },


    // 6 - CLIENTES
    // ----------------------------------------------------------------------
    {
        subheader: 'CLIENTES',
        items: [
            {title: 'dashboard', path: PATH_DASHBOARD.root, icon: ICONS.dashboard},
            {title: 'tienda', path: PATH_DASHBOARD.eCommerce.shop, icon: ICONS.ecommerce},
            {title: 'ordenes', path: PATH_DASHBOARD.invoice.list, icon: ICONS.order},
            {title: 'Servicio Técnico', path: PATH_DASHBOARD.st.ingresarOrden, icon: ICONS.folder},
            {title: 'Programa HT Recompensas', path: PATH_DASHBOARD.customer.root, icon: ICONS.banking},
        ],
    },

    // 7 - CRÉDITO PVP
    // ----------------------------------------------------------------------
    {
        subheader: 'CRÉDITO PVP',
        items: [
            {title: 'Cliente', path: PATH_DASHBOARD.blank, icon: ICONS.user},
            {title: 'Equifax', path: PATH_DASHBOARD.blank, icon: ICONS.lock},
            {title: 'Perfil Económico', path: PATH_DASHBOARD.blank, icon: ICONS.analytics},
            {title: 'Referencias', path: PATH_DASHBOARD.blank, icon: ICONS.file},
            {title: 'Productos', path: PATH_DASHBOARD.blank, icon: ICONS.product},
            {title: 'Documentos Imprimir', path: PATH_DASHBOARD.blank, icon: ICONS.folder},
        ],
    },

    // 8 - RRHH
    // ----------------------------------------------------------------------
    {
        subheader: 'RRHH',
        items: [
            {title: 'Marcar', path: PATH_DASHBOARD.rrhh.marcar, icon: ICONS.booking},
            {title: 'Reporte', path: PATH_DASHBOARD.rrhh.reporte_rrhh, icon: ICONS.analytics},
        ],
    },

    // 9 - GENERAR DOCUMENTOS CREDITO
    // ----------------------------------------------------------------------
    {
        subheader: 'UANATACA - MAYORISTAS',
        items: [
            {title: 'Crear Natural', path: PATH_DASHBOARD.credito.natural_crear, icon: ICONS.user},
            {title: 'Crear Jurídica', path: PATH_DASHBOARD.credito.juridica_crear, icon: ICONS.user},
            {title: 'Consultar', path: PATH_DASHBOARD.credito.cargar, icon: ICONS.folder},
            // {title: 'Equifax', path: PATH_DASHBOARD.credito.auth_equifax, icon: ICONS.blog},
        ],
    },

    // 10 - Gestión de Pedidos y Despacho
    // ----------------------------------------------------------------------
    {
        subheader: 'GESTIÓN PEDIDOS Y DESPACHO',
        items: [
            {title: 'Manifiesto', path: PATH_DASHBOARD.reports.manifest, icon: ICONS.params},
        //     {title: 'Producción', path: PATH_DASHBOARD.credito.juridica_crear, icon: ICONS.job},
        //     {title: 'Despacho', path: PATH_DASHBOARD.credito.cargar, icon: ICONS.booking},
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
