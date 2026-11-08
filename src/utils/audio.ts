/**
 * Web Audio API synthesizer for countdown and timer completion chimes.
 * Requires no external audio files.
 */
export function playRestTimerCompleteSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playBeep = (freq: number, delayMs: number, durationMs: number) => {
      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + durationMs / 1000);
        } catch {
          // Ignore audio errors if audio context blocked
        }
      }, delayMs);
    };

    // 3 short ascending chime tones
    playBeep(587.33, 0, 150);   // D5
    playBeep(739.99, 180, 150); // F#5
    playBeep(880.00, 360, 300); // A5
  } catch {
    // Audio context not allowed or unsupported
  }
}
