// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
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
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'overview',
    items: [
      { title: 'app', path: PATH_DASHBOARD.general.app, icon: ICONS.dashboard },
      // { title: 'ecommerce', path: PATH_DASHBOARD.general.ecommerce, icon: ICONS.ecommerce },
      { title: 'analytics M.', path: PATH_DASHBOARD.general.analytics, icon: ICONS.analytics },
      // { title: 'banking', path: PATH_DASHBOARD.general.banking, icon: ICONS.banking },
      // { title: 'booking', path: PATH_DASHBOARD.general.booking, icon: ICONS.booking },
      // { title: 'file', path: PATH_DASHBOARD.general.file, icon: ICONS.file },
      {
        title: 'calendar M.',
        path: PATH_DASHBOARD.calendar,
        icon: ICONS.calendar,
      },
    ],
  },

  // MANAGEMENT
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
          //{ title: 'perfil', path: PATH_DASHBOARD.user.profile },
          // { title: 'cards', path: PATH_DASHBOARD.user.cards },
          //{ title: 'lista', path: PATH_DASHBOARD.user.list },
          //{ title: 'crear', path: PATH_DASHBOARD.user.new },
          // { title: 'edit', path: PATH_DASHBOARD.user.demoEdit },
          // { title: 'cuenta', path: PATH_DASHBOARD.user.account },
          { title: 'Tracking', path: PATH_DASHBOARD.user.tracking },
        ],
      },

      // E-COMMERCE
      {
        title: 'ecommerce',
        path: PATH_DASHBOARD.eCommerce.root,
        icon: ICONS.cart,
        children: [
          { title: 'tienda', path: PATH_DASHBOARD.eCommerce.list },
          // { title: 'product', path: PATH_DASHBOARD.eCommerce.demoView },
          // { title: 'list', path: PATH_DASHBOARD.eCommerce.list },
          // { title: 'create', path: PATH_DASHBOARD.eCommerce.new },
          { title: 'carrito de compras', path: PATH_DASHBOARD.eCommerce.checkout },
          { title: 'Catálogo', path: PATH_DASHBOARD.eCommerce.catalogo },
          { title: 'Clientes', path: PATH_DASHBOARD.eCommerce.clientes },

        ],
      },

      // INVOICE
      {
        title: 'Pedidos',
        path: PATH_DASHBOARD.invoice.root,
        icon: ICONS.invoice,
        children: [
          { title: 'Lista', path: PATH_DASHBOARD.invoice.list },
          { title: 'IMEIs', path: PATH_DASHBOARD.invoice.sap },
          // { title: 'details', path: PATH_DASHBOARD.invoice.demoView },
          // { title: 'create', path: PATH_DASHBOARD.invoice.new },
          // { title: 'edit', path: PATH_DASHBOARD.invoice.demoEdit },
        ],
      },

      // BLOG
      {
        title: 'Gestión',
        path: PATH_DASHBOARD.gestion.root,
        icon: ICONS.blog,
        children: [
          { title: 'Mayoristas', path: PATH_DASHBOARD.gestion.mayorista },
          { title: 'C. Finales', path: PATH_DASHBOARD.gestion.cfinal },
          // { title: 'create', path: PATH_DASHBOARD.blog.new },
        ],
      },

        //
      {
        title: 'Servicio Técnico',
        path: PATH_DASHBOARD.st.root,
        icon: ICONS.folder,
        children: [
          { title: 'garantía', path: PATH_DASHBOARD.st.garantia },
          // { title: 'post', path: PATH_DASHBOARD.blog.demoView },
          // { title: 'create', path: PATH_DASHBOARD.blog.new },
        ],
      },
    ],
  },

  // APP
  // ----------------------------------------------------------------------
  {
    subheader: 'INFINIX',
    items: [
      { title: 'tienda', path: PATH_DASHBOARD.eCommerce.list, icon: ICONS.calendar, },
      { title: 'Clientes', path: PATH_DASHBOARD.eCommerce.clientes, icon: ICONS.kanban, },
      { title: 'Lista', path: PATH_DASHBOARD.invoice.list, icon: ICONS.banking, },

      // {
      //   title: 'mail',
      //   path: PATH_DASHBOARD.mail.root,
      //   icon: ICONS.mail,
      //   info: <Label color="error">+32</Label>,
      // },
      // {
      //   title: 'chat',
      //   path: PATH_DASHBOARD.chat.root,
      //   icon: ICONS.chat,
      // },
      // {
      //   title: 'calendar',
      //   path: PATH_DASHBOARD.calendar,
      //   icon: ICONS.calendar,
      // },
      // {
      //   title: 'kanban',
      //   path: PATH_DASHBOARD.kanban,
      //   icon: ICONS.kanban,
      // },
    ],
  },

  {
    subheader: 'ALPHACELL',
    items: [
      { title: 'tienda', path: PATH_DASHBOARD.eCommerce.list },
      { title: 'ordenes', path: PATH_DASHBOARD.invoice.list },
      { title: 'Catálogo', path: PATH_DASHBOARD.eCommerce.catalogo },

    ],
  },

  {
    subheader: 'TOMEBAMBA',
    items: [
      { title: 'tienda', path: PATH_DASHBOARD.eCommerce.list },
      { title: 'ordenes', path: PATH_DASHBOARD.invoice.list },

    ],
  },

  // DEMO MENU STATES
  {
    subheader: '-_-',
    items: [
      {
        // default roles : All roles can see this entry.
        // roles: ['user'] Only users can see this item.
        // roles: ['admin'] Only admin can see this item.
        // roles: ['admin', 'manager'] Only admin/manager can see this item.
        // Reference from 'src/guards/RoleBasedGuard'.
        title: 'item_by_roles',
        path: PATH_DASHBOARD.permissionDenied,
        icon: ICONS.lock,
        roles: ['admin'],
        caption: 'only_admin_can_see_this_item',
      },
      // {
      //   title: 'menu_level',
      //   path: '#/dashboard/menu_level',
      //   icon: ICONS.menuItem,
      //   children: [
      //     {
      //       title: 'menu_level_2a',
      //       path: '#/dashboard/menu_level/menu_level_2a',
      //     },
      //     {
      //       title: 'menu_level_2b',
      //       path: '#/dashboard/menu_level/menu_level_2b',
      //       children: [
      //         {
      //           title: 'menu_level_3a',
      //           path: '#/dashboard/menu_level/menu_level_2b/menu_level_3a',
      //         },
      //         {
      //           title: 'menu_level_3b',
      //           path: '#/dashboard/menu_level/menu_level_2b/menu_level_3b',
      //           children: [
      //             {
      //               title: 'menu_level_4a',
      //               path: '#/dashboard/menu_level/menu_level_2b/menu_level_3b/menu_level_4a',
      //             },
      //             {
      //               title: 'menu_level_4b',
      //               path: '#/dashboard/menu_level/menu_level_2b/menu_level_3b/menu_level_4b',
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   title: 'item_disabled',
      //   path: '#disabled',
      //   icon: ICONS.disabled,
      //   disabled: true,
      // },
      //
      // {
      //   title: 'item_label',
      //   path: '#label',
      //   icon: ICONS.label,
      //   info: (
      //     <Label color="info" startIcon={<Iconify icon="eva:email-fill" />}>
      //       NEW
      //     </Label>
      //   ),
      // },
      // {
      //   title: 'item_caption',
      //   path: '#caption',
      //   icon: ICONS.menuItem,
      //   caption:
      //     'Quisque malesuada placerat nisl. In hac habitasse platea dictumst. Cras id dui. Pellentesque commodo eros a enim. Morbi mollis tellus ac sapien.',
      // },
      // {
      //   title: 'item_external_link',
      //   path: 'https://www.google.com/',
      //   icon: ICONS.external,
      // },
      // {
      //   title: 'blank',
      //   path: PATH_DASHBOARD.blank,
      //   icon: ICONS.blank,
      // },
    ],
  },
];

export default navConfig;
