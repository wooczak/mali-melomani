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
  // If on a mobile device, don't initialize the Phaser game.
  // Show a friendly message in the #game-container instead.
  const isMobile = (): boolean => {
    if (
      typeof navigator !== "undefined" &&
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ) {
      return true;
    }
    if (
      typeof window !== "undefined" &&
      window.innerWidth &&
      window.innerWidth < 768
    ) {
      return true;
    }
    return false;
  };

  const container = document.getElementById("game-container");

  if (isMobile()) {
    if (container) {
      container.innerHTML = `
        <div class="mx-auto max-w-md w-full bg-white/90 text-center p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl abezee-regular mb-2">Gra "Mali Melomani" jest dostępna tylko na komputerze. Zagraj na większym ekranie!</h2>
          <p class="text-lg abezee-regular">Przepraszamy za niedogodności.</p>
        </div>
      `;
    }
    return;
  }

  new Phaser.Game(config);
}

startGame();
