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
    active: 0x6AD2FF,
    faded: 0x3B57B4
  },
  bgBlue: 0x3650A5,
  textGreen: 0xD6E264,
  pickScene: [
    {
      fill: 0xFEF8DB,
      stroke: 0xFFE879
    },
    {
      fill: 0xEEE0FF,
      stroke: 0x812BC7
    }, 
    {
      fill: 0xFFDAD9,
      stroke: 0xF66583
    },
    {
      fill: 0xD0F6FF,
      stroke: 0x2B8C9F
    },
    {
      fill: 0xD6F4E4,
      stroke: 0x1F8850
    }
  ]
} as const;