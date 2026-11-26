# 06. Rastreabilidade

Telas: `T-01 Solicitar`, `T-02 Acompanhar`, `T-03 Cancelar/Reagendar`, `T-04 Fila do atendente`, `T-05 Detalhe e decisão`, `T-06 Consulta pública`.

Os testes `TE-xx` são os **testes automatizados que existem em `prototipo/tests`**. Onde não há teste, a coluna diz `sem teste automatizado ainda`. Não há TE-xx previsto sem existir.

## Catálogo de testes

| Teste | O que verifica | Cobre |
|-------|----------------|-------|
| TE-01 | Solicitar coleta gera protocolo e entra em Aguardando Triagem | HU-01 |
| TE-02 | Bloqueia segunda solicitação ativa no mesmo endereço | RN-01 |
| TE-02b | Não bloqueia se a solicitação anterior foi cancelada | RN-01 |
| TE-03 | Recusa 3,1 m³ e aceita 3 m³ | RN-02 |
| TE-04 | Bloqueia material proibido, pela interface | RN-03 |
| TE-05 | Datas: sem fim de semana, sem data cedo demais, sem 21ª coleta no dia | RN-04 |
| TE-05b | A 20ª coleta ainda cabe no dia | RN-04 |
| TE-06 | Cancelamento só até 24 h antes e reagendamento uma única vez | RN-05 |
| TE-07 | Protocolo COL-AAAA-NNNNNN e sequencial | RN-06 |
| TE-08 | Recusa exige justificativa com pelo menos 10 caracteres (pela interface, com recusa válida) | RN-07, HU-05 |
| TE-09 | Consulta pública mostra CPF mascarado e nenhum dado pessoal a mais | RN-08, HU-06 |
| TE-10 | Fumaça: todas as telas abrem sem erro de JavaScript, sem rolagem horizontal e com um h1 | RNF-01, RNF-02 |
| TE-11 | Acompanhar por protocolo mostra situação e histórico; protocolo inexistente e fora do formato avisam | HU-02, RN-06 |
| TE-12 | Atendente aprova e a solicitação passa a Agendada | HU-04 |
| TE-13 | Cancelar com mais de 24 h libera o endereço | HU-03 |
| TE-14 | Dados de exemplo: pelo menos 6 solicitações em estados variados | RNF-06 |
| TE-15a | RN-01 a RN-03 e RN-06 a RN-08 em `regras.js` | RN-01, RN-02, RN-03, RN-06, RN-07, RN-08 |
| TE-15b | RN-04 em `regras.js`: dias úteis, antecedência, janela e capacidade | RN-04 |
| TE-15c | RN-05 em `regras.js`: prazo de 24 h (08h00 e 08h01 de domingo) e reagendamento único | RN-05 |

## Matriz principal: HU x RF x RN x tela x teste

| HU | RF | RN | Tela | Teste |
|----|----|----|------|-------|
| HU-01 Solicitar coleta | RF-01 a RF-06, RF-15 | RN-01, RN-02, RN-03, RN-04, RN-06, RN-08 | T-01 | TE-01, TE-02, TE-02b, TE-03, TE-04, TE-05, TE-05b, TE-07, TE-15a, TE-15b |
| HU-02 Acompanhar por protocolo | RF-07, RF-15 | RN-06, RN-08 | T-02 | TE-11 |
| HU-03 Cancelar ou reagendar | RF-05, RF-08, RF-09, RF-15 | RN-04, RN-05 | T-03 | TE-06, TE-13, TE-15c |
| HU-04 Atendente triar e aprovar | RF-10, RF-11, RF-12, RF-15 | RN-04 | T-04, T-05 | TE-12 (aprovar); fila e conclusão: sem teste automatizado ainda |
| HU-05 Atendente recusar | RF-13, RF-15 | RN-07 | T-05 | TE-08, TE-15a |
| HU-06 Consulta pública | RF-14 | RN-06, RN-08 | T-06 | TE-09; protocolo inválido na T-06: sem teste automatizado ainda |

## Por requisito funcional

| RF | HU | RN | Tela | Teste |
|----|----|----|------|-------|
| RF-01 | HU-01 | RN-08 | T-01 | TE-01 |
| RF-02 | HU-01 | RN-02 | T-01 | TE-03, TE-15a |
| RF-03 | HU-01 | RN-03 | T-01 | TE-04, TE-15a |
| RF-04 | HU-01 | RN-01 | T-01 | TE-02, TE-02b, TE-15a |
| RF-05 | HU-01, HU-03 | RN-04 | T-01, T-03 | TE-05, TE-05b, TE-15b |
| RF-06 | HU-01 | RN-06 | T-01 | TE-01, TE-07, TE-15a |
| RF-07 | HU-02 | RN-06, RN-08 | T-02 | TE-11 |
| RF-08 | HU-03 | RN-05 | T-03 | TE-06, TE-13, TE-15c |
| RF-09 | HU-03 | RN-05, RN-04 | T-03 | TE-06, TE-15c |
| RF-10 | HU-04 | n/a | T-04 | sem teste automatizado ainda |
| RF-11 | HU-04 | RN-04 | T-05 | TE-12 |
| RF-12 | HU-04 | n/a | T-05 | sem teste automatizado ainda |
| RF-13 | HU-05 | RN-07 | T-05 | TE-08, TE-15a |
| RF-14 | HU-06 | RN-06, RN-08 | T-06 | TE-09 |
| RF-15 | HU-02, HU-03, HU-04, HU-05 | n/a | T-02, T-05 | TE-11 (histórico) |

## Por regra de negócio

| RN | RF | HU | Teste |
|----|----|----|-------|
| RN-01 | RF-04 | HU-01 | TE-02, TE-02b, TE-15a |
| RN-02 | RF-02 | HU-01 | TE-03, TE-15a |
| RN-03 | RF-03 | HU-01 | TE-04, TE-15a |
| RN-04 | RF-05, RF-09, RF-11 | HU-01, HU-03, HU-04 | TE-05, TE-05b, TE-15b |
| RN-05 | RF-08, RF-09 | HU-03 | TE-06, TE-13, TE-15c |
| RN-06 | RF-06, RF-07, RF-14 | HU-01, HU-02, HU-06 | TE-07, TE-11, TE-15a |
| RN-07 | RF-13 | HU-05 | TE-08, TE-15a |
| RN-08 | RF-01, RF-07, RF-14 | HU-01, HU-02, HU-06 | TE-09, TE-15a |

## Por tela

| Tela | HU | RF |
|------|----|----|
| T-01 Solicitar | HU-01 | RF-01 a RF-06 |
| T-02 Acompanhar | HU-02 | RF-07, RF-15 |
| T-03 Cancelar/Reagendar | HU-03 | RF-05, RF-08, RF-09 |
| T-04 Fila do atendente | HU-04 | RF-10 |
| T-05 Detalhe e decisão | HU-04, HU-05 | RF-11, RF-12, RF-13, RF-15 |
| T-06 Consulta pública | HU-06 | RF-14 |

## Requisitos não funcionais

| RNF | Teste |
|-----|-------|
| RNF-01 Acessibilidade | TE-10 cobre só h1 único e abertura sem erro. Auditoria WCAG completa: sem teste automatizado ainda |
| RNF-02 Responsividade | TE-10 cobre ausência de rolagem horizontal. Demais larguras: sem teste automatizado ainda |
| RNF-03 LGPD | TE-09 |
| RNF-04 Desempenho | sem teste automatizado ainda |
| RNF-05 Usabilidade (mensagens) | Mensagens conferidas dentro de TE-02, TE-03, TE-04, TE-05, TE-06, TE-08, TE-11 |
| RNF-06 Dados fictícios | TE-14 (dados de exemplo) |

## Lacunas de teste

Critérios de aceitação da documentação **sem teste automatizado correspondente**. Não foram inventados testes para eles.

| Lacuna | HU, RF e RN | Cenário em 03-historias-de-usuario.md |
|--------|-------------|----------------------------------------|
| Fila de triagem só com Aguardando Triagem, da mais antiga para a mais recente | HU-04, RF-10 | Fila de triagem |
| Registrar conclusão leva a Concluída (função ainda não existe no protótipo) | HU-04, RF-12 | Registro de conclusão |
| Cancelamento permitido na sexta 23h59 para coleta de segunda 08h00 | HU-03, RF-08, RN-05 | Fronteira das 24 horas (TE-15c cobre só domingo 08h00 e 08h01) |
| Justificativa com exatamente 10 caracteres pela interface | HU-05, RF-13, RN-07 | Justificativa com exatamente 10 caracteres (TE-15a cobre a regra em `regras.js`) |
| Protocolo inválido ou inexistente na consulta pública (T-06) | HU-06, RF-14, RN-06 | Protocolo inválido ou inexistente (T-02 é coberta por TE-11) |
| Histórico registra cada mudança de status (aprovar, recusar, cancelar, reagendar) | RF-15 | Aprovação (TE-12 confere só a situação final) |
| Auditoria de acessibilidade WCAG 2.1 AA, larguras de 320 a 1440 px e desempenho | RNF-01, RNF-02, RNF-04 | n/a |
