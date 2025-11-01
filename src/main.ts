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

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: "game-container",
  scene: [
    new HelloScene({
      key: "HelloScene",
      cameras: { backgroundColor: gameBg },
    }),
    new PickSongScene({
      key: "PickSongScene",
      cameras: { backgroundColor: gameBg },
    }),
    new PickInstrumentScene({
      key: "PickInstrumentScene",
      cameras: { backgroundColor: gameBg },
    }),
    new TimelineScene({
      key: "TimelineScene",
      cameras: { backgroundColor: gameBg },
    }),
  ],
};

function loadFontsAndStartGame(): Promise<void> {
  return new Promise((resolve) => {
    const WebFont = (window as any).WebFont;
    WebFont.load({
      google: {
        families: ["DynaPuff", "ABeeZee", "Bubblegum Sans", "Roboto"],
      },
      active: async () => {
        await document.fonts.ready;

        const polishChars = "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ";
        const families = ["DynaPuff", "ABeeZee", "Bubblegum Sans", "Roboto"];

        await Promise.all(
          families.map((family) =>
            document.fonts.load(`20px "${family}"`, polishChars)
          )
        );

        requestAnimationFrame(() => resolve());
      },
      inactive: () => {
        console.warn("⚠️ WebFont loading failed — starting anyway");
        resolve();
      },
    });
  });
}

loadFontsAndStartGame().then(() => {
  new Phaser.Game(config);
});
