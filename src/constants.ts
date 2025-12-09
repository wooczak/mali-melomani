export const INSTRUMENTS = {
  bebenek: "bebenek",
  grzechotka: "grzechotka",
  trojkat: "trojkat",
  tamburyn: "tamburyn",
  drewienka: "drewienka",
  tarka: "tarka",
  janczary: "janczary",
  talerze: "talerze",
} as const;

export const GAME_SCENE_KEY = {
  hello: "HelloScene",
  pickSong: "PickSongScene",
  pickInstrument: "PickInstrumentScene",
  timeline: "TimelineScene",
} as const;

export const COLORS = {
  whiteBg: 0xf9f5f2,
  bgBlue: 0x3650a5,
  textGreen: 0x018741,
  textRed: 0xa41034,
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
  playBtnCircleFill: 0xffe5b3,
  playBtnTriangleFill: 0x8c0129,
  timeline: {
    ocean: {
      bg: 0xC4ECFE,
      blockStroke: {
        active: 0x1052a3,
        faded: 0x9bd9fe,
      },
    },
    forest: {
      bg: 0xE0F3DC,
      blockStroke: {
        active: 0x1f713a,
        faded: 0xa1d99b,
      },
    },
    savanna: {
      bg: 0xF9F5F2,
      blockStroke: {
        active: 0xf95b37,
        faded: 0xffe1da,
      },
    },
  },
} as const;
