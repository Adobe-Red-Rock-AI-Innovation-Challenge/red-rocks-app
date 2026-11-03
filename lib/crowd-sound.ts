// Stadium crowd sounds are synthesized, so there is no recording to license. Each call picks one
// of three moods at random and plays it quietly for about three seconds.

const PEAK = 0.09;
let context: AudioContext | null = null;
let lastPlayed = 0;

function pinkNoise(audio: AudioContext, seconds: number) {
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * seconds), audio.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18;
  }
  return buffer;
}

function cheer(audio: AudioContext, out: AudioNode, start: number, length: number) {
  for (let voice = 0; voice < 5; voice++) {
    const osc = audio.createOscillator();
    const vibrato = audio.createOscillator();
    const depth = audio.createGain();
    const level = audio.createGain();
    const base = 420 + Math.random() * 420;
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(base, start);
    osc.frequency.linearRampToValueAtTime(base * 1.35, start + length * 0.6);
    vibrato.frequency.value = 5 + Math.random() * 3;
    depth.gain.value = 12;
    vibrato.connect(depth).connect(osc.frequency);
    level.gain.setValueAtTime(0.0001, start);
    level.gain.exponentialRampToValueAtTime(0.006, start + 0.3);
    level.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(level).connect(out);
    osc.start(start);
    vibrato.start(start);
    osc.stop(start + length);
    vibrato.stop(start + length);
  }
}

function claps(audio: AudioContext, out: AudioNode, start: number, length: number) {
  const burst = pinkNoise(audio, 0.05);
  for (let t = 0; t < length; t += 0.06 + Math.random() * 0.08) {
    const source = audio.createBufferSource();
    const level = audio.createGain();
    source.buffer = burst;
    level.gain.value = 0.25 + Math.random() * 0.35;
    source.connect(level).connect(out);
    source.start(start + t);
  }
}

export async function playCrowd() {
  if (Date.now() - lastPlayed < 2500) return true;
  context ??= new AudioContext();
  if (context.state === "suspended") await context.resume().catch(() => undefined);
  // Browsers only allow sound after the visitor has clicked or tapped the page.
  if (context.state !== "running") return false;
  lastPlayed = Date.now();

  const audio = context;
  const now = audio.currentTime;
  const mood = Math.floor(Math.random() * 3);
  const length = 3;

  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(PEAK, now + [0.6, 0.25, 0.9][mood]);
  master.gain.setValueAtTime(PEAK, now + length - 1.2);
  master.gain.exponentialRampToValueAtTime(0.0001, now + length);
  master.connect(audio.destination);

  const roar = audio.createBufferSource();
  const band = audio.createBiquadFilter();
  roar.buffer = pinkNoise(audio, length);
  band.type = "bandpass";
  band.frequency.value = [850, 1200, 650][mood];
  band.Q.value = 0.5;
  roar.connect(band).connect(master);
  roar.start(now);

  if (mood !== 2) cheer(audio, master, now + 0.2, length - 0.4);
  if (mood !== 0) claps(audio, master, now + 0.4, length - 1);
  return true;
}
