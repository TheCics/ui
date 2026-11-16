/**
 * ============================================================================
 * ARQUIVO: avatar.js
 * LOCAL: packages/ui/src/avatar.js
 * ============================================================================
 *
 * DESCRIÇÃO:
 * Avatar com a inicial do nickname.
 *
 * RESPONSABILIDADES:
 * - Gerar o HTML do avatar com a primeira letra do nome.
 * - Escolher a cor a partir de um hash do nome, mantendo-a estável entre as telas.
 *
 * DATA DE CRIAÇÃO: 07/11/2026 (extraído de client/src/cards.js).
 *
 * ATUALIZAÇÕES:
 * - 07/11/2026: Extraído de cards.js; é usado pelo menu, pela sala, pela mesa e pelo resultado.
 *
 * AUTOR: Viana-78
 *
 * ============================================================================
 */

import { esc } from './escape-html.js';

const HUES = [4, 28, 48, 140, 190, 215, 265, 320];

function avatar(nick, cls = '') {
    let hash = 0;
    for (const char of String(nick))
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    const hue = HUES[hash % HUES.length];
    const initial = String(nick).trim().charAt(0).toUpperCase() || '?';
    return `<span class="avatar ${cls}" style="--h:${hue}">${esc(initial)}</span>`;
}

export { avatar };
