// Telas T-01 a T-06 (mais a página inicial). Cada tela devolve { titulo, html, montar }.
import {
  STATUS,
  STATUS_ATIVOS,
  MATERIAIS_PROIBIDOS,
  LIMITES,
  paraISO,
  primeiraData,
  ultimaData,
  normalizarProtocolo,
  protocoloValido,
  proximoProtocolo,
  validarSolicitacao,
  validarData,
  validarJustificativa,
  podeCancelar,
  podeReagendar,
  formatarCpf,
  mascararCpf,
  lerVolume,
} from './regras.js';
import { esc, fmtData, fmtDataHora, fmtVolume, selo, campo, mostrarErros } from './util.js';

const MATERIAIS_PERMITIDOS = ['Restos de construção', 'Madeira e móveis', 'Metais'];
const ROTULO_PROIBIDO = {
  amianto: 'Amianto',
  'tintas e solventes': 'Tintas e solventes',
  pneus: 'Pneus',
  'lixo domiciliar': 'Lixo domiciliar',
};

const titulo1 = (txt, lead = '') =>
  `<header class="pagina-cab"><h1 tabindex="-1">${esc(txt)}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</header>`;

const achar = (estado, protocolo) =>
  estado.solicitacoes.find((s) => s.protocolo === normalizarProtocolo(protocolo));

function resumo(s, { cpfCompleto = false, endereco = true } = {}) {
  const linhas = [
    ['Protocolo', `<span class="mono">${esc(s.protocolo)}</span>`],
    ['Situação', selo(s.status)],
    ['Data da coleta', esc(fmtData(s.data))],
  ];
  if (endereco) linhas.push(['Endereço', esc(s.endereco)]);
  linhas.push(
    ['Volume', esc(fmtVolume(s.volume))],
    ['Materiais', esc(s.materiais.join(', '))],
    ['CPF', `<span class="mono">${esc(cpfCompleto ? s.cpf : mascararCpf(s.cpf))}</span>`],
  );
  return `<dl class="resumo">${linhas.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}

function linhaDoTempo(s) {
  return `<ol class="tempo" aria-label="Histórico">${s.historico
    .map((h) => `<li><time>${esc(fmtDataHora(h.em))}</time> ${esc(h.texto)}</li>`)
    .join('')}</ol>`;
}

function formBusca({ rotulo, valor = '', erro = '' }) {
  return `
    <form class="cartao form-busca" id="form-busca" novalidate>
      <div class="campo">
        <label for="protocolo">${esc(rotulo)}</label>
        <p class="dica" id="dica-protocolo">Formato COL-AAAA-NNNNNN. Exemplo: COL-2026-000001.</p>
        <input id="protocolo" name="protocolo" type="text" value="${esc(valor)}" autocomplete="off"
          aria-describedby="dica-protocolo erro-protocolo" data-campo ${erro ? 'aria-invalid="true"' : ''}>
        <p class="erro" id="erro-protocolo">${esc(erro)}</p>
      </div>
      <button class="botao" type="submit">Consultar</button>
    </form>`;
}

function montarBusca(raiz, destino, navegar) {
  const form = raiz.querySelector('#form-busca');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = normalizarProtocolo(form.protocolo.value);
    if (!protocoloValido(p)) {
      mostrarErros(raiz, { protocolo: 'Informe o protocolo no formato COL-AAAA-NNNNNN.' });
      return;
    }
    navegar(`${destino}/${p}`);
  });
}

// ---------------------------------------------------------------- Início

export function telaInicio() {
  return {
    titulo: 'Início',
    html: `
      <section class="heroi">
        <p class="heroi-selo">Serviço digital · Prefeitura de Vila Modelo</p>
        <h1 tabindex="-1">Agendamento de Coleta de Entulho</h1>
        <p class="lead">Peça a retirada de entulho da sua obra em poucos passos, acompanhe pelo
        protocolo e remarque se precisar.</p>
        <a class="botao botao--claro" href="#/solicitar">Solicitar coleta</a>
      </section>
      <div class="grade-2">
        <section class="cartao" aria-labelledby="h-cid">
          <h2 id="h-cid">Para o cidadão</h2>
          <ul class="lista-links">
            <li><a href="#/solicitar"><strong>Solicitar coleta</strong><span>Informe endereço, volume, materiais e data.</span></a></li>
            <li><a href="#/acompanhar"><strong>Acompanhar solicitação</strong><span>Veja a situação com o número do protocolo.</span></a></li>
            <li><a href="#/cancelar"><strong>Cancelar ou reagendar</strong><span>Sem penalidade até 24 horas antes.</span></a></li>
            <li><a href="#/consulta"><strong>Consulta pública</strong><span>Qualquer pessoa confere a situação por protocolo.</span></a></li>
          </ul>
        </section>
        <section class="cartao" aria-labelledby="h-atd">
          <h2 id="h-atd">Para o atendente</h2>
          <ul class="lista-links">
            <li><a href="#/atendente"><strong>Fila de triagem</strong><span>Aprove ou recuse as solicitações recebidas.</span></a></li>
          </ul>
          <h2 id="h-regras" class="h-sec">Antes de pedir</h2>
          <ul class="pontos">
            <li>Volume de até ${LIMITES.volumeMaxM3} m³ por coleta.</li>
            <li>Não coletamos amianto, tintas e solventes, pneus nem lixo domiciliar.</li>
            <li>Datas em dias úteis, a partir de ${LIMITES.antecedenciaDiasUteis} dias úteis, dentro de ${LIMITES.janelaDias} dias.</li>
          </ul>
        </section>
      </div>`,
  };
}

// ---------------------------------------------------------------- T-01 Solicitar

export function telaSolicitar({ estado, hoje, salvar, navegar }) {
  const min = paraISO(primeiraData(hoje));
  const max = paraISO(ultimaData(hoje));
  const permitidos = MATERIAIS_PERMITIDOS.map(
    (m) =>
      `<label class="opcao"><input type="checkbox" name="materiais" value="${esc(m)}"> ${esc(m)}</label>`,
  ).join('');
  const proibidos = MATERIAIS_PROIBIDOS.map(
    (m) =>
      `<label class="opcao"><input type="checkbox" name="materiais" value="${esc(m)}"> ${esc(ROTULO_PROIBIDO[m])}</label>`,
  ).join('');
  return {
    titulo: 'Solicitar coleta',
    html: `
      ${titulo1('Solicitar coleta de entulho', 'Preencha os dados abaixo. Pedimos só o necessário para agendar a coleta.')}
      <form class="cartao form" id="form-solicitar" novalidate>
        <div class="grade-2 grade-2--campos">
          ${campo({ nome: 'nome', rotulo: 'Nome completo', atributos: 'autocomplete="name"' })}
          ${campo({ nome: 'cpf', rotulo: 'CPF', dica: 'Somente números ou no formato 000.000.000-00.', atributos: 'inputmode="numeric" autocomplete="off"' })}
        </div>
        ${campo({ nome: 'endereco', rotulo: 'Endereço da coleta', dica: 'Rua, número e bairro.', atributos: 'autocomplete="street-address"' })}
        <div class="grade-2 grade-2--campos">
          ${campo({ nome: 'volume', rotulo: 'Volume estimado (m³)', dica: `Máximo de ${LIMITES.volumeMaxM3} m³ por coleta. Use vírgula ou ponto.`, atributos: 'inputmode="decimal" autocomplete="off"' })}
          ${campo({ nome: 'data', rotulo: 'Data da coleta', tipo: 'date', dica: `Dias úteis entre ${esc(fmtData(min))} e ${esc(fmtData(max))}.`, atributos: `min="${min}" max="${max}"` })}
        </div>
        <fieldset class="campo" id="materiais" data-campo aria-describedby="dica-materiais erro-materiais">
          <legend>Materiais presentes</legend>
          <p class="dica" id="dica-materiais">Marque tudo o que será descartado. Alguns materiais não podem ser coletados.</p>
          <div class="opcoes">${permitidos}${proibidos}</div>
          <p class="erro" id="erro-materiais"></p>
        </fieldset>
        <button class="botao" type="submit">Enviar solicitação</button>
      </form>`,
    montar(raiz) {
      const form = raiz.querySelector('#form-solicitar');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const dados = {
          nome: form.nome.value,
          cpf: form.cpf.value,
          endereco: form.endereco.value,
          volume: form.volume.value,
          data: form.data.value,
          materiais: [...form.querySelectorAll('[name=materiais]:checked')].map((c) => c.value),
        };
        const erros = validarSolicitacao(dados, { hoje, solicitacoes: estado.solicitacoes });
        mostrarErros(raiz, erros);
        if (Object.keys(erros).length) return;
        const protocolo = proximoProtocolo(estado.solicitacoes, hoje.getFullYear());
        const agora = hoje.toISOString();
        estado.solicitacoes.push({
          protocolo,
          nome: dados.nome.trim(),
          cpf: formatarCpf(dados.cpf),
          endereco: dados.endereco.trim(),
          volume: lerVolume(dados.volume),
          materiais: dados.materiais,
          data: dados.data,
          status: STATUS.AGUARDANDO,
          reagendada: false,
          justificativa: null,
          criadaEm: agora,
          historico: [{ em: agora, texto: 'Solicitação registrada.' }],
        });
        salvar();
        navegar(`#/solicitar/confirmacao/${protocolo}`);
      });
    },
  };
}

export function telaConfirmacao({ estado, params }) {
  const s = achar(estado, params[0]);
  if (!s) return telaNaoEncontrada();
  return {
    titulo: 'Solicitação registrada',
    html: `
      <section class="cartao confirmacao" role="status">
        <p class="heroi-selo">Tudo certo</p>
        <h1 tabindex="-1">Solicitação registrada</h1>
        <p>Guarde o número do protocolo para acompanhar sua coleta:</p>
        <p class="protocolo-grande mono" id="protocolo-gerado">${esc(s.protocolo)}</p>
        <p>Situação: ${selo(s.status)}. Um atendente fará a triagem em breve.</p>
        <div class="acoes">
          <a class="botao" href="#/acompanhar/${esc(s.protocolo)}">Acompanhar solicitação</a>
          <a class="botao botao--sec" href="#/">Voltar ao início</a>
        </div>
      </section>`,
  };
}

// ---------------------------------------------------------------- T-02 Acompanhar

export function telaAcompanhar({ estado, params, navegar }) {
  const p = params[0] ? normalizarProtocolo(params[0]) : '';
  if (!p) {
    return {
      titulo: 'Acompanhar solicitação',
      html: `${titulo1('Acompanhar solicitação', 'Digite o protocolo recebido ao solicitar a coleta.')}${formBusca({ rotulo: 'Número do protocolo' })}`,
      montar: (raiz) => montarBusca(raiz, '#/acompanhar', navegar),
    };
  }
  const s = achar(estado, p);
  if (!s) {
    return {
      titulo: 'Acompanhar solicitação',
      html: `${titulo1('Acompanhar solicitação')}${formBusca({ rotulo: 'Número do protocolo', valor: p, erro: 'Protocolo não encontrado.' })}`,
      montar: (raiz) => montarBusca(raiz, '#/acompanhar', navegar),
    };
  }
  return {
    titulo: `Protocolo ${s.protocolo}`,
    html: `
      ${titulo1('Acompanhar solicitação')}
      <section class="cartao" aria-labelledby="h-det">
        <h2 id="h-det">Dados da solicitação</h2>
        ${resumo(s)}
        ${s.justificativa ? `<p class="aviso aviso--erro"><strong>Motivo da recusa:</strong> ${esc(s.justificativa)}</p>` : ''}
      </section>
      <section class="cartao" aria-labelledby="h-hist">
        <h2 id="h-hist">Histórico</h2>
        ${linhaDoTempo(s)}
      </section>
      <div class="acoes">
        ${STATUS_ATIVOS.includes(s.status) ? `<a class="botao" href="#/cancelar/${esc(s.protocolo)}">Cancelar ou reagendar</a>` : ''}
        <a class="botao botao--sec" href="#/acompanhar">Consultar outro protocolo</a>
      </div>`,
  };
}

// ---------------------------------------------------------------- T-03 Cancelar/Reagendar

export function telaCancelar({ estado, params, hoje, salvar, navegar }) {
  const p = params[0] ? normalizarProtocolo(params[0]) : '';
  const base = { titulo: 'Cancelar ou reagendar' };
  if (!p) {
    return {
      ...base,
      html: `${titulo1('Cancelar ou reagendar', 'Digite o protocolo da solicitação que deseja alterar.')}${formBusca({ rotulo: 'Número do protocolo' })}`,
      montar: (raiz) => montarBusca(raiz, '#/cancelar', navegar),
    };
  }
  const s = achar(estado, p);
  if (!s) {
    return {
      ...base,
      html: `${titulo1('Cancelar ou reagendar')}${formBusca({ rotulo: 'Número do protocolo', valor: p, erro: 'Protocolo não encontrado.' })}`,
      montar: (raiz) => montarBusca(raiz, '#/cancelar', navegar),
    };
  }
  const ativa = STATUS_ATIVOS.includes(s.status);
  const min = paraISO(primeiraData(hoje));
  const max = paraISO(ultimaData(hoje));
  return {
    ...base,
    html: `
      ${titulo1('Cancelar ou reagendar', 'Cancelamento sem penalidade até 24 horas antes da coleta. O reagendamento pode ser feito uma única vez.')}
      <section class="cartao" aria-labelledby="h-atual">
        <h2 id="h-atual">Solicitação atual</h2>
        ${resumo(s)}
      </section>
      ${
        ativa
          ? `
      <div class="grade-2">
        <section class="cartao" aria-labelledby="h-reag">
          <h2 id="h-reag">Reagendar</h2>
          <form id="form-reagendar" novalidate>
            ${campo({ nome: 'novaData', rotulo: 'Nova data da coleta', tipo: 'date', dica: `Dias úteis entre ${esc(fmtData(min))} e ${esc(fmtData(max))}.`, atributos: `min="${min}" max="${max}"` })}
            <button class="botao" type="submit">Reagendar coleta</button>
          </form>
        </section>
        <section class="cartao" aria-labelledby="h-canc">
          <h2 id="h-canc">Cancelar</h2>
          <p>A coleta deixa de ser realizada e o endereço fica livre para uma nova solicitação.</p>
          <button class="botao botao--perigo" type="button" id="btn-cancelar" aria-describedby="erro-cancelar">Cancelar solicitação</button>
          <p class="erro" id="erro-cancelar"></p>
        </section>
      </div>`
          : `<p class="aviso">Esta solicitação está <strong>${esc(s.status)}</strong> e não pode mais ser alterada.</p>`
      }
      <div class="acoes"><a class="botao botao--sec" href="#/acompanhar/${esc(s.protocolo)}">Voltar ao acompanhamento</a></div>`,
    montar(raiz) {
      if (!ativa) return;
      raiz.querySelector('#btn-cancelar').addEventListener('click', (ev) => {
        const r = podeCancelar(s, hoje);
        const alvo = raiz.querySelector('#erro-cancelar');
        if (!r.ok) {
          alvo.textContent = r.erro;
          ev.currentTarget.setAttribute('aria-invalid', 'true');
          return;
        }
        s.status = STATUS.CANCELADA;
        s.historico.push({ em: hoje.toISOString(), texto: 'Cancelada pelo cidadão.' });
        salvar();
        navegar(`#/cancelar/${s.protocolo}`, { aviso: 'Solicitação cancelada com sucesso.' });
      });
      const form = raiz.querySelector('#form-reagendar');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const uso = podeReagendar(s);
        if (!uso.ok) {
          mostrarErros(raiz, { novaData: uso.erro });
          return;
        }
        const erro = validarData(form.novaData.value, hoje, estado.solicitacoes, s.protocolo);
        mostrarErros(raiz, erro ? { novaData: erro } : {});
        if (erro) return;
        s.data = form.novaData.value;
        s.reagendada = true;
        s.historico.push({
          em: hoje.toISOString(),
          texto: `Reagendada para ${fmtData(s.data)}.`,
        });
        salvar();
        navegar(`#/cancelar/${s.protocolo}`, {
          aviso: `Coleta reagendada para ${fmtData(s.data)}.`,
        });
      });
    },
  };
}

// ---------------------------------------------------------------- T-04 Fila do atendente

export function telaFila({ estado, params }) {
  const filtro = params[0] ? decodeURIComponent(params[0]) : STATUS.AGUARDANDO;
  const opcoes = ['Todas', ...Object.values(STATUS)];
  const lista = estado.solicitacoes
    .filter((s) => filtro === 'Todas' || s.status === filtro)
    .sort((a, b) => a.criadaEm.localeCompare(b.criadaEm));
  const pendentes = estado.solicitacoes.filter((s) => s.status === STATUS.AGUARDANDO).length;
  return {
    titulo: 'Fila do atendente',
    html: `
      ${titulo1('Fila de triagem', `Perfil atendente. ${pendentes} solicitação(ões) aguardando triagem.`)}
      <div class="cartao filtro">
        <label for="filtro">Filtrar por situação</label>
        <select id="filtro">${opcoes.map((o) => `<option ${o === filtro ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>
      </div>
      ${
        lista.length
          ? `<ul class="fila" aria-label="Solicitações">${lista
              .map(
                (s) => `
        <li class="fila-item">
          <a href="#/atendente/${esc(s.protocolo)}">
            <span class="mono fila-proto">${esc(s.protocolo)}</span>
            ${selo(s.status)}
            <span class="fila-end">${esc(s.endereco)}</span>
            <span class="fila-meta">${esc(fmtVolume(s.volume))} · coleta em ${esc(fmtData(s.data))}</span>
          </a>
        </li>`,
              )
              .join('')}</ul>`
          : '<p class="aviso">Nenhuma solicitação com esta situação.</p>'
      }`,
    montar(raiz) {
      raiz.querySelector('#filtro').addEventListener('change', (e) => {
        location.hash = `#/atendente/fila/${encodeURIComponent(e.target.value)}`;
      });
    },
  };
}

// ---------------------------------------------------------------- T-05 Detalhe e decisão

export function telaDetalhe({ estado, params, hoje, salvar, navegar }) {
  const s = achar(estado, params[0]);
  if (!s) return telaNaoEncontrada();
  const pendente = s.status === STATUS.AGUARDANDO;
  return {
    titulo: `Triagem ${s.protocolo}`,
    html: `
      ${titulo1('Detalhe e decisão', `Perfil atendente. Solicitação <span class="mono">${esc(s.protocolo)}</span>.`)}
      <section class="cartao" aria-labelledby="h-dados">
        <h2 id="h-dados">Dados da solicitação</h2>
        <dl class="resumo"><div><dt>Solicitante</dt><dd>${esc(s.nome)}</dd></div></dl>
        ${resumo(s, { cpfCompleto: true })}
        ${s.justificativa ? `<p class="aviso aviso--erro"><strong>Justificativa da recusa:</strong> ${esc(s.justificativa)}</p>` : ''}
      </section>
      <section class="cartao" aria-labelledby="h-hist2"><h2 id="h-hist2">Histórico</h2>${linhaDoTempo(s)}</section>
      ${
        pendente
          ? `
      <section class="cartao" aria-labelledby="h-dec">
        <h2 id="h-dec">Decisão</h2>
        <div class="grade-2">
          <div>
            <p>Aprovar confirma a data pedida e muda a situação para Agendada.</p>
            <button class="botao" type="button" id="btn-aprovar">Aprovar e agendar</button>
          </div>
          <form id="form-recusar" novalidate>
            <div class="campo">
              <label for="justificativa">Justificativa da recusa</label>
              <p class="dica" id="dica-justificativa">Mínimo de ${LIMITES.justificativaMin} caracteres. O cidadão verá este texto.</p>
              <textarea id="justificativa" name="justificativa" rows="3" aria-describedby="dica-justificativa erro-justificativa" data-campo></textarea>
              <p class="erro" id="erro-justificativa"></p>
            </div>
            <button class="botao botao--perigo" type="submit">Recusar solicitação</button>
          </form>
        </div>
      </section>`
          : '<p class="aviso">Esta solicitação já foi decidida ou encerrada. Nenhuma ação disponível.</p>'
      }
      <div class="acoes"><a class="botao botao--sec" href="#/atendente">Voltar à fila</a></div>`,
    montar(raiz) {
      if (!pendente) return;
      raiz.querySelector('#btn-aprovar').addEventListener('click', () => {
        s.status = STATUS.AGENDADA;
        s.historico.push({ em: hoje.toISOString(), texto: 'Aprovada na triagem e agendada.' });
        salvar();
        navegar(`#/atendente/${s.protocolo}`, { aviso: 'Solicitação aprovada e agendada.' });
      });
      const form = raiz.querySelector('#form-recusar');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const erro = validarJustificativa(form.justificativa.value);
        mostrarErros(raiz, erro ? { justificativa: erro } : {});
        if (erro) return;
        s.status = STATUS.RECUSADA;
        s.justificativa = form.justificativa.value.trim();
        s.historico.push({ em: hoje.toISOString(), texto: 'Recusada na triagem.' });
        salvar();
        navegar(`#/atendente/${s.protocolo}`, { aviso: 'Solicitação recusada.' });
      });
    },
  };
}

// ---------------------------------------------------------------- T-06 Consulta pública

export function telaConsulta({ estado, params, navegar }) {
  const p = params[0] ? normalizarProtocolo(params[0]) : '';
  const intro =
    'Qualquer pessoa pode conferir a situação de uma coleta com o número do protocolo. Por privacidade, o CPF aparece mascarado e não mostramos nome nem endereço.';
  if (!p) {
    return {
      titulo: 'Consulta pública',
      html: `${titulo1('Consulta pública por protocolo', intro)}${formBusca({ rotulo: 'Número do protocolo' })}`,
      montar: (raiz) => montarBusca(raiz, '#/consulta', navegar),
    };
  }
  const s = achar(estado, p);
  if (!s) {
    return {
      titulo: 'Consulta pública',
      html: `${titulo1('Consulta pública por protocolo', intro)}${formBusca({ rotulo: 'Número do protocolo', valor: p, erro: 'Protocolo não encontrado.' })}`,
      montar: (raiz) => montarBusca(raiz, '#/consulta', navegar),
    };
  }
  return {
    titulo: `Consulta ${s.protocolo}`,
    html: `
      ${titulo1('Consulta pública por protocolo', intro)}
      <section class="cartao" aria-labelledby="h-res">
        <h2 id="h-res">Resultado</h2>
        <dl class="resumo" id="resultado-publico">
          <div><dt>Protocolo</dt><dd><span class="mono">${esc(s.protocolo)}</span></dd></div>
          <div><dt>Situação</dt><dd>${selo(s.status)}</dd></div>
          <div><dt>Data da coleta</dt><dd>${esc(fmtData(s.data))}</dd></div>
          <div><dt>CPF do solicitante</dt><dd><span class="mono">${esc(mascararCpf(s.cpf))}</span></dd></div>
        </dl>
      </section>
      <div class="acoes"><a class="botao botao--sec" href="#/consulta">Consultar outro protocolo</a></div>`,
  };
}

export function telaNaoEncontrada() {
  return {
    titulo: 'Página não encontrada',
    html: `${titulo1('Página não encontrada', 'O endereço procurado não existe neste protótipo.')}<div class="acoes"><a class="botao" href="#/">Ir para o início</a></div>`,
  };
}
