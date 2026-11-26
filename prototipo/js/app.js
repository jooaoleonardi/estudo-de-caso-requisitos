// Roteador por hash e estrutura da página.
import { carregar, salvar, agora, reiniciar } from './store.js';
import {
  telaInicio,
  telaSolicitar,
  telaConfirmacao,
  telaAcompanhar,
  telaCancelar,
  telaFila,
  telaDetalhe,
  telaConsulta,
  telaNaoEncontrada,
} from './telas.js';

const conteudo = document.querySelector('#conteudo');
const anunciador = document.querySelector('#anunciador');
let estado = carregar();
let aviso = null;

// Rotas: [prefixo, tela, grupo do menu]
const ROTAS = [
  ['solicitar/confirmacao', telaConfirmacao, 'solicitar'],
  ['solicitar', telaSolicitar, 'solicitar'],
  ['acompanhar', telaAcompanhar, 'acompanhar'],
  ['cancelar', telaCancelar, 'cancelar'],
  ['atendente/fila', telaFila, 'atendente'],
  ['atendente', null, 'atendente'], // fila ou detalhe, decidido abaixo
  ['consulta', telaConsulta, 'consulta'],
];

function resolver(hash) {
  const partes = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (partes.length === 0) return { tela: telaInicio, params: [], grupo: 'inicio' };
  const caminho = partes.join('/');
  for (const [prefixo, tela, grupo] of ROTAS) {
    if (caminho === prefixo || caminho.startsWith(`${prefixo}/`)) {
      const params = caminho.slice(prefixo.length).split('/').filter(Boolean);
      if (prefixo === 'atendente') {
        return { tela: params.length ? telaDetalhe : telaFila, params, grupo };
      }
      return { tela, params, grupo };
    }
  }
  return { tela: telaNaoEncontrada, params: [], grupo: '' };
}

export function navegar(destino, opcoes = {}) {
  aviso = opcoes.aviso ?? null;
  if (location.hash === destino) renderizar();
  else location.hash = destino;
}

function renderizar() {
  const { tela, params, grupo } = resolver(location.hash);
  const ctx = { estado, params, hoje: agora(), salvar: () => salvar(estado), navegar };
  const { titulo, html, montar } = tela(ctx);
  document.title = `${titulo} · Coleta de Entulho · Vila Modelo`;
  conteudo.innerHTML = html;
  if (aviso) {
    const p = document.createElement('p');
    p.className = 'aviso aviso--ok';
    p.setAttribute('role', 'status');
    p.textContent = aviso;
    const h1 = conteudo.querySelector('h1');
    (h1?.closest('header') ?? h1)?.after(p);
    aviso = null;
  }
  montar?.(conteudo);
  document.querySelectorAll('[data-grupo]').forEach((a) => {
    if (a.dataset.grupo === grupo) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
  conteudo.querySelector('h1')?.focus({ preventScroll: true });
  anunciador.textContent = `Página: ${titulo}`;
}

document.querySelector('#btn-reiniciar').addEventListener('click', () => {
  estado = reiniciar();
  navegar('#/', { aviso: 'Dados de exemplo restaurados.' });
});

window.addEventListener('hashchange', renderizar);
renderizar();
