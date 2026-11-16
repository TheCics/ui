/** Serviço genérico de áudio do client: não conhece jogos nem regras. */
const active = new Map(); // audio -> { channel, volume }
const cache = new Map();
let masterVolume = 0.75;

// Dois canais de volume independentes (0 a 1): 'sfx' (efeitos, padrão) e 'music' (trilha).
const channelVolume = { sfx: 1, music: 1 };

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const effectiveVolume = (channel, volume) => clamp01(masterVolume * channelVolume[channel] * volume);

function audioFor(src) {
    if (!cache.has(src)) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        cache.set(src, audio);
    }
    return cache.get(src);
}

/**
 * options:
 * - volume: volume relativo do som dentro do canal (0 a 1).
 * - loop: repete o som.
 * - channel: 'sfx' (padrão) ou 'music'.
 * - fitMs: ajusta a velocidade para o som durar exatamente esse tempo (sem repetir nem sobrar).
 */
function playHandle(src, options = {}) {
    if (!src)
        return { started: Promise.resolve(false), stop() {} };
    const { volume = 1, loop = false, channel = 'sfx', fitMs = 0 } = options;
    let audio;
    let stopped = false;
    let cleaned = false;
    const cleanup = () => {
        if (cleaned)
            return;
        cleaned = true;
        active.delete(audio);
    };
    const stop = () => {
        if (stopped)
            return;
        stopped = true;
        if (audio) {
            audio.pause();
            try { audio.currentTime = 0; } catch {}
            cleanup();
        }
    };
    try {
        audio = audioFor(src).cloneNode(true);
        audio.loop = Boolean(loop);
        audio.volume = effectiveVolume(channel, volume);
        audio.currentTime = 0;
        if (fitMs > 0) {
            // taxa = duração do arquivo / tempo desejado (limites do navegador: 0.0625 a 16)
            const fit = () => {
                const length = audio.duration;
                if (Number.isFinite(length) && length > 0)
                    audio.playbackRate = Math.max(0.0625, Math.min(16, (length * 1000) / fitMs));
            };
            fit();
            audio.addEventListener('loadedmetadata', fit, { once: true });
        }
        active.set(audio, { channel, volume });
        audio.addEventListener('ended', cleanup, { once: true });
        audio.addEventListener('error', cleanup, { once: true });
        const started = audio.play().then(() => !stopped).catch(() => {
            cleanup();
            return false;
        });
        return { started, stop };
    } catch {
        cleanup();
        return { started: Promise.resolve(false), stop() {} };
    }
}

function play(src, options = {}) {
    return playHandle(src, options).started;
}

function stopAll() {
    for (const audio of active.keys()) {
        audio.pause();
        try { audio.currentTime = 0; } catch {}
    }
    active.clear();
}

function setMasterVolume(value) { masterVolume = clamp01(value); }
function getMasterVolume() { return masterVolume; }

// Muda o volume de um canal e aplica na hora aos sons que já estão tocando (a trilha acompanha o controle).
function setChannelVolume(channel, value) {
    if (!(channel in channelVolume))
        return;
    channelVolume[channel] = clamp01(value);
    for (const [audio, info] of active) {
        if (info.channel === channel)
            audio.volume = effectiveVolume(channel, info.volume);
    }
}
function getChannelVolume(channel) { return channelVolume[channel] ?? 1; }

export const audioService = { play, playHandle, stopAll, setMasterVolume, getMasterVolume, setChannelVolume, getChannelVolume };
