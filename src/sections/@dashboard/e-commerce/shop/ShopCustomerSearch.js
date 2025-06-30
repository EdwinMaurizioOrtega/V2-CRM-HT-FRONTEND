import { useState } from 'react';
import { paramCase } from 'change-case';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
// next
import { useRouter } from 'next/router';
// @mui
import {Link, Typography, Autocomplete, InputAdornment, Button} from '@mui/material';
// utils
import axios from '../../../../utils/axios';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// components
import Image from '../../../../components/image';
import Iconify from '../../../../components/iconify';
import { CustomTextField } from '../../../../components/custom-input';
import SearchNotFound from '../../../../components/search-not-found';

// ----------------------------------------------------------------------

export default function ShopCustomerSearch() {
  const { push } = useRouter();

  const [searchProducts, setSearchProducts] = useState('');

  const [searchResults, setSearchResults] = useState([]);

  const handleChangeSearch = async (value) => {
    try {
      setSearchProducts(value);
      if (value) {
        const response = await axios.get('/hanadb/api/customers/search', {
          params: { query: value },
        });

        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGotoProduct = (name) => {
    // push(PATH_DASHBOARD.eCommerce.view(paramCase(name)));
    // push(PATH_DASHBOARD.eCommerce.view(name));

      //console.log(name);
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
      getOptionLabel={(product) => product.Cliente}
      noOptionsText={<SearchNotFound query={searchProducts} />}
      isOptionEqualToValue={(option, value) => option.ID === value.ID}
      componentsProps={{
        popper: {
          sx: {
            width: `380px !important`,
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

          placeholder="Buscar..."
          onKeyUp={handleKeyUp}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      )}
      renderOption={(props, product, { inputValue }) => {
        const { ID, Cliente } = product;
        const matches = match(Cliente, inputValue);
        const parts = parse(Cliente, matches);

        return (
          <li {...props}>

              <Button onClick={() => handleGotoProduct(ID)}>
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
              </Button>
          </li>
        );
      }}
    />
  );
}
