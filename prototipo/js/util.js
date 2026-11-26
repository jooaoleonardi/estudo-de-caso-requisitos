// Utilitários de apresentação e formulário (sem regra de negócio).
import { STATUS } from './regras.js';

export function esc(valor) {
  return String(valor ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

export function fmtData(iso) {
  const [a, m, d] = String(iso).split('-');
  return `${d}/${m}/${a}`;
}

export function fmtDataHora(isoCompleto) {
  const d = new Date(isoCompleto);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function fmtVolume(v) {
  return `${String(v).replace('.', ',')} m³`;
}

const CLASSE_STATUS = {
  [STATUS.AGUARDANDO]: 'aguardando',
  [STATUS.AGENDADA]: 'agendada',
  [STATUS.CONCLUIDA]: 'concluida',
  [STATUS.RECUSADA]: 'recusada',
  [STATUS.CANCELADA]: 'cancelada',
};

export function selo(status) {
  return `<span class="selo selo--${CLASSE_STATUS[status]}">${esc(status)}</span>`;
}

// Campo de texto com rótulo, dica e área de erro ligados por aria-describedby.
export function campo({ nome, rotulo, dica = '', tipo = 'text', atributos = '', valor = '' }) {
  const ids = [dica ? `dica-${nome}` : '', `erro-${nome}`].filter(Boolean).join(' ');
  return `
    <div class="campo">
      <label for="${nome}">${esc(rotulo)}</label>
      ${dica ? `<p class="dica" id="dica-${nome}">${dica}</p>` : ''}
      <input id="${nome}" name="${nome}" type="${tipo}" value="${esc(valor)}"
        aria-describedby="${ids}" data-campo ${atributos}>
      <p class="erro" id="erro-${nome}"></p>
    </div>`;
}

// Mostra erros por campo ({ nome: mensagem }) e leva o foco ao primeiro campo inválido.
export function mostrarErros(raiz, erros) {
  let primeiro = null;
  raiz.querySelectorAll('[data-campo]').forEach((el) => {
    const nome = el.id || el.dataset.campo;
    const msg = erros[nome];
    const alvoErro = raiz.querySelector(`#erro-${nome}`);
    if (alvoErro) alvoErro.textContent = msg ?? '';
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      primeiro ??= el;
    } else {
      el.removeAttribute('aria-invalid');
    }
  });
  primeiro?.focus();
}
