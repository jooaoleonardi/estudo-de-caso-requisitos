import { test, expect } from '@playwright/test';

// Testes unitários de js/regras.js executados no navegador (o módulo é ES module puro).
test.beforeEach(async ({ page, isMobile }) => {
  test.skip(isMobile, 'As regras não dependem do tamanho da tela: rodam só no projeto desktop.');
  await page.goto('/');
});

const rodar = (page, fn) => page.evaluate(fn);

test('TE-15a RN-01..RN-03 e RN-06..RN-08 em regras.js', async ({ page }) => {
  const r = await rodar(page, async () => {
    const m = await import('/js/regras.js');
    const ativa = { protocolo: 'COL-2026-000001', endereco: 'Rua A, 10', status: 'Agendada' };
    return {
      rn01: m.validarEndereco('rua a 10', [ativa]),
      rn01Livre: m.validarEndereco('Rua B, 1', [ativa]),
      rn01Cancelada: m.validarEndereco('Rua A, 10', [{ ...ativa, status: 'Cancelada' }]),
      rn02: [m.validarVolume('3'), m.validarVolume('3,1'), m.validarVolume('0')],
      rn03: m.validarMateriais(['Metais', 'pneus']),
      rn03Ok: m.validarMateriais(['Metais']),
      rn06: [
        m.gerarProtocolo(2026, 7),
        m.protocoloValido('COL-2026-000007'),
        m.protocoloValido('COL-26-7'),
      ],
      prox: m.proximoProtocolo([{ protocolo: 'COL-2026-000009' }], 2026),
      rn07: [
        m.validarJustificativa('123456789'),
        m.validarJustificativa('1234567890'),
        m.validarJustificativa('   curto   '),
      ],
      rn08: [m.mascararCpf('111.123.456-99'), m.mascararCpf('11112345699'), m.mascararCpf('x')],
    };
  });
  expect(r.rn01).toBe('Já existe uma coleta ativa para este endereço.');
  expect(r.rn01Livre).toBeNull();
  expect(r.rn01Cancelada).toBeNull();
  expect(r.rn02).toEqual([
    null,
    'O volume máximo por coleta é de 3 m³.',
    'Informe o volume em m³.',
  ]);
  expect(r.rn03).toBe('Este material não pode ser coletado: pneus.');
  expect(r.rn03Ok).toBeNull();
  expect(r.rn06).toEqual(['COL-2026-000007', true, false]);
  expect(r.prox).toBe('COL-2026-000010');
  expect(r.rn07).toEqual([
    'Informe a justificativa com pelo menos 10 caracteres.',
    null,
    'Informe a justificativa com pelo menos 10 caracteres.',
  ]);
  expect(r.rn08).toEqual(['***.123.456-**', '***.123.456-**', '***.***.***-**']);
});

test('TE-15b RN-04 datas: dias úteis, antecedência, janela e capacidade', async ({ page }) => {
  const r = await rodar(page, async () => {
    const m = await import('/js/regras.js');
    const hoje = new Date(2026, 2, 2); // segunda 02/03/2026
    const dia = (iso) => ({ protocolo: Math.random().toString(), status: 'Agendada', data: iso });
    const cheio = Array.from({ length: 20 }, () => dia('2026-03-06'));
    return {
      primeira: m.paraISO(m.primeiraData(hoje)),
      sexta3: m.paraISO(m.somarDiasUteis(new Date(2026, 2, 5), 3)), // quinta + 3 úteis = terça
      ultima: m.paraISO(m.ultimaData(hoje)),
      volta: m.paraISO(m.somarDiasUteis(new Date(2026, 2, 9), -1)),
      valida: m.validarData('2026-03-05', hoje, []),
      sabado: m.validarData('2026-03-07', hoje, []),
      cedo: m.validarData('2026-03-04', hoje, []),
      tarde: m.validarData('2026-04-03', hoje, []),
      limite: m.validarData('2026-04-01', hoje, []),
      lixo: m.validarData('', hoje, []),
      vinte: m.validarData('2026-03-06', hoje, cheio.slice(0, 19)),
      vinteUm: m.validarData('2026-03-06', hoje, cheio),
      excecaoDoProprio: m.validarData('2026-03-06', hoje, cheio, cheio[0].protocolo),
      canceladaNaoConta: m.validarData(
        '2026-03-06',
        hoje,
        cheio.map((s) => ({ ...s, status: 'Cancelada' })),
      ),
      disponiveis: m.datasDisponiveis(hoje, cheio).includes('2026-03-06'),
    };
  });
  expect(r.primeira).toBe('2026-03-05');
  expect(r.sexta3).toBe('2026-03-10');
  expect(r.ultima).toBe('2026-04-01');
  expect(r.volta).toBe('2026-03-06');
  expect(r.valida).toBeNull();
  for (const k of ['sabado', 'cedo', 'tarde', 'lixo', 'vinteUm']) {
    expect(r[k], k).toBe('Escolha uma data disponível.');
  }
  expect(r.limite).toBeNull();
  expect(r.vinte).toBeNull();
  expect(r.excecaoDoProprio).toBeNull();
  expect(r.canceladaNaoConta).toBeNull();
  expect(r.disponiveis).toBe(false);
});

test('TE-15c RN-05 prazo de 24 h e reagendamento único', async ({ page }) => {
  const r = await rodar(page, async () => {
    const m = await import('/js/regras.js');
    const s = { status: 'Agendada', data: '2026-03-10', reagendada: false };
    // a coleta começa às 08:00 de 10/03; o limite é 08:00 de 09/03
    return {
      noLimite: m.podeCancelar(s, new Date(2026, 2, 9, 8, 0)),
      depois: m.podeCancelar(s, new Date(2026, 2, 9, 8, 1)),
      cedo: m.podeCancelar(s, new Date(2026, 2, 2, 12, 0)),
      encerrada: m.podeCancelar({ ...s, status: 'Concluída' }, new Date(2026, 2, 2)),
      reag1: m.podeReagendar(s),
      reag2: m.podeReagendar({ ...s, reagendada: true }),
    };
  });
  expect(r.noLimite.ok).toBe(true);
  expect(r.depois).toEqual({
    ok: false,
    erro: 'O cancelamento só é possível até 24 horas antes da coleta.',
  });
  expect(r.cedo.ok).toBe(true);
  expect(r.encerrada.ok).toBe(false);
  expect(r.reag1.ok).toBe(true);
  expect(r.reag2).toEqual({ ok: false, erro: 'O reagendamento já foi usado nesta solicitação.' });
});
