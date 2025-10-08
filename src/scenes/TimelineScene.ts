import { COLORS, INSTRUMENTS } from "../constants";
import type { Song } from "../types";

class TimelineScene extends Phaser.Scene {
  hitBoxContainer: Phaser.GameObjects.Container[] = [];
  countdownMs: number = 0;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preload() {
    this.load.json("song1", "src/assets/songs/song1.json");
    this.load.json("instruments", "src/assets/songs/instruments.json");
    this.load.audio("countdownStick", "src/assets/audio/countdown-stick.mp3");
  }

  create() {
    this.registry.set("selectedInstrument", this.data.get("selectedInstrument"));
    const instruments = this.cache.json.get("instruments").instruments;
    const song = this.cache.json.get("song1") as Song;
    this.countdownMs = song.countdownMs;
    const allTweens: Phaser.Tweens.Tween[] = [];

    this.input.once("pointerdown", () => {
      if (
        this.sound instanceof Phaser.Sound.WebAudioSoundManager &&
        this.sound.context.state === "suspended"
      ) {
        this.sound.context.resume();
      }
    });

    let hitBoxContainer = this.add.container(0, 0);

    this.registry.set("selectedInstrument", "drum");

    instruments.forEach((_i: string, index: number) => {
      const hitBox = this.add.graphics();
      hitBox.lineStyle(2, COLORS.blockBlue.active);
      hitBox.strokeRoundedRect(0, 0, 140, 78, 8);

      const total = instruments.length;
      const rectWidth = 140;
      const spacing = (this.sys.game.canvas.width - rectWidth) / total;

      hitBox.x = 75 + index * spacing;
      hitBox.y = this.sys.game.canvas.height - 30 - 78;

      const instrumentKeys = Object.keys(
        INSTRUMENTS
      ) as (keyof typeof INSTRUMENTS)[];
      hitBox.name = INSTRUMENTS[instrumentKeys[index]];

      hitBoxContainer.add(hitBox);
    });

    song.instruments.forEach((instrument, index) => {
      const instrumentLine = hitBoxContainer.list[
        index
      ] as Phaser.GameObjects.Graphics;

      instrument.hits.forEach((hit) => {
        const note = this.add
          .graphics()
          .fillStyle(instrument.name === this.registry.get("selectedInstrument") ? COLORS.blockBlue.active : COLORS.blockBlue.faded, 1)
          .fillRoundedRect(instrumentLine.x, -100, 140, 78, 8);

        const noteTween = this.tweens.add({
          targets: note,
          paused: true,
          y: instrumentLine.y + 120,
          delay: hit.time * 1000 - 1000,
          onComplete: () => {
            note.destroy();
          },
        });

        allTweens.push(noteTween);
      });
    });

    let countdownText = this.add
      .text(
        this.sys.game.canvas.width / 2,
        this.sys.game.canvas.height / 2,
        "",
        {
          fontSize: "64px",
          color: COLORS.blockBlue.toString(),
        }
      )
      .setOrigin(0.5);

    const steps = 4;
    const stepDuration = this.countdownMs / steps;

    let timelineSteps = [];
    for (let i = 0; i < steps; i++) {
      timelineSteps.push({
        at: i * stepDuration,
        run: () => {
          countdownText.setText(String(steps - i)),
            this.sound.play("countdownStick");
        },
      });
    }
    timelineSteps.push({
      at: this.countdownMs,
      run: () => countdownText.destroy(),
    });

    let timeline = this.add.timeline(timelineSteps);
    timeline.play();

    this.time.delayedCall(this.countdownMs, () => {
      allTweens.forEach((tween) => tween.play());
    });

    let spaceObject: Phaser.Input.Keyboard.Key | undefined;

    if (this.input.keyboard) {
      spaceObject = this.input.keyboard.addKey("SPACE");
    }

    let possibleLatency = song.tempo > 100 ? 300 : 200;

    function between(x: number, min: number, max: number) {
      return x >= min && x <= max;
    }

    spaceObject?.on("down", () => {
      song.instruments
        .find((inst) => inst.name === this.registry.get("selectedInstrument"))
        ?.hits.forEach((hit) => {
          if (
            between(
              this.time.now - this.countdownMs,
              hit.time * 1000 - possibleLatency,
              hit.time * 1000 + possibleLatency
            )
          ) {
            console.log("HIT!", hit);
          }
        });
    });
  }
}
export default TimelineScene;
