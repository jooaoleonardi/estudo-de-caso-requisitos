# 03. Histórias de usuário

Cada cenário Gherkin leva o ID do teste previsto (`TE-xx`). Mensagens citadas estão em [04-regras-de-negocio.md](04-regras-de-negocio.md). Datas usam o calendário de 2026.

| ID | História | Persona | Tela |
|----|----------|---------|------|
| HU-01 | Solicitar coleta | Cidadão | T-01 |
| HU-02 | Acompanhar solicitação por protocolo | Cidadão | T-02 |
| HU-03 | Cancelar ou reagendar | Cidadão | T-03 |
| HU-04 | Atendente triar e aprovar | Atendente | T-04, T-05 |
| HU-05 | Atendente recusar com justificativa | Atendente | T-05 |
| HU-06 | Consulta pública por protocolo (com CPF mascarado) | Cidadão e público em geral | T-06 |

---

## HU-01. Solicitar coleta

**Como** cidadão, **quero** solicitar a coleta de entulho informando endereço, volume, materiais e data, **para** não ter de ligar ou ir ao balcão.

**RF:** RF-01 a RF-06. **RN:** RN-01, RN-02, RN-03, RN-04, RN-06, RN-08.

```gherkin
Funcionalidade: Solicitar coleta

  Cenário: TE-01 Solicitação válida gera protocolo (caminho feliz)
    Dado que o endereço "CEP 12345-678, nº 120" não tem solicitação ativa
    E que hoje é segunda-feira, 05/01/2026
    Quando o cidadão informa volume 2,0 m³, material "tijolo e concreto" e a data 08/01/2026
    E confirma a solicitação
    Então o sistema cria a solicitação com status "Aguardando Triagem"
    E exibe o protocolo no formato "COL-2026-NNNNNN"

  Cenário: TE-02 Endereço com solicitação ativa (RN-01)
    Dado que o endereço "CEP 12345-678, nº 120" tem uma solicitação em "Aguardando Triagem"
    Quando o cidadão tenta solicitar outra coleta para o mesmo endereço
    Então o sistema bloqueia o envio
    E exibe "Já existe uma solicitação ativa para este endereço."

  Cenário: TE-03 Volume no limite é aceito (RN-02, borda)
    Quando o cidadão informa o volume 3,0 m³
    Então o sistema aceita o volume

  Cenário: TE-04 Volume acima do limite (RN-02, regra violada)
    Quando o cidadão informa o volume 3,1 m³
    Então o sistema bloqueia o envio
    E exibe "O volume máximo é de 3 m³ por coleta."

  Cenário: TE-05 Material proibido (RN-03, regra violada)
    Quando o cidadão marca os materiais "tijolo e concreto" e "pneus"
    Então o sistema bloqueia o envio
    E exibe "Este material não é aceito na coleta de entulho."

  Cenário: TE-06 Datas oferecidas (RN-04)
    Dado que hoje é segunda-feira, 05/01/2026
    Quando o cidadão abre a lista de datas
    Então a primeira data oferecida é quinta-feira, 08/01/2026
    E a última data oferecida é quarta-feira, 04/02/2026
    E sábados e domingos não aparecem na lista

  Cenário: TE-07 Dia com 20 coletas (RN-04, borda)
    Dado que 15/01/2026 já tem 20 coletas ativas
    Quando o cidadão abre a lista de datas
    Então 15/01/2026 não é oferecida
    E uma 21ª solicitação para essa data é recusada com "Este dia atingiu o limite de 20 coletas. Escolha outra data."
```

---

## HU-02. Acompanhar solicitação por protocolo

**Como** cidadão, **quero** consultar minha solicitação pelo protocolo, **para** saber o status e a data da coleta.

**RF:** RF-07, RF-15. **RN:** RN-06, RN-08.

```gherkin
Funcionalidade: Acompanhar solicitação

  Cenário: TE-08 Consulta de protocolo existente (caminho feliz)
    Dado que existe a solicitação "COL-2026-000001" com status "Agendada" para 12/01/2026
    Quando o cidadão informa "COL-2026-000001"
    Então o sistema exibe o status "Agendada" e a data 12/01/2026
    E exibe o histórico de mudanças de status
    E exibe o CPF no formato "***.123.456-**"

  Cenário: TE-09 Protocolo com formato inválido (RN-06, regra violada)
    Quando o cidadão informa "COL-26-1"
    Então o sistema exibe "Protocolo inválido. Use o formato COL-AAAA-NNNNNN."

  Cenário: TE-10 Protocolo inexistente (RN-06)
    Dado que "COL-2026-999999" não existe
    Quando o cidadão informa "COL-2026-999999"
    Então o sistema exibe "Protocolo não encontrado."
```

---

## HU-03. Cancelar ou reagendar

**Como** cidadão, **quero** cancelar ou reagendar minha coleta, **para** me adaptar a imprevistos sem deixar uma vaga ocupada.

**RF:** RF-05, RF-08, RF-09, RF-15. **RN:** RN-04, RN-05.

```gherkin
Funcionalidade: Cancelar ou reagendar

  Cenário: TE-11 Cancelamento dentro do prazo (caminho feliz)
    Dado uma solicitação "Agendada" para segunda-feira, 12/01/2026, às 08h00
    E que agora é quarta-feira, 07/01/2026, 10h00
    Quando o cidadão cancela a solicitação
    Então o status passa para "Cancelada"
    E a vaga do dia 12/01/2026 é liberada

  Cenário: TE-12 Cancelamento fora do prazo (RN-05, regra violada)
    Dado uma solicitação "Agendada" para segunda-feira, 12/01/2026, às 08h00
    E que agora é domingo, 11/01/2026, 08h01
    Quando o cidadão tenta cancelar
    Então o sistema bloqueia a ação
    E exibe "O prazo terminou. Só é possível alterar até 24 horas antes da coleta."

  Esquema do Cenário: TE-13 Fronteira das 24 horas em horas corridas (RN-05, borda)
    Dado uma solicitação "Agendada" para segunda-feira, 12/01/2026, às 08h00
    E que agora é <momento>
    Quando o cidadão tenta cancelar
    Então o resultado é <resultado>

    Exemplos:
      | momento                      | resultado |
      | sexta-feira 09/01, 23h59     | permitido |
      | domingo 11/01, 08h00         | permitido |
      | domingo 11/01, 08h01         | bloqueado |

  Cenário: TE-14 Primeiro reagendamento (RN-05, caminho feliz)
    Dado uma solicitação "Agendada" para 12/01/2026 sem reagendamentos
    E que o prazo de 24 horas ainda não venceu
    Quando o cidadão escolhe a nova data 14/01/2026
    Então a data da solicitação passa a ser 14/01/2026
    E o status continua "Agendada"

  Cenário: TE-15 Segundo reagendamento (RN-05, regra violada)
    Dado uma solicitação "Agendada" que já foi reagendada uma vez
    Quando o cidadão tenta reagendar de novo
    Então o sistema bloqueia a ação
    E exibe "Esta solicitação já foi reagendada uma vez."
```

---

## HU-04. Atendente triar e aprovar

**Como** atendente, **quero** ver a fila de solicitações e aprovar as válidas, **para** confirmar a data da coleta.

**RF:** RF-10, RF-11, RF-12, RF-15. **RN:** RN-04.

```gherkin
Funcionalidade: Triar e aprovar

  Cenário: TE-16 Fila de triagem (caminho feliz)
    Dado que existem 3 solicitações "Aguardando Triagem" criadas em horários diferentes
    Quando o atendente abre a fila
    Então vê somente solicitações "Aguardando Triagem"
    E a mais antiga aparece primeiro

  Cenário: TE-17 Aprovação (caminho feliz)
    Dado uma solicitação "Aguardando Triagem" para 15/01/2026
    Quando o atendente abre o detalhe e aprova
    Então o status passa para "Agendada"
    E a mudança é registrada no histórico com a data e a hora

  Cenário: TE-18 Registro de conclusão
    Dado uma solicitação "Agendada" cuja data de coleta já passou
    Quando o atendente registra a conclusão
    Então o status passa para "Concluída"
    E o endereço fica livre para nova solicitação (RN-01)
```

---

## HU-05. Atendente recusar com justificativa

**Como** atendente, **quero** recusar uma solicitação registrando o motivo, **para** que o cidadão entenda a decisão.

**RF:** RF-13, RF-15. **RN:** RN-07.

```gherkin
Funcionalidade: Recusar com justificativa

  Cenário: TE-19 Recusa com justificativa válida (caminho feliz)
    Dado uma solicitação "Aguardando Triagem"
    Quando o atendente recusa com a justificativa "Endereço sem acesso para caminhão"
    Então o status passa para "Recusada"
    E o cidadão vê a justificativa ao consultar o protocolo

  Cenário: TE-20 Justificativa curta demais (RN-07, regra violada)
    Quando o atendente tenta recusar com a justificativa "Não cabe"
    Então o sistema bloqueia a recusa
    E exibe "Informe uma justificativa com pelo menos 10 caracteres."

  Cenário: TE-21 Justificativa com exatamente 10 caracteres (RN-07, borda)
    Quando o atendente recusa com a justificativa "Sem acesso"
    Então o sistema aceita a recusa
    E o status passa para "Recusada"
```

---

## HU-06. Consulta pública por protocolo

**Como** cidadão ou terceiro, **quero** consultar uma solicitação pelo protocolo em uma página aberta, **para** verificar o andamento sem expor dados pessoais.

**RF:** RF-14. **RN:** RN-06, RN-08.

```gherkin
Funcionalidade: Consulta pública

  Cenário: TE-22 CPF mascarado (RN-08, caminho feliz)
    Dado a solicitação "COL-2026-000001" com CPF 987.123.456-00
    Quando alguém consulta o protocolo na página pública
    Então o sistema exibe o CPF como "***.123.456-**"
    E nunca exibe o CPF completo

  Cenário: TE-23 Só dados mínimos (RN-08, borda)
    Quando alguém consulta um protocolo válido na página pública
    Então o sistema exibe status, data e bairro
    E não exibe nome, telefone nem endereço completo

  Cenário: TE-24 Protocolo inválido ou inexistente (RN-06, regra violada)
    Quando alguém informa "COL-2026-1"
    Então o sistema exibe "Protocolo inválido. Use o formato COL-AAAA-NNNNNN."
    Quando alguém informa "COL-2026-999999" e ele não existe
    Então o sistema exibe "Protocolo não encontrado."
```
