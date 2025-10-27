import { COLORS } from "../constants";
import type { Song } from "../types";
import drum from "/assets/svg/drum.svg";
import guiro from "/assets/svg/guiro.svg";
import rattle from "/assets/svg/rattle.svg";
import tambourine from "/assets/svg/tambourine.svg";
import triangle from "/assets/svg/triangle.svg";
import woodBlocks from "/assets/svg/woodBlocks.svg";

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

    this.load.image("bębenek", drum);
    this.load.image("tarka", guiro);
    this.load.image("grzechotka", rattle);
    this.load.image("tamburyn", tambourine);
    this.load.image("trójkąt", triangle);
    this.load.image("drewienka", woodBlocks);
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
            fontFamily: "'ABeeZee', Arial",
            fontSize: "28px",
            color: "#000000",
            wordWrap: { width: 30 },
          }
        )
        .setOrigin(0.5);

      const card = this.add
        .container(cardX, cardY, [cardGraphics, instrumentImage, cardText])
        .setInteractive(
          new Phaser.Geom.Rectangle(0, 0, cardWidth, cardHeight),
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
