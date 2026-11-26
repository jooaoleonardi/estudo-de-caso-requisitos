# 06. Rastreabilidade

Telas: `T-01 Solicitar`, `T-02 Acompanhar`, `T-03 Cancelar/Reagendar`, `T-04 Fila do atendente`, `T-05 Detalhe e decisão`, `T-06 Consulta pública`.

Os testes `TE-xx` são os **previstos**: um por critério de aceitação principal, definidos em [03-historias-de-usuario.md](03-historias-de-usuario.md).

## Matriz principal: HU x RF x RN x tela x teste

| HU | RF | RN | Tela | Testes |
|----|----|----|------|--------|
| HU-01 Solicitar coleta | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-15 | RN-01, RN-02, RN-03, RN-04, RN-06, RN-08 | T-01 | TE-01, TE-02, TE-03, TE-04, TE-05, TE-06, TE-07 |
| HU-02 Acompanhar por protocolo | RF-07, RF-15 | RN-06, RN-08 | T-02 | TE-08, TE-09, TE-10 |
| HU-03 Cancelar ou reagendar | RF-05, RF-08, RF-09, RF-15 | RN-04, RN-05 | T-03 | TE-11, TE-12, TE-13, TE-14, TE-15 |
| HU-04 Atendente triar e aprovar | RF-10, RF-11, RF-12, RF-15 | RN-04 | T-04, T-05 | TE-16, TE-17, TE-18 |
| HU-05 Atendente recusar | RF-13, RF-15 | RN-07 | T-05 | TE-19, TE-20, TE-21 |
| HU-06 Consulta pública | RF-14 | RN-06, RN-08 | T-06 | TE-22, TE-23, TE-24 |

## Por requisito funcional

| RF | HU | RN | Tela | Testes |
|----|----|----|------|--------|
| RF-01 | HU-01 | RN-08 | T-01 | TE-01 |
| RF-02 | HU-01 | RN-02 | T-01 | TE-03, TE-04 |
| RF-03 | HU-01 | RN-03 | T-01 | TE-05 |
| RF-04 | HU-01 | RN-01 | T-01 | TE-02 |
| RF-05 | HU-01, HU-03 | RN-04 | T-01, T-03 | TE-06, TE-07, TE-14 |
| RF-06 | HU-01 | RN-06 | T-01 | TE-01 |
| RF-07 | HU-02 | RN-06, RN-08 | T-02 | TE-08, TE-09, TE-10 |
| RF-08 | HU-03 | RN-05 | T-03 | TE-11, TE-12, TE-13 |
| RF-09 | HU-03 | RN-05, RN-04 | T-03 | TE-14, TE-15 |
| RF-10 | HU-04 | n/a | T-04 | TE-16 |
| RF-11 | HU-04 | RN-04 | T-05 | TE-17 |
| RF-12 | HU-04 | n/a | T-05 | TE-18 |
| RF-13 | HU-05 | RN-07 | T-05 | TE-19, TE-20, TE-21 |
| RF-14 | HU-06 | RN-06, RN-08 | T-06 | TE-22, TE-23, TE-24 |
| RF-15 | HU-02, HU-03, HU-04, HU-05 | n/a | T-02, T-05 | TE-08, TE-17, TE-19 |

## Por regra de negócio

| RN | RF | HU | Testes |
|----|----|----|--------|
| RN-01 | RF-04 | HU-01 | TE-02, TE-18 |
| RN-02 | RF-02 | HU-01 | TE-03, TE-04 |
| RN-03 | RF-03 | HU-01 | TE-05 |
| RN-04 | RF-05, RF-09, RF-11 | HU-01, HU-03, HU-04 | TE-06, TE-07, TE-14 |
| RN-05 | RF-08, RF-09 | HU-03 | TE-11, TE-12, TE-13, TE-14, TE-15 |
| RN-06 | RF-06, RF-07, RF-14 | HU-01, HU-02, HU-06 | TE-01, TE-09, TE-10, TE-24 |
| RN-07 | RF-13 | HU-05 | TE-19, TE-20, TE-21 |
| RN-08 | RF-01, RF-07, RF-14 | HU-01, HU-02, HU-06 | TE-08, TE-22, TE-23 |

## Por tela

| Tela | HU | RF |
|------|----|----|
| T-01 Solicitar | HU-01 | RF-01 a RF-06 |
| T-02 Acompanhar | HU-02 | RF-07, RF-15 |
| T-03 Cancelar/Reagendar | HU-03 | RF-05, RF-08, RF-09 |
| T-04 Fila do atendente | HU-04 | RF-10 |
| T-05 Detalhe e decisão | HU-04, HU-05 | RF-11, RF-12, RF-13, RF-15 |
| T-06 Consulta pública | HU-06 | RF-14 |

## Catálogo de testes previstos

| Teste | Cenário | HU | Tipo |
|-------|---------|----|------|
| TE-01 | Solicitação válida gera protocolo | HU-01 | Caminho feliz |
| TE-02 | Endereço com solicitação ativa | HU-01 | Regra violada |
| TE-03 | Volume 3,0 m³ aceito | HU-01 | Borda |
| TE-04 | Volume 3,1 m³ bloqueado | HU-01 | Regra violada |
| TE-05 | Material proibido bloqueia | HU-01 | Regra violada |
| TE-06 | Datas oferecidas (dias úteis, 3 dias úteis, 30 dias) | HU-01 | Caminho feliz |
| TE-07 | Dia com 20 coletas, 21ª recusada | HU-01 | Borda |
| TE-08 | Consulta de protocolo existente | HU-02 | Caminho feliz |
| TE-09 | Protocolo com formato inválido | HU-02 | Regra violada |
| TE-10 | Protocolo inexistente | HU-02 | Regra violada |
| TE-11 | Cancelamento dentro do prazo | HU-03 | Caminho feliz |
| TE-12 | Cancelamento a menos de 24 h | HU-03 | Regra violada |
| TE-13 | Fronteira de 24 h (sexta 23h59, domingo 08h00 e 08h01) | HU-03 | Borda |
| TE-14 | Primeiro reagendamento | HU-03 | Caminho feliz |
| TE-15 | Segundo reagendamento bloqueado | HU-03 | Regra violada |
| TE-16 | Fila só com Aguardando Triagem, mais antiga primeiro | HU-04 | Caminho feliz |
| TE-17 | Aprovar leva a Agendada | HU-04 | Caminho feliz |
| TE-18 | Registrar conclusão leva a Concluída | HU-04 | Caminho feliz |
| TE-19 | Recusa com justificativa válida | HU-05 | Caminho feliz |
| TE-20 | Justificativa de 8 caracteres bloqueada | HU-05 | Regra violada |
| TE-21 | Justificativa de 10 caracteres aceita | HU-05 | Borda |
| TE-22 | CPF mascarado na consulta pública | HU-06 | Caminho feliz |
| TE-23 | Consulta pública sem dados além do mínimo | HU-06 | Borda |
| TE-24 | Protocolo inválido ou inexistente na consulta pública | HU-06 | Regra violada |

## Requisitos não funcionais

Os RNF-01 a RNF-06 não têm teste `TE-xx` por história. São verificados por tela, conforme a tabela de verificação em [02-requisitos-funcionais.md](02-requisitos-funcionais.md).
