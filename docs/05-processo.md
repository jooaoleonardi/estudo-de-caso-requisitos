# 05. Processo

## Estados da solicitação

Cinco status. Concluída, Recusada e Cancelada são finais.

```mermaid
stateDiagram-v2
    direction LR
    state "Aguardando Triagem" as AT
    state "Agendada" as AG
    state "Concluída" as CO
    state "Recusada" as RE
    state "Cancelada" as CA

    [*] --> AT : Cidadão solicita (HU-01)
    AT --> AG : Atendente aprova (HU-04)
    AT --> RE : Atendente recusa com justificativa (HU-05, RN-07)
    AT --> CA : Cidadão cancela (HU-03)
    AG --> AG : Cidadão reagenda, 1 vez (HU-03, RN-05)
    AG --> CA : Cidadão cancela até 24 h antes (HU-03, RN-05)
    AG --> CO : Atendente registra conclusão (HU-04)
    CO --> [*]
    RE --> [*]
    CA --> [*]
```

| De | Para | Quem | Condição |
|----|------|------|----------|
| (início) | Aguardando Triagem | Cidadão | Passou em RN-01, RN-02, RN-03 e RN-04; protocolo gerado (RN-06) |
| Aguardando Triagem | Agendada | Atendente | Aprovação |
| Aguardando Triagem | Recusada | Atendente | Justificativa com 10 ou mais caracteres (RN-07) |
| Aguardando Triagem | Cancelada | Cidadão | Sem prazo mínimo |
| Agendada | Agendada | Cidadão | Nova data válida (RN-04), até 24 h antes, no máximo 1 vez (RN-05) |
| Agendada | Cancelada | Cidadão | Até 24 h antes da coleta (RN-05) |
| Agendada | Concluída | Atendente | Coleta realizada |

Solicitações ativas (Aguardando Triagem e Agendada) ocupam o endereço (RN-01) e uma vaga na data (RN-04).

## Fluxo da solicitação

Da perspectiva do cidadão, da tela T-01 até a decisão do atendente.

```mermaid
flowchart TD
    A([Início: cidadão abre T-01]) --> B[Informa dados, endereço, volume e materiais]
    B --> C{Endereço já tem<br/>solicitação ativa?}
    C -- Sim --> C1[/"Já existe uma solicitação ativa para este endereço."/]
    C1 --> B
    C -- Não --> D{Volume maior<br/>que 3 m³?}
    D -- Sim --> D1[/"O volume máximo é de 3 m³ por coleta."/]
    D1 --> B
    D -- Não --> E{Algum material<br/>proibido?}
    E -- Sim --> E1[/"Este material não é aceito na coleta de entulho."/]
    E1 --> B
    E -- Não --> F[Sistema oferece datas válidas, RN-04]
    F --> G{Há data<br/>disponível?}
    G -- Não --> G1[/"Data indisponível. Escolha outra data."/]
    G1 --> F
    G -- Sim --> H[Cidadão escolhe a data e confirma]
    H --> I[Sistema gera protocolo COL-AAAA-NNNNNN]
    I --> J[Status: Aguardando Triagem]
    J --> K{Atendente decide<br/>em T-05}
    K -- Aprova --> L[Status: Agendada]
    K -- Recusa com justificativa --> M[Status: Recusada]
    L --> N{Cidadão cancela<br/>ou reagenda?}
    N -- Cancela até 24 h antes --> O[Status: Cancelada]
    N -- Reagenda, 1 vez --> L
    N -- Não --> P[Coleta realizada]
    P --> Q[Atendente registra conclusão]
    Q --> R[Status: Concluída]
    M --> S([Fim])
    O --> S
    R --> S
```

## Telas por etapa

| Etapa | Tela |
|-------|------|
| Solicitar | T-01 Solicitar |
| Acompanhar | T-02 Acompanhar |
| Cancelar ou reagendar | T-03 Cancelar/Reagendar |
| Fila de triagem | T-04 Fila do atendente |
| Decisão (aprovar, recusar, concluir) | T-05 Detalhe e decisão |
| Consulta aberta ao público | T-06 Consulta pública |
