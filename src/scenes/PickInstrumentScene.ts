import type { Song } from "../types";

interface PickInstrumentSceneData {
  songIndex: number;
}

class PickInstrumentScene extends Phaser.Scene {
  cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  cardContainers: Phaser.GameObjects.Container[] = [];
  songIndex: number = 0;
  songInstruments: string[] = [];

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig | undefined) {
    super(config);
  }

  init(data: PickInstrumentSceneData): void {
    this.songIndex = data.songIndex;
  }

  preload() {
    this.load.json("song", `src/assets/songs/song${this.songIndex + 1}.json`);
    this.load.json("instrumentsData", "src/assets/instruments.json");

    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      const song = this.cache.json.get("song") as Song;
      const instrumentsData = this.cache.json.get("instrumentsData");

      song.instruments.forEach((inst) => {
        const key = inst.name;
        const path = instrumentsData[key].svg;
        this.load.image(key, path);
      });

      this.load.start();
    });
  }

  createCardContainers() {
    this.cardContainers = [];

    if (this.songInstruments) {
      this.songInstruments.forEach((instrument: string, index: number) => {
        const cardX = 100 + index * 170;
        const cardY = 200;

        const cardGraphics = this.add.graphics();
        cardGraphics.fillStyle(0xffeee9, 1);
        cardGraphics.fillRoundedRect(0, 0, 150, 300, 12);
        cardGraphics.lineStyle(6, 0xf9a38a, 1);
        cardGraphics.strokeRoundedRect(0, 0, 150, 300, 12);

        console.log(`Added image for instrument: ${instrument}`);

        const instrumentImage = this.add.image(75, 100, instrument);
        console.log(this.cache.json.get("instrumentsData")[instrument].svg);

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

  create() {
    this.createCardContainers();
  }

  pickInstrument(instrument: string) {
    this.scene.start("TimelineScene", { selectedInstrument: instrument });
  }
}
export default PickInstrumentScene;
