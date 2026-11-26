# Protótipo navegável: Agendamento de Coleta de Entulho

Serviço público digital **fictício** da "Prefeitura de Vila Modelo". Site estático, sem build e sem dependências de runtime. O estado fica no `localStorage` do navegador.

## Como rodar

Na raiz do repositório (Node 22 e Python 3):

```bash
npm install
npm run dev
```

Abra <http://localhost:4173>. Os módulos ES exigem servidor HTTP (não abre por `file://`). O botão "Restaurar dados de exemplo" no rodapé recria os dados iniciais (7 solicitações em todos os estados).

## Telas

| ID   | Tela                       | Rota                                                                   |
| ---- | -------------------------- | ---------------------------------------------------------------------- |
| T-01 | Solicitar                  | `#/solicitar` (confirmação em `#/solicitar/confirmacao/<protocolo>`)   |
| T-02 | Acompanhar                 | `#/acompanhar` e `#/acompanhar/<protocolo>`                            |
| T-03 | Cancelar/Reagendar         | `#/cancelar` e `#/cancelar/<protocolo>`                                |
| T-04 | Fila do atendente          | `#/atendente` (filtro em `#/atendente/fila/<situação>`)                |
| T-05 | Detalhe e decisão          | `#/atendente/<protocolo>`                                              |
| T-06 | Consulta pública           | `#/consulta` e `#/consulta/<protocolo>`                                |

Histórias cobertas: HU-01 (T-01), HU-02 (T-02), HU-03 (T-03), HU-04 e HU-05 (T-04 e T-05), HU-06 (T-06). Personas: Cidadão e Atendente (sem login; a área do atendente é um link do menu).

## Regras implementadas (`js/regras.js`)

Módulo puro, sem DOM nem relógio global, testado isoladamente.

- **RN-01** no máximo 1 solicitação ativa (Aguardando Triagem ou Agendada) por endereço.
- **RN-02** volume máximo de 3 m³.
- **RN-03** amianto, tintas e solventes, pneus e lixo domiciliar bloqueiam.
- **RN-04** só dias úteis, a partir de 3 dias úteis, janela de 30 dias, máximo de 20 coletas por dia.
- **RN-05** cancelamento até 24 h antes da coleta; reagendamento uma única vez.
- **RN-06** protocolo `COL-AAAA-NNNNNN`.
- **RN-07** recusa exige justificativa de pelo menos 10 caracteres.
- **RN-08** CPF mascarado (`***.123.456-**`) na consulta pública e no acompanhamento; só o atendente vê o CPF completo. Dados pessoais pedidos: nome, CPF e endereço.

## Testes

Playwright, em `prototipo/tests/`, nos projetos `desktop` e `celular`. O relógio do navegador é fixado em segunda-feira, 02/03/2026, 09:00 (Brasília) para deixar as datas determinísticas.

```bash
npx playwright install chromium   # uma vez
npm test                          # sobe o servidor sozinho
npm run check                     # ESLint (sem avisos) e Prettier
```

| ID           | O que verifica                                                                       |
| ------------ | ------------------------------------------------------------------------------------ |
| TE-01        | HU-01: caminho feliz, protocolo gerado, situação Aguardando Triagem                  |
| TE-02        | RN-01: bloqueia segunda coleta ativa no endereço (TE-02b: cancelada não bloqueia)    |
| TE-03        | RN-02: 3,1 m³ recusado, 3 m³ aceito                                                  |
| TE-04        | RN-03: um teste por material proibido                                                |
| TE-05        | RN-04: fim de semana, cedo demais, fora da janela e 21ª coleta (TE-05b: 20ª cabe)    |
| TE-06        | RN-05: cancelar com menos de 24 h e reagendar duas vezes                             |
| TE-07        | RN-06: formato e sequência do protocolo                                              |
| TE-08        | RN-07: justificativa curta recusada, longa aceita                                    |
| TE-09        | RN-08: CPF mascarado e sem nome nem endereço na consulta pública                     |
| TE-10        | Fumaça: todas as telas, sem erro de JavaScript, sem rolagem horizontal, um `h1`      |
| TE-11        | HU-02: acompanhar por protocolo, inexistente e formato inválido                      |
| TE-12        | HU-04: aprovar passa a Agendada                                                      |
| TE-13        | HU-03: cancelar com antecedência libera o endereço                                   |
| TE-14        | Dados de exemplo: ao menos 6 solicitações, todos os estados                          |
| TE-15a a 15c | Unitários de `regras.js` (rodam no navegador via `page.evaluate`, só no desktop)     |

## Acessibilidade

Rótulos em todos os campos, foco visível, contraste AA, um `h1` por tela com foco movido a ele a cada troca de rota, erros ligados aos campos por `aria-describedby` e `aria-invalid`, link "Ir para o conteúdo", alvos de toque de 44 px.

## Decisões

Onde o contrato não definia, escolhi a opção mais simples:

- Coleta começa às 08:00 do dia agendado; "24 h antes" conta a partir desse horário.
- Sem feriados: dia útil é de segunda a sexta. "A partir de 3 dias úteis" conta de hoje; "30 dias" são corridos.
- Só coletas ativas (Aguardando Triagem e Agendada) ocupam as 20 vagas do dia.
- Reagendamento mantém a situação e só obedece à RN-04 e ao limite de uma vez; não tem prazo de 24 h.
- Aprovar mantém a data pedida. Não há tela para marcar Concluída (só aparece nos dados de exemplo).
- Com vários materiais proibidos marcados, a mensagem cita o primeiro da lista da RN-03.
- CPF validado só pelo formato (11 dígitos), sem dígito verificador; os dados de exemplo são inventados.
- Mensagens fora do contrato (campo obrigatório, protocolo não encontrado ou fora do formato, material não marcado) são mínimas e só existem para a interface funcionar.
- Sem fotos, e-mail ou telefone, para manter dados pessoais mínimos.
