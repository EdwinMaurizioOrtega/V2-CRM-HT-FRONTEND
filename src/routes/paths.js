// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  register: path(ROOTS_AUTH, '/register'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  newPassword: path(ROOTS_AUTH, '/new-password'),
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  kanban: path(ROOTS_DASHBOARD, '/kanban'),
  calendar: path(ROOTS_DASHBOARD, '/calendar'),
  fileManager: path(ROOTS_DASHBOARD, '/files-manager'),
  permissionDenied: path(ROOTS_DASHBOARD, '/permission-denied'),
  blank: path(ROOTS_DASHBOARD, '/blank'),
  general: {
    app: path(ROOTS_DASHBOARD, '/app'),
    ecommerce: path(ROOTS_DASHBOARD, '/ecommerce'),
    analytics: path(ROOTS_DASHBOARD, '/analytics'),
    banking: path(ROOTS_DASHBOARD, '/banking'),
    booking: path(ROOTS_DASHBOARD, '/booking'),
    file: path(ROOTS_DASHBOARD, '/file'),
  },

  powerBI: {
    root: path(ROOTS_DASHBOARD, '/microsoft-power-bi'),
    gerencia: path(ROOTS_DASHBOARD, '/microsoft-power-bi/gerencia-power-bi'),
    administrativo: path(ROOTS_DASHBOARD, '/microsoft-power-bi/administrativo'),
    cartera: path(ROOTS_DASHBOARD, '/microsoft-power-bi/cartera'),
    vendedor: path(ROOTS_DASHBOARD, '/microsoft-power-bi/vendedor'),
    // david_granda: path(ROOTS_DASHBOARD, '/microsoft-power-bi/david_granda'),
    // alexandra_nunez: path(ROOTS_DASHBOARD, '/microsoft-power-bi/alexandra_nunez'),
    // michelle_calderon: path(ROOTS_DASHBOARD, '/microsoft-power-bi/michelle_calderon'),

  },
  mail: {
    root: path(ROOTS_DASHBOARD, '/mail'),
    all: path(ROOTS_DASHBOARD, '/mail/all'),
  },
  chat: {
    root: path(ROOTS_DASHBOARD, '/chat'),
    new: path(ROOTS_DASHBOARD, '/chat/new'),
    view: (name) => path(ROOTS_DASHBOARD, `/chat/${name}`),
  },
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    new: path(ROOTS_DASHBOARD, '/user/new'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    account: path(ROOTS_DASHBOARD, '/user/account'),
    edit: (name) => path(ROOTS_DASHBOARD, `/user/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`),
    tracking: path(ROOTS_DASHBOARD, `/user/tracking`),
  },
  eCommerce: {
    root: path(ROOTS_DASHBOARD, '/e-commerce'),
    shop: path(ROOTS_DASHBOARD, '/e-commerce/shop'),
    list: path(ROOTS_DASHBOARD, '/e-commerce/list'),
    checkout: path(ROOTS_DASHBOARD, '/e-commerce/checkout'),
    catalogo: path(ROOTS_DASHBOARD, '/e-commerce/catalogo'),
    clientes: path(ROOTS_DASHBOARD, '/e-commerce/ConsultClients'),
    client: path(ROOTS_DASHBOARD, '/e-commerce/CreateClient'),
    images: path(ROOTS_DASHBOARD, '/e-commerce/gestion-imagenes'),
    tomebamba_catalogo: path(ROOTS_DASHBOARD, '/e-commerce/CatalogoTomebamba'),
    new: path(ROOTS_DASHBOARD, '/e-commerce/product/new'),
    view: (name) => path(ROOTS_DASHBOARD, `/e-commerce/product/${name}`),
    edit: (name) => path(ROOTS_DASHBOARD, `/e-commerce/product/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-blazer-low-77-vintage/edit'),
    demoView: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-air-force-1-ndestrukt'),
  },
  invoice: {
    root: path(ROOTS_DASHBOARD, '/invoice'),
    list: path(ROOTS_DASHBOARD, '/invoice/list'),
    sap: path(ROOTS_DASHBOARD, '/invoice/imeis'),
    cargar_evidencia: path(ROOTS_DASHBOARD, '/invoice/cargar_evidencia'),
    validar_evidencia: path(ROOTS_DASHBOARD, '/invoice/validar_evidencia'),
    new: path(ROOTS_DASHBOARD, '/invoice/new'),
    view: (id) => path(ROOTS_DASHBOARD, `/invoice/${id}`),
    edit: (id) => path(ROOTS_DASHBOARD, `/invoice/${id}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1/edit'),
    demoView: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5'),
  },
  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    posts: path(ROOTS_DASHBOARD, '/blog/posts'),
    new: path(ROOTS_DASHBOARD, '/blog/new'),
    view: (title) => path(ROOTS_DASHBOARD, `/blog/post/${title}`),
    demoView: path(ROOTS_DASHBOARD, '/blog/post/apply-these-7-secret-techniques-to-improve-event'),
  },
  gestion: {
    root: path(ROOTS_DASHBOARD, '/ge'),
    mayorista: path(ROOTS_DASHBOARD, '/gestion/mayorista'),
    cfinal: path(ROOTS_DASHBOARD, '/gestion/cfinal'),
  },
  st: {
    root: path(ROOTS_DASHBOARD, '/st'),
    garantia: path(ROOTS_DASHBOARD, '/st/garantia'),
    ingresarOrden: path(ROOTS_DASHBOARD, '/st/CrearOrden'),
    gestionOrden: path(ROOTS_DASHBOARD, '/st/GestionGarantia'),
    crearNC: path(ROOTS_DASHBOARD, '/st/CrearNotaCreditoSAP'),
    reporteOrden: path(ROOTS_DASHBOARD, '/st/ReporteST'),
  },
  customer: {
    root: path(ROOTS_DASHBOARD, '/customer'),
  }
};

export const PATH_DOCS = {
  root: '/',
  changelog: 'https://docs.minimals.cc/changelog',
};

export const PATH_ZONE_ON_STORE = 'https://mui.com/store/items/zone-landing-page/';

export const PATH_MINIMAL_ON_STORE = '/auth/login/';

export const PATH_FREE_VERSION = 'https://mui.com/store/items/minimal-dashboard-free/';

export const PATH_FIGMA_PREVIEW =
  'https://www.figma.com/file/rWMDOkMZYw2VpTdNuBBCvN/%5BPreview%5D-Minimal-Web.26.11.22?node-id=0%3A1&t=ya2mDFiuhTXXLLF1-1';
