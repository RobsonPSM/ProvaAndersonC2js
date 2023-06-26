import { Cerveja } from "./CervejaModel";

const API_URL = 'https://random-data-api.com/api/beer/random_beer';

export async function fetchCervejaData(): Promise<Cerveja> {
  try {
    const response = await fetch(`${API_URL}`); 
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados da API:', error);
    throw error;
  }
}