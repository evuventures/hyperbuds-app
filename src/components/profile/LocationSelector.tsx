'use client';

import React, { useMemo } from 'react';
import ccsj from 'countrycitystatejson';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';

interface LocationSelectorProps {
  country: string;
  state: string;
  city: string;
  onChange: (key: 'country' | 'state' | 'city', value: string) => void;
  className?: string;
  gridClassName?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  country,
  state,
  city,
  onChange,
  className = '',
  gridClassName = 'grid grid-cols-1 gap-4 md:grid-cols-3',
}) => {
  // 1. All countries list
  const countries = useMemo(() => {
    try {
      const list = ccsj.getCountries() || [];
      return list.map((c) => ({
        label: `${c.emoji ? c.emoji + ' ' : ''}${c.name}`,
        value: c.name,
        shortName: c.shortName,
      }));
    } catch (e) {
      console.error('Failed to load countries:', e);
      return [];
    }
  }, []);

  // Find the selected country object to obtain shortName for states
  const selectedCountryObj = useMemo(() => {
    if (!country) return null;
    return (
      countries.find(
        (c) =>
          c.value.toLowerCase() === country.toLowerCase() ||
          c.shortName.toLowerCase() === country.toLowerCase()
      ) || null
    );
  }, [countries, country]);

  // 2. States list for selected country
  const states = useMemo<SelectOption[]>(() => {
    if (!selectedCountryObj?.shortName) return [];
    try {
      const stateList =
        ccsj.getStatesByShort(selectedCountryObj.shortName) || [];
      return stateList.map((st) => ({
        label: st,
        value: st,
      }));
    } catch (e) {
      console.error('Failed to load states:', e);
      return [];
    }
  }, [selectedCountryObj]);

  // 3. Cities list for selected country & state
  const cities = useMemo<SelectOption[]>(() => {
    if (!selectedCountryObj?.shortName || !state) return [];
    try {
      const cityList =
        ccsj.getCities(selectedCountryObj.shortName, state) || [];
      return cityList.map((ct) => ({
        label: ct,
        value: ct,
      }));
    } catch (e) {
      console.error('Failed to load cities:', e);
      return [];
    }
  }, [selectedCountryObj, state]);

  const handleCountryChange = (newCountry: string) => {
    onChange('country', newCountry);
    if (newCountry !== country) {
      onChange('state', '');
      onChange('city', '');
    }
  };

  const handleStateChange = (newState: string) => {
    onChange('state', newState);
    if (newState !== state) {
      onChange('city', '');
    }
  };

  const handleCityChange = (newCity: string) => {
    onChange('city', newCity);
  };

  return (
    <div className={className}>
      <div className={gridClassName}>
        {/* Country */}
        <SearchableSelect
          label="Country"
          placeholder="Select Country"
          searchPlaceholder="Search country..."
          value={country}
          options={countries}
          onChange={handleCountryChange}
        />

        {/* State / Province */}
        <SearchableSelect
          label="State / Province"
          placeholder={country ? 'Select State' : 'Select country first'}
          searchPlaceholder="Search state..."
          value={state}
          options={states}
          onChange={handleStateChange}
          disabled={!country || states.length === 0}
          disabledMessage={
            !country
              ? 'Select country first'
              : states.length === 0
              ? 'No states available'
              : undefined
          }
        />

        {/* City */}
        <SearchableSelect
          label="City"
          placeholder={state ? 'Select City' : 'Select state first'}
          searchPlaceholder="Search city..."
          value={city}
          options={cities}
          onChange={handleCityChange}
          disabled={!state || cities.length === 0}
          disabledMessage={
            !state
              ? 'Select state first'
              : cities.length === 0
              ? 'No cities available'
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default LocationSelector;
