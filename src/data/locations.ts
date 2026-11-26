export type Location = {
  command: string;
  name: string;
  latitude: number;
  longitude: number;
};

export const locations: Location[] = [
  {
    command: "cienkow",
    name: "Cieńków",
    latitude: 49.631889,
    longitude: 18.930278,
  },
  {
    command: "novaosada",
    name: "Nova Osada",
    latitude: 49.636917,
    longitude: 18.890583,
  },
  {
    command: "stok",
    name: "Stok",
    latitude: 49.657889,
    longitude: 18.828278,
  },
  {
    command: "bialka",
    name: "Białka Tatrzańska",
    latitude: 49.389528,
    longitude: 20.099056,
  },
  {
    command: "jasna",
    name: "Jasná",
    latitude: 48.964861,
    longitude: 19.586333,
  },
  {
    command: "bukovel",
    name: "Буковель",
    latitude: 48.360278,
    longitude: 24.409444,
  },
];
