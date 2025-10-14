import { INSTRUMENTS } from "./constants";

type InstrumentHits = {
  time: number;
  long?: true;
  duration?: number;
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
  instruments: SongInstrumentData[];
};

export type InstrumentsSvgData = {
  [key in keyof typeof INSTRUMENTS]: {
    svg: string;
  };
};
