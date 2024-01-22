import {useState, memo, useEffect} from 'react';
import Map, {GeolocateControl} from 'react-map-gl';

// ----------------------------------------------------------------------

function MapChangeTheme({ latitude, longitude, ...other }) {

    // console.log("latitude: "+ latitude)
    // console.log("longitudefddg: "+ longitude)

    const [showGeolocateControl, setShowGeolocateControl] = useState(true);

    useEffect(() => {
        // Se ejecuta cuando el componente se monta
        setShowGeolocateControl(true);

        // Limpia la configuración al desmontar el componente
        return () => setShowGeolocateControl(false);
    }, []);

    return (
    <>
      <Map
        initialViewState={{
          latitude: latitude,
          longitude: longitude,
          zoom: 12,  // Ajusta el valor de zoom según sea necesariobearing: 0,
          pitch: 0,
        }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        positionOptions={{ enableHighAccuracy: true }}
        geolocateControlOptions={showGeolocateControl}
        {...other}

      >
          {showGeolocateControl && (
              <GeolocateControl position="top-left" positionOptions={{ enableHighAccuracy: true }} />
          )}
      </Map>

    </>
  );
}

export default memo(MapChangeTheme);
