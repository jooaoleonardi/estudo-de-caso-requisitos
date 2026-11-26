# Estudo de caso: requisitos de um serviço público digital

Projeto **fictício** que mostra, de ponta a ponta, como transformo uma necessidade de negócio em requisitos claros, protótipo navegável e testes automatizados. O serviço é o **Agendamento de Coleta de Entulho** da "Prefeitura de Vila Modelo".

> Órgão, regras, nomes e dados são inventados. Nada aqui vem de órgão ou cliente real.

## O que há aqui

| Etapa | Onde | Conteúdo |
| --- | --- | --- |
| Requisitos | [`docs/`](docs) | Visão geral, RF e RNF, 6 histórias com critérios de aceitação em Gherkin, 8 regras de negócio com mensagens exatas, processo em Mermaid, rastreabilidade e perguntas em aberto |
| Protótipo | [`prototipo/`](prototipo) | Site navegável em HTML, CSS e JavaScript, com 6 telas, estado simulado e as 8 regras em um módulo testável |
| Testes | `prototipo/tests` | Testes Playwright no desktop e no celular, um por critério principal, mais fumaça de todas as telas |

## Como os documentos se conectam

Cada peça tem um ID e cada ID aparece nos documentos, no código e nos testes:

`HU` (história) → `RF` (requisito) → `RN` (regra) → `T` (tela) → `TE` (teste)

A matriz está em [`docs/06-rastreabilidade.md`](docs/06-rastreabilidade.md), que também lista as lacunas de teste que ainda existem, sem esconder.

## Como rodar

Requer Node.js 22 e Python 3.

```bash
npm install
npm run dev      # http://localhost:4173
npm run check    # lint e formatação
npm test         # testes (Playwright)
```

## Por onde começar a ler

1. [Visão geral](docs/01-visao-geral.md) para o contexto.
2. [Regras de negócio](docs/04-regras-de-negocio.md), que sustentam o resto.
3. [Histórias de usuário](docs/03-historias-de-usuario.md) e o [protótipo](prototipo/README.md).

## Licença

MIT. Veja [LICENSE](LICENSE).
