import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function fDateCustom(date) {
    const fm =  'dd-MM-yyyy';
    return date ? format(new Date(date), fm) : '';
}

export function fDateCustomDateAndTime(date) {
    const fm =  'dd-MM-yyyy HH:mm:ss';
    return date ? format(new Date(date), fm) : '';
}
