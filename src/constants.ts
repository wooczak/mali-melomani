export const INSTRUMENTS = {
  drum: "drum",
  rattle: "rattle",
  triangle: "triangle",
  tambourine: "tambourine",
  woodBlocks: "woodBlocks",
  guiro: "guiro",
} as const;

export const COLORS = {
  blockBlue: {
    active: 0x6ad2ff,
    faded: 0x3b57b4,
  },
  bgBlue: 0x3650a5,
  textGreen: 0xd6e264,
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
    fill: 0xf5f8d9,
    stroke: 0xd6e264,
  },
} as const;
