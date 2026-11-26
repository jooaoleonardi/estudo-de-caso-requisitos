# Documentação de requisitos

Estudo de caso fictício: **Agendamento de Coleta de Entulho**, da **Prefeitura de Vila Modelo**. O órgão, o serviço e todos os dados são inventados. Não há dados nem órgãos reais.

Os documentos usam os mesmos IDs do protótipo (`prototipo/`): histórias `HU-xx`, regras `RN-xx`, requisitos `RF-xx` e `RNF-xx`, telas `T-xx` e testes `TE-xx`.

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Visão geral](01-visao-geral.md) | Problema, objetivo, escopo, fora de escopo, personas e glossário |
| 02 | [Requisitos funcionais e não funcionais](02-requisitos-funcionais.md) | RF-01 a RF-15 e RNF-01 a RNF-06, cada RF ligado a HU e RN |
| 03 | [Histórias de usuário](03-historias-de-usuario.md) | HU-01 a HU-06 com critérios de aceitação em Gherkin |
| 04 | [Regras de negócio](04-regras-de-negocio.md) | RN-01 a RN-08 com exemplos numéricos e mensagens de erro exatas |
| 05 | [Processo](05-processo.md) | Diagrama de estados e fluxograma da solicitação (Mermaid) |
| 06 | [Rastreabilidade](06-rastreabilidade.md) | Matriz HU x RF x RN x tela x teste |
| 07 | [Decisões e perguntas em aberto](07-decisoes-e-perguntas.md) | Decisões com motivo e 5 perguntas ao órgão |

## Ordem de leitura sugerida

1. Visão geral, para o contexto.
2. Regras de negócio, que sustentam todo o resto.
3. Histórias de usuário e requisitos.
4. Processo e rastreabilidade, para ver como as peças se conectam.

## Convenções

- Idioma: português do Brasil.
- Datas de exemplo usam o calendário de 2026 (05/01/2026 é segunda-feira).
- Texto de regra e mensagens de erro são fixos: o protótipo e os testes usam exatamente as frases de [04-regras-de-negocio.md](04-regras-de-negocio.md).
