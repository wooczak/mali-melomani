import { COLORS, INSTRUMENTS } from "../constants";
import type { Song, WORLD } from "../types";

class TimelineScene extends Phaser.Scene {
  hitBoxContainer: Phaser.GameObjects.Container[] = [];
  countdownMs: number = 0;
  chosenSongIndex: number = 0;
  selectedInstrument: keyof typeof INSTRUMENTS = "bębenek";
  world: WORLD = "ocean";
  objects = {};

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  init(data: {
    chosenSong: number;
    chosenInstrument: keyof typeof INSTRUMENTS;
  }) {
    this.chosenSongIndex = data.chosenSong;
    this.selectedInstrument = data.chosenInstrument;
  }

  preload() {
    this.load.json("song", `assets/songs/song${this.chosenSongIndex + 1}.json`);
    this.load.audio(
      "audio",
      `assets/audio/song${this.chosenSongIndex + 1}.mp3`
    );
    this.load.audio("countdownStick", "assets/audio/countdown-stick.mp3");
    this.load.on("progress", (val: number) => {
      console.log(`TimelineScene preload: ${val}`);
    });
    this.objects = {};
  }

  create() {
    const instruments = (this.cache.json.get("song") as Song).instruments;
    const song = this.cache.json.get("song") as Song;

    this.countdownMs = song.countdownMs;
    const allNotes: {
      note: Phaser.GameObjects.Graphics;
      tween: Phaser.Tweens.Tween;
    }[] = [];
// @ts-ignore
    this.objects.camera = this.cameras.add(
      0,
      0,
      this.sys.game.canvas.width,
      this.sys.game.canvas.height
    );
// @ts-ignore
    this.objects.camera.setBackgroundColor(
      Phaser.Display.Color.IntegerToColor(COLORS.timeline[this.world].bg).rgba
    );

    this.input.once("pointerdown", () => {
      if (
        this.sound instanceof Phaser.Sound.WebAudioSoundManager &&
        this.sound.context.state === "suspended"
      ) {
        this.sound.context.resume();
      }
    });

    let hitBoxContainer = this.add.container(0, 0);

    instruments.forEach((instrument, index: number) => {
      const hitBox = this.add.graphics();
      hitBox.lineStyle(
        3,
        instrument.name === this.selectedInstrument
          ? COLORS.timeline[this.world].blockStroke.active
          : COLORS.timeline[this.world].blockStroke.faded,
        1
      );
      hitBox.strokeRoundedRect(0, 0, 140, 78, 8);

      const total = instruments.length;
      const rectWidth = 140;
      const spacing = (this.sys.game.canvas.width - rectWidth) / total;

      hitBox.x = 75 + index * spacing;
      hitBox.y = this.sys.game.canvas.height - 30 - 78;

      hitBox.name = instrument.name;

      hitBoxContainer.add(hitBox);
    });

    song.instruments.forEach((instrument, index) => {
      const instrumentLine = hitBoxContainer.list[
        index
      ] as Phaser.GameObjects.Graphics;

      instrument.hits.forEach((hit) => {
        const note = this.add
          .graphics()
          .fillStyle(
            instrument.name === this.selectedInstrument
              ? COLORS.timeline[this.world].blockStroke.active
              : COLORS.timeline[this.world].blockStroke.faded,
            1
          )
          .fillRoundedRect(instrumentLine.x, -100, 140, 78, 8);

        note.setData("hitTime", hit.time);

        const noteTween = this.tweens.add({
          targets: note,
          paused: true,
          y: instrumentLine.y + 120,
          delay: hit.time * 1000 - 1000,
        });

        allNotes.push({
          note,
          tween: noteTween,
        });
      });
    });

    let countdownText = this.add
      .text(
        this.sys.game.canvas.width / 2,
        this.sys.game.canvas.height / 2,
        "",
        {
          fontSize: "64px",
          color: COLORS.timeline[this.world].blockStroke.toString(),
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
    timeline.add({
      at: this.countdownMs,
      run: () => {
        this.sound.play("audio");
      },
    });
    timeline.play();

    this.time.delayedCall(this.countdownMs, () => {
      allNotes.forEach((note) => note.tween.play());
    });

    let spaceObject: Phaser.Input.Keyboard.Key | undefined;

    if (this.input.keyboard) {
      spaceObject = this.input.keyboard.addKey("SPACE");
    }

    let possibleLatency = 500;

    function between(x: number, min: number, max: number) {
      return x >= min && x <= max;
    }

    spaceObject?.on("down", () => {
      song.instruments
        .find((inst) => inst.name === this.selectedInstrument)
        ?.hits.forEach((hit) => {
          if (
            between(
              this.time.now - this.countdownMs,
              hit.time * 1000 - possibleLatency,
              hit.time * 1000 + possibleLatency
            )
          ) {
            const noteHit = allNotes.find((note) =>
              between(
                note.note.getData("hitTime") * 1000,
                this.time.now - this.countdownMs - possibleLatency,
                this.time.now - this.countdownMs + possibleLatency
              )
            );

            console.log(
              noteHit?.note.getData("hitTime") * 1000,
              this.time.now - this.countdownMs - possibleLatency,
              this.time.now - this.countdownMs + possibleLatency
            );

            if (noteHit) {
              this.tweens.add({
                targets: noteHit.note,
                scaleX: 1.2,
                scaleY: 1.2,
                alpha: 0,
                duration: 100,
                onComplete: () => {
                  this.tweens.killTweensOf(noteHit.note);
                  noteHit.note.destroy(true); 
                  allNotes.splice(allNotes.indexOf(noteHit), 1);
                },
              });
            }
          }
        });
    });
  }
}
export default TimelineScene;
