export async function celebrate() {
  const { default: confetti } = await import("canvas-confetti");
  const colors = ["#c20202", "#141414", "#ffffff"];

  [0.2, 0.5, 0.8].forEach((x, index) => {
    window.setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 45,
        origin: { x, y: 0.6 },
        colors,
        disableForReducedMotion: true,
      });
    }, index * 220);
  });
}
