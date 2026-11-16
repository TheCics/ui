/**
 * ============================================================================
 * ARQUIVO: escape-html.js
 * LOCAL: packages/ui/src/escape-html.js
 * ============================================================================
 *
 * DESCRIÇÃO:
 * Escape de texto para inserção segura em strings de HTML.
 *
 * RESPONSABILIDADES:
 * - Converter &, <, > e " em entidades HTML antes de montar o HTML das telas.
 * - Evitar que nicknames, nomes de sala e mensagens de chat sejam interpretados como HTML.
 *
 * DATA DE CRIAÇÃO: 07/11/2026 (extraído de client/src/cards.js).
 *
 * ATUALIZAÇÕES:
 * - 07/11/2026: Extraído de cards.js, pois é um utilitário genérico usado por mais de uma área.
 *
 * AUTOR: Viana-78
 *
 * ============================================================================
 */

const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
};

function esc(value) {
    return String(value).replace(/[&<>"]/g, (char) => HTML_ESCAPES[char]);
}

export { esc };
