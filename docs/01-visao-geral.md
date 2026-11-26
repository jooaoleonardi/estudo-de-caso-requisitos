# 01. Visão geral

> Serviço fictício. A Prefeitura de Vila Modelo e todos os dados citados são inventados.

## Problema

Na situação inventada para este estudo, a Prefeitura de Vila Modelo recebe pedidos de coleta de entulho por telefone e balcão. Isso gera:

- pedidos duplicados para o mesmo endereço;
- coletas marcadas além da capacidade diária das equipes;
- cidadãos sem informação sobre o andamento do pedido;
- materiais que o serviço não pode recolher (como amianto) só descobertos no dia da coleta.

## Objetivo

Oferecer um serviço digital em que o cidadão solicita e acompanha a coleta de entulho, e o atendente tria, aprova ou recusa cada pedido, com regras aplicadas pelo sistema desde o preenchimento.

## Escopo

| Dentro do escopo | Referência |
|------------------|------------|
| Solicitar coleta com endereço, volume, materiais e data | HU-01 |
| Acompanhar a solicitação por protocolo | HU-02 |
| Cancelar ou reagendar | HU-03 |
| Atendente triar e aprovar | HU-04 |
| Atendente recusar com justificativa | HU-05 |
| Consulta pública por protocolo, com CPF mascarado | HU-06 |
| Cinco status: Aguardando Triagem, Agendada, Concluída, Recusada, Cancelada | [05-processo.md](05-processo.md) |

## Fora de escopo

- Login, cadastro de conta e autenticação (o protocolo identifica a solicitação).
- Pagamento, taxas e multas.
- Roteirização de caminhões e gestão da frota.
- Notificações por e-mail, SMS ou WhatsApp.
- Calendário de feriados municipais (ver pergunta PA-01 em [07-decisoes-e-perguntas.md](07-decisoes-e-perguntas.md)).
- Integração com sistemas reais, bases de CPF ou CEP.
- Painel gerencial e relatórios.

## Personas

| Persona | Perfil | Objetivo | Histórias |
|---------|--------|----------|-----------|
| **Cidadão** | Morador de Vila Modelo, uso ocasional do serviço, geralmente pelo celular | Pedir a retirada do entulho de uma reforma e saber quando será feita | HU-01, HU-02, HU-03, HU-06 |
| **Atendente** | Servidor da prefeitura, uso diário, em computador | Decidir cada pedido com rapidez e deixar o motivo registrado | HU-04, HU-05 |

## Glossário

| Termo | Significado |
|-------|-------------|
| Coleta | Retirada de entulho em um endereço, em uma data |
| Solicitação | Pedido de coleta registrado, com protocolo |
| Protocolo | Identificador no formato `COL-AAAA-NNNNNN` (RN-06) |
| Solicitação ativa | Solicitação em Aguardando Triagem ou Agendada |
| Triagem | Análise do pedido pelo atendente, que aprova ou recusa |
| Entulho | Resto de obra e reforma: tijolo, concreto, madeira, vidro, gesso e similares |
| Material proibido | Item que o serviço não coleta: amianto, tintas e solventes, pneus, lixo domiciliar (RN-03) |
| Dia útil | Segunda a sexta-feira, sem considerar feriados no escopo deste estudo |
| CPF mascarado | CPF exibido como `***.123.456-**` (RN-08) |
