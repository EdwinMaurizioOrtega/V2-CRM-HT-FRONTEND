import FullCalendar from '@fullcalendar/react'; // => request placed at the top
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';

import {useState, useRef, useEffect, useCallback} from 'react';

// @mui
import {
    Card,
    Button,
    Container,
    DialogTitle,
    Dialog,
    Stack,
    Tabs,
    Tab,
    Box,
    TextField,
    DialogActions
} from '@mui/material';
import {useSnackbar} from "notistack";
import {useSettingsContext} from "../../../components/settings";
import {useDispatch, useSelector} from "react-redux";
import {useDateRangePicker} from "../../../components/date-range-picker";
import useResponsive from "../../../hooks/useResponsive";
import {useAuthContext} from "../../../auth/useAuthContext";
import {getEvents} from "../../../redux/slices/calendar";
import {fTimestamp} from "../../../utils/formatTime";
import {CalendarForm, CalendarToolbar, StyledCalendar} from "../../@dashboard/calendar";
import Iconify from "../../../components/iconify";
import {MotionContainer} from "../../../components/animate";
import {MobileDateTimePicker} from "@mui/x-date-pickers";
import FormProvider, {RHFTextField, RHFSwitch} from '../../../components/hook-form';

import {yupResolver} from "@hookform/resolvers/yup";
import {Controller, useForm} from "react-hook-form";
import {updateEvent} from "../../../redux/slices/calendar";

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

export default function CalendarView({onValorCambiado}) {
    const {enqueueSnackbar} = useSnackbar();


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

    // const handleResizeEvent = ({event}) => {
    //     try {
    //         dispatch(
    //             updateEvent(event.id, {
    //                 allDay: event.allDay,
    //                 start: event.start,
    //                 end: event.end,
    //             })
    //         );
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    // const handleDropEvent = ({event}) => {
    //     try {
    //         dispatch(
    //             updateEvent(event.id, {
    //                 allDay: event.allDay,
    //                 start: event.start,
    //                 end: event.end,
    //             })
    //         );
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    const handleCreateUpdateEvent = (newEvent) => {

        //console.log("Cerrar Agenda: "+JSON.stringify(newEvent));

        if (selectedEventId) {
            //Actualizar
            //console.log("Actualizar: "+ JSON.stringify( selectedEventId ));
            dispatch(updateEvent(selectedEventId));
            // Recargar la página
            window.location.reload();
            //enqueueSnackbar('Update success!');
        } else {
            //Crear
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
        const {setStartDate, setEndDate} = picker;

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

    useEffect(() => {
        // Llamar a la función de devolución de llamada del padre con el valor por defecto
        onValorCambiado(events);
    }, [events]); // Se ejecuta solo una vez al montar el componente

    // const dataFiltered = [
    //   { title: 'Meeting', start: new Date() },
    //   { title: 'Meeting', start: new Date() },
    //   { title: 'Meeting', start: new Date() }
    // ]

    const methods = useForm({
        // resolver: yupResolver(EventSchema),
        // defaultValues: getInitialValues(event, range),
    });

    const {
        reset,
        watch,
        control,
        handleSubmit,
        formState: {isSubmitting},
    } = methods;

    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const onSubmitOk = async (data) => {
        try {
            //console.log("Data Nueva Fecha Agenda: "+ JSON.stringify(data))
        } catch (error) {
            console.error(error);
        }
    };

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
                        eventClick={handleSelectEvent}
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

                <Container component={MotionContainer} sx={{textAlign: 'center'}}>

                    <Box sx={{width: '100%'}}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="Cerrar Evento"/>
                            <Tab label="ReAgendar"/>
                        </Tabs>
                        <Box sx={{p: 3}}>
                            {value === 0 && <div>
                                <CalendarForm
                                    event={selectedEvent}
                                    range={selectedRange}
                                    onCancel={handleCloseModal}
                                    onCreateUpdateEvent={handleCreateUpdateEvent}
                                    onDeleteEvent={handleDeleteEvent}
                                    colorOptions={COLOR_OPTIONS}
                                />

                            </div>}
                            {value === 1 && <div>

                                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitOk)}>
                                    <Stack spacing={3} sx={{px: 3}}>
                                        <Controller
                                            name="start"
                                            control={control}
                                            render={({field}) => (
                                                <MobileDateTimePicker
                                                    {...field}
                                                    onChange={(newValue) => field.onChange(newValue)}
                                                    label="ReAgendar"
                                                    inputFormat="dd/MM/yyyy hh:mm a"
                                                    renderInput={(params) => <TextField {...params} fullWidth/>}
                                                />
                                            )}
                                        />
                                    </Stack>
                                    <Box sx={{flexGrow: 1}}/>
                                    <DialogActions>
                                        <Button variant="outlined" color="inherit" type="submit">
                                            Guardar
                                        </Button>
                                    </DialogActions>
                                </FormProvider>

                            </div>}
                        </Box>
                    </Box>
                </Container>


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

    const {user} = useAuthContext();


    const {events: data} = useSelector((state) => state.calendar);

    //console.log("data: " + JSON.stringify(data));
    // //console.log("events: "+ JSON.stringify( events) );

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
        title: event.CLIENTE,
        start: new Date(event.FECHA),
        // allDay: true,
        description: `${event.CLIENTE} ${event.CLIENTE_ID} ${event.NOTA} ${event.VISITO ? "CERRADO" : "NO CERRADO"}`,
        VISITO: event.VISITO
    }));


    //console.log("events: " + JSON.stringify(events));

    return events;
};

// ----------------------------------------------------------------------

function applyFilter({inputData, filterEventColor, filterStartDate, filterEndDate, isError}) {
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

    //console.log("inputData: " + JSON.stringify(inputData));
    return inputData;
}