import { GAME_SCENE_KEY } from "./constants";

export function bringBackPolishChars(input: string): string {
  return input.replace(/Bebenek/g, "Bębenek").replace(/Trojkat/g, "Trójkąt");
}

export function resetSceneState(
  currentScene: (typeof GAME_SCENE_KEY)[keyof typeof GAME_SCENE_KEY],
  game: Phaser.Scene
) {
  switch (currentScene) {
    case GAME_SCENE_KEY.timeline:
      game.tweens.killAll();
      game.time.removeAllEvents();
      game.sound.stopAll();
      game.sound.removeAll();
      for (let i = 1; i <= 5; i++) game.textures.remove("world-animal" + i);
      game.cache.audio.remove("audio");
      game.cache.audio.remove("countdownStick");
      game.scene.stop();
      game.scene.start(GAME_SCENE_KEY.pickInstrument);
      break;
    case GAME_SCENE_KEY.pickInstrument:
      game.scene.stop();
      game.scene.start(GAME_SCENE_KEY.pickSong);
      break;
    default:
      break;
  }
}
