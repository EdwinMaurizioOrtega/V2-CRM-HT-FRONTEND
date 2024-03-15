import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Label from "../../../components/label";
import React, {useEffect, useState} from "react";
import {GoogleMap, InfoWindow, Marker, useJsApiLoader} from "@react-google-maps/api";

// ----------------------------------------------------------------------

export default function CustomerLocationMap({currentPartner, open, onClose}) {

    console.log("partner.ID " + currentPartner?.Cliente || '');

    return (<Dialog
            fullWidth
            maxWidth={false}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {maxWidth: 720},
            }}
        >

            <DialogTitle>Ubicación del Cliente</DialogTitle>

            <DialogContent>
                <Alert variant="outlined" severity="info" sx={{mb: 3}}>
                    Cliente: {currentPartner.Cliente || ''}
                </Alert>

                <Box
                    rowGap={1}
                    columnGap={1}
                >
                    {currentPartner ? (<>
                            <MapComponent markers={JSON.parse(currentPartner?.ENVIO)}/>
                        </>
                    ) : (<Label color="error">Cliente no encontrado</Label>)}


                </Box>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Cerrar
                </Button>

            </DialogActions>

        </Dialog>);
}

CustomerLocationMap.propTypes = {
    open: PropTypes.bool, onClose: PropTypes.func, currentUser: PropTypes.object,
};

const mapContainerStyle = {
    width: '100%', height: '800px',
};

// URL de tu imagen personalizada para el marcador
// const customMarkerIcon = 'URL_DE_TU_IMAGEN';

function MapComponent({markers}) {

    console.log("Markers: " + JSON.stringify(markers));

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState({ lat: -1.8312, lng: -78.1834 });
    const [zoom, setZoom] = useState(8);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script', googleMapsApiKey: 'AIzaSyARV9G0tkya9zgXXlVNmx8U5ep7mg8XdHI',
    });

    useEffect(() => {
        if (isLoaded && map) {
            let bounds = new window.google.maps.LatLngBounds();
            markers.forEach(marker => {
                bounds.extend({ lat: parseFloat(marker.U_LS_LATITUD), lng: parseFloat(marker.U_LS_LONGITUD) });
            });
            map.fitBounds(bounds);
        }
    }, [isLoaded, map, markers]);

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };

    const handleInfoWindowClose = () => {
        setSelectedMarker(null);
    };

    const onLoad = (map) => {
        setMap(map);
    };

    return isLoaded ? (<GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onZoomChanged={() => map && setZoom(map.getZoom())}
            onCenterChanged={() => map && setCenter(map.getCenter())}
        >
            {/* Renderizar marcadores */}
            {markers.map((marker, index) => (<Marker
                    key={index}
                    position={{lat: parseFloat(marker.U_LS_LATITUD), lng: parseFloat(marker.U_LS_LONGITUD)}}
                    // icon={customMarkerIcon} // Usar icono personalizado
                    onClick={() => handleMarkerClick(marker)}
                />))}

            {/* Mostrar información del marcador seleccionado */}
            {selectedMarker && (<InfoWindow
                    position={{
                        lat: parseFloat(selectedMarker.U_LS_LATITUD), lng: parseFloat(selectedMarker.U_LS_LONGITUD)
                    }}
                    onCloseClick={handleInfoWindowClose}
                >
                    <div>
                        <p>TIPO: {selectedMarker.TIPO}</p>
                        <p>PROVINCIA: {selectedMarker.PROVINCIA}</p>
                        <p>CANTON: {selectedMarker.CANTON}</p>
                        <p>DIRECCION: {selectedMarker.DIRECCION}</p>
                    </div>
                </InfoWindow>)}

        </GoogleMap>) : (<></>);
}
