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
      fill: 0xfef8db,
      stroke: 0xffe879,
    },
    {
      fill: 0xeee0ff,
      stroke: 0x812bc7,
    },
    {
      fill: 0xffdad9,
      stroke: 0xf66583,
    },
    {
      fill: 0xd0f6ff,
      stroke: 0x2b8c9f,
    },
    {
      fill: 0xd6f4e4,
      stroke: 0x1f8850,
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
