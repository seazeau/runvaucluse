export interface Race {
  id: number;
  slug: string;
  date: string;
  name: string;
  city: string;
  distances: string;
  type: string;
  link: string;
  is_featured: number;
  image_url?: string;
  label?: string;
  contact?: string;
  description?: string;
  facebook?: string;
  instagram?: string;
  registration_platform?: string;
  registration_link?: string;
  website?: string;
}

export interface RaceResult {
  id: number;
  race_slug: string;
  event_name: string;
  rank_overall: number;
  bib: string;
  name: string;
  rank_sex: string;
  rank_cat: string;
  time: string;
  podium: string;
  speed: string;
  club: string;
}

export interface Club {
  id: number;
  name: string;
  image_url: string;
  website?: string;
}

export interface RunnerResult extends RaceResult {
  race_name: string;
  race_date: string;
}
