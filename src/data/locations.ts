export type Location = {
  command: string;
  name: string;
  latitude: number;
  longitude: number;
  routesMap?: string;
  cameras?: string;
};

export const locations: Location[] = [
  {
    command: "cienkow",
    name: "Cieńków",
    latitude: 49.631889,
    longitude: 18.930278,
    routesMap:
      "https://www.cienkownarty.pl/zima/trasy-narciarskie-stacja-narciarska-cienkow,1.html",
    cameras: "https://www.cienkownarty.pl/zima/kamery-on-line,3.html",
  },
  {
    command: "novaosada",
    name: "Nova Osada",
    latitude: 49.636917,
    longitude: 18.890583,
    routesMap: "https://nowaosada.pl/trasy-i-warunki/",
    cameras: "https://nowaosada.pl/kamery/",
  },
  {
    command: "stok",
    name: "Stok",
    latitude: 49.657889,
    longitude: 18.828278,
    routesMap: "https://www.stokstacjanarciarska.pl/trasy/",
    cameras: "https://www.stokstacjanarciarska.pl/kamery/",
  },
  {
    command: "bialka",
    name: "Białka Tatrzańska",
    latitude: 49.389528,
    longitude: 20.099056,
    routesMap: "https://bialkatatrzanska.pl/plan-osrodka/",
    cameras: "https://bialkatatrzanska.pl/kamery/",
  },
  {
    command: "jasna",
    name: "Jasná",
    latitude: 48.964861,
    longitude: 19.586333,
    routesMap: "https://www.jasna.sk/en/resort/resort-info/maps",
    cameras: "https://www.jasna.sk/en/resort/resort-info/webcameras",
  },
  {
    command: "bukovel",
    name: "Буковель",
    latitude: 48.360278,
    longitude: 24.409444,
    routesMap: "https://bukovel.com/status/map",
    cameras: "https://bukovel.com/cams",
  },
];
