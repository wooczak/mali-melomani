import { COLORS } from "../constants";
import type { Song } from "../types";

interface PickInstrumentSceneData {
  chosenSongIndex: number;
}

class PickInstrumentScene extends Phaser.Scene {
  cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  cardContainers: Phaser.GameObjects.Container[] = [];
  chosenSongIndex: number = 0;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig | undefined) {
    super(config);
  }

  init(data: PickInstrumentSceneData): void {
    this.chosenSongIndex = data.chosenSongIndex;
  }

  preload() {
    this.load.json(
      "chosenSong",
      `assets/songs/song${this.chosenSongIndex + 1}.json`
    );

    this.load.svg("bębenek", "assets/svg/bębenek.svg");
    this.load.svg("tarka", "assets/svg/tarka.svg");
    this.load.svg("grzechotka", "assets/svg/grzechotka.svg");
    this.load.svg("tamburyno", "assets/svg/tamburyno.svg");
    this.load.svg("trójkąt", "assets/svg/trójkąt.svg");
    this.load.svg("drewienka", "assets/svg/drewienka.svg");
  }

  createCardContainers() {
    this.cardContainers = [];

    const chosenSongInstruments = (this.cache.json.get("chosenSong") as Song)
      .instruments;

    chosenSongInstruments.forEach((instrument, index, arr) => {
      const canvasWidth = this.sys.game.canvas.width;
      const cardWidth = 200;
      const cardHeight = 280;
      const count = arr.length;

      let spacing = (canvasWidth - count * cardWidth) / (count + 1);
      spacing = Math.max(spacing, 2);

      const cardX = spacing + index * (cardWidth + spacing);
      const cardY = 200;

      const cardGraphics = this.add.graphics();
      cardGraphics.fillStyle(COLORS.pickInstrumentBlock.fill, 1);
      cardGraphics.fillRoundedRect(0, 0, cardWidth, cardHeight, 12);
      cardGraphics.lineStyle(6, COLORS.pickInstrumentBlock.stroke, 1);
      cardGraphics.strokeRoundedRect(0, 0, cardWidth, cardHeight, 12);

      const instrumentImage = this.add.image(
        cardWidth / 2,
        100,
        instrument.name
      );

      const cardText = this.add
        .text(
          cardWidth / 2,
          220,
          instrument.name.charAt(0).toUpperCase() + instrument.name.slice(1),
          {
            fontFamily: "'ABeeZee', cursive",
            fontSize: "28px",
            color: "#000000",
            wordWrap: { width: 30 },
          }
        )
        .setOrigin(0.5);

      const card = this.add
        .container(cardX, cardY, [cardGraphics, instrumentImage, cardText])
        .setInteractive(
          new Phaser.Geom.Rectangle(
            0,
            0,
            cardWidth,
            cardHeight
          ),
          Phaser.Geom.Rectangle.Contains,
          false
        );

      card.setData("instrument", instrument.name);

      card.on("pointerover", () => {
        this.input.manager.canvas.style.cursor = "pointer";
        this.tweens.add({
          targets: card,
          scaleX: 1.03,
          scaleY: 1.03,
          duration: 120,
          ease: "Quad.easeOut",
        });
      });

      card.on("pointerout", () => {
        this.input.manager.canvas.style.cursor = "default";

        this.tweens.add({
          targets: card,
          scaleX: 1,
          scaleY: 1,
          duration: 120,
          ease: "Quad.easeIn",
        });
      });

      card.on("pointerdown", () => {
        this.scene.start("TimelineScene", {
          chosenSong: this.chosenSongIndex,
          chosenInstrument: card.getData("instrument"),
        });
      });

      this.cardContainers.push(card);
    });
  }

  create() {
    const { width } = this.sys.game.canvas;

    this.add
      .text(width / 2, 100, "Wybierz instrument", {
        font: "600 64px DynaPuff",
        color: Phaser.Display.Color.IntegerToColor(COLORS.textRed).rgba,
      })
      .setOrigin(0.5);

    this.createCardContainers();
  }
}
export default PickInstrumentScene;
