// Estado simulado em localStorage. Sem servidor: tudo vive no navegador.
import { STATUS, gerarProtocolo, paraISO, somarDiasUteis, somarDias } from './regras.js';

export const CHAVE = 'vilamodelo.coletas.v1';

export function agora() {
  return new Date();
}

function dadosDeExemplo(hoje) {
  const ano = hoje.getFullYear();
  const em = (dias, hora = 9) => {
    const d = somarDias(hoje, dias);
    d.setHours(hora, 0, 0, 0);
    return d.toISOString();
  };
  const util = (n) => paraISO(somarDiasUteis(hoje, n));
  const mk = (seq, extra) => ({
    protocolo: gerarProtocolo(ano, seq),
    reagendada: false,
    justificativa: null,
    ...extra,
  });
  return [
    mk(1, {
      nome: 'Marina Albuquerque Teles',
      cpf: '111.222.333-44',
      endereco: 'Rua das Acácias, 120',
      volume: 1.5,
      materiais: ['Restos de construção'],
      data: util(4),
      status: STATUS.AGUARDANDO,
      criadaEm: em(-1),
      historico: [{ em: em(-1), texto: 'Solicitação registrada.' }],
    }),
    mk(2, {
      nome: 'Otávio Brandão Lemos',
      cpf: '222.333.444-55',
      endereco: 'Avenida Central, 450',
      volume: 2.8,
      materiais: ['Restos de construção', 'Madeira e móveis'],
      data: util(5),
      status: STATUS.AGENDADA,
      criadaEm: em(-3),
      historico: [
        { em: em(-3), texto: 'Solicitação registrada.' },
        { em: em(-2), texto: 'Aprovada na triagem e agendada.' },
      ],
    }),
    mk(3, {
      nome: 'Helena Prado Siqueira',
      cpf: '333.444.555-66',
      endereco: 'Rua do Ipê, 33',
      volume: 0.9,
      materiais: ['Metais'],
      data: util(7),
      status: STATUS.AGENDADA,
      reagendada: true,
      criadaEm: em(-6),
      historico: [
        { em: em(-6), texto: 'Solicitação registrada.' },
        { em: em(-5), texto: 'Aprovada na triagem e agendada.' },
        { em: em(-4), texto: 'Data alterada pelo cidadão (reagendamento).' },
      ],
    }),
    mk(4, {
      nome: 'Caio Mendonça Reis',
      cpf: '444.555.666-77',
      endereco: 'Travessa do Mercado, 8',
      volume: 2.2,
      materiais: ['Restos de construção'],
      data: util(-5),
      status: STATUS.CONCLUIDA,
      criadaEm: em(-14),
      historico: [
        { em: em(-14), texto: 'Solicitação registrada.' },
        { em: em(-12), texto: 'Aprovada na triagem e agendada.' },
        { em: em(-5), texto: 'Coleta realizada.' },
      ],
    }),
    mk(5, {
      nome: 'Luana Figueiredo Nunes',
      cpf: '555.666.777-88',
      endereco: 'Rua da Paz, 77',
      volume: 1.0,
      materiais: ['Madeira e móveis'],
      data: util(3),
      status: STATUS.RECUSADA,
      justificativa: 'Endereço fora da área de atendimento do município.',
      criadaEm: em(-4),
      historico: [
        { em: em(-4), texto: 'Solicitação registrada.' },
        { em: em(-3), texto: 'Recusada na triagem.' },
      ],
    }),
    mk(6, {
      nome: 'Rafael Domingues Costa',
      cpf: '666.777.888-99',
      endereco: 'Alameda dos Girassóis, 905',
      volume: 2.0,
      materiais: ['Restos de construção'],
      data: util(6),
      status: STATUS.CANCELADA,
      criadaEm: em(-5),
      historico: [
        { em: em(-5), texto: 'Solicitação registrada.' },
        { em: em(-2), texto: 'Cancelada pelo cidadão.' },
      ],
    }),
    mk(7, {
      nome: 'Beatriz Cavalcanti Moura',
      cpf: '777.888.999-00',
      endereco: 'Rua Bela Vista, 15',
      volume: 3.0,
      materiais: ['Restos de construção', 'Metais'],
      data: util(8),
      status: STATUS.AGUARDANDO,
      criadaEm: em(0, 8),
      historico: [{ em: em(0, 8), texto: 'Solicitação registrada.' }],
    }),
  ];
}

export function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const estado = JSON.parse(bruto);
      if (Array.isArray(estado.solicitacoes)) return estado;
    }
  } catch {
    // estado corrompido: recria abaixo
  }
  return reiniciar();
}

export function salvar(estado) {
  localStorage.setItem(CHAVE, JSON.stringify(estado));
}

export function reiniciar() {
  const estado = { solicitacoes: dadosDeExemplo(agora()) };
  salvar(estado);
  return estado;
}
