import Phaser from "phaser";
import "./styles.css";
import {
  HelloScene,
  PickInstrumentScene,
  PickSongScene,
  TimelineScene,
} from "./scenes";
import { COLORS, GAME_SCENE_KEY } from "./constants";
import { gameStore } from "./store";

document.addEventListener("DOMContentLoaded", () => {
  initializeHamburgerMenu();
  changeFairyTaleButtons();
});
const gameBg = Phaser.Display.Color.IntegerToColor(COLORS.whiteBg).rgba;

function initializeHamburgerMenu() {
  const hamburgerButton = document.getElementById("hamburger-menu");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuItems = document.querySelectorAll(".mobile-menu-item");
  const mainContent = document.querySelector("main");

  if (!hamburgerButton || !mobileMenu) return;

  let isMenuOpen = false;

  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
      hamburgerButton.classList.add("hamburger-active");
      mobileMenu.classList.remove("mobile-menu-closed");
      mobileMenu.classList.add("mobile-menu-open");

      if (mainContent) {
        mainContent.style.transition =
          "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        mainContent.style.transform = "translateY(0)";
      }
    } else {
      hamburgerButton.classList.remove("hamburger-active");
      mobileMenu.classList.remove("mobile-menu-open");
      mobileMenu.classList.add("mobile-menu-closed");

      if (mainContent) {
        mainContent.style.transform = "translateY(0)";
      }
    }
  };

  // Close menu function
  const closeMenu = () => {
    if (isMenuOpen) {
      isMenuOpen = false;
      hamburgerButton.classList.remove("hamburger-active");
      mobileMenu.classList.remove("mobile-menu-open");
      mobileMenu.classList.add("mobile-menu-closed");

      if (mainContent) {
        mainContent.style.transform = "translateY(0)";
      }
    }
  };

  // Add click event to hamburger button
  hamburgerButton.addEventListener("click", toggleMenu);

  // Close menu when clicking on menu items
  mobileMenuItems.forEach((item) => {
    item.addEventListener("click", closeMenu);
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    if (
      isMenuOpen &&
      !hamburgerButton.contains(target) &&
      !mobileMenu.contains(target)
    ) {
      closeMenu();
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      closeMenu();
    }
  });

  // Handle window resize - close menu on desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && isMenuOpen) {
      closeMenu();
    }
  });
}

function changeFairyTaleButtons() {
  const oceanButton = document.querySelector(".fairy-tales-button-ocean");
  const forestButton = document.querySelector(".fairy-tales-button-forest");
  const savannaButton = document.querySelector(".fairy-tales-button-savanna");

  const oceanContent = document.getElementById("ocean-content");
  const forestContent = document.getElementById("forest-content");
  const savannaContent = document.getElementById("savanna-content");

  const buttons = [oceanButton, forestButton, savannaButton];
  const contents = [oceanContent, forestContent, savannaContent];

  // Set ocean as default active
  oceanButton?.classList.add("active");
  oceanContent?.classList.remove("hidden");
  oceanContent?.classList.add("grid");

  buttons.forEach((button, index) => {
    button?.addEventListener("click", () => {
      // Remove active class from all buttons
      buttons.forEach((btn) => btn?.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");

      // Hide all content sections
      contents.forEach((content) => {
        content?.classList.add("hidden");
        content?.classList.remove("grid");
      });

      // Show the corresponding content
      const activeContent = contents[index];
      activeContent?.classList.remove("hidden");
      activeContent?.classList.add("grid");
    });
  });
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: "game-container",
  audio: {
    disableWebAudio: false,
  },
  fps: {
    forceSetTimeOut: false,
  },
  autoFocus: true,
  callbacks: {},
  banner: false,
  scene: [
    new HelloScene({
      key: GAME_SCENE_KEY.hello,
      cameras: { backgroundColor: gameBg },
    }),
    new PickSongScene({
      key: GAME_SCENE_KEY.pickSong,
      cameras: { backgroundColor: gameBg },
    }),
    new PickInstrumentScene({
      key: GAME_SCENE_KEY.pickInstrument,
      cameras: { backgroundColor: gameBg },
    }),
    new TimelineScene({
      key: GAME_SCENE_KEY.timeline,
      cameras: { backgroundColor: gameBg },
    }),
  ],
};

function loadFontsAndStartGame(): Promise<void> {
  checkMobile();

  return new Promise((resolve) => {
    const WebFont = (window as any).WebFont;
    WebFont.load({
      google: {
        families: [
          "DynaPuff",
          "ABeeZee",
          "Bubblegum Sans",
          "Roboto",
          "Poppins",
        ],
      },
      active: async () => {
        await document.fonts.ready;

        const polishChars = "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ";
        const families = [
          "DynaPuff",
          "ABeeZee",
          "Bubblegum Sans",
          "Roboto",
          "Poppins",
        ];

        await Promise.all(
          families.map((family) =>
            document.fonts.load(`20px "${family}"`, polishChars)
          )
        );

        requestAnimationFrame(() => resolve());
      },
      inactive: () => {
        console.warn("⚠️ WebFont loading failed — starting anyway");
        resolve();
      },
    });
  });
}

async function checkMobile(): Promise<boolean> {
  const isMobile = (): boolean => {
    if (
      typeof navigator !== "undefined" &&
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ) {
      return true;
    }
    if (
      typeof window !== "undefined" &&
      window.innerWidth &&
      window.innerWidth < 768
    ) {
      return true;
    }
    return false;
  };

  const container = document.getElementById("game-container");

  if (isMobile()) {
    if (container) {
      container.innerHTML = `
     <div class="mx-5 bg-[#A41034] text-center p-6 rounded-2xl shadow-lg">
    <img src="/assets/svg/note.svg" alt="note-icon" class="mx-auto my-10" />
    <h2 class="text-5xl dynapuff-regular text-white mb-5">Zagraj na większym ekranie!</h2>
    <p class="text-2xl abezee-regular text-white">Gra MaliMelomani jest niedostępna na <br>urządzeniach mobilnych.</p>
  </div>
      `;
    }
    return true;
  }

  return false;
}

async function startGame() {
  const isOnMobile = await checkMobile();
  if (isOnMobile) return;

  await loadFontsAndStartGame();
  const game = new Phaser.Game(config);
  gameStore.game = game;
}

startGame();
