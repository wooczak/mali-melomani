import { INSTRUMENTS } from "./constants";

type InstrumentHits = {
  time: number;
  type?: "long";
  length?: number; // in seconds
};

type SongInstrumentData = {
  name: keyof typeof INSTRUMENTS;
  hits: InstrumentHits[];
};

export type Song = {
  songName: string;
  countdownMs: number;
  tempo: number;
  duration: number;
  world: keyof typeof WORLD;
  instruments: SongInstrumentData[];
};

export type InstrumentsSvgData = {
  [key in keyof typeof INSTRUMENTS]: {
    svg: string;
  };
};

export const WORLD = {
  ocean: "ocean",
  forest: "forest",
  savanna: "savanna",
} as const;
