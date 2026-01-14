import { COLORS, GAME_SCENE_KEY, INSTRUMENTS } from "../constants";
import { gameStore } from "../store";
import { type Song, WORLD } from "../types";
import { resetSceneState } from "../utils";
import loaderNote1 from "/assets/svg/loader-note1.svg?raw";
import loaderNote2 from "/assets/svg/loader-note2.svg?raw";
import loaderNote3 from "/assets/svg/loader-note3.svg?raw";

const between = (x: number, min: number, max: number) => x >= min && x <= max;
const loaderNotes = [loaderNote1, loaderNote2, loaderNote3];

type NoteTweenData = {
  note: Phaser.GameObjects.Graphics;
  tween: Phaser.Tweens.Tween;
};

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
  private allNotes: NoteTweenData[] = [];
  private hitBoxContainer!: Phaser.GameObjects.Container;
  private songStartTimestamp: number | null = null;
  private isSpaceHeld = false;
  private noteWidth = 140;
  private noteHeight = 78;
  private pxPerSec: number = 0;
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
        top: "60%",
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

    const songData = this.cache.json.get(
      `song${this.chosenSongIndex + 1}`
    ) as Song;

    songData.instruments.forEach((instrument) => {
      this.load.svg(
        `${this.world}-${instrument.name}`,
        `assets/svg/${this.world}-${instrument.name}.svg`
      );
    });

    this.load.once("complete", () => this.loaders.forEach((l) => l.remove()));
  }

  create() {
    gameStore.currentScene = GAME_SCENE_KEY.timeline;
    this.song = this.cache.json.get(`song${this.chosenSongIndex + 1}`) as Song;
    this.countdownMs = this.song.countdownMs;
    const instruments = this.song.instruments;

    this.cameras
      .add(0, 0, this.sys.game.canvas.width, this.sys.game.canvas.height)
      .setBackgroundColor(
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

    const { width, height } = {
      width: this.noteWidth,
      height: this.noteHeight,
    };
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
          instrument.name === "tamburyn"
            ? 0.55
            : instrument.name === "janczary"
            ? 0.7
            : 0.8
        );

      this.hitBoxContainer.add(hitBox);
    });

    instruments.forEach((instrument, i) => {
      const line = this.hitBoxContainer.list[i] as Phaser.GameObjects.Graphics;

      const noteStartY = -100 + height / 2;

      instrument.hits.forEach((hit) => {
        const isLong = hit.type === "long" && hit.length! > 0;
        const finalY = this.sys.game.canvas.height + (!isLong ? 300 : 1000)

        const tweenDur = (finalY / (line.y + 120)) * 1000;
        const pxPerSec = (finalY - noteStartY) / (tweenDur / 1000);

        this.pxPerSec = pxPerSec;

        const h = isLong ? hit.length! * pxPerSec : height;
        const color =
          this.isTutti || instrument.name === this.selectedInstrument
            ? COLORS.timeline[this.world].blockStroke.active
            : COLORS.timeline[this.world].blockStroke.faded;

        const yStart = noteStartY - (h - height) / 2;
        const longHitDuration = isLong ? hit.length! * 1000 : 0;

        const extraDistance = (h - height) / 2;
        const extraTime = (extraDistance / pxPerSec) * 1000;
        const adjustedDuration = tweenDur + extraTime;

        const note = this.add
          .graphics()
          .fillStyle(color, 1)
          .fillRoundedRect(-width / 2, -h / 2, width, h, 8)
          .setPosition(line.x, yStart)
          .setData({
            hitTime: hit.time,
            instrument: instrument.name,
            isLong,
            longHitDuration,
            name: `${instrument.name}-note-${hit.time}`,
            consumedDuration: 0,
          })
          .setDepth(10);

        const tween = this.tweens.add({
          targets: note,
          paused: true,
          y: finalY,
          delay: hit.time * 1000 - 800,
          duration: adjustedDuration,
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
        {
          at: this.countdownMs,
          run: () => {
            countdown.destroy();
            this.setupNoteFadeouts();
          },
        },
      ])
      .add({
        at: this.countdownMs,
        run: () => (
          this.sound.play("audio"), (this.songStartTimestamp = this.time.now)
        ),
      })
      .play();

    if (this.input.keyboard) {
      this.spaceObject = this.input.keyboard.addKey("SPACE");
    }

    this.spaceObject?.on("down", () => {
      this.handleHit();
    });
  }

  private setupNoteFadeouts() {
    this.allNotes.forEach((note) => {
      const targetNote = note.note;

      const longHitDuration = targetNote.getData("longHitDuration") || 0;
      const instrument = targetNote.getData("instrument");
      const time = targetNote.getData("hitTime") * 1000;
      const hitBox = this.hitBoxContainer.list.find(
        (hb: any) => hb.name === instrument
      );
      const isTuttiOrNotSelectedInstrument =
        this.isTutti || this.selectedInstrument !== instrument;
      const isSelectedInstrument = !isTuttiOrNotSelectedInstrument;

      this.tweens.add({
        targets: targetNote,
        alpha: 0,
        delay: time,
        duration: 100 + longHitDuration * 1000,
        onComplete: () => targetNote.destroy(),
        scale: isTuttiOrNotSelectedInstrument ? 2 : 1,
      });

      if (isSelectedInstrument) return;

      this.tweens.add({
        targets: hitBox,
        scaleX: 1.1,
        delay: time,
        scaleY: 1.1,
        duration: 100 + longHitDuration * 1000,
        yoyo: true,
      });
    });
  }

  private handleHit() {
    if (this.isTutti) this.input.keyboard?.removeKey("SPACE");
    if (!this.songStartTimestamp) return;

    const current = (this.time.now - this.songStartTimestamp) / 1000;
    const hit = this.allNotes.find(
      (n) =>
        n.note.getData("instrument") === this.selectedInstrument &&
        between(
          current,
          n.note.getData("hitTime") - this.latency / 1000,
          n.note.getData("hitTime") + this.latency / 1000
        )
    );

    if (hit) {
      const isLong = hit.note.getData("isLong");

      if (!isLong) hit.tween.stop();

      if (isLong) return;

      this.tweens.add({
        targets: hit.note,
        alpha: 0,
        scale: 2,
        duration: 100,
        onComplete: () => hit.note.destroy(),
      });

      const hb = this.hitBoxContainer.list.find(
        (hb: any) => hb.name === hit.note.getData("instrument")
      );

      this.tweens.add({
        targets: hb,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 50,
        yoyo: true,
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

  private startAllNotes() {
    this.allNotes.forEach((n) => n.tween.play());
  }

  update(time: number, delta: number) {
    if (!this.songStartTimestamp) return;

    if (time === this.songStartTimestamp) {
      this.startAllNotes();
    }

    let currentTime = (time - this.songStartTimestamp) / 1000;

    if (this.spaceObject?.isDown) {
      this.isSpaceHeld = true;
    }

    if (this.spaceObject?.isUp) {
      this.isSpaceHeld = false;
    }

    this.allNotes.forEach((note) => {
      if (!note.note.getData("isLong")) return;

      const longNote = note.note;
      const hitTime = longNote.getData("hitTime");
      const longDuration = longNote.getData("longHitDuration");

      if (between(currentTime, hitTime - 0.2, hitTime + longDuration + 0.2)) {
        const relatedTween = this.allNotes.find(
          (n) => n.note.getData("name") === longNote.getData("name")
        )?.tween;

        const relatedHitBoxContainer = this.hitBoxContainer.list.find(
          (hb: any) => hb.name === longNote.getData("instrument")
        );

        if (this.isSpaceHeld) {
          if (relatedTween) {
            relatedTween.pause();
          }

          const consumedDuration =
            longNote.getData("consumedDuration") + delta / 1000;
          longNote.setData("consumedDuration", consumedDuration);

          const width = this.noteWidth;
          const longDurationMs = longNote.getData("longHitDuration");
          const longDurationSec = longDurationMs / 1000;
          const baseHeight = longDurationSec * this.pxPerSec;
          const eatenPx =
            Math.min(consumedDuration, longDurationSec) * this.pxPerSec;
          const h = Math.max(baseHeight - eatenPx, 0);

          longNote.clear();
          longNote.fillStyle(COLORS.timeline[this.world].blockStroke.active, 1);
          longNote.fillRoundedRect(
            -width / 2,
            eatenPx / 2 - h / 2,
            width,
            h,
            8
          );

          this.tweens.add({
            targets: relatedHitBoxContainer,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
          });

          if (eatenPx >= 0.9 * baseHeight) {
            longNote.destroy();
          }
        } else {
          this.tweens.add({
            targets: relatedHitBoxContainer,
            scaleX: 1,
            scaleY: 1,
          });

          if (relatedTween) {
            relatedTween.resume();
          }
        }
      }

      if (currentTime > hitTime + longDuration + 0.2) {
        longNote.destroy();
      }
    });

    if (
      Math.floor(time / 1000 - this.songStartTimestamp / 1000) >=
      this.song.duration
    )
      this.showGameOver();
  }

  private resetScene(
    goToScene?: (typeof GAME_SCENE_KEY)[keyof typeof GAME_SCENE_KEY]
  ) {
    resetSceneState("TimelineScene", this, goToScene);
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
      this.resetScene(GAME_SCENE_KEY.pickSong)
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
