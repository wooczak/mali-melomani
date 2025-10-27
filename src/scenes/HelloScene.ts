import { COLORS } from "../constants";

class HelloScene extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig | undefined) {
    super(config);
  }

  preload() {}

  create() {
    const { width, height } = this.sys.game.canvas;

    this.add
      .text(width / 2, height / 2 - 210, "Mali Melomani", {
        font: "600 110px DynaPuff",
        color: Phaser.Display.Color.IntegerToColor(COLORS.textRed).rgba,
      })
      .setOrigin(0.5);

    const pressSpaceText = this.make
      .text({
        x: width / 2,
        y: height - 100,
        text: "Naciśnij spację, aby rozpocząć grę.",
        style: {
          fontFamily: "'DynaPuff', cursive",
          fontSize: "32px",
          color: Phaser.Display.Color.IntegerToColor(COLORS.textRed).rgba,
        },
      })
      .setOrigin(0.5);

    this.add
      .circle(width / 2, height / 2, 128, COLORS.playBtnCircleFill)
      .setOrigin(0.5);

    this.add
      .triangle(
        width / 2 + 45,
        height / 2 + 45,
        -32,
        -48,
        -32,
        48,
        64,
        0,
        COLORS.textRed
      )
      .setOrigin(0.5);

    this.add
      .rectangle(
        pressSpaceText.x,
        pressSpaceText.y,
        pressSpaceText.width + 50,
        pressSpaceText.height + 50
      )
      .setStrokeStyle(5, 0xffffff)
      .setFillStyle(0xffffff, 0);

    const keyboard = this.input.keyboard;

    if (keyboard) {
      const space = keyboard.addKey("SPACE");
      space.on("down", () => {
        this.scene.start("PickSongScene");
      });
    }
  }
}

export default HelloScene;
