// Regras de negócio RN-01 a RN-08 do serviço fictício "Agendamento de Coleta de Entulho"
// (Prefeitura de Vila Modelo). Módulo puro: sem DOM, sem localStorage, sem relógio global.
// Toda função que depende do "agora" ou de dados recebe esses valores por parâmetro.

export const STATUS = {
  AGUARDANDO: 'Aguardando Triagem',
  AGENDADA: 'Agendada',
  CONCLUIDA: 'Concluída',
  RECUSADA: 'Recusada',
  CANCELADA: 'Cancelada',
};

export const STATUS_ATIVOS = [STATUS.AGUARDANDO, STATUS.AGENDADA];

export const LIMITES = {
  volumeMaxM3: 3, // RN-02
  capacidadePorDia: 20, // RN-04
  antecedenciaDiasUteis: 3, // RN-04
  janelaDias: 30, // RN-04
  horasCancelamento: 24, // RN-05
  horaColeta: 8, // a coleta começa às 08:00 (decisão registrada no README)
  justificativaMin: 10, // RN-07
};

export const MATERIAIS_PROIBIDOS = ['amianto', 'tintas e solventes', 'pneus', 'lixo domiciliar']; // RN-03

export const MENSAGENS = {
  rn01: 'Já existe uma coleta ativa para este endereço.',
  rn02: 'O volume máximo por coleta é de 3 m³.',
  rn03: (material) => `Este material não pode ser coletado: ${material}.`,
  rn04: 'Escolha uma data disponível.',
  rn05Prazo: 'O cancelamento só é possível até 24 horas antes da coleta.',
  rn05Reagendamento: 'O reagendamento já foi usado nesta solicitação.',
  rn07: 'Informe a justificativa com pelo menos 10 caracteres.',
};

// ---------- Datas (sempre no fuso local; datas de coleta trafegam como "AAAA-MM-DD") ----------

const pad = (n, tam = 2) => String(n).padStart(tam, '0');

export function paraISO(data) {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

export function deISO(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [a, m, d] = iso.split('-').map(Number);
  const data = new Date(a, m - 1, d);
  return data.getFullYear() === a && data.getMonth() === m - 1 && data.getDate() === d
    ? data
    : null;
}

export function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function ehDiaUtil(data) {
  const dia = data.getDay();
  return dia !== 0 && dia !== 6; // sem feriados no protótipo
}

export function somarDiasUteis(data, n) {
  const passo = n < 0 ? -1 : 1;
  const r = inicioDoDia(data);
  let faltam = Math.abs(n);
  while (faltam > 0) {
    r.setDate(r.getDate() + passo);
    if (ehDiaUtil(r)) faltam -= 1;
  }
  return r;
}

export function somarDias(data, n) {
  const r = inicioDoDia(data);
  r.setDate(r.getDate() + n);
  return r;
}

export function primeiraData(hoje) {
  return somarDiasUteis(hoje, LIMITES.antecedenciaDiasUteis);
}

export function ultimaData(hoje) {
  return somarDias(hoje, LIMITES.janelaDias);
}

// ---------- RN-06: protocolo COL-AAAA-NNNNNN ----------

export function gerarProtocolo(ano, sequencia) {
  return `COL-${pad(ano, 4)}-${pad(sequencia, 6)}`;
}

export function protocoloValido(texto) {
  return /^COL-\d{4}-\d{6}$/.test(String(texto));
}

export function normalizarProtocolo(texto) {
  return String(texto ?? '')
    .trim()
    .toUpperCase();
}

export function proximoProtocolo(solicitacoes, ano) {
  const prefixo = `COL-${pad(ano, 4)}-`;
  const maior = solicitacoes
    .filter((s) => s.protocolo.startsWith(prefixo))
    .reduce((max, s) => Math.max(max, Number(s.protocolo.slice(prefixo.length))), 0);
  return gerarProtocolo(ano, maior + 1);
}

// ---------- RN-01: no máximo 1 solicitação ativa por endereço ----------

export function normalizarEndereco(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function validarEndereco(endereco, solicitacoes, ignorarProtocolo = null) {
  const alvo = normalizarEndereco(endereco);
  const conflito = solicitacoes.some(
    (s) =>
      s.protocolo !== ignorarProtocolo &&
      STATUS_ATIVOS.includes(s.status) &&
      normalizarEndereco(s.endereco) === alvo,
  );
  return conflito ? MENSAGENS.rn01 : null;
}

// ---------- RN-02: volume máximo de 3 m³ ----------

export function lerVolume(texto) {
  const n = Number(
    String(texto ?? '')
      .trim()
      .replace(',', '.'),
  );
  return Number.isFinite(n) ? n : NaN;
}

export function validarVolume(texto) {
  const v = lerVolume(texto);
  if (Number.isNaN(v) || v <= 0) return 'Informe o volume em m³.';
  return v > LIMITES.volumeMaxM3 ? MENSAGENS.rn02 : null;
}

// ---------- RN-03: materiais proibidos ----------

export function validarMateriais(materiais) {
  const lista = (materiais ?? []).map((m) => String(m).toLowerCase());
  const proibido = MATERIAIS_PROIBIDOS.find((p) => lista.includes(p));
  if (proibido) return MENSAGENS.rn03(proibido);
  return lista.length === 0 ? 'Marque pelo menos um material.' : null;
}

// ---------- RN-04: datas ----------

export function contarColetasNoDia(solicitacoes, iso, ignorarProtocolo = null) {
  return solicitacoes.filter(
    (s) => s.protocolo !== ignorarProtocolo && STATUS_ATIVOS.includes(s.status) && s.data === iso,
  ).length;
}

export function validarData(iso, hoje, solicitacoes, ignorarProtocolo = null) {
  const data = deISO(iso);
  if (!data) return MENSAGENS.rn04;
  if (!ehDiaUtil(data)) return MENSAGENS.rn04;
  if (data < primeiraData(hoje) || data > ultimaData(hoje)) return MENSAGENS.rn04;
  if (contarColetasNoDia(solicitacoes, iso, ignorarProtocolo) >= LIMITES.capacidadePorDia) {
    return MENSAGENS.rn04;
  }
  return null;
}

export function datasDisponiveis(hoje, solicitacoes) {
  const lista = [];
  for (let d = primeiraData(hoje); d <= ultimaData(hoje); d = somarDias(d, 1)) {
    const iso = paraISO(d);
    if (!validarData(iso, hoje, solicitacoes)) lista.push(iso);
  }
  return lista;
}

// ---------- RN-05: cancelamento e reagendamento ----------

export function inicioDaColeta(iso) {
  const d = deISO(iso);
  return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), LIMITES.horaColeta) : null;
}

export function podeCancelar(solicitacao, agora) {
  if (!STATUS_ATIVOS.includes(solicitacao.status)) {
    return { ok: false, erro: 'Esta solicitação não está ativa.' };
  }
  const inicio = inicioDaColeta(solicitacao.data);
  const limite = inicio.getTime() - LIMITES.horasCancelamento * 3600 * 1000;
  return agora.getTime() <= limite ? { ok: true } : { ok: false, erro: MENSAGENS.rn05Prazo };
}

export function podeReagendar(solicitacao) {
  if (!STATUS_ATIVOS.includes(solicitacao.status)) {
    return { ok: false, erro: 'Esta solicitação não está ativa.' };
  }
  return solicitacao.reagendada ? { ok: false, erro: MENSAGENS.rn05Reagendamento } : { ok: true };
}

// ---------- RN-07: justificativa de recusa ----------

export function validarJustificativa(texto) {
  return String(texto ?? '').trim().length >= LIMITES.justificativaMin ? null : MENSAGENS.rn07;
}

// ---------- RN-08: CPF mascarado e dados mínimos ----------

export function apenasDigitos(texto) {
  return String(texto ?? '').replace(/\D/g, '');
}

export function formatarCpf(texto) {
  const d = apenasDigitos(texto);
  return d.length === 11
    ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
    : null;
}

export function mascararCpf(texto) {
  const d = apenasDigitos(texto);
  return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : '***.***.***-**';
}

// ---------- Validação do formulário T-01 (reúne as regras acima) ----------

export function validarSolicitacao(dados, { hoje, solicitacoes }) {
  const erros = {};
  if (!String(dados.nome ?? '').trim()) erros.nome = 'Informe o nome completo.';
  if (!formatarCpf(dados.cpf)) erros.cpf = 'Informe um CPF com 11 dígitos.';
  if (!String(dados.endereco ?? '').trim()) erros.endereco = 'Informe o endereço da coleta.';
  else {
    const e = validarEndereco(dados.endereco, solicitacoes);
    if (e) erros.endereco = e;
  }
  const v = validarVolume(dados.volume);
  if (v) erros.volume = v;
  const m = validarMateriais(dados.materiais);
  if (m) erros.materiais = m;
  const d = validarData(dados.data, hoje, solicitacoes);
  if (d) erros.data = d;
  return erros;
}
