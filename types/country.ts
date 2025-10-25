export interface Country {
  id: string;
  name: string;
  code: string;
  cities?: [];
}

export interface City {
  id: string;
  name: string;
  countryId: string;
  country?: Country;
  hotels?: any[];
}

export interface CreateCountryDto {
  name: string;
  code: string;
}

export interface CreateCityDto {
  name: string;
  countryId: string;
}


