# 04. Regras de negócio

As mensagens abaixo são **exatas**: o protótipo e os testes usam estas frases, sem variação.

## Resumo

| ID | Regra |
|----|-------|
| RN-01 | No máximo 1 solicitação ativa (Aguardando Triagem ou Agendada) por endereço. |
| RN-02 | Volume máximo de 3 m³ por coleta. |
| RN-03 | Materiais proibidos (amianto, tintas e solventes, pneus, lixo domiciliar) bloqueiam a solicitação. |
| RN-04 | Datas oferecidas: só dias úteis, a partir de 3 dias úteis, janela de 30 dias, no máximo 20 coletas por dia. |
| RN-05 | Cancelamento sem penalidade até 24 horas antes da data; reagendamento permitido 1 vez. |
| RN-06 | Protocolo no formato COL-AAAA-NNNNNN. |
| RN-07 | Recusa exige justificativa de pelo menos 10 caracteres. |
| RN-08 | Dados pessoais mínimos; o CPF aparece mascarado (`***.123.456-**`) em qualquer consulta pública. |

---

## RN-01. Uma solicitação ativa por endereço

**Regra.** Um endereço só pode ter 1 solicitação ativa por vez. Ativa significa status Aguardando Triagem ou Agendada.

**Detalhes de aplicação.**
- O endereço é um campo de texto (rua, número e bairro). Na comparação, o sistema ignora maiúsculas, acentos, pontuação e espaços extras.
- Concluída, Recusada e Cancelada liberam o endereço.

**Exemplos.**

| Situação do endereço "Rua das Acácias, 120, Centro" | Nova solicitação |
|-----------------------------------------------------|------------------|
| Nenhuma solicitação anterior | Permitida |
| 1 em Aguardando Triagem | Bloqueada |
| 1 em Agendada | Bloqueada |
| 1 Concluída | Permitida |
| 1 Recusada ou Cancelada | Permitida |
| Mesma rua digitada como "rua das acacias 120 centro" (existe ativa) | Bloqueada |

**Mensagem:** `Já existe uma coleta ativa para este endereço.`

---

## RN-02. Volume máximo de 3 m³

**Regra.** O volume estimado deve ser maior que 0 e no máximo 3 m³.

**Exemplos.**

| Volume informado | Resultado |
|------------------|-----------|
| vazio ou 0 | Bloqueado com a mensagem de campo (ver complementares) |
| 1,5 m³ | Aceito |
| 3 m³ | Aceito (limite) |
| 3,1 m³ | Bloqueado |
| 5 m³ | Bloqueado |

**Mensagem:** `O volume máximo por coleta é de 3 m³.`

---

## RN-03. Materiais proibidos

**Regra.** Se o cidadão marcar qualquer material proibido, a solicitação é bloqueada. Materiais proibidos: amianto, tintas e solventes, pneus, lixo domiciliar.

**Materiais aceitos para marcação:** restos de construção, madeira e móveis, metais.

**Exemplos.**

| Materiais marcados | Resultado |
|--------------------|-----------|
| Restos de construção | Aceito |
| Madeira e móveis e metais | Aceito |
| Restos de construção e pneus | Bloqueado (pneus) |
| Tintas e solventes | Bloqueado |
| Amianto | Bloqueado |
| Lixo domiciliar | Bloqueado |

**Mensagem:** `Este material não pode ser coletado: <material>.` O `<material>` é o nome do material proibido marcado, em minúsculas. Exemplo: `Este material não pode ser coletado: pneus.`

---

## RN-04. Datas oferecidas

**Regra.** O sistema só oferece datas que cumpram todas as condições:
1. dia útil (segunda a sexta);
2. a partir de 3 dias úteis depois do dia da solicitação (o dia da solicitação não conta);
3. dentro de 30 dias corridos contados do dia da solicitação (inclusive o 30º dia);
4. com menos de 20 coletas ativas ocupando a data (máximo de 20 por dia).

**Exemplos (calendário de 2026).**

| Solicitação feita em | Primeira data oferecida | Última data oferecida |
|----------------------|-------------------------|-----------------------|
| Segunda 05/01 | Quinta 08/01 (terça 6, quarta 7 e quinta 8 são os 3 dias úteis) | Quarta 04/02 (05/01 + 30 dias) |
| Sexta 09/01 | Quarta 14/01 (segunda 12, terça 13, quarta 14) | Sexta 06/02 (09/01 + 30 dias cai em domingo, 08/02) |

Outros casos:
- Sábado e domingo nunca são oferecidos.
- Dia com 19 coletas ativas: a 20ª ainda cabe.
- Dia com 20 coletas ativas: a 21ª é recusada.
- Cancelar ou recusar uma coleta libera uma vaga no dia.

**Mensagem (para qualquer data fora das regras, inclusive dia lotado):** `Escolha uma data disponível.`

---

## RN-05. Cancelamento e reagendamento

**Regra.**
- Cancelamento sem penalidade até 24 horas antes da data da coleta.
- Reagendamento permitido 1 vez por solicitação.

**Detalhes de aplicação.**
- Para o cálculo do prazo, a coleta é considerada às **08h00** da data agendada. As 24 horas são horas corridas, incluindo sábado e domingo.
- O prazo de 24 horas vale para o cancelamento de qualquer solicitação ativa.
- O reagendamento vale para solicitação ativa, só 1 vez, e a nova data segue a RN-04. O status não muda.
- Concluída, Recusada e Cancelada não podem ser canceladas nem reagendadas.

**Exemplos de cancelamento (coleta para segunda 12/01/2026, 08h00).**

| Momento da ação | Cancelar |
|-----------------|----------|
| Sexta 09/01, 23h59 | Permitido (56 h 01 min de antecedência) |
| Domingo 11/01, 08h00 | Permitido (exatamente 24 h) |
| Domingo 11/01, 08h01 | Bloqueado (23 h 59 min) |
| Segunda 12/01, 07h00 | Bloqueado |

| Reagendamentos já feitos | Novo reagendamento |
|--------------------------|--------------------|
| 0 | Permitido |
| 1 | Bloqueado |

**Mensagens:**
- Cancelamento fora do prazo: `O cancelamento só é possível até 24 horas antes da coleta.`
- Segundo reagendamento: `O reagendamento já foi usado nesta solicitação.`

---

## RN-06. Formato do protocolo

**Regra.** O protocolo tem o formato `COL-AAAA-NNNNNN`:
- `COL` fixo;
- `AAAA` é o ano de criação, com 4 dígitos;
- `NNNNNN` é um número sequencial de 6 dígitos, com zeros à esquerda, reiniciado a cada ano.

**Exemplos.**

| Protocolo digitado | Resultado |
|--------------------|-----------|
| COL-2026-000001 | Formato válido |
| COL-2026-000342 | Formato válido |
| COL-26-000001 | Formato inválido (ano com 2 dígitos) |
| COL-2026-1 | Formato inválido (sequencial sem zeros) |
| col-2026-000001 | Aceito: o sistema converte para maiúsculas |
| COL-2026-999999 | Formato válido, mas pode não existir |

Sequência: se o maior protocolo de 2026 é `COL-2026-000009`, o próximo é `COL-2026-000010`.

**Mensagens:**
- Formato errado: `Informe o protocolo no formato COL-AAAA-NNNNNN.`
- Formato certo e inexistente: `Protocolo não encontrado.`

---

## RN-07. Justificativa de recusa

**Regra.** Para recusar, o atendente deve informar uma justificativa com pelo menos 10 caracteres. Espaços no início e no fim não contam.

**Exemplos.**

| Justificativa | Caracteres | Resultado |
|---------------|-----------|-----------|
| (vazia) | 0 | Bloqueada |
| `Sem acesso` | 10 | Aceita (limite) |
| `Fora da área` | 12 | Aceita |
| `Não cabe` | 8 | Bloqueada |
| `   curto   ` | 5 (após remover espaços) | Bloqueada |

**Mensagem:** `Informe a justificativa com pelo menos 10 caracteres.`

---

## RN-08. Dados mínimos e CPF mascarado

**Regra.**
- O sistema pede só: nome completo, CPF, endereço, volume, materiais e data. Não pede telefone nem e-mail.
- Em qualquer consulta (T-02 e T-06), o CPF aparece mascarado: `***.123.456-**` (os 6 dígitos do meio visíveis, o restante oculto).
- Nenhuma consulta exibe o nome do solicitante.

**Exemplos.**

| CPF cadastrado (fictício) | Exibido em consulta |
|---------------------------|---------------------|
| 987.123.456-00 | `***.123.456-**` |
| 111.222.333-44 | `***.222.333-**` |

| Dado | T-02 Acompanhar | T-06 Consulta pública |
|------|-----------------|------------------------|
| Protocolo, situação e data | Exibidos | Exibidos |
| CPF | Mascarado | Mascarado |
| Nome | Oculto | Oculto |
| Endereço, volume e materiais | Exibidos | Ocultos |
| Motivo da recusa e histórico | Exibidos | Ocultos |

**Mensagem (CPF inválido no formulário):** `Informe um CPF com 11 dígitos.`

---

## Mensagens complementares de campo

Não são regras de negócio. São as mensagens que o protótipo também exibe.

| Situação | Mensagem |
|----------|----------|
| Nome vazio | `Informe o nome completo.` |
| Endereço vazio | `Informe o endereço da coleta.` |
| Volume vazio ou menor ou igual a zero | `Informe o volume em m³.` |
| Nenhum material marcado | `Marque pelo menos um material.` |
| CPF sem 11 dígitos | `Informe um CPF com 11 dígitos.` |
| Protocolo fora do formato | `Informe o protocolo no formato COL-AAAA-NNNNNN.` |
| Protocolo bem formado e inexistente | `Protocolo não encontrado.` |
