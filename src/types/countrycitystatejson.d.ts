declare module 'countrycitystatejson' {
  export interface Country {
    shortName: string;
    name: string;
    native?: string;
    phone?: string;
    continent?: string;
    capital?: string;
    currency?: string;
    languages?: string[];
    emoji?: string;
    emojiU?: string;
  }

  export function getCountries(): Country[];
  export function getStatesByShort(countryShortName: string): string[] | null;
  export function getCities(countryShortName: string, stateName: string): string[] | null;
  export function getCountryByShort(countryShortName: string): any;
  export function getCountryInfoByShort(countryShortName: string): any;
  export function getCitiesByName(cityName: string): any;
}
