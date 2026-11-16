/**
 * ============================================================================
 * ARQUIVO: form-fields.js
 * LOCAL: packages/ui/src/form-fields.js
 * ============================================================================
 *
 * DESCRIÇÃO:
 * Leitura de campos de formulário da página pelo atributo id.
 *
 * RESPONSABILIDADES:
 * - Ler o valor de um campo sem espaços nas extremidades (val).
 * - Ler o valor de um campo exatamente como foi digitado, útil para senhas (rawVal).
 *
 * DATA DE CRIAÇÃO: 07/11/2026 (extraído de client/src/main.js).
 *
 * ATUALIZAÇÕES:
 * - 07/11/2026: Extraído de main.js (função val e leituras diretas de document.getElementById).
 *
 * AUTOR: Viana-78
 *
 * ============================================================================
 */

function val(id) {
    return (document.getElementById(id)?.value || '').trim();
}

function rawVal(id) {
    return document.getElementById(id)?.value || '';
}

export { val, rawVal };
