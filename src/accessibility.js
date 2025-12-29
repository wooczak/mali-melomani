// Accessibility functionality
document.addEventListener("DOMContentLoaded", function () {
  const accessibilityButton = document.getElementById("accessibility-button");
  const accessibilityMenu = document.querySelector(".accessibility-menu");
  const increaseTextBtn = document.getElementById("increase-text");
  const decreaseTextBtn = document.getElementById("decrease-text");
  const resetTextBtn = document.getElementById("reset-text");
  const currentSizeDisplay = document.getElementById("current-size");

  if (!accessibilityButton || !accessibilityMenu) {
    return;
  }

  // Text size settings
  const MIN_SIZE = 100;
  const MAX_SIZE = 150;
  const STEP = 10;
  const STORAGE_KEY = "textSizePercentage";

  // Load saved text size
  let currentSize = parseInt(localStorage.getItem(STORAGE_KEY)) || 100;
  applyTextSize(currentSize);

  // Toggle menu
  accessibilityButton.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (accessibilityMenu.classList.contains("hidden")) {
      accessibilityMenu.classList.remove("hidden");
      accessibilityMenu.classList.add("block");
    } else {
      accessibilityMenu.classList.add("hidden");
      accessibilityMenu.classList.remove("block");
    }
  });

  // Close when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !accessibilityMenu.classList.contains("hidden") &&
      !accessibilityMenu.contains(e.target) &&
      !accessibilityButton.contains(e.target)
    ) {
      accessibilityMenu.classList.add("hidden");
      accessibilityMenu.classList.remove("block");
    }
  });

  // Increase text size
  if (increaseTextBtn) {
    increaseTextBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (currentSize < MAX_SIZE) {
        currentSize += STEP;
        applyTextSize(currentSize);
      }
    });
  }

  // Decrease text size
  if (decreaseTextBtn) {
    decreaseTextBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (currentSize > MIN_SIZE) {
        currentSize -= STEP;
        applyTextSize(currentSize);
      }
    });
  }

  // Reset text size
  if (resetTextBtn) {
    resetTextBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      currentSize = 100;
      applyTextSize(currentSize);
    });
  }

  // Apply text size
  function applyTextSize(size) {
    document.documentElement.style.fontSize = size + "%";
    if (currentSizeDisplay) {
      currentSizeDisplay.textContent = size + "%";
    }
    localStorage.setItem(STORAGE_KEY, size);

    // Update button states
    if (increaseTextBtn) {
      increaseTextBtn.disabled = size >= MAX_SIZE;
      increaseTextBtn.style.opacity = size >= MAX_SIZE ? "0.5" : "1";
    }
    if (decreaseTextBtn) {
      decreaseTextBtn.disabled = size <= MIN_SIZE;
      decreaseTextBtn.style.opacity = size <= MIN_SIZE ? "0.5" : "1";
    }
  }
});
