# 07. Decisões e perguntas em aberto

## Decisões tomadas

Onde a regra do órgão deixou lacuna, a análise assumiu o que está abaixo, para o estudo seguir. Cada item vira pergunta ao órgão se o serviço fosse real.

| ID | Decisão | Motivo |
|----|---------|--------|
| DEC-01 | A coleta é considerada às 08h00 da data agendada para o prazo de 24 horas (RN-05). As 24 horas são corridas, incluindo fins de semana. | A regra fala em "24 horas" sem horário de coleta. Um horário fixo torna o cálculo testável e evita disputa de minutos. |
| DEC-02 | O reagendamento só vale para solicitação Agendada, respeita o mesmo prazo de 24 horas e mantém o status Agendada, sem nova triagem. | A data nova já passa pela RN-04 (inclusive capacidade). Nova triagem só atrasaria o cidadão. |
| DEC-03 | Em Aguardando Triagem o cancelamento é livre, sem prazo. | A data ainda é uma preferência, e a equipe não montou rota. |
| DEC-04 | A capacidade de 20 coletas por dia conta solicitações ativas (Aguardando Triagem e Agendada) já na criação. Cancelar ou recusar libera a vaga. | Evita aprovar além da capacidade e deixa a regra simples de explicar. |
| DEC-05 | O dia da solicitação não conta nos "3 dias úteis". A janela de 30 dias é corrida e inclui o 30º dia. | Contagem previsível, com exemplos numéricos em RN-04. |
| DEC-06 | Sem login: o protocolo identifica a solicitação e permite acompanhar e agir (T-02 e T-03). Em T-02 o CPF aparece mascarado; na consulta pública (T-06) só aparecem dados mínimos. | Reduz o escopo do estudo e a coleta de dados (RN-08). O risco de quem souber o protocolo cancelar a coleta está registrado em PA-03. |
| DEC-07 | Endereço é identificado por CEP + número + complemento. | Dá um critério objetivo para RN-01, sem integrar base de endereços. |
| DEC-08 | O atendente aprova a data escolhida pelo cidadão. Não troca a data na aprovação. | Mantém a triagem em duas saídas (aprovar ou recusar) e a justificativa de recusa explica o resto. |
| DEC-09 | Existe RF-12 (registrar conclusão) feito pelo atendente. | Sem ele o status Concluída não seria alcançável no fluxo. |
| DEC-10 | Feriados não entram no cálculo de dias úteis neste estudo. | Não há calendário municipal inventado. Ver PA-01. |
| DEC-11 | Mensagens de erro são fixas e curtas, listadas em 04-regras-de-negocio.md. | Protótipo e testes verificam o mesmo texto. |
| DEC-12 | Todos os dados são fictícios e identificados assim na interface. | Repositório público de portfólio: nenhum dado nem órgão real. |

## Perguntas em aberto ao órgão

| ID | Pergunta | Por que importa | Documentos afetados |
|----|----------|-----------------|---------------------|
| PA-01 | Feriados municipais e pontos facultativos contam como dias úteis? Quem mantém o calendário? | Muda as datas oferecidas e a conta dos 3 dias úteis. | RN-04, RF-05 |
| PA-02 | Existe limite de solicitações por CPF, além do limite por endereço? Um mesmo CPF pode ter vários endereços ativos? | Sem limite por CPF, uma pessoa pode ocupar muitas vagas diárias. | RN-01, RN-08 |
| PA-03 | O cidadão precisa provar identidade para cancelar ou reagendar (por exemplo, confirmar o CPF), ou o protocolo basta? | Hoje quem souber um protocolo pode cancelar o pedido de outra pessoa. | RF-08, RF-09, DEC-06 |
| PA-04 | O que acontece quando o cidadão não está no local na hora da coleta, ou o volume real passa de 3 m³? Há nova solicitação, taxa ou bloqueio? | Define se há penalidade, hoje inexistente, e o status adequado para coleta não realizada. | RN-02, RN-05, estados |
| PA-05 | Quem pode ser atendente, quantos há por turno e qual o prazo máximo (SLA) para triar um pedido? Pedidos sem triagem até a data desejada são recusados automaticamente? | Define a fila, o risco de pedido vencido em Aguardando Triagem e a necessidade de alertas. | RF-10, RF-11, RN-04 |
