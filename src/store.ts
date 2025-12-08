import { GAME_SCENE_KEY } from "./constants";
import { WORLD } from "./types";
import { resetSceneState } from "./utils";

type StateType = {
  chosenSongName: string;
  chosenWorld: keyof typeof WORLD;
  game: Phaser.Game | null;
  currentScene: (typeof GAME_SCENE_KEY)[keyof typeof GAME_SCENE_KEY];
};

const state: StateType = {
  chosenSongName: "",
  chosenWorld: WORLD.ocean,
  game: null,
  currentScene: GAME_SCENE_KEY.hello,
};

const bannerContainer = document.getElementById("game-banner-container");

function refreshGameBanner() {
  if (gameStore.chosenSongName) {
    if (!bannerContainer) return;

    bannerContainer.innerHTML = `
      <div class="${
        gameStore.currentScene === GAME_SCENE_KEY.pickInstrument
          ? "pick-instrument-banner"
          : `${gameStore.chosenWorld}-banner`
      } p-4 text-center flex relative w-[1000px] m-auto poppins-regular text-lg">
      <button class="flex gap-2 items-center ${
        gameStore.currentScene === GAME_SCENE_KEY.pickInstrument
          ? "pick-instrument-arrow-back"
          : `${gameStore.chosenWorld}-arrow-back`
      }  arrow-back">
        <i class="fa-solid fa-arrow-left" style="color: ${
          gameStore.currentScene === GAME_SCENE_KEY.pickInstrument
            ? "#8c0129"
            : gameStore.chosenWorld === "ocean"
            ? "#1052a3"
            : gameStore.chosenWorld === "forest"
            ? "#1f713a"
            : gameStore.chosenWorld === "savanna"
            ? "#f54b24"
            : "#8c0129"
        };"></i>
        <p>Wróć</p>
      </button>  
      <p class="block w-2xl ${
        gameStore.chosenWorld
      }-text text-lg -translate-1/2 absolute left-1/2 top-1/2 transform">
          ${
            [GAME_SCENE_KEY.pickInstrument, GAME_SCENE_KEY.pickSong].includes(
              // @ts-ignore
              gameStore.currentScene
            )
              ? "Wybrany utwór"
              : "Teraz gra"
          }: <span class="font-bold">${gameStore.chosenSongName}</span>
        </p>
      </div>
    `;
  }

  document.querySelector(".arrow-back")?.addEventListener("click", function () {
    if (!gameStore.game) return;

    const game = gameStore.game;

    resetSceneState(
      gameStore.currentScene,
      game.scene.getScene(gameStore.currentScene)
    );
  });
}

function removeGameBanner() {
  if (!bannerContainer) return;
  bannerContainer.innerHTML = "";
}

function onStateChange<K extends keyof StateType>(
  property: K,
  value: StateType[K]
): void {
  if (property === "currentScene") {
    if (value === GAME_SCENE_KEY.hello || value === GAME_SCENE_KEY.pickSong)
      removeGameBanner();
    else refreshGameBanner();
  }
}

const handler: ProxyHandler<StateType> = {
  set<K extends keyof StateType>(
    target: StateType,
    property: K,
    value: StateType[K]
  ): boolean {
    if (!(property in target)) return false;

    target[property] = value;
    onStateChange(property, value);
    return true;
  },
};

export const gameStore = new Proxy(state, handler);
