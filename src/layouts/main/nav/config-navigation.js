// routes
import { PATH_AUTH, PATH_DOCS, PATH_PAGE } from '../../../routes/paths';
// config
import { PATH_AFTER_LOGIN } from '../../../config-global';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const navConfig = [
  {
    title: 'Nosotros',
    icon: <Iconify icon="eva:home-fill" />,
    path: PATH_PAGE.about,
  },
  {
    title: 'Contacto',
    icon: <Iconify icon="ic:round-grain" />,
    path: PATH_PAGE.contact,
  },
  {
    title: 'Categorias/Marcas',
    path: '/pages',
    icon: <Iconify icon="eva:file-fill" />,
    children: [
      {
        subheader: 'Celulares',
        items: [

          { title: 'Marca1', path: '/' },
          { title: 'Marca2', path: '/' },
          { title: 'Marca3', path: '/' },
          { title: 'Marca4', path: '/' },
        ],
      },
      {
        subheader: 'Televisores',
        items: [
          { title: 'Marca1', path: '/' },
          { title: 'Marca2', path: '/' },
          { title: 'Marca3', path: '/' },
          { title: 'Marca4', path: '/' },
        ],
      },
      {
        subheader: 'Tablets',
        items: [
          { title: 'Marca1', path: '/' },
          { title: 'Marca2', path: '/' },
          { title: 'Marca3', path: '/' },
          { title: 'Marca4', path: '/' },
        ],
      },
      {
        subheader: 'Accesorios',
        items: [
          { title: 'Marca1', path: '/' },
          { title: 'Marca2', path: '/' },
          { title: 'Marca3', path: '/' },
          { title: 'Marca4', path: '/' },
        ],
      },
      // {
      //   subheader: 'Dashboard',
      //   items: [{ title: 'Dashboard', path: PATH_AFTER_LOGIN }],
      // },
    ],
  },
  {
    title: 'SuperCias',
    icon: <Iconify icon="eva:book-open-fill" />,
    path: PATH_DOCS.root,
  },
];

export default navConfig;
