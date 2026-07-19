// 极简「配乐」：用 Web Audio 实时合成一段安静的古风氛围垫底音。
// 无需任何音频文件；必须由用户点击触发（浏览器自动播放策略）。
// 做法：几枚失谐的正弦波（五声音阶上的音）+ 缓慢的音量起伏 + 低通滤波，营造空灵的「氤氲」感。

type AmbientHandle = {
  stop: () => void;
};

// 五声音阶（宫商角徵羽）上的几个音，单位 Hz（D 宫调附近，听感清雅）
const NOTES = [146.83, 220.0, 293.66]; // D3, A3, D4 —— 纯五度叠置，空灵不刺耳

export function startAmbient(): AmbientHandle | null {
  const AudioCtx =
    typeof window !== "undefined"
      ? window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0.0;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  master.connect(filter);
  filter.connect(ctx.destination);

  // 缓慢淡入到一个很低的音量
  master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 4);

  const oscs: OscillatorNode[] = [];
  NOTES.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = (i - 1) * 4; // 轻微失谐，更有「呼吸感」

    const g = ctx.createGain();
    g.gain.value = 0.5 / NOTES.length;

    // 给每个音加一个极慢的音量起伏（LFO），像潮汐一样
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05 + i * 0.02; // 极低频
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.25 / NOTES.length;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);

    osc.connect(g);
    g.connect(master);
    osc.start();
    lfo.start();
    oscs.push(osc, lfo);
  });

  return {
    stop() {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0.0, t + 1.2);
      window.setTimeout(() => {
        oscs.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* 已停止 */
          }
        });
        ctx.close().catch(() => undefined);
      }, 1400);
    },
  };
}
