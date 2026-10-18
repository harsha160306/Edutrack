/** Single app-wide timer so dev reload / strict mode cannot stack intervals. */
let generation = 0;
let activeTimer = null;

export const stopAutoSyncScheduler = () => {
  generation += 1;
  if (activeTimer !== null) {
    clearTimeout(activeTimer);
    activeTimer = null;
  }
};

/**
 * Runs `tick` on start, then every `intervalMs` after each run finishes.
 * Uses chained timeouts (not setInterval) so work never piles up.
 */
export const startAutoSyncScheduler = ({ intervalMs, tick }) => {
  stopAutoSyncScheduler();

  const safeMs = Number.isFinite(intervalMs) && intervalMs >= 60_000 ? intervalMs : 300_000;
  const gen = generation;

  const loop = async () => {
    if (gen !== generation) return;
    try {
      await tick();
    } catch {
      // swallow — next run will retry
    }
    if (gen !== generation) return;
    activeTimer = setTimeout(loop, safeMs);
  };

  void loop();
};
