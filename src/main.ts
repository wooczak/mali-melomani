import Phaser from "phaser";
import "./styles.css";
import {
  HelloScene,
  PickInstrumentScene,
  PickSongScene,
  TimelineScene,
} from "./scenes";
import { COLORS } from "./constants";

const gameBg = Phaser.Display.Color.IntegerToColor(COLORS.whiteBg).rgba;

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: "game-container",
  scene: [
    new HelloScene({
      key: "HelloScene",
      active: true,
      cameras: {
        backgroundColor: gameBg,
      },
    }),
    new PickSongScene({
      key: "PickSongScene",
      cameras: { backgroundColor: gameBg },
    }),
    new PickInstrumentScene({
      key: "PickInstrumentScene",
      cameras: {
        backgroundColor: gameBg,
      },
    }),
    new TimelineScene({
      key: "TimelineScene",
      cameras: {
        backgroundColor: gameBg,
      },
    }),
  ],
};

async function startGame() {
  await document.fonts.ready;

  new Phaser.Game(config);
}

startGame();
