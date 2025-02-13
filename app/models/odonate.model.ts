export interface Odonate {
  id: number;
  commonName: string;
  malayalamName: string;
  scientificName: string;
  family: string;
  sciName: string;
  description: string;
  mainPhoto: string;
  photos: Photo[];
  speciesLink: string;
  wikipediaLink: string;
}

export interface Photo {
  url: string;
  credit: string;
  sourceUrl: string;
}