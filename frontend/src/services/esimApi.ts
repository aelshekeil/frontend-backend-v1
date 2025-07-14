import { API_URL } from './types';

// eSIM plan type
export interface EsimPlan {
  id: number;
  product_name: string;
  data_gb: string;
  net_price_usd: number;
  sms: number;
  voice: number;
}

// Country type: backend returns `Country` field for plans
export interface Country {
  id: number;
  name: string;
  isoCode?: string;
  flag_icon?: {
    url: string;
  };
  Country?: EsimPlan[]; // raw backend field
  plans?: EsimPlan[]; // normalized: holds actual plans
}

// Strapi paginated response
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Fetch all countries with their plans
export const fetchCountriesWithPlans = async (): Promise<Country[]> => {
  let allCountries: Country[] = [];
  let page = 1;
  let pageCount = 1;

  try {
    while (page <= pageCount) {
      const response = await fetch(
        `${API_URL}/api/countries?populate[Country]=true&populate[flag_icon]=true&pagination[page]=${page}&pagination[pageSize]=100`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: StrapiResponse<Country[]> = await response.json();

      // normalize: rename backend `Country` to `plans`
      const normalized = result.data.map((c) => ({
        ...c,
        plans: c.Country ?? [],
      }));

      allCountries = allCountries.concat(normalized);
      pageCount = result.meta?.pagination.pageCount || 1;
      page++;
    }

    return allCountries;
  } catch (error) {
    console.error('Error fetching countries with plans:', error);
    throw error;
  }
};

// Fetch plans for a specific country
export const fetchCountryPlans = async (countryId: number): Promise<EsimPlan[]> => {
  try {
    const response = await fetch(`${API_URL}/api/countries/${countryId}?populate[Country]=true`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: StrapiResponse<Country> = await response.json();
    return result.data.Country ?? []; // return [] if undefined
  } catch (error) {
    console.error('Error fetching country plans:', error);
    throw error;
  }
};

// Search countries by name
export const searchCountries = async (query: string): Promise<Country[]> => {
  try {
    const response = await fetch(
      `${API_URL}/api/countries?filters[name][$containsi]=${encodeURIComponent(query)}&populate[Country]=true&populate[flag_icon]=true`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: StrapiResponse<Country[]> = await response.json();

    // normalize: rename `Country` to `plans`
    return result.data.map((c) => ({
      ...c,
      plans: c.Country ?? [],
    }));
  } catch (error) {
    console.error('Error searching countries:', error);
    throw error;
  }
};
