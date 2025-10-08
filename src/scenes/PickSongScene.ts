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
    this.add
      .text(this.sys.game.canvas.width / 2, 100, "Pick a song", {
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

    this.add
      .text(this.sys.game.canvas.width / 2, 100, "Pick a song", {
        fontSize: "64px",
        color: Phaser.Display.Color.IntegerToColor(COLORS.textGreen).rgba,
        fontFamily: "'DynaPuff', cursive",
      })
      .setOrigin(0.5);

    const renderSongs = () => {
      songButtons.forEach((btn) => btn.destroy());
      songButtons = [];

      const start = currentPage * SONGS_PER_PAGE;
      const end = Math.min(start + SONGS_PER_PAGE, allSongs.length);

      for (let i = start; i < end; i++) {
        const color = COLORS.pickScene[i - start];
        const { fill, stroke } = color;

        const x = this.sys.game.canvas.width * 0.15;
        const y = this.sys.game.canvas.height * 0.25 + (i - start) * 85;
        const width = this.sys.game.canvas.width * 0.7;
        const height = 70;
        const radius = 20;

        const graphics = this.add.graphics();
        graphics.fillStyle(fill, 1);
        graphics.lineStyle(4, stroke, 1);
        graphics.fillRoundedRect(0, 0, width, height, radius);
        graphics.strokeRoundedRect(0, 0, width, height, radius);

        const songName = allSongs[i].songName || `Song ${i + 1}`;
        const text = this.add
          .text(width / 2, height / 2, songName, {
            fontSize: "24px",
            color: "#000",
            fontFamily: "'DynaPuff', cursive",
          })
          .setOrigin(0.5);

        const button = this.add.container(x, y);
        button.add([graphics, text]);

        button.setSize(width, height);
        button.setInteractive(
          new Phaser.Geom.Rectangle(0, 0, width, height),
          Phaser.Geom.Rectangle.Contains
        );

        button.on("pointerdown", () => {
          console.log("Picked song:", songName);
        });

        songButtons.push(button);
      }

      if (totalPages > 1) {
        const arrow = this.add
          .text(
            this.sys.game.canvas.width / 2,
            this.sys.game.canvas.height * 0.9,
            "▼",
            {
              fontSize: "48px",
              color: "#fff",
              fontFamily: "'DynaPuff', cursive",
            }
          )
          .setOrigin(0.5)
          .setInteractive();

        arrow.on("pointerdown", () => {
          currentPage = (currentPage + 1) % totalPages;
          renderSongs();
        });
      }
    };

    renderSongs();
  }
}

export default PickSongScene;
