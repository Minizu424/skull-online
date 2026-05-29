export function updateViewportSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  document.documentElement.style.setProperty("--app-width", `${width}px`);
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

export function setupViewportSize() {
  updateViewportSize();

  window.addEventListener("resize", updateViewportSize);

  window.addEventListener("orientationchange", () => {
    updateViewportSize();

    window.setTimeout(updateViewportSize, 100);
    window.setTimeout(updateViewportSize, 300);
    window.setTimeout(updateViewportSize, 700);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateViewportSize);
    window.visualViewport.addEventListener("scroll", updateViewportSize);
  }
}
