import { test, expect } from '@playwright/test';
import { abrir, preencherSolicitacao, enviar, solicitacao, DATAS, CPF } from './apoio.js';

// IDs de teste alinhados ao contrato do estudo de caso: TE-01 a TE-10 (um por critério principal),
// TE-11 a TE-14 (histórias de apoio) e TE-15a a TE-15c (regras em regras.js, em regras.spec.js).

test('TE-01 HU-01 caminho feliz: solicitar coleta gera protocolo e entra em Aguardando Triagem', async ({
  page,
}) => {
  await abrir(page, '#/solicitar');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await preencherSolicitacao(page);
  await enviar(page);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Solicitação registrada' }),
  ).toBeVisible();
  await expect(page.locator('#protocolo-gerado')).toHaveText(/^COL-2026-\d{6}$/);
  await expect(page.getByRole('status').getByText('Aguardando Triagem')).toBeVisible();
});

test('TE-02 RN-01 bloqueia segunda solicitação ativa no mesmo endereço', async ({ page }) => {
  await abrir(page, '#/solicitar', [solicitacao({ endereco: 'Rua das Palmeiras, 10' })]);
  await preencherSolicitacao(page, { endereco: 'rua das palmeiras 10' });
  await enviar(page);
  const campo = page.getByLabel('Endereço da coleta');
  await expect(page.locator('#erro-endereco')).toHaveText(
    'Já existe uma coleta ativa para este endereço.',
  );
  await expect(campo).toHaveAttribute('aria-invalid', 'true');
  await expect(campo).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Solicitação registrada' })).toHaveCount(0);
});

test('TE-02b RN-01 não bloqueia endereço cuja solicitação anterior foi cancelada', async ({
  page,
}) => {
  await abrir(page, '#/solicitar', [
    solicitacao({ endereco: 'Rua das Palmeiras, 10', status: 'Cancelada' }),
  ]);
  await preencherSolicitacao(page, { endereco: 'Rua das Palmeiras, 10' });
  await enviar(page);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Solicitação registrada' }),
  ).toBeVisible();
});

test('TE-03 RN-02 recusa volume de 3,1 m³ e aceita 3 m³', async ({ page }) => {
  await abrir(page, '#/solicitar');
  await preencherSolicitacao(page, { volume: '3,1' });
  await enviar(page);
  await expect(page.locator('#erro-volume')).toHaveText('O volume máximo por coleta é de 3 m³.');
  await expect(page.getByLabel('Volume estimado (m³)')).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Volume estimado (m³)').fill('3');
  await enviar(page);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Solicitação registrada' }),
  ).toBeVisible();
});

for (const material of ['Amianto', 'Tintas e solventes', 'Pneus', 'Lixo domiciliar']) {
  test(`TE-04 RN-03 bloqueia material proibido: ${material}`, async ({ page }) => {
    await abrir(page, '#/solicitar');
    await preencherSolicitacao(page, { materiais: ['Restos de construção', material] });
    await enviar(page);
    await expect(page.locator('#erro-materiais')).toHaveText(
      `Este material não pode ser coletado: ${material.toLowerCase()}.`,
    );
    await expect(page.locator('#materiais')).toHaveAttribute('aria-invalid', 'true');
  });
}

test('TE-05 RN-04 datas: sem fim de semana, sem data cedo demais e sem 21ª coleta no dia', async ({
  page,
}) => {
  const lotado = Array.from({ length: 20 }, () => solicitacao({ data: DATAS.outraValida }));
  await abrir(page, '#/solicitar', lotado);
  const msg = 'Escolha uma data disponível.';
  const tentar = async (data) => {
    await preencherSolicitacao(page, { data });
    await enviar(page);
  };

  await test.step('sábado e domingo', async () => {
    await tentar(DATAS.sabado);
    await expect(page.locator('#erro-data')).toHaveText(msg);
    await tentar(DATAS.domingo);
    await expect(page.locator('#erro-data')).toHaveText(msg);
  });
  await test.step('antes de 3 dias úteis e além de 30 dias', async () => {
    await tentar(DATAS.tresDiasAntes);
    await expect(page.locator('#erro-data')).toHaveText(msg);
    await tentar(DATAS.foraDaJanela);
    await expect(page.locator('#erro-data')).toHaveText(msg);
  });
  await test.step('21ª coleta no mesmo dia', async () => {
    await tentar(DATAS.outraValida);
    await expect(page.locator('#erro-data')).toHaveText(msg);
    await expect(page.getByLabel('Data da coleta')).toHaveAttribute('aria-invalid', 'true');
  });
  await test.step('dia com vaga é aceito', async () => {
    await tentar(DATAS.primeiraValida);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Solicitação registrada' }),
    ).toBeVisible();
  });
});

test('TE-05b RN-04 a 20ª coleta ainda cabe no dia', async ({ page }) => {
  const dezenove = Array.from({ length: 19 }, () => solicitacao({ data: DATAS.outraValida }));
  await abrir(page, '#/solicitar', dezenove);
  await preencherSolicitacao(page, { data: DATAS.outraValida });
  await enviar(page);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Solicitação registrada' }),
  ).toBeVisible();
});

test('TE-06 RN-05 cancelamento só até 24 h antes e reagendamento uma única vez', async ({
  page,
}) => {
  const dentroDe24h = solicitacao({ data: DATAS.amanha, status: 'Agendada' });
  const comVagas = solicitacao({ data: DATAS.primeiraValida, status: 'Agendada' });
  await abrir(page, `#/cancelar/${dentroDe24h.protocolo}`, [dentroDe24h, comVagas]);

  await test.step('cancelar com menos de 24 h é recusado', async () => {
    await page.getByRole('button', { name: 'Cancelar solicitação' }).click();
    await expect(page.locator('#erro-cancelar')).toHaveText(
      'O cancelamento só é possível até 24 horas antes da coleta.',
    );
  });

  await test.step('reagendar uma vez funciona e a segunda vez é recusada', async () => {
    await page.goto(`/#/cancelar/${comVagas.protocolo}`);
    await page.getByLabel('Nova data da coleta').fill(DATAS.outraValida);
    await page.getByRole('button', { name: 'Reagendar coleta' }).click();
    await expect(page.getByRole('status').getByText(/reagendada para 06\/03\/2026/i)).toBeVisible();
    await page.getByLabel('Nova data da coleta').fill(DATAS.primeiraValida);
    await page.getByRole('button', { name: 'Reagendar coleta' }).click();
    await expect(page.locator('#erro-novaData')).toHaveText(
      'O reagendamento já foi usado nesta solicitação.',
    );
  });
});

test('TE-07 RN-06 protocolo no formato COL-AAAA-NNNNNN e sequencial', async ({ page }) => {
  await abrir(page, '#/solicitar');
  await preencherSolicitacao(page);
  await enviar(page);
  const primeiro = await page.locator('#protocolo-gerado').innerText();
  expect(primeiro).toMatch(/^COL-2026-\d{6}$/);
  await page.goto('/#/solicitar');
  await preencherSolicitacao(page, { endereco: 'Outra Rua, 77' });
  await enviar(page);
  const segundo = await page.locator('#protocolo-gerado').innerText();
  expect(segundo).toMatch(/^COL-2026-\d{6}$/);
  expect(Number(segundo.slice(-6))).toBe(Number(primeiro.slice(-6)) + 1);
});

test('TE-08 RN-07 recusa exige justificativa com pelo menos 10 caracteres', async ({ page }) => {
  const s = solicitacao();
  await abrir(page, `#/atendente/${s.protocolo}`, [s]);
  const recusar = page.getByRole('button', { name: 'Recusar solicitação' });
  const campo = page.getByLabel('Justificativa da recusa');

  await campo.fill('curto');
  await recusar.click();
  await expect(page.locator('#erro-justificativa')).toHaveText(
    'Informe a justificativa com pelo menos 10 caracteres.',
  );
  await expect(campo).toHaveAttribute('aria-invalid', 'true');

  await campo.fill('Endereço fora da área.');
  await recusar.click();
  await expect(page.getByRole('status').getByText('Solicitação recusada.')).toBeVisible();
  await page.goto(`/#/acompanhar/${s.protocolo}`);
  await expect(page.getByText('Endereço fora da área.')).toBeVisible();
  await expect(page.getByText('Recusada').first()).toBeVisible();
});

test('TE-09 RN-08 consulta pública mostra CPF mascarado e nenhum dado pessoal a mais', async ({
  page,
}) => {
  await abrir(page, '#/solicitar');
  await preencherSolicitacao(page, { nome: 'Joana da Silva', endereco: 'Rua Reservada, 999' });
  await enviar(page);
  const protocolo = await page.locator('#protocolo-gerado').innerText();

  await page.goto('/#/consulta');
  await page.getByLabel('Número do protocolo').fill(protocolo);
  await page.getByRole('button', { name: 'Consultar' }).click();
  const resultado = page.locator('#resultado-publico');
  await expect(resultado).toContainText('***.123.456-**');
  await expect(resultado).not.toContainText(CPF);
  await expect(resultado).not.toContainText('111');
  await expect(page.locator('main')).not.toContainText('Joana');
  await expect(page.locator('main')).not.toContainText('Rua Reservada');
});

const TELAS = [
  ['#/', 'Início'],
  ['#/solicitar', 'T-01'],
  ['#/acompanhar', 'T-02'],
  ['#/cancelar', 'T-03'],
  ['#/atendente', 'T-04'],
  ['#/atendente/COL-2026-000001', 'T-05'],
  ['#/consulta', 'T-06'],
  ['#/consulta/COL-2026-000002', 'T-06 com resultado'],
  ['#/acompanhar/COL-2026-000002', 'T-02 com resultado'],
  ['#/cancelar/COL-2026-000002', 'T-03 com solicitação'],
];

test('TE-10 fumaça: todas as telas abrem sem erro de JavaScript, sem rolagem horizontal e com um h1', async ({
  page,
}) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  await abrir(page, '#/');
  for (const [hash, nome] of TELAS) {
    await page.goto(`/${hash}`);
    await expect(page.locator('h1'), nome).toHaveCount(1);
    const largura = await page.evaluate(() => ({
      conteudo: document.documentElement.scrollWidth,
      janela: document.documentElement.clientWidth,
    }));
    expect(largura.conteudo, `${nome} (${hash}) rola na horizontal`).toBeLessThanOrEqual(
      largura.janela,
    );
  }
  expect(erros).toEqual([]);
});

test('TE-11 HU-02 acompanhar por protocolo mostra situação e histórico; protocolo inexistente avisa', async ({
  page,
}) => {
  await abrir(page, '#/acompanhar');
  await page.getByLabel('Número do protocolo').fill('COL-2026-000002');
  await page.getByRole('button', { name: 'Consultar' }).click();
  await expect(page.getByText('Agendada').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Histórico' })).toBeVisible();

  await page.goto('/#/acompanhar');
  await page.getByLabel('Número do protocolo').fill('COL-2026-999999');
  await page.getByRole('button', { name: 'Consultar' }).click();
  await expect(page.locator('#erro-protocolo')).toHaveText('Protocolo não encontrado.');
  await page.getByLabel('Número do protocolo').fill('abc');
  await page.getByRole('button', { name: 'Consultar' }).click();
  await expect(page.locator('#erro-protocolo')).toHaveText(
    'Informe o protocolo no formato COL-AAAA-NNNNNN.',
  );
});

test('TE-12 HU-04 atendente aprova solicitação e ela passa a Agendada', async ({ page }) => {
  const s = solicitacao();
  await abrir(page, '#/atendente', [s]);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: new RegExp(s.protocolo) }).click();
  await page.getByRole('button', { name: 'Aprovar e agendar' }).click();
  await expect(
    page.getByRole('status').getByText('Solicitação aprovada e agendada.'),
  ).toBeVisible();
  await page.goto(`/#/acompanhar/${s.protocolo}`);
  await expect(page.getByText('Agendada').first()).toBeVisible();
});

test('TE-13 HU-03 cancelar com mais de 24 h de antecedência libera o endereço', async ({
  page,
}) => {
  const s = solicitacao({ status: 'Agendada', endereco: 'Rua do Teste, 1' });
  await abrir(page, `#/cancelar/${s.protocolo}`, [s]);
  await page.getByRole('button', { name: 'Cancelar solicitação' }).click();
  await expect(
    page.getByRole('status').getByText('Solicitação cancelada com sucesso.'),
  ).toBeVisible();
  await page.goto('/#/solicitar');
  await preencherSolicitacao(page, { endereco: 'Rua do Teste, 1' });
  await enviar(page);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Solicitação registrada' }),
  ).toBeVisible();
});

test('TE-14 dados de exemplo: pelo menos 6 solicitações em estados variados', async ({ page }) => {
  await abrir(page, '#/atendente/fila/Todas');
  expect(await page.locator('.fila-item').count()).toBeGreaterThanOrEqual(6);
  for (const status of ['Aguardando Triagem', 'Agendada', 'Concluída', 'Recusada', 'Cancelada']) {
    await expect(page.locator('.fila-item .selo', { hasText: status }).first()).toBeVisible();
  }
});
