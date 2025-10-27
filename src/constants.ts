export const INSTRUMENTS = {
  bębenek: "bębenek",
  grzechotka: "grzechotka",
  trójkąt: "trójkąt",
  tamburyn: "tamburyn",
  drewienka: "drewienka",
  tarka: "tarka",
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
  playBtnCircleFill: 0xfee8e3,
  timeline: {
    ocean: {
      bg: 0x1869ce,
      blockStroke: {
        active: 0x6ad2ff,
        faded: 0x3b57b4,
      },
    },
  },
} as const;
