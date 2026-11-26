# 03. Histórias de usuário

Cada cenário Gherkin indica o teste automatizado do protótipo que o cobre (`TE-xx`, ver [06-rastreabilidade.md](06-rastreabilidade.md)) ou `sem teste automatizado ainda`. Mensagens citadas estão em [04-regras-de-negocio.md](04-regras-de-negocio.md). Datas usam o calendário de 2026.

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

  # Teste: TE-01
  Cenário: Solicitação válida gera protocolo (caminho feliz)
    Dado que o endereço "Rua das Acácias, 120, Centro" não tem solicitação ativa
    E que hoje é segunda-feira, 05/01/2026
    Quando o cidadão informa volume 2,0 m³, material "tijolo e concreto" e a data 08/01/2026
    E confirma a solicitação
    Então o sistema cria a solicitação com status "Aguardando Triagem"
    E exibe o protocolo no formato "COL-2026-NNNNNN"

  # Teste: TE-02
  Cenário: Endereço com solicitação ativa (RN-01, regra violada)
    Dado que o endereço "Rua das Acácias, 120, Centro" tem uma solicitação em "Aguardando Triagem"
    Quando o cidadão tenta solicitar outra coleta para o mesmo endereço
    Então o sistema bloqueia o envio
    E exibe "Já existe uma coleta ativa para este endereço."

  # Teste: TE-02b
  Cenário: Endereço de solicitação cancelada está livre (RN-01, borda)
    Dado que a solicitação anterior do endereço está "Cancelada"
    Quando o cidadão solicita outra coleta para o mesmo endereço
    Então o sistema aceita a solicitação

  # Teste: TE-03
  Cenário: Volume no limite é aceito (RN-02, borda)
    Quando o cidadão informa o volume 3 m³
    Então o sistema aceita o volume

  # Teste: TE-03
  Cenário: Volume acima do limite (RN-02, regra violada)
    Quando o cidadão informa o volume 3,1 m³
    Então o sistema bloqueia o envio
    E exibe "O volume máximo por coleta é de 3 m³."

  # Teste: TE-04
  Cenário: Material proibido (RN-03, regra violada)
    Quando o cidadão marca o material proibido "pneus"
    Então o sistema bloqueia o envio
    E exibe "Este material não pode ser coletado: pneus."

  # Teste: TE-05 e TE-15b
  Cenário: Datas válidas (RN-04)
    Dado que hoje é segunda-feira, 05/01/2026
    Então a primeira data aceita é quinta-feira, 08/01/2026
    E a última data aceita é quarta-feira, 04/02/2026
    E sábado e domingo são recusados com "Escolha uma data disponível."
    E datas antes de 3 dias úteis ou além de 30 dias são recusadas com a mesma mensagem

  # Teste: TE-05
  Cenário: 21ª coleta no dia (RN-04, borda)
    Dado que 15/01/2026 já tem 20 coletas ativas
    Quando o cidadão escolhe 15/01/2026
    Então o sistema bloqueia o envio
    E exibe "Escolha uma data disponível."

  # Teste: TE-05b
  Cenário: 20ª coleta ainda cabe (RN-04, borda)
    Dado que 15/01/2026 já tem 19 coletas ativas
    Quando o cidadão escolhe 15/01/2026
    Então o sistema aceita a data
```

---

## HU-02. Acompanhar solicitação por protocolo

**Como** cidadão, **quero** consultar minha solicitação pelo protocolo, **para** saber o status e a data da coleta.

**RF:** RF-07, RF-15. **RN:** RN-06, RN-08.

```gherkin
Funcionalidade: Acompanhar solicitação

  # Teste: TE-11
  Cenário: Consulta de protocolo existente (caminho feliz)
    Dado que existe a solicitação "COL-2026-000001" com status "Agendada" para 12/01/2026
    Quando o cidadão informa "COL-2026-000001"
    Então o sistema exibe a situação "Agendada" e a data 12/01/2026
    E exibe o histórico de mudanças de status
    E exibe o CPF no formato "***.123.456-**"

  # Teste: TE-11
  Cenário: Protocolo com formato inválido (RN-06, regra violada)
    Quando o cidadão informa "COL-26-1"
    Então o sistema exibe "Informe o protocolo no formato COL-AAAA-NNNNNN."

  # Teste: TE-11
  Cenário: Protocolo inexistente (RN-06)
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

  # Teste: TE-13
  Cenário: Cancelamento dentro do prazo libera o endereço (caminho feliz)
    Dado uma solicitação "Agendada" para segunda-feira, 12/01/2026, às 08h00
    E que agora é quarta-feira, 07/01/2026, 10h00
    Quando o cidadão cancela a solicitação
    Então o status passa para "Cancelada"
    E o endereço fica livre para nova solicitação

  # Teste: TE-06
  Cenário: Cancelamento fora do prazo (RN-05, regra violada)
    Dado uma solicitação "Agendada" para segunda-feira, 12/01/2026, às 08h00
    E que agora é domingo, 11/01/2026, 08h01
    Quando o cidadão tenta cancelar
    Então o sistema bloqueia a ação
    E exibe "O cancelamento só é possível até 24 horas antes da coleta."

  # Teste: TE-15c (domingo 08h00 e 08h01); sexta 23h59 sem teste automatizado ainda
  Esquema do Cenário: Fronteira das 24 horas em horas corridas (RN-05, borda)
    Dado uma solicitação "Agendada" para segunda-feira, 12/01/2026, às 08h00
    E que agora é <momento>
    Quando o cidadão tenta cancelar
    Então o resultado é <resultado>

    Exemplos:
      | momento                      | resultado |
      | sexta-feira 09/01, 23h59     | permitido |
      | domingo 11/01, 08h00         | permitido |
      | domingo 11/01, 08h01         | bloqueado |

  # Teste: TE-06
  Cenário: Primeiro reagendamento (RN-05, caminho feliz)
    Dado uma solicitação ativa para 12/01/2026 sem reagendamentos
    Quando o cidadão escolhe a nova data 14/01/2026
    Então a data da solicitação passa a ser 14/01/2026
    E o status não muda

  # Teste: TE-06 e TE-15c
  Cenário: Segundo reagendamento (RN-05, regra violada)
    Dado uma solicitação ativa que já foi reagendada uma vez
    Quando o cidadão tenta reagendar de novo
    Então o sistema bloqueia a ação
    E exibe "O reagendamento já foi usado nesta solicitação."
```

---

## HU-04. Atendente triar e aprovar

**Como** atendente, **quero** ver a fila de solicitações e aprovar as válidas, **para** confirmar a data da coleta.

**RF:** RF-10, RF-11, RF-12, RF-15. **RN:** RN-04.

```gherkin
Funcionalidade: Triar e aprovar

  # Teste: sem teste automatizado ainda (TE-14 só confere os dados de exemplo)
  Cenário: Fila de triagem (caminho feliz)
    Dado que existem 3 solicitações "Aguardando Triagem" criadas em horários diferentes
    Quando o atendente abre a fila
    Então vê somente solicitações "Aguardando Triagem"
    E a mais antiga aparece primeiro

  # Teste: TE-12
  Cenário: Aprovação (caminho feliz)
    Dado uma solicitação "Aguardando Triagem" para 15/01/2026
    Quando o atendente abre o detalhe e aprova
    Então o status passa para "Agendada"
    E a mudança é registrada no histórico com a data e a hora

  # Teste: sem teste automatizado ainda (função ainda não existe no protótipo)
  Cenário: Registro de conclusão
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

  # Teste: TE-08
  Cenário: Recusa com justificativa válida (caminho feliz)
    Dado uma solicitação "Aguardando Triagem"
    Quando o atendente recusa com a justificativa "Endereço fora da área."
    Então o status passa para "Recusada"
    E o cidadão vê a justificativa ao consultar o protocolo

  # Teste: TE-08
  Cenário: Justificativa curta demais (RN-07, regra violada)
    Quando o atendente tenta recusar com a justificativa "curto"
    Então o sistema bloqueia a recusa
    E exibe "Informe a justificativa com pelo menos 10 caracteres."

  # Teste: TE-15a (regra em regras.js); pela interface, sem teste automatizado ainda
  Cenário: Justificativa com exatamente 10 caracteres (RN-07, borda)
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

  # Teste: TE-09
  Cenário: CPF mascarado (RN-08, caminho feliz)
    Dado a solicitação "COL-2026-000001" com CPF 987.123.456-00
    Quando alguém consulta o protocolo na página pública
    Então o sistema exibe o CPF como "***.123.456-**"
    E nunca exibe o CPF completo

  # Teste: TE-09
  Cenário: Só dados mínimos (RN-08, borda)
    Quando alguém consulta um protocolo válido na página pública
    Então o sistema exibe protocolo, situação, data e CPF mascarado
    E não exibe nome, endereço, volume nem materiais

  # Teste: sem teste automatizado ainda (a mesma busca é testada na tela T-02, em TE-11)
  Cenário: Protocolo inválido ou inexistente (RN-06, regra violada)
    Quando alguém informa "COL-2026-1"
    Então o sistema exibe "Informe o protocolo no formato COL-AAAA-NNNNNN."
    Quando alguém informa "COL-2026-999999" e ele não existe
    Então o sistema exibe "Protocolo não encontrado."
```
