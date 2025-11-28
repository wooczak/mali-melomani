import { COLORS, INSTRUMENTS } from "../constants";
import { type Song, WORLD } from "../types";
import loaderNote1 from "/assets/svg/loader-note1.svg?raw";
import loaderNote2 from "/assets/svg/loader-note2.svg?raw";
import loaderNote3 from "/assets/svg/loader-note3.svg?raw";

const between = (x: number, min: number, max: number) => x >= min && x <= max;
const loaderNotes = [loaderNote1, loaderNote2, loaderNote3];

class TimelineScene extends Phaser.Scene {
  private loaders: HTMLElement[] = [];
  private song: Song = {
    songName: "",
    countdownMs: 0,
    tempo: 0,
    world: "ocean",
    duration: 0,
    instruments: [],
  };
  private allNotes: {
    note: Phaser.GameObjects.Graphics;
    tween: Phaser.Tweens.Tween;
  }[] = [];
  private hitBoxContainer!: Phaser.GameObjects.Container;
  private songStartTimestamp: number | null = null;
  private isSpaceHeld = false;

  isTutti = false;
  gameOver = false;
  countdownMs = 0;
  chosenSongIndex = 0;
  selectedInstrument: keyof typeof INSTRUMENTS = "bebenek";
  world: keyof typeof WORLD = "ocean";
  latency = 200;
  gameOverContainer?: Phaser.GameObjects.Container;
  spaceObject?: Phaser.Input.Keyboard.Key;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  init({
    chosenSong,
    chosenInstrument,
    world,
    tutti,
  }: {
    chosenSong: number;
    chosenInstrument: keyof typeof INSTRUMENTS;
    world: keyof typeof WORLD;
    tutti?: boolean;
  }) {
    Object.assign(this, {
      chosenSongIndex: chosenSong,
      selectedInstrument: chosenInstrument,
      world,
      isTutti: !!tutti,
      gameOver: false,
      songStartTimestamp: null,
    });
    this.gameOverContainer?.destroy();
  }

  preload() {
    loaderNotes.forEach((html, i) => {
      const div = document.createElement("div");
      div.innerHTML = html;
      Object.assign(div.style, {
        position: "absolute",
        top: "50%",
        transform: "translate(-50%, -50%)",
        left: `calc(50% + ${(i - 1) * 170}px)`,
        animation: `loader-note-bounce ${[1.5, 0.5, 1][i]}s infinite`,
        zIndex: "1000",
      });
      document.body.appendChild(div);
      this.loaders.push(div);
    });

    this.load.audio(
      "audio",
      `assets/audio/song${this.chosenSongIndex + 1}.mp3`
    );

    this.load.audio("countdownStick", "assets/audio/countdown-stick.mp3");

    ["game-over-box", `arrow-back-${this.world}`].forEach((i) =>
      this.load.svg(i, `assets/svg/${i}.svg`)
    );

    for (let i = 0; i <= Object.values(INSTRUMENTS).length; i++) {
      if (!Object.values(INSTRUMENTS)[i]) break;

      this.load.svg(
        `${this.world}-${Object.values(INSTRUMENTS)[i]}`,
        `assets/svg/${this.world}-${Object.values(INSTRUMENTS)[i]}.svg`
      );
    }

    this.load.once("complete", () => this.loaders.forEach((l) => l.remove()));
  }

  create() {
    this.song = this.cache.json.get(`song${this.chosenSongIndex + 1}`) as Song;
    const instruments = this.song.instruments;
    this.countdownMs = this.song.countdownMs;

    // Camera setup
    const cam = this.cameras.add(
      0,
      0,
      this.sys.game.canvas.width,
      this.sys.game.canvas.height
    );
    cam.setBackgroundColor(
      Phaser.Display.Color.IntegerToColor(COLORS.timeline[this.world].bg).rgba
    );

    this.sound.unlock();
    window.addEventListener("focus", () => {
      if ("context" in this.sound) {
        (this.sound as Phaser.Sound.WebAudioSoundManager).context.resume();
      } else {
        this.sound.resumeAll();
      }
    });
    window.addEventListener("blur", () => {
      if ("context" in this.sound) {
        (this.sound as Phaser.Sound.WebAudioSoundManager).context.resume();
      } else {
        this.sound.resumeAll();
      }
    });

    // Back arrow
    const arrowBack = this.add
      .image(50, 50, `arrow-back-${this.world}`)
      .setOrigin(0.5)
      .setScale(1)
      .setInteractive();
    arrowBack.on(
      "pointerover",
      () => (this.input.manager.canvas.style.cursor = "pointer")
    );
    arrowBack.on(
      "pointerout",
      () => (this.input.manager.canvas.style.cursor = "default")
    );
    arrowBack.on("pointerdown", () => this.resetScene("PickSongScene"));

    // Hit boxes
    const { width, height } = { width: 140, height: 78 };
    this.hitBoxContainer = this.add.container(0, 0);
    const total = instruments.length;
    const gap = Math.max(
      0,
      (this.sys.game.canvas.width - width * total) / (total + 1)
    );

    instruments.forEach((instrument, i) => {
      const color =
        this.isTutti || instrument.name === this.selectedInstrument
          ? COLORS.timeline[this.world].blockStroke.active
          : COLORS.timeline[this.world].blockStroke.faded;

      const hitBox = this.add
        .graphics()
        .lineStyle(3, color, 1)
        .strokeRoundedRect(-width / 2, -height / 2, width, height, 8);

      hitBox.setPosition(
        gap + i * (width + gap) + width / 2,
        this.sys.game.canvas.height - 180 + height / 2
      );
      hitBox.name = instrument.name;
      this.add
        .image(hitBox.x, 100, `${this.world}-${instrument.name}`)
        .setDepth(20);
      this.add
        .image(hitBox.x, hitBox.y + height / 2 + 20, instrument.name)
        .setScale(
          ["janczary", "tamburyn"].includes(instrument.name) ? 0.6 : 0.8
        );

      this.hitBoxContainer.add(hitBox);
    });

    // Notes
    const finalY = this.sys.game.canvas.height + 300;
    instruments.forEach((instrument, i) => {
      const line = this.hitBoxContainer.list[i] as Phaser.GameObjects.Graphics;
      const noteStartY = -100 + height / 2;
      const tweenDur = (finalY / (line.y + 120)) * 1000;
      const pxPerSec = (finalY - noteStartY) / (tweenDur / 1000);

      instrument.hits.forEach((hit) => {
        const isLong = hit.type === "long" && hit.length! > 0;
        const h = isLong ? hit.length! * pxPerSec : height;
        const color =
          this.isTutti || instrument.name === this.selectedInstrument
            ? COLORS.timeline[this.world].blockStroke.active
            : COLORS.timeline[this.world].blockStroke.faded;

        const yStart = noteStartY - (h - height) / 2;

        const note = this.add
          .graphics()
          .fillStyle(color, 1)
          .fillRoundedRect(-width / 2, -h / 2, width, h, 8)
          .setPosition(line.x, yStart)
          .setData({ hitTime: hit.time, instrument: instrument.name, isLong })
          .setDepth(10);

        const tween = this.tweens.add({
          targets: note,
          paused: true,
          y: finalY,
          delay: hit.time * 1000 - 800,
          duration: tweenDur,
        });

        this.allNotes.push({ note, tween });
      });
    });

    // Countdown
    const countdown = this.add
      .text(
        this.sys.game.canvas.width / 2,
        this.sys.game.canvas.height / 2,
        "",
        { fontSize: "350px", color: "#FFF", fontFamily: "ABeeZee, Arial" }
      )
      .setOrigin(0.5);

    const steps = 4,
      dur = this.countdownMs / steps;
    const events = Array.from({ length: steps }, (_, i) => ({
      at: i * dur,
      run: () => (
        countdown.setText(String(steps - i)), this.sound.play("countdownStick")
      ),
    }));

    this.add
      .timeline([
        ...events,
        { at: this.countdownMs, run: () => countdown.destroy() },
      ])
      .add({
        at: this.countdownMs,
        run: () => (
          this.sound.play("audio"), (this.songStartTimestamp = this.time.now)
        ),
      })
      .play();

    this.time.delayedCall(this.countdownMs, () => {
      this.allNotes.forEach((n) => n.tween.play());
    });

    if (this.input.keyboard) {
      this.spaceObject = this.input.keyboard.addKey("SPACE");
    }

    this.setupNoteFadeouts();
    this.spaceObject?.on("down", () => {
      this.isSpaceHeld = true;
      this.handleHit();
    });
  }

  private setupNoteFadeouts() {
    this.allNotes.forEach((note) => {
      const instrument = note.note.getData("instrument");
      const time = this.countdownMs + note.note.getData("hitTime") * 1000;
      const hitBox = this.hitBoxContainer.list.find(
        (hb: any) => hb.name === instrument
      );

      if (this.isTutti || this.selectedInstrument !== instrument) {
        this.time.delayedCall(time, () => {
          this.tweens.add({
            targets: note.note,
            alpha: 0,
            duration: this.isTutti ? 150 : 100,
            onComplete: () => note.note.destroy(),
          });
          if (!this.isTutti)
            this.tweens.add({
              targets: hitBox,
              scaleX: 1.1,
              scaleY: 1.1,
              duration: 100,
              yoyo: true,
            });
        });
      } else {
        this.time.delayedCall(time + 200, () =>
          this.tweens.add({
            targets: note.note,
            alpha: 0,
            duration: 300,
            onComplete: () => note.note.destroy(),
          })
        );
      }
    });
  }

  private handleHit() {
    if (this.isTutti) this.input.keyboard?.removeKey("SPACE");
    if (!this.songStartTimestamp) return;

    const current = (this.time.now - this.songStartTimestamp) / 1000;
    const hitNote = this.allNotes.find(
      (n) =>
        n.note.getData("instrument") === this.selectedInstrument &&
        between(
          current,
          n.note.getData("hitTime") - this.latency / 1000,
          n.note.getData("hitTime") + this.latency / 1000
        )
    );

    if (hitNote) {
      hitNote.tween.stop();

      if (hitNote.note.getData("isLong")) {
        const holdDuration = 1350;
        this.time.delayedCall(holdDuration, () => {
          this.tweens.add({
            targets: hitNote.note,
            alpha: 0,
            scale: 2,
            duration: 100,
            onComplete: () => hitNote.note.destroy(),
          });
        });
        return;
      }

      this.tweens.add({
        targets: hitNote.note,
        alpha: 0,
        scale: 2,
        duration: 100,
        onComplete: () => hitNote.note.destroy(),
      });
    } else {
      const next = this.allNotes.find(
        (n) =>
          n.note.getData("instrument") === this.selectedInstrument &&
          n.note.getData("hitTime") > current &&
          !n.note.getData("jiggling")
      );
      if (next) {
        next.note.setData("jiggling", true);
        this.tweens.add({
          targets: next.note,
          x: next.note.x + 10,
          duration: 50,
          yoyo: true,
          repeat: 2,
          onComplete: () => next.note.setData("jiggling", false),
        });
      }
    }
  }

  update(time: number) {
    if (!this.songStartTimestamp) return;

    if (
      Math.floor(time / 1000 - this.songStartTimestamp / 1000) >=
      this.song.duration
    )
      this.showGameOver();
  }

  private resetScene(sceneName: string) {
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.sound.stopAll();
    this.sound.removeAll();
    for (let i = 1; i <= 5; i++) this.textures.remove("world-animal" + i);
    this.cache.audio.remove("audio");
    this.cache.audio.remove("countdownStick");
    this.scene.stop();
    this.scene.start(sceneName);
  }

  private showGameOver() {
    this.gameOver = true;
    const c = this.sys.game.canvas;
    const { width, height } = { width: 300, height: 60 };
    const centerX = c.width / 2,
      centerY = c.height / 2;
    this.gameOverContainer = this.add.container(0, 0);

    const box = this.add
      .image(centerX, centerY, "game-over-box")
      .setOrigin(0.5)
      .setScale(0.8);
    const txt = this.add
      .text(centerX, centerY - 100, "Koniec gry!", {
        fontSize: "64px",
        color: "#000",
        fontFamily: "DynaPuff, Arial",
      })
      .setOrigin(0.5);

    const makeBtn = (y: number, text: string, cb: () => void) => {
      const g = this.add
        .graphics({
          x: centerX - width / 2,
          y: centerY + y - height / 2,
          fillStyle: { color: COLORS.textRed },
        })
        .fillRoundedRect(0, 0, width, height, 8)
        .setInteractive(
          new Phaser.Geom.Rectangle(0, 0, width, height),
          Phaser.Geom.Rectangle.Contains
        )
        .on("pointerdown", cb);
      const t = this.add
        .text(centerX, centerY + y, text, {
          font: "600 22px ABeeZee",
          color: "#fff",
        })
        .setOrigin(0.5);
      return [g, t];
    };

    const [repickBtn, repickTxt] = makeBtn(10, "Wybierz inny utwór", () =>
      this.resetScene("PickSongScene")
    );
    const [replayBtn, replayTxt] = makeBtn(90, "Zagraj ponownie", () =>
      this.scene.restart({
        chosenSong: this.chosenSongIndex,
        chosenInstrument: this.selectedInstrument,
        tutti: this.isTutti,
        world: this.world,
      })
    );

    [repickBtn, replayBtn].forEach((btn) => {
      btn.on(
        "pointerover",
        () => (this.input.manager.canvas.style.cursor = "pointer")
      );
      btn.on(
        "pointerout",
        () => (this.input.manager.canvas.style.cursor = "default")
      );
    });

    this.gameOverContainer.add([
      box,
      txt,
      repickBtn,
      repickTxt,
      replayBtn,
      replayTxt,
    ]);
  }
}

export default TimelineScene;
