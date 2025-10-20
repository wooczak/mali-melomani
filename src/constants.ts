export const INSTRUMENTS = {
  bębenek: "bębenek",
  grzechotka: "grzechotka",
  trójkąt: "trójkąt",
  tamburyno: "tamburyno",
  drewienka: "drewienka",
  tarka: "tarka",
} as const;

export const COLORS = {
  blockBlue: {
    active: 0x6ad2ff,
    faded: 0x3b57b4,
  },
  whiteBg: 0xF9F5F2,
  bgBlue: 0x3650a5,
  textGreen: 0xd6e264,
  textRed: 0xF95B37,
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
    fill: 0xFEE8E3,
    stroke: 0xF95B37,
  },
  playBtnCircleFill: 0xFEE8E3
} as const;
