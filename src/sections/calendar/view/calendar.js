import FullCalendar from '@fullcalendar/react'; // => request placed at the top
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';

import { useState, useRef, useEffect, useCallback } from 'react';

// @mui
import { Card, Button, Container, DialogTitle, Dialog } from '@mui/material';
import {useSnackbar} from "notistack";
import {useSettingsContext} from "../../../components/settings";
import {useDispatch, useSelector} from "react-redux";
import {useDateRangePicker} from "../../../components/date-range-picker";
import useResponsive from "../../../hooks/useResponsive";
import {useAuthContext} from "../../../auth/useAuthContext";
import {getEvents} from "../../../redux/slices/calendar";
import {fTimestamp} from "../../../utils/formatTime";
import {CalendarForm, CalendarToolbar, StyledCalendar} from "../../@dashboard/calendar";

// ----------------------------------------------------------------------

const COLOR_OPTIONS = [
  '#00AB55', // theme.palette.primary.main,
  '#1890FF', // theme.palette.info.main,
  '#54D62C', // theme.palette.success.main,
  '#FFC107', // theme.palette.warning.main,
  '#FF4842', // theme.palette.error.main
  '#04297A', // theme.palette.info.darker
  '#7A0C2E', // theme.palette.error.darker
];

// ----------------------------------------------------------------------


// ----------------------------------------------------------------------

export default function CalendarView() {
  const { enqueueSnackbar } = useSnackbar();


  const dispatch = useDispatch();

  const isDesktop = useResponsive('up', 'sm');

  const calendarRef = useRef(null);

  const events = useGetEvents();

  const [openForm, setOpenForm] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState(null);

  const [selectedRange, setSelectedRange] = useState(null);

  const selectedEvent = useSelector(() => {
    if (selectedEventId) {
      return events.find((event) => event.id === selectedEventId);
    }

    return null;
  });

  const picker = useDateRangePicker(null, null);

  const [date, setDate] = useState(new Date());

  const [openFilter, setOpenFilter] = useState(false);

  const [filterEventColor, setFilterEventColor] = useState([]);

  const [view, setView] = useState(isDesktop ? 'dayGridMonth' : 'listWeek');

  useEffect(() => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      const newView = isDesktop ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [isDesktop]);

  const handleOpenModal = () => {
    setOpenForm(true);
  };

  const handleCloseModal = () => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectedEventId(null);
  };

  const handleClickToday = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  };

  const handleChangeView = (newView) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(newView);
      setView(newView);
    }
  };

  const handleClickDatePrev = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  };

  const handleClickDateNext = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  };

  const handleSelectRange = (arg) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.unselect();
    }
    handleOpenModal();
    setSelectedRange({
      start: arg.start,
      end: arg.end,
    });
  };

  const handleSelectEvent = (arg) => {
    handleOpenModal();
    setSelectedEventId(arg.event.id);
  };

  const handleResizeEvent = ({ event }) => {
    try {
      dispatch(
        updateEvent(event.id, {
          allDay: event.allDay,
          start: event.start,
          end: event.end,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDropEvent = ({ event }) => {
    try {
      dispatch(
        updateEvent(event.id, {
          allDay: event.allDay,
          start: event.start,
          end: event.end,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateUpdateEvent = (newEvent) => {
    if (selectedEventId) {
      dispatch(updateEvent(selectedEventId));
      enqueueSnackbar('Update success!');
    } else {
      dispatch(createEvent(newEvent));
      enqueueSnackbar('Create success!');
    }
  };

  const handleDeleteEvent = () => {
    try {
      if (selectedEventId) {
        handleCloseModal();
        dispatch(deleteEvent(selectedEventId));
        enqueueSnackbar('Delete success!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterEventColor = (eventColor) => {
    const checked = filterEventColor.includes(eventColor)
      ? filterEventColor.filter((value) => value !== eventColor)
      : [...filterEventColor, eventColor];

    setFilterEventColor(checked);
  };

  const handleResetFilter = () => {
    const { setStartDate, setEndDate } = picker;

    if (setStartDate && setEndDate) {
      setStartDate(null);
      setEndDate(null);
    }

    setFilterEventColor([]);
  };

  const dataFiltered = applyFilter({
    inputData: events,
    filterEventColor,
    filterStartDate: picker.startDate,
    filterEndDate: picker.endDate,
    isError: !!picker.isError,
  });

  // const dataFiltered = [
  //   { title: 'Meeting', start: new Date() },
  //   { title: 'Meeting', start: new Date() },
  //   { title: 'Meeting', start: new Date() }
  // ]

  return (
    <>
        <Card>
          <StyledCalendar>
            <CalendarToolbar
              date={date}
              view={view}
              onNextDate={handleClickDateNext}
              onPrevDate={handleClickDatePrev}
              onToday={handleClickToday}
              onChangeView={handleChangeView}
              onOpenFilter={() => setOpenFilter(true)}
            />

            <FullCalendar
              weekends
              editable
              droppable
              selectable
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              initialDate={date}
              initialView={view}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={dataFiltered}
              headerToolbar={false}
              initialEvents={events}
              select={handleSelectRange}
              eventDrop={handleDropEvent}
              eventClick={handleSelectEvent}
              eventResize={handleResizeEvent}
              height={isDesktop ? 720 : 'auto'}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
            />
          </StyledCalendar>
        </Card>


      <Dialog fullWidth maxWidth="xs" open={openForm} onClose={handleCloseModal}>
        <DialogTitle>{selectedEvent ? 'Cerrar Evento Agenda' : 'Add Event'}</DialogTitle>

        <CalendarForm
          event={selectedEvent}
          range={selectedRange}
          onCancel={handleCloseModal}
          onCreateUpdateEvent={handleCreateUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          colorOptions={COLOR_OPTIONS}
        />
      </Dialog>

      {/*<CalendarFilterDrawer*/}
      {/*  events={events}*/}
      {/*  picker={picker}*/}
      {/*  openFilter={openFilter}*/}
      {/*  colorOptions={COLOR_OPTIONS}*/}
      {/*  onResetFilter={handleResetFilter}*/}
      {/*  filterEventColor={filterEventColor}*/}
      {/*  onCloseFilter={() => setOpenFilter(false)}*/}
      {/*  onFilterEventColor={handleFilterEventColor}*/}
      {/*  onSelectEvent={(eventId) => {*/}
      {/*    if (eventId) {*/}
      {/*      handleOpenModal();*/}
      {/*      setSelectedEventId(eventId);*/}
      {/*    }*/}
      {/*  }}*/}
      {/*/>*/}
    </>
  );
}

// ----------------------------------------------------------------------

const useGetEvents = () => {
  const dispatch = useDispatch();

  const { user } = useAuthContext();


  const { events: data } = useSelector((state) => state.calendar);

  console.log("data: "+ JSON.stringify( data) );
  // console.log("events: "+ JSON.stringify( events) );

  const getAllEvents = useCallback(() => {
    dispatch(getEvents(user));
  }, [dispatch]);

  useEffect(() => {
    getAllEvents();
  }, [getAllEvents]);

  const events = data.map((event) => ({
    //...event,
    // textColor: event.color,
    id: event.ID,
    title:  event.CLIENTE,
    start: new Date(event.FECHA),
    // allDay: true,
    description: `${event.CLIENTE} ${event.CLIENTE_ID} ${event.NOTA} ${event.VISITO ? "CERRADO" : "NO CERRADO"}`
  }));


  console.log("events: "+ JSON.stringify( events) );

  return events;
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, filterEventColor, filterStartDate, filterEndDate, isError }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterEventColor.length) {
    inputData = inputData.filter((event) => filterEventColor.includes(event.color));
  }

  if (filterStartDate && filterEndDate && !isError) {
    inputData = inputData.filter(
      (event) =>
        fTimestamp(event.start) >= fTimestamp(filterStartDate) &&
        fTimestamp(event.end) <= fTimestamp(filterEndDate)
    );
  }

  console.log("inputData: "+  JSON.stringify(inputData));
  return inputData;
}
