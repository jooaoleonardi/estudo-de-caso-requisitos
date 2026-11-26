// Apoio dos testes: relógio fixo (segunda-feira, 02/03/2026 09:00 em Brasília) e semeadura do localStorage.
export const HOJE = '2026-03-02T09:00:00-03:00';
export const CHAVE = 'vilamodelo.coletas.v1';

// Datas relativas ao relógio fixo
export const DATAS = {
  primeiraValida: '2026-03-05', // 3 dias úteis depois de seg 02/03
  outraValida: '2026-03-06', // sexta
  tresDiasAntes: '2026-03-04', // 2 dias úteis: cedo demais
  sabado: '2026-03-07',
  domingo: '2026-03-08',
  foraDaJanela: '2026-04-03', // mais de 30 dias
  amanha: '2026-03-03', // coleta às 08:00: faltam 23 h
};

export const CPF = '111.123.456-99';

/** Abre o app com relógio fixo. Se `solicitacoes` vier, semeia o estado (uma única vez por contexto). */
export async function abrir(page, hash = '#/', solicitacoes = null) {
  await page.clock.install({ time: new Date(HOJE) });
  if (solicitacoes) {
    await page.addInitScript(
      ([chave, dados]) => {
        if (!localStorage.getItem(chave)) {
          localStorage.setItem(chave, JSON.stringify({ solicitacoes: dados }));
        }
      },
      [CHAVE, solicitacoes],
    );
  }
  await page.goto(`/${hash}`);
}

let contador = 0;
/** Cria uma solicitação válida para semear o estado. */
export function solicitacao(extra = {}) {
  contador += 1;
  const seq = String(900 + contador).padStart(6, '0');
  return {
    protocolo: `COL-2026-${seq}`,
    nome: 'Pessoa de Teste',
    cpf: CPF,
    endereco: `Rua de Teste, ${contador}`,
    volume: 1,
    materiais: ['Metais'],
    data: DATAS.primeiraValida,
    status: 'Aguardando Triagem',
    reagendada: false,
    justificativa: null,
    criadaEm: '2026-03-01T10:00:00-03:00',
    historico: [{ em: '2026-03-01T10:00:00-03:00', texto: 'Solicitação registrada.' }],
    ...extra,
  };
}

/** Preenche o formulário T-01 (campos omitidos usam valores válidos). */
export async function preencherSolicitacao(page, dados = {}) {
  const d = {
    nome: 'Joana da Silva',
    cpf: CPF,
    endereco: 'Rua Nova, 500',
    volume: '2,5',
    data: DATAS.primeiraValida,
    materiais: ['Restos de construção'],
    ...dados,
  };
  await page.getByLabel('Nome completo').fill(d.nome);
  await page.getByLabel('CPF', { exact: true }).fill(d.cpf);
  await page.getByLabel('Endereço da coleta').fill(d.endereco);
  await page.getByLabel('Volume estimado (m³)').fill(d.volume);
  await page.getByLabel('Data da coleta').fill(d.data);
  for (const m of d.materiais) await page.getByLabel(m, { exact: true }).check();
}

export const enviar = (page) => page.getByRole('button', { name: 'Enviar solicitação' }).click();
