import { COLORS, INSTRUMENTS } from "../constants";
import type { Song, WORLD } from "../types";

function between(x: number, min: number, max: number) {
  return x >= min && x <= max;
}

class TimelineScene extends Phaser.Scene {
  hitBoxContainer: Phaser.GameObjects.Container[] = [];
  countdownMs: number = 0;
  chosenSongIndex: number = 0;
  selectedInstrument: keyof typeof INSTRUMENTS = "bębenek";
  world: WORLD = "ocean";
  objects = {};
  spaceObject: Phaser.Input.Keyboard.Key | undefined;
  allNotes: {
    note: Phaser.GameObjects.Graphics;
    tween: Phaser.Tweens.Tween;
  }[] = [];
  latency = 200;
  songStartTimestamp: number | null = null;
  startTime = 0;
  spaceKey!: Phaser.Input.Keyboard.Key;

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

    this.startTime = this.time.now;
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

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

    // ----------
    // Creating hit boxes and notes
    // ----------

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

    // ----------
    // Creating note boxes
    // ----------

    const finalY = this.sys.game.canvas.height + 300;

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
        note.setData("instrument", instrument.name);

        const noteTween = this.tweens.add({
          targets: note,
          paused: true,
          y: finalY,
          delay: hit.time * 1000 - 1000,
          duration: (finalY / (instrumentLine.y + 120)) * 1000,
        });

        this.allNotes.push({
          note,
          tween: noteTween,
        });
      });
    });

    // ----
    // Creating countdown
    // ----

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
        this.songStartTimestamp = this.time.now;
      },
    });

    timeline.play();

    this.time.delayedCall(this.countdownMs, () => {
      this.allNotes.forEach((note) => note.tween.play());
    });

    if (this.input.keyboard) {
      this.spaceObject = this.input.keyboard.addKey("SPACE");
    }

    this.allNotes.forEach((note) => {
      if (this.selectedInstrument !== note.note.getData("instrument")) {
        this.time.delayedCall(
          this.countdownMs + note.note.getData("hitTime") * 1000 - 200,
          () => {
            this.tweens.add({
              targets: note.note,
              alpha: 0,
              duration: 300,
              ease: "Power1",
              onComplete: () => {
                note.note.destroy();
              },
            });
          }
        );
      } else {
        this.time.delayedCall(
          this.countdownMs + note.note.getData("hitTime") * 1000 + 200,
          () => {
            this.tweens.add({
              targets: note.note,
              alpha: 0,
              duration: 300,
              ease: "Power1",
              onComplete: () => {
                note.note.destroy();
              },
            });
          }
        );
      }
    });

    this.spaceObject?.on("down", () => {
      if (this.songStartTimestamp === null) return;

      const currentGameTime = (this.time.now - this.songStartTimestamp) / 1000;
      if (currentGameTime < 0) return;

      const hitNote = this.allNotes.find(
        (n) =>
          n.note.getData("instrument") === this.selectedInstrument &&
          between(
            currentGameTime,
            n.note.getData("hitTime") - this.latency / 1000,
            n.note.getData("hitTime") + this.latency / 1000
          )
      );

      if (hitNote) {
        hitNote.tween.stop();
        this.tweens.add({
          targets: hitNote.note,
          alpha: 0,
          scaleY: "+=0.5",
          duration: 100,
          ease: "Power1",
          onComplete: () => {
            hitNote.note.destroy();
          },
        });
      } else {
        const upcomingNote = this.allNotes.find(
          (n) =>
            n.note.getData("instrument") === this.selectedInstrument &&
            n.note.getData("hitTime") > currentGameTime &&
            !n.note.getData("jiggling")
        );

        if (upcomingNote) {
          upcomingNote.note.setData("jiggling", true);

          this.tweens.add({
            targets: upcomingNote.note,
            x: upcomingNote.note.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 2,
            onComplete: () => upcomingNote.note.setData("jiggling", false),
          });
        }
      }
    });
  }
}

export default TimelineScene;
