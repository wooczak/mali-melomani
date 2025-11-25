import { COLORS } from "../constants";

class HelloScene extends Phaser.Scene {
  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preload() {}

  create() {
    const { width, height } = this.sys.game.canvas;

    const centerX = Math.round(width / 2);
    const centerY = Math.round(height / 2);

    const title = this.add
      .text(centerX, centerY - 210, "Mali Melomani", {
        font: "600 110px DynaPuff",
        color: Phaser.Display.Color.IntegerToColor(COLORS.textRed).rgba,
      })
      .setOrigin(0.5);

    title.setPosition(Math.round(title.x), Math.round(title.y));

    this.add
      .circle(centerX, centerY, 128, COLORS.playBtnCircleFill)
      .setOrigin(0.5)
      .setPosition(Math.round(centerX), Math.round(centerY))
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.start("PickSongScene");
      })
      .on("pointerover", () => {
        this.input.manager.canvas.style.cursor = "pointer";
      })
      .on("pointerout", () => {
        this.input.manager.canvas.style.cursor = "default";
      });

    this.add
      .triangle(
        centerX + 45,
        centerY + 45,
        -32,
        -48,
        -32,
        48,
        64,
        0,
        COLORS.playBtnTriangleFill
      )
      .setOrigin(0.5)
      .setPosition(Math.round(centerX + 45), Math.round(centerY + 45))
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.start("PickSongScene");
      })
      .on("pointerover", () => {
        this.input.manager.canvas.style.cursor = "pointer";
      })
      .on("pointerout", () => {
        this.input.manager.canvas.style.cursor = "default";
      });

    this.make
      .text({
        x: centerX,
        y: height - 100,
        text: "Naciśnij ▶ lub spację, aby rozpocząć grę.",
        style: {
          fontFamily: "'DynaPuff', cursive",
          fontSize: "32px",
          color: Phaser.Display.Color.IntegerToColor(COLORS.textRed).rgba,
        },
      })
      .setOrigin(0.5)
      .setPosition(centerX, Math.round(height - 100));

    const space = this.input.keyboard?.addKey("SPACE");
    space?.on("down", () => this.scene.start("PickSongScene"));
  }
}

export default HelloScene;
