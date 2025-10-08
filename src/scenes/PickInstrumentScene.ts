class PickInstrumentScene extends Phaser.Scene {
  cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  cardContainers: Phaser.GameObjects.Container[] = [];
  assets: { instruments: string[] } = { instruments: [] };

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig | undefined) {
    super(config);
  }

  preload() {
    this.load.json("assets", "src/assets/songs/instruments.json");

    this.load.svg("cymbalki", "src/assets/cymbalki.svg");
    this.load.svg("tamburyno", "src/assets/tamburyno.svg");
    this.load.svg("trojkat", "src/assets/trojkat.svg");
    this.load.svg("grzechotki", "src/assets/grzechotki.svg");
  }

  createCardContainers() {
    this.assets = this.cache.json.get("assets");
    this.cardContainers = [];

    if (this.assets && this.assets.instruments) {
      this.assets.instruments.forEach((instrument: string, index: number) => {
        const cardX = 100 + index * 170;
        const cardY = 200;

        const cardGraphics = this.add.graphics();
        cardGraphics.fillStyle(0xffeee9, 1);
        cardGraphics.fillRoundedRect(0, 0, 150, 300, 12);
        cardGraphics.lineStyle(6, 0xf9a38a, 1);
        cardGraphics.strokeRoundedRect(0, 0, 150, 300, 12);

        const instrumentImage = this.add.image(75, 75, instrument);

        const cardText = this.add
          .text(
            75,
            220,
            instrument.charAt(0).toUpperCase() + instrument.slice(1),
            {
              fontFamily: "'Bubblegum Sans', cursive",
              fontSize: "32px",
              color: "#000000",
              wordWrap: { width: 30 },
            }
          )
          .setOrigin(0.5);

        const card = this.add.container(cardX, cardY, [
          cardGraphics,
          instrumentImage,
          cardText,
        ]);

        this.cardContainers.push(card);
      });
    }
  }

  createSceneRegistry() {
    this.registry.set("selectedInstrumentIndex", 0);
  }

  create() {
    this.createCardContainers();
    this.createSceneRegistry();

    const rightArrowKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    );
    const leftArrowKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    );

    const enterKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    rightArrowKey?.on("down", () => {
      if (
        this.registry.values.selectedInstrumentIndex <
        this.cardContainers.length - 1
      ) {
        this.registry.values.selectedInstrumentIndex += 1;
      } else {
        this.registry.values.selectedInstrumentIndex = 0;
      }
    });

    leftArrowKey?.on("down", () => {
      if (this.registry.values.selectedInstrumentIndex > 0) {
        this.registry.values.selectedInstrumentIndex -= 1;
      } else {
        this.registry.values.selectedInstrumentIndex =
          this.cardContainers.length - 1;
      }
    });

    enterKey?.on("down", () => {
      this.pickInstrument(
        this.assets.instruments[this.registry.values.selectedInstrumentIndex]
      );
    });

    this.add.text(100, 100, "Pick Instrument Scene");
  }

  pickInstrument(instrument: string) {
    this.scene.start("TimelineScene", { selectedInstrument: instrument });
  }
}
export default PickInstrumentScene;
