// ----------------------------------------------------------------------

export default function Breadcrumbs(theme) {
  return {
    MuiBreadcrumbs: {
      styleOverrides: {
        ol: {
          rowGap: theme.spacing(0.5),
          columnGap: theme.spacing(2),
        },
        separator: {
          margin: 0,
        },
        li: {
          display: 'inline-flex',
          '& > *': {
            ...theme.typography.body2,
          },
        },
      },
    },
  };
}
