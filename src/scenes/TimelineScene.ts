import { COLORS, INSTRUMENTS } from "../constants";
import type { Song, WORLD } from "../types";
import loaderNote1 from "/assets/svg/loader-note1.svg?raw";
import loaderNote2 from "/assets/svg/loader-note2.svg?raw";
import loaderNote3 from "/assets/svg/loader-note3.svg?raw";

function between(x: number, min: number, max: number) {
  return x >= min && x <= max;
}

class TimelineScene extends Phaser.Scene {
  private loader1?: HTMLElement;
  private loader2?: HTMLElement;
  private loader3?: HTMLElement;

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
  spaceKey!: Phaser.Input.Keyboard.Key;
  song: Song = {
    songName: "",
    countdownMs: 0,
    tempo: 0,
    duration: 0,
    instruments: [],
  };
  isTutti: boolean = false;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  init(data: {
    chosenSong: number;
    chosenInstrument: keyof typeof INSTRUMENTS;
    tutti?: boolean;
  }) {
    this.chosenSongIndex = data.chosenSong;
    this.selectedInstrument = data.chosenInstrument;
    this.isTutti = !!data.tutti;
  }

  preload() {
    this.loader1 = document.createElement("div");
    this.loader2 = document.createElement("div");
    this.loader3 = document.createElement("div");
    this.loader1.innerHTML = loaderNote1;
    this.loader2.innerHTML = loaderNote2;
    this.loader3.innerHTML = loaderNote3;

    Object.assign(this.loader1.style, {
      position: "absolute",
      top: "50%",
      left: "calc(50% - 150px)",
      transform: "translate(-50%, -50%)",
      animation: "loader-note-bounce 1.5s infinite",
      zIndex: "1000",
    });

    Object.assign(this.loader2.style, {
      position: "absolute",
      top: "50%",
      left: "calc(50% + 0px)",
      animation: "loader-note-bounce 0.5s infinite",
      transform: "translate(-50%, -50%)",
      zIndex: "1000",
    });

    Object.assign(this.loader3.style, {
      position: "absolute",
      top: "50%",
      left: "calc(50% + 100px)",
      transform: "translate(-50%, -50%)",
      animation: "loader-note-bounce 1s infinite",
      zIndex: "1000",
    });

    document.body.appendChild(this.loader1);
    document.body.appendChild(this.loader2);
    document.body.appendChild(this.loader3);

    this.load.json("song", `assets/songs/song${this.chosenSongIndex + 1}.json`);

    this.load.audio(
      "audio",
      `assets/audio/song${this.chosenSongIndex + 1}.mp3`
    );
    this.load.audio("countdownStick", "assets/audio/countdown-stick.mp3");
    this.load.svg(INSTRUMENTS.bębenek, "assets/svg/drum.svg");
    this.load.svg(INSTRUMENTS.tarka, "assets/svg/guiro.svg");
    this.load.svg(INSTRUMENTS.grzechotka, "assets/svg/rattle.svg");
    this.load.svg(INSTRUMENTS.tamburyn, "assets/svg/tambourine.svg");
    this.load.svg(INSTRUMENTS.drewienka, "assets/svg/woodBlocks.svg");
    this.load.svg(INSTRUMENTS.trójkąt, "assets/svg/triangle.svg");

    this.load.once("complete", () => {
      this.loader1?.remove();
      this.loader2?.remove();
      this.loader3?.remove();
    });
    this.objects = {};
  }

  create() {
    const instruments = (this.cache.json.get("song") as Song).instruments;
    this.song = this.cache.json.get("song") as Song;

    this.countdownMs = this.song.countdownMs;

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

    const width = 140;
    const height = 78;

    instruments.forEach((instrument, index: number) => {
      const hitBox = this.add.graphics();
      hitBox.lineStyle(
        3,
        this.isTutti
          ? COLORS.timeline[this.world].blockStroke.active
          : instrument.name === this.selectedInstrument
          ? COLORS.timeline[this.world].blockStroke.active
          : COLORS.timeline[this.world].blockStroke.faded,
        1
      );
      hitBox.strokeRoundedRect(0, 0, width, height, 8);

      const total = instruments.length;
      const rectWidth = 140;

      const available = this.sys.game.canvas.width;
      const gap = Math.max(0, (available - rectWidth * total) / (total + 1));
      const startX = gap;
      hitBox.x = startX + index * (rectWidth + gap);
      hitBox.y = this.sys.game.canvas.height - 30 - 150;

      hitBox.name = instrument.name;

      this.add
        .image(hitBox.x + width / 2, hitBox.y + height + 20, instrument.name)
        .setScale(0.7, 0.7);

      hitBoxContainer.add(hitBox);
    });

    // ----------
    // Creating note boxes
    // ----------

    const finalY = this.sys.game.canvas.height + 300;

    this.song.instruments.forEach((instrument, index) => {
      const instrumentLine = hitBoxContainer.list[
        index
      ] as Phaser.GameObjects.Graphics;

      instrument.hits.forEach((hit) => {
        const w = 140;
        const h = 78;

        const color = this.isTutti
          ? COLORS.timeline[this.world].blockStroke.active
          : instrument.name === this.selectedInstrument
          ? COLORS.timeline[this.world].blockStroke.active
          : COLORS.timeline[this.world].blockStroke.faded;

        const note = this.add.graphics();

        note.fillStyle(color, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        note.setPosition(instrumentLine.x + width / 2, -100 + height / 2);

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
          fontSize: "350px",
          color: "#FFFFFF",
          fontFamily: "ABeeZee, Arial",
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
      if (this.isTutti) {
        this.time.delayedCall(
          this.countdownMs + note.note.getData("hitTime") * 1000,
          () => {
            this.tweens.add({
              targets: note.note,
              alpha: 0,
              scale: 2,
              duration: 150,
              ease: "Power1",
              onComplete: () => note.note.destroy(),
            });
          }
        );
      } else {
        if (this.selectedInstrument !== note.note.getData("instrument")) {
          this.time.delayedCall(
            this.countdownMs + note.note.getData("hitTime") * 1000 - 200,
            () => {
              this.tweens.add({
                targets: note.note,
                alpha: 0,
                duration: 300,
                ease: "Power1",
                onComplete: () => note.note.destroy(),
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
                onComplete: () => note.note.destroy(),
              });
            }
          );
        }
      }
    });

    this.spaceObject?.on("down", () => {
      if (this.isTutti) {
        this.input.keyboard?.removeKey("SPACE");
      }

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
          scale: 2,
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

  /*   update(time: number) {
    if (time / 1000 >= this.song.duration + this.countdownMs / 1000) {
      this.scene.start("ScoreScene", {
        chosenSong: this.chosenSongIndex,
        chosenInstrument: this.selectedInstrument,
      });
    }
  } */
}

export default TimelineScene;
