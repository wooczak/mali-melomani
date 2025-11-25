export const INSTRUMENTS = {
  bebenek: "bebenek",
  grzechotka: "grzechotka",
  trojkat: "trojkat",
  tamburyn: "tamburyn",
  drewienka: "drewienka",
  tarka: "tarka",
  janczary: "janczary",
  talerze: "talerze"
} as const;

export const COLORS = {
  whiteBg: 0xf9f5f2,
  bgBlue: 0x3650a5,
  textGreen: 0x018741,
  textRed: 0xf95b37,
  pickScene: [
    {
      fill: 0x1869ce,
    },
    {
      fill: 0x680e8b,
    },
    {
      fill: 0x018741,
    },
    {
      fill: 0xf556b3,
    },
    {
      fill: 0xec293d,
    },
  ],
  pickInstrumentBlock: {
    fill: 0xfee8e3,
    stroke: 0xf95b37,
  },
  playBtnCircleFill: 0xc6dcf7,
  playBtnTriangleFill: 0x1869ce,
  timeline: {
    ocean: {
      bg: 0xC4ECFE,
      blockStroke: {
        active: 0x1052A3,
        faded: 0x9BD9FE,
      },
    },
    forest: {
      bg: 0xE0F3DC,
      blockStroke: {
        active: 0x1F713A,
        faded: 0xA1D99B,
      },
    },
    savanna: {
      bg: 0xF9F5F2,
      blockStroke: {
        active: 0xF95B37,
        faded: 0xFFE1DA,
      },
    }
  },
} as const;
