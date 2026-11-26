# 02. Requisitos funcionais e não funcionais

Cada requisito funcional (RF) aponta para a história de usuário (HU) que o origina e para as regras de negócio (RN) que ele aplica. Textos das regras e mensagens estão em [04-regras-de-negocio.md](04-regras-de-negocio.md).

## Requisitos funcionais

| ID | Requisito | HU | RN |
|----|-----------|----|----|
| RF-01 | O sistema deve coletar apenas os dados mínimos da solicitação: nome, CPF, telefone, endereço (CEP, número e complemento), volume estimado, materiais e data desejada. | HU-01 | RN-08 |
| RF-02 | O sistema deve recusar volume acima de 3 m³ e exigir volume maior que zero. | HU-01 | RN-02 |
| RF-03 | O sistema deve bloquear a solicitação quando o cidadão marcar qualquer material proibido. | HU-01 | RN-03 |
| RF-04 | O sistema deve bloquear nova solicitação para endereço que já tenha solicitação ativa. | HU-01 | RN-01 |
| RF-05 | O sistema deve oferecer apenas datas válidas: dias úteis, a partir de 3 dias úteis, dentro de 30 dias, com menos de 20 coletas no dia. | HU-01, HU-03 | RN-04 |
| RF-06 | O sistema deve gerar o protocolo `COL-AAAA-NNNNNN` e registrar a solicitação com status Aguardando Triagem. | HU-01 | RN-06 |
| RF-07 | O sistema deve permitir consultar a solicitação pelo protocolo, mostrando status, data, detalhes, histórico e, se houver, a justificativa da recusa. | HU-02 | RN-06, RN-08 |
| RF-08 | O sistema deve permitir cancelar a solicitação, respeitando o prazo de 24 horas antes da data da coleta. | HU-03 | RN-05 |
| RF-09 | O sistema deve permitir reagendar uma solicitação Agendada, uma única vez, para uma data válida. | HU-03 | RN-05, RN-04 |
| RF-10 | O sistema deve listar para o atendente as solicitações Aguardando Triagem, da mais antiga para a mais recente. | HU-04 | n/a |
| RF-11 | O sistema deve permitir ao atendente aprovar a solicitação, mudando o status para Agendada. | HU-04 | RN-04 |
| RF-12 | O sistema deve permitir ao atendente registrar a conclusão de uma solicitação Agendada, mudando o status para Concluída. | HU-04 | n/a |
| RF-13 | O sistema deve permitir ao atendente recusar a solicitação mediante justificativa de pelo menos 10 caracteres, mudando o status para Recusada. | HU-05 | RN-07 |
| RF-14 | O sistema deve oferecer consulta pública por protocolo, exibindo apenas dados mínimos e o CPF mascarado. | HU-06 | RN-06, RN-08 |
| RF-15 | O sistema deve registrar no histórico cada mudança de status, com data e hora e o ator (Cidadão ou Atendente). | HU-02, HU-03, HU-04, HU-05 | n/a |

### Observações

- RF-05 vale para a solicitação (T-01) e para o reagendamento (T-03). A mesma regra, o mesmo cálculo.
- A capacidade diária (20 coletas) conta solicitações ativas que ocupam a data. Recusar ou cancelar libera a vaga.
- RF-12 existe para que o status Concluída seja alcançável no fluxo. A coleta física não faz parte do sistema.

## Requisitos não funcionais

| ID | Categoria | Requisito |
|----|-----------|-----------|
| RNF-01 | Acessibilidade | As telas devem atender à WCAG 2.1 nível AA: contraste mínimo 4,5:1 para texto, navegação completa por teclado, foco visível, rótulos associados aos campos, mensagens de erro anunciadas por leitor de tela e erro nunca indicado só pela cor. |
| RNF-02 | Responsividade | As telas devem funcionar sem rolagem horizontal de 320 px a 1440 px de largura, com alvos de toque de pelo menos 44 x 44 px. |
| RNF-03 | LGPD | O sistema deve tratar só dados mínimos (RN-08), informar a finalidade da coleta de dados no formulário e nunca exibir CPF completo em consulta pública. Dados reais não devem ser usados neste estudo. |
| RNF-04 | Desempenho | Cada tela deve carregar em até 2 segundos e cada ação (validar, salvar, consultar) deve responder em até 1 segundo, em conexão 4G comum. |
| RNF-05 | Usabilidade | Mensagens de erro devem ser frases curtas em português, ao lado do campo com problema, e dizer o que corrigir. |
| RNF-06 | Dados fictícios | Todo dado de exemplo deve ser inventado e identificado como fictício na interface. |

### Verificação dos RNF

| RNF | Como verificar |
|-----|----------------|
| RNF-01 | Auditoria automática de acessibilidade e navegação manual só com teclado |
| RNF-02 | Capturas de tela em 320 px, 768 px e 1440 px |
| RNF-03 | Revisão dos campos do formulário e das telas de consulta contra RN-08 |
| RNF-04 | Medição de carregamento em cada tela do protótipo |
| RNF-05 | Revisão das mensagens contra a lista de [04-regras-de-negocio.md](04-regras-de-negocio.md) |
| RNF-06 | Revisão visual e do conteúdo do repositório |
