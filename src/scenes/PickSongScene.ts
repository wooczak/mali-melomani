import { COLORS } from "../constants";

class PickSongScene extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preload() {
    for (let i = 1; i <= 10; i++) {
      this.load.json(`song${i}`, `src/assets/songs/song${i}.json`);
    }
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    this.add
      .text(width / 2, 100, "Wybierz utwór", {
        fontSize: "64px",
        color: Phaser.Display.Color.IntegerToColor(COLORS.textGreen).rgba,
        fontFamily: "'DynaPuff', cursive",
      })
      .setOrigin(0.5);

    let currentPage = 0;
    const SONGS_PER_PAGE = COLORS.pickScene.length;
    const allSongs = this.cache.json.entries.getArray();
    const totalPages = Math.ceil(allSongs.length / SONGS_PER_PAGE);

    let songButtons: Phaser.GameObjects.Container[] = [];

    const renderSongs = () => {
      songButtons.forEach((btn) => btn.destroy());
      songButtons = [];

      const start = currentPage * SONGS_PER_PAGE;
      const end = Math.min(start + SONGS_PER_PAGE, allSongs.length);

      for (let i = start; i < end; i++) {
        const color = COLORS.pickScene[i - start];
        const { fill, stroke } = color;

        const btnX = width * 0.15;
        const btnY = height * 0.25 + (i - start) * 85;
        const btnWidth = width * 0.7;
        const btnHeight = 70;
        const btnRadius = 20;

        const graphics = this.add.graphics();
        graphics.fillStyle(fill, 1);
        graphics.lineStyle(4, stroke, 1);
        graphics.fillRoundedRect(0, 0, btnWidth, btnHeight, btnRadius);
        graphics.strokeRoundedRect(0, 0, btnWidth, btnHeight, btnRadius);

        const songName = allSongs[i].songName || `Song ${i + 1}`;
        const text = this.add
          .text(btnWidth / 2, btnHeight / 2, songName, {
            fontSize: "24px",
            color: "#000",
            fontFamily: "'ABeeZee', cursive",
          })
          .setOrigin(0.5);

        const button = this.add.container(btnX, btnY, [graphics, text]);

        button
          .setSize(btnWidth, btnHeight)
          .setInteractive(
            new Phaser.Geom.Rectangle(
              btnWidth / 2,
              btnHeight / 2,
              btnWidth,
              btnHeight
            ),
            Phaser.Geom.Rectangle.Contains,
            false
          );

        button.on("pointerover", () => {
          this.input.manager.canvas.style.cursor = "pointer";
          this.tweens.add({
            targets: button,
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 120,
            ease: "Quad.easeOut",
          });
        });

        button.on("pointerout", () => {
          this.input.manager.canvas.style.cursor = "default";

          this.tweens.add({
            targets: button,
            scaleX: 1,
            scaleY: 1,
            duration: 120,
            ease: "Quad.easeIn",
          });
        });

        button.setData("songIndex", i);

        button.on("pointerdown", () => {
          this.scene.start("PickInstrumentScene", { songIndex: button.getData("songIndex") });
        });

        songButtons.push(button);
      }

      if (totalPages > 1) {
        const arrow = this.add
          .text(width / 2, height * 0.9, "▼", {
            fontSize: "48px",
            color: "#fff",
            fontFamily: "'DynaPuff', cursive",
          })
          .setOrigin(0.5)
          .setInteractive();

        arrow.on("pointerdown", () => {
          currentPage = (currentPage + 1) % totalPages;
          renderSongs();
        });

        arrow.on("pointerover", () => {
          this.input.manager.canvas.style.cursor = "pointer";
          this.tweens.add({
            targets: arrow,
            scale: 1.2,
            duration: 120,
            yoyo: true,
            ease: "Quad.easeOut",
          });
        });
      }
    };

    renderSongs();
  }
}

export default PickSongScene;
