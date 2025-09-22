import Phaser from "phaser";
import "./styles.css";

class HelloScene extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig | undefined) {
    super(config);
  }

  preload() {}

  create() {
    this.add
      .text(640, 250, "Mali Melomani", {
        fontFamily: "'Bubblegum Sans', cursive",
        fontSize: "128px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const pressSpaceText = this.make
      .text({
        x: 640,
        y: 400,
        text: "Naciśnij spację, aby rozpocząć grę.",
        style: {
          fontFamily: "'Bubblegum Sans', cursive",
          fontSize: "32px",
          color: "#ffffff",
        },
      })
      .setOrigin(0.5);

    this.add
      .rectangle(
        pressSpaceText.x,
        pressSpaceText.y,
        pressSpaceText.width + 30,
        pressSpaceText.height + 30
      )
      .setStrokeStyle(2, 0xffffff)
      .setFillStyle(0xffffff, 0);

    const keyboard = this.input.keyboard;

    if (keyboard) {
      const space = keyboard.addKey("SPACE");
      space.on("down", () => {
        this.consoleLog();
      });
    }
  }

  consoleLog() {
    this.scene.start("PickInstrumentScene");
  }
}

class PickInstrumentScene extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig | undefined) {
    super(config);
  }

  preload() {}
  create() {
    this.add.text(100, 100, "Pick Instrument Scene");
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 700,
  scene: [
    new HelloScene({ key: "HelloScene", active: true }),
    new PickInstrumentScene("PickInstrumentScene"),
    // Other scenes can be added here
  ],
};

new Phaser.Game(config);
