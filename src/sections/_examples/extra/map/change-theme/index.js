import Map from 'react-map-gl';
import PropTypes from 'prop-types';
import { memo, useState, useCallback } from 'react';

import { MapControl } from 'src/components/map';

// import ControlPanel from './control-panel';

// ----------------------------------------------------------------------

function MapChangeTheme({ themes, ...other }) {
    const [selectTheme, setSelectTheme] = useState('outdoors');

    const handleChangeTheme = useCallback((value) => setSelectTheme(value), []);

    return (
        <>
            <Map
                initialViewState={{
                    latitude: -2.8959059,
                    longitude: -79.0055115,
                    zoom: 3.5,
                    bearing: 0,
                    pitch: 0,
                }}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
                {...other}
            >
                <MapControl />
            </Map>

            {/* <ControlPanel themes={themes} selectTheme={selectTheme} onChangeTheme={handleChangeTheme} /> */}
        </>
    );
}

MapChangeTheme.propTypes = {
    themes: PropTypes.object,
};

export default memo(MapChangeTheme);
