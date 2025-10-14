import { COLORS } from "../constants";

class HelloScene extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig | undefined) {
    super(config);
  }

  preload() {}

  create() {
    const textColor = Phaser.Display.Color.IntegerToColor(
      COLORS.textGreen
    ).rgba;

    this.add
      .text(640, 250, "Mali Melomani", {
        fontFamily: "'DynaPuff', cursive",
        fontSize: "128px",
        color: textColor,
      })
      .setOrigin(0.5);

    const pressSpaceText = this.make
      .text({
        x: 640,
        y: 400,
        text: "Naciśnij spację, aby rozpocząć grę.",
        style: {
          fontFamily: "'DynaPuff', cursive",
          fontSize: "32px",
          color: textColor,
        },
      })
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
