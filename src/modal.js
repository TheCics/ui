/**
 * ============================================================================
 * ARQUIVO: modal.js
 * LOCAL: packages/ui/src/modal.js
 * ============================================================================
 *
 * DESCRIÇÃO:
 * Estrutura comum das janelas modais.
 *
 * RESPONSABILIDADES:
 * - Montar o HTML do modal (sobreposição, cabeçalho, botão de fechar e corpo).
 * - Ser reaproveitada pelos modais do lobby, das salas e do Uno.
 *
 * DATA DE CRIAÇÃO: 07/11/2026 (extraído de client/src/views.js).
 *
 * ATUALIZAÇÕES:
 * - 07/11/2026: Extraído de views.js (função modalShell).
 *
 * AUTOR: Viana-78
 *
 * ============================================================================
 */

import { esc } from './escape-html.js';

function modalShell(title, body, { wide = false, close = true, overlayClass = '', screen = false } = {}) {
    if (screen) {
        return `
        <div class="screen bar-screen bar-scene ${esc(overlayClass)}">
            <h2 class="bar-scene-title">${esc(title)}</h2>
            <div class="bar-scene-body"><div class="bar-panel" role="region" aria-label="${esc(title)}">${body}</div></div>
            <button class="bar-scene-back" data-act="closeModal">← Voltar</button>
        </div>`;
    }
    const closeButton = close
        ? '<button class="x" data-act="closeModal" aria-label="Fechar">✕</button>'
        : '';
    return `
        <div class="overlay ${esc(overlayClass)}" data-close="1">
            <div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-label="${esc(title)}">
                <div class="mhead"><h2>${esc(title)}</h2>${closeButton}</div>${body}
            </div>
        </div>`;
}

export { modalShell };
