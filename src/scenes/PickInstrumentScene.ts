import { COLORS, GAME_SCENE_KEY } from "../constants";
import { WORLD, type Song } from "../types";
import { bringBackPolishChars } from "../utils";

import drum from "/assets/svg/drum.svg";
import guiro from "/assets/svg/guiro.svg";
import rattle from "/assets/svg/rattle.svg";
import tambourine from "/assets/svg/tambourine.svg";
import triangle from "/assets/svg/triangle.svg";
import woodBlocks from "/assets/svg/woodBlocks.svg";
import sleighBells from "/assets/svg/sleighbells.svg";
import cymbals from "/assets/svg/cymbals.svg";
import { gameStore } from "../store";

interface PickInstrumentSceneData {
  chosenSongIndex: number;
  world: keyof typeof WORLD;
}

class PickInstrumentScene extends Phaser.Scene {
  cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  cardContainers: Phaser.GameObjects.Container[] = [];
  chosenSongIndex: number = 0;
  world: keyof typeof WORLD = WORLD.ocean;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig | undefined) {
    super(config);
  }

  init(data: PickInstrumentSceneData): void {
    this.chosenSongIndex = data.chosenSongIndex ?? 0;
    this.world = data.world ?? WORLD.ocean;
  }

  preload() {
    this.load.image("bebenek", drum);
    this.load.image("tarka", guiro);
    this.load.image("grzechotka", rattle);
    this.load.image("tamburyn", tambourine);
    this.load.image("trojkat", triangle);
    this.load.image("drewienka", woodBlocks);
    this.load.image("janczary", sleighBells);
    this.load.image("talerze", cymbals);
  }

  createCardContainers() {
    this.cardContainers = [];

    const chosenSongInstruments = (
      this.cache.json.get(`song${this.chosenSongIndex + 1}`) as Song
    ).instruments;

    chosenSongInstruments.forEach((instrument, index, arr) => {
      const canvasWidth = this.sys.game.canvas.width;
      const cardWidth = arr.length < 5 ? 200 : 175;
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

      const instrumentImage = this.add
        .image(cardWidth / 2, 100, instrument.name)
        .setScale(
          instrument.name === "tamburyn"
            ? 0.55
            : instrument.name === "janczary"
            ? 0.7
            : 0.8
        );

      const cardText = this.add
        .text(
          cardWidth / 2,
          220,
          bringBackPolishChars(
            instrument.name.charAt(0).toUpperCase() + instrument.name.slice(1)
          ),
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
          world: this.world,
          tutti: false,
        });
      });

      this.cardContainers.push(card);
    });
  }

  create() {
    gameStore.currentScene = GAME_SCENE_KEY.pickInstrument;
    const { width, height } = this.sys.game.canvas;

    this.add
      .text(width / 2, 100, "Wybierz instrument", {
        font: "600 64px DynaPuff",
        color: Phaser.Display.Color.IntegerToColor(COLORS.textRed).rgba,
      })
      .setOrigin(0.5);

    this.createCardContainers();

    const tuttiText = this.add
      .text(0, 0, "TUTTI", {
        font: "36px DynaPuff",
        color: Phaser.Display.Color.IntegerToColor(COLORS.textRed).rgba,
      })
      .setOrigin(0.5);

    const underline = this.add.graphics();
    underline.lineStyle(4, COLORS.textRed, 1);
    underline.beginPath();
    underline.moveTo(-tuttiText.width / 2, tuttiText.height / 2 + 10);
    underline.lineTo(tuttiText.width / 2, tuttiText.height / 2 + 10);
    underline.strokePath();

    const tuttiContainer = this.add
      .container(width / 2, height - 50, [tuttiText, underline])
      .setSize(tuttiText.width, tuttiText.height + 10)
      .setInteractive();

    tuttiContainer.on("pointerover", () => {
      this.input.manager.canvas.style.cursor = "pointer";
      this.tweens.add({
        targets: tuttiContainer,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 120,
        ease: "Quad.easeOut",
      });
    });

    tuttiContainer.on("pointerout", () => {
      this.input.manager.canvas.style.cursor = "default";
      this.tweens.add({
        targets: tuttiContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: "Quad.easeIn",
      });
    });

    tuttiContainer.on("pointerdown", () => {
      this.scene.stop("PickInstrumentScene");
      this.scene.start("TimelineScene", {
        chosenSong: this.chosenSongIndex,
        chosenInstrument: null,
        world: this.world,
        tutti: true,
      });
    });
  }
}
export default PickInstrumentScene;
