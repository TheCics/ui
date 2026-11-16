/**
 * ============================================================================
 * ARQUIVO: card-fx.js
 * LOCAL: packages/ui/src/card-fx.js
 * ============================================================================
 *
 * DESCRIÇÃO:
 * Animações reutilizáveis para jogos de cartas/peças (Uno, Piff, Dominó...).
 * Não conhece regras de jogo: recebe o HTML de uma carta e dois pontos na tela.
 * Os elementos animados vivem numa camada fixa fora de #screen, então sobrevivem aos re-renders.
 *
 * API:
 * - flyTo({ html, front, from, to, size, startScale, endScale, duration, delay, spin, midScale, midAt, arc, endRotate }) → Promise
 *     voa um elemento (HTML) do centro de `from` até o centro de `to`.
 *     from/to: Element ou DOMRect. size: { w, h } do elemento (padrão: tamanho de `to`).
 *     midScale/midAt/arc: escala máxima no meio do voo, em que ponto do trajeto (0 a 1) e quanto o caminho sobe (px).
 *     endRotate: inclinação (graus) com que o elemento pousa.
 *     front: HTML da frente da carta. Com ele o elemento viaja de costas (`html`) e vira durante o voo, chegando com a frente à mostra.
 * - popBadge({ at, text, tone, hold }) → Promise  selo que "estoura" sobre `at` e some depois de `hold` ms.
 * - hideUntil(elements, promise) esconde elementos reais até a animação terminar.
 * - sleep(ms)
 *
 * DATA DE CRIAÇÃO: 08/11/2026.
 *
 * ATUALIZAÇÕES:
 * - 09/11/2026: flyTo aceita `front`: a carta sai de costas e vira no caminho, revelando a frente (distribuição e compra das minhas cartas).
 * - 09/11/2026: reduced() passa a depender só da opção "Animações" do jogo (opts.anim); a preferência de movimento reduzido do sistema deixa de desligar os efeitos (no celular Android ela vinha ligada e pulava tudo).
 * - 09/11/2026: flyTo aceita escala intermediária, trajetória em arco e inclinação final (voo da carta jogada); sem esses parâmetros funciona como antes.
 * - 11/11/2026: Movida para packages/ui; deixa de importar as preferências do portal (setAnimationsSource).
 * - 10/11/2026: flyTo aceita `onStart` (gancho de áudio chamado quando o voo começa, respeitando o delay); falha no gancho nunca interrompe nem deixa carta presa na tela.
 *
 * AUTOR: Viana-78
 *
 * ============================================================================
 */

// O portal diz se as animações estão ligadas (opção "Animações"); a biblioteca não conhece as preferências do portal.
let animationsOn = () => true;
function setAnimationsSource(fn) {
    animationsOn = typeof fn === 'function' ? fn : () => true;
}

let effectsEnabled = true;
function setEffectsEnabled(enabled) {
    effectsEnabled = Boolean(enabled);
    if (!effectsEnabled) clearEffects();
}
function clearEffects() {
    const node = document.getElementById('fx-layer');
    if (node) {
        node.querySelectorAll('*').forEach((element) => element.getAnimations?.().forEach((animation) => animation.cancel()));
        node.replaceChildren();
    }
}

// Só a opção "Animações" do jogo (lobby → configurações) decide. A configuração do sistema ("Remover animações",
// economia de bateria etc.) é ignorada de propósito: as animações já vêm ligadas para todo mundo.
// Nome mantido ("reduced") porque todo o código de animação já usa essa função como porteiro.
const reduced = () => !animationsOn();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function layer() {
    if (!effectsEnabled) return document.createDocumentFragment();
    let node = document.getElementById('fx-layer');
    if (!node) {
        node = document.createElement('div');
        node.id = 'fx-layer';
        document.body.appendChild(node);
    }
    return node;
}

const rectOf = (target) => (target instanceof Element ? target.getBoundingClientRect() : target || null);
const centerOf = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

// A carta vira em torno do eixo vertical: some de costas, fica de lado e aparece de frente (a virada ocupa o meio do voo).
const FLIP_FRAMES = [
    { transform: 'rotateY(0deg)' },
    { transform: 'rotateY(0deg)', offset: 0.3 },
    { transform: 'rotateY(180deg)', offset: 0.78 },
    { transform: 'rotateY(180deg)' },
];

function flyTo({ html, front = '', from, to, size, startScale = 1, endScale = 1, duration = 450, delay = 0, spin = 0, midScale = 0, midAt = 0.5, arc = 0, endRotate = 0, onStart = null }) {
    if (!effectsEnabled) return Promise.resolve();
    const a = rectOf(from);
    const b = rectOf(to);
    // Gancho de áudio protegido: um erro de som jamais pode abortar o voo (a carta ficaria presa na camada de efeitos).
    const fire = () => { try { onStart?.(); } catch { /* som é opcional */ } };
    if (!a || !b || reduced()) {
        if (delay > 0)
            return sleep(delay).then(fire);
        fire();
        return Promise.resolve();
    }
    const w = size?.w ?? b.width;
    const h = size?.h ?? b.height;
    const start = centerOf(a);
    const end = centerOf(b);
    const el = document.createElement('div');
    el.className = front ? 'fx-fly flipper' : 'fx-fly';
    el.style.cssText = `width:${w}px;height:${h}px;left:${end.x - w / 2}px;top:${end.y - h / 2}px`;
    el.innerHTML = front ? `<div class="flip3"><div class="fl-b">${html}</div><div class="fl-f">${front}</div></div>` : html;
    layer().appendChild(el);
    const dx = start.x - end.x;
    const dy = start.y - end.y;
    const pose = (x, y, scale, rotate) => `translate(${x}px,${y}px) scale(${scale}) rotate(${rotate}deg)`;
    // Com escala intermediária o voo tem duas fases: acelera até o ponto do meio e desacelera até pousar
    // (as duas curvas se encontram em velocidade alta, então não há parada no meio).
    const frames = midScale
        ? [
            { transform: pose(dx, dy, startScale, endRotate - spin), easing: 'cubic-bezier(.4,0,.8,.6)' },
            { transform: pose(dx * (1 - midAt), dy * (1 - midAt) - arc, midScale, endRotate - spin * (1 - midAt)), offset: midAt, easing: 'cubic-bezier(.1,.5,.25,1)' },
            { transform: pose(0, 0, endScale, endRotate) },
        ]
        : [
            { transform: pose(dx, dy, startScale, endRotate - spin) },
            { transform: pose(0, 0, endScale, endRotate) },
        ];
    const animation = el.animate(frames, { duration, delay, easing: 'cubic-bezier(.25,.8,.3,1)', fill: 'both' });
    if (front)
        el.querySelector('.flip3').animate(FLIP_FRAMES, { duration, delay, easing: 'ease-in-out', fill: 'both' });
    // O som sai junto com o voo (mesmo atraso), já depois de toda a animação estar criada.
    if (delay > 0)
        setTimeout(fire, delay);
    else
        fire();
    return animation.finished.catch(() => {}).then(() => el.remove());
}

function popBadge({ at, text, tone = '', hold = 900 }) {
    if (!effectsEnabled) return Promise.resolve();
    const r = rectOf(at);
    if (!r || reduced())
        return Promise.resolve();
    const c = centerOf(r);
    const el = document.createElement('div');
    el.className = `fx-badge ${tone}`;
    el.textContent = text;
    el.style.left = `${c.x}px`;
    el.style.top = `${c.y}px`;
    layer().appendChild(el);
    const pop = el.animate([
        { transform: 'translate(-50%,-50%) scale(0)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.35)', opacity: 1, offset: 0.6 },
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
    ], { duration: 320, easing: 'ease-out', fill: 'forwards' });
    return pop.finished.catch(() => {}).then(() => {
        sleep(hold).then(() => {
            const out = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
            out.finished.catch(() => {}).then(() => el.remove());
        });
    });
}

function hideUntil(elements, promise) {
    const list = [...elements].filter(Boolean);
    list.forEach((el) => { el.style.visibility = 'hidden'; });
    promise.finally(() => list.forEach((el) => { el.style.visibility = ''; }));
}

// Faixa de aviso no centro da tela (desafio, veredito, giro das mãos...). Resolve quando some.
async function banner({ html, hold = 1200, tone = '' }) {
    if (reduced())
        return sleep(hold);
    const el = document.createElement('div');
    el.className = `fx-banner ${tone}`;
    el.innerHTML = html;
    layer().appendChild(el);
    await el.animate([
        { opacity: 0, transform: 'translate(-50%,-50%) scale(.8)' },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' },
    ], { duration: 220, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
    await sleep(hold - 220 - 160);
    await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }).finished.catch(() => {});
    el.remove();
}

export { flyTo, popBadge, hideUntil, sleep, rectOf, layer, banner, reduced, setEffectsEnabled, setAnimationsSource, clearEffects };
