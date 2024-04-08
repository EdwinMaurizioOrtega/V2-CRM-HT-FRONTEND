import PropTypes from 'prop-types';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import useResponsive from 'src/hooks/useResponsive';

// ----------------------------------------------------------------------

export default function CustomDateRangePicker({
  title = 'Seleccionar rango de fechas',
  variant = 'input',
  //
  startDate,
  endDate,
  //
  onChangeStartDate,
  onChangeEndDate,
  //
  open,
  onClose,
  //
  error,
}) {
  const mdUp = useResponsive('up', 'lg');

  const isCalendarView = variant === 'calendar';

  return (
    <Dialog
      fullWidth
      maxWidth={isCalendarView ? false : 'xs'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...(isCalendarView && {
            maxWidth: 720,
          }),
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent
        sx={{
          ...(isCalendarView &&
            mdUp && {
              overflow: 'unset',
            }),
        }}
      >
        <Stack
          justifyContent="center"
          spacing={isCalendarView ? 3 : 2}
          direction={isCalendarView && mdUp ? 'row' : 'column'}
          sx={{ pt: 1 }}
        >
          {isCalendarView ? (
            <>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: 'divider',
                  borderStyle: 'dashed',
                }}
              >
                <DateCalendar value={startDate} onChange={onChangeStartDate} />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: 'divider',
                  borderStyle: 'dashed',
                }}
              >
                <DateCalendar value={endDate} onChange={onChangeEndDate} />
              </Paper>
            </>
          ) : (
            <>
              <DatePicker label="Fecha de inicio" value={startDate} onChange={onChangeStartDate} />

              <DatePicker label="Fecha final" value={endDate} onChange={onChangeEndDate} />
            </>
          )}
        </Stack>

        {error && (
          <FormHelperText error sx={{ px: 2 }}>
            La fecha de finalización debe ser posterior a la fecha de inicio.
          </FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancelar
        </Button>

        <Button disabled={error} variant="contained" onClick={onClose}>
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CustomDateRangePicker.propTypes = {
  error: PropTypes.bool,
  onChangeEndDate: PropTypes.func,
  onChangeStartDate: PropTypes.func,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['input', 'calendar']),
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
};
