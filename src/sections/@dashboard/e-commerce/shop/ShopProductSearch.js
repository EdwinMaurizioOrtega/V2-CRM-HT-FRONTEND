import {useState} from 'react';
import {paramCase} from 'change-case';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
// next
import {useRouter} from 'next/router';
// @mui
import {Link, Typography, Autocomplete, InputAdornment} from '@mui/material';
// utils
import axios from '../../../../utils/axios';
// routes
import {PATH_DASHBOARD} from '../../../../routes/paths';
// components
import Image from '../../../../components/image';
import Iconify from '../../../../components/iconify';
import {CustomTextField} from '../../../../components/custom-input';
import SearchNotFound from '../../../../components/search-not-found';
import {HOST_API_KEY} from "../../../../config-global";

// ----------------------------------------------------------------------

export default function ShopProductSearch() {
    const {push} = useRouter();

    const [searchProducts, setSearchProducts] = useState('');

    const [searchResults, setSearchResults] = useState([]);

    const handleChangeSearch = async (value) => {
        //V1
        // try {
        //   setSearchProducts(value);
        //   if (value) {
        //     const response = await axios.get('/hanadb/api/products/search', {
        //       params: { query: value },
        //     });
        //
        //     setSearchResults(response.data.results);
        //
        //     //console.log('Productos encontrados:', searchResults)
        //   }
        // } catch (error) {
        //   console.error(error);
        // }

        //V2
        try {
            setSearchProducts(value);
            if (value) {

                const cache = await caches.open('cache-crm');
                const response = await cache.match(`${HOST_API_KEY}/hanadb/api/products/`);

                if (response) {
                    const cachedData = await response.json();
                    const searchResultsAux = cachedData.products.filter(product => product.NOMBRE.includes(value.toUpperCase().trim()));
                    setSearchResults(searchResultsAux);
                    //console.log('Productos encontrados en la caché:', searchResultsAux);
                }

            }
        } catch (error) {
            console.error(error);
        }


        // try {
        //
        //     const cache = await caches.open('cache-crm');
        //     const response = await cache.match('https://crm.lidenar.com/hanadb/api/products');
        //
        //     if (response) {
        //         const cachedData = await response.json();
        //         const searchResultsAux = cachedData.products.filter(product => product.CODIGO === value || product.NOMBRE.toLowerCase().includes(value.toLowerCase()));
        //
        //         if (searchResultsAux.length > 0) {
        //             //console.log('Productos encontrados en la caché:', searchResultsAux);
        //             setSearchResults(searchResultsAux);
        //             //console.log('Productos encontrados:', searchResults)
        //             // Realizar alguna operación con la lista de productos encontrados en la caché
        //         } else {
        //             //console.log('No se encontraron productos en la caché que coincidan con el término de búsqueda');
        //             // Realizar alguna operación cuando no se encuentren productos en la caché que coincidan con el término de búsqueda
        //         }
        //     }
        // } catch (error) {
        //     console.error('Error al buscar productos en la caché:', error);
        // }
    };

    const handleGotoProduct = (name) => {
        // push(PATH_DASHBOARD.eCommerce.view(paramCase(name)));
        push(PATH_DASHBOARD.eCommerce.view(name));
    };

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            handleGotoProduct(searchProducts);
        }
    };

    return (
        <Autocomplete
            size="small"
            autoHighlight
            popupIcon={null}
            options={searchResults}
            onInputChange={(event, value) => handleChangeSearch(value)}
            getOptionLabel={(product) => product.NOMBRE}
            noOptionsText={<SearchNotFound query={searchProducts}/>}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            componentsProps={{
                popper: {
                    sx: {
                        width: `280px !important`,
                    },
                },
                paper: {
                    sx: {
                        '& .MuiAutocomplete-option': {
                            px: `8px !important`,
                        },
                    },
                },
            }}
            renderInput={(params) => (
                <CustomTextField
                    {...params}
                    width={220}
                    placeholder="Buscar...."
                    onKeyUp={handleKeyUp}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ml: 1, color: 'text.disabled'}}/>
                            </InputAdornment>
                        ),
                    }}
                />
            )}
            renderOption={(props, product, {inputValue}) => {
                const {CODIGO, NOMBRE, cover} = product;
                const matches = match(NOMBRE, inputValue);
                const parts = parse(NOMBRE, matches);

                return (
                    <li {...props}>
                        {/* <Image */}
                        {/*   alt={cover} */}
                        {/*   src={cover} */}
                        {/*   sx={{ width: 48, height: 48, borderRadius: 1, flexShrink: 0, mr: 1.5 }} */}
                        {/* /> */}

                        <Link underline="none" onClick={() => handleGotoProduct(CODIGO)}>
                            {parts.map((part, index) => (
                                <Typography
                                    key={index}
                                    component="span"
                                    variant="subtitle2"
                                    color={part.highlight ? 'primary' : 'textPrimary'}
                                >
                                    {part.text}
                                </Typography>
                            ))}
                        </Link>
                    </li>
                );
            }}
        />
    );
}
