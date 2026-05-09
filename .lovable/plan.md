## Visão Geral

Transformar a ferramenta atual em um SaaS profissional para clínicas de estética, com design premium (glassmorphism + gradientes sutis + microanimações) e funcionalidades de ponta. Como o escopo é gigantesco, vou organizar em **5 fases entregáveis**, cada uma autossuficiente. Você aprova a fase 1 e seguimos sequencialmente — assim cada tela sai com profundidade real, não superficial.

---

## Fase 1 — Design System Premium + Dashboard + Demo Rico

**Design system novo (`src/styles.css`):**
- Paleta refinada (primária ciano/azul-noite, gradientes sutis, glass surfaces)
- Tokens: `--surface-glass`, `--gradient-hero`, `--shadow-glow`, `--shadow-soft`, `--radius-xl`
- Tipografia: display + body com hierarquia clara
- Componentes shadcn customizados (Card, Button, Badge) com variants premium
- Microanimações: fade-up, scale-in, shimmer

**Dashboard repaginada:**
- Hero KPIs com gradiente, sparklines, comparativo período anterior
- Gráficos: receita mensal (área), funil leads → procedimentos (funnel), top procedimentos (bar horizontal), agenda do dia (timeline)
- Cards de "Próximos compromissos", "Leads quentes", "Estoque crítico", "Aniversariantes"
- Filtro de período já existente, agora estilizado

**Usuário demo populado:**
- 50+ clientes com histórico completo (alergias, cirurgias, procedimentos)
- 20+ procedimentos com imagens, preços, produtos vinculados
- 80+ leads em diferentes estágios do kanban
- 6 meses de financeiro (entradas, saídas recorrentes, parcelamentos)
- Estoque com 30+ produtos, alguns críticos
- Agenda preenchida (passado e futuro)
- Formulários respondidos para popular kanban de leads

---

## Fase 2 — Formulários Avançados + Kanban de Leads

**Construtor de formulários (`/forms`):**
- Galeria de templates pré-formulados (Anamnese estética, Agendamento, Captação, Avaliação, Pós-procedimento) — todos editáveis
- Editor drag-and-drop com componentes:
  - Texto curto/longo, email, telefone (com máscara), número
  - Select, multi-select, radio, checkbox
  - Upload de imagem/arquivo (lead envia foto)
  - **Agendador real**: lead escolhe data+hora disponível → cria evento na agenda automaticamente
  - Assinatura digital, escala (1-10), CPF, data, endereço com CEP
  - Bloco de imagem/banner, divisor, texto explicativo
  - Termos de aceite, condicional (mostra pergunta se resposta X)
- Associar formulário a procedimento/produto → gera link único copiável
- Prévia ao vivo, publicar/despublicar, tema visual editável
- Página pública do formulário com design premium responsivo

**Kanban de leads (`/leads`):**
- Colunas customizáveis (Novo → Contatado → Agendado → Compareceu → Convertido → Perdido)
- Card com foto, nome, procedimento de interesse, tempo no estágio
- Click no card → dialog full com TODAS respostas do formulário, histórico, notas, ações (agendar, criar cliente, mensagem WhatsApp)
- Filtros: 7d / 30d / customizado (calendário range), por formulário, por origem
- Busca por nome/telefone/email

---

## Fase 3 — Clientes 360° + Agenda Inteligente + Prontuário

**Clientes (`/clients`):**
- Ficha completa: dados pessoais, foto, contato, endereço, redes sociais
- Saúde: alergias (com severidade), medicamentos em uso, condições (diabetes, hipertensão, gestante), cirurgias prévias
- Histórico: procedimentos realizados (com fotos antes/depois), produtos usados, valor pago, profissional
- Preferências, observações privadas, tags (VIP, fidelidade)
- Aniversário, primeiro atendimento, LTV, frequência média
- Timeline visual de toda interação

**Agenda (`/calendar`):**
- Visões: dia/semana/mês/lista
- Criar compromisso → buscar cliente (autocomplete), escolher procedimento (auto-preenche duração+valor), data/hora/duração em minutos
- Status: agendado/confirmado/realizado/cancelado/falta
- Barra de busca por dia, cliente, procedimento
- Bloqueios de horário, recorrências
- Confirmação automática via WhatsApp (link gerado)
- Sincronização com agendamentos vindos de formulários

**Prontuário:**
- Por cliente: ficha de anamnese, evolução por sessão, fotos com comparador antes/depois, prescrições, anexos
- Templates de evolução por procedimento
- Assinatura do profissional, exportar PDF

---

## Fase 4 — Procedimentos + Catálogo Público + Estoque

**Procedimentos (`/procedures`):**
- Lista com cards (imagem, nome, preço, duração)
- Detalhe: galeria de fotos, descrição rica, duração, preço (ou "Sob consulta — alinhamos o valor ideal pra você"), contraindicações
- **Produtos consumidos** (privado): lista de produto + quantidade usada por sessão → desconta estoque automático
- Formulário associado → botão "Copiar link do formulário"
- Estatísticas: faturamento, qtd clientes atendidos, ticket médio, recorrência (filtro 7d/30d/custom)
- Edição inline de tudo

**Catálogo público (`/c/:slug` e `/c/:slug/:procedure`):**
- Design hero com vídeo/imagem de fundo, tipografia editorial
- Grid de procedimentos com hover cinematográfico
- Página individual do procedimento com CTA → formulário
- Link do catálogo inteiro OU link isolado por procedimento
- Compartilhável, SEO otimizado, responsivo

**Estoque (`/inventory`):**
- Tabela rica: produto, marca, qtd atual, qtd mínima, última compra (data + valor + qtd recebida), custo médio, validade
- Alertas visuais: crítico (vermelho), baixo (âmbar), ok (verde), vencendo
- Histórico de movimentações (entradas, saídas por procedimento, perdas)
- Vincular produtos a procedimentos (já consumido na fase de procedimentos)
- Importar compra (NF), ajuste manual com motivo

---

## Fase 5 — Financeiro Pro + Relatórios + Configurações + Perfil

**Financeiro (`/finance`):**
- Dashboard: receita prevista vs realizada, DRE simplificado, saldo projetado próximos 6 meses
- Lançamentos: gastos avulsos, gastos recorrentes (mensal/anual com data), receitas
- Parcelamentos (cartão da clínica e parcelas a receber dos clientes)
- Projeção dinâmica: integra com agenda (procedimentos confirmados = receita prevista), estoque (reposição prevista)
- Categorias customizáveis, anexar comprovante
- Gráficos: fluxo de caixa, top categorias, evolução mensal

**Relatórios (`/reports`):**
- Dashboards prontos: clínica geral, por profissional, por procedimento, por cliente, conversão de leads, retenção
- Filtros poderosos com salvamento de visões
- Exportar PDF/CSV/Excel com identidade da clínica
- Comparativos período a período

**Configurações (`/settings`) — sem campo slug visível:**
- Identidade: logo (upload), nome da clínica, descrição, slogan
- Contato: endereço completo (com CEP), telefone, email, Instagram, WhatsApp da proprietária, WhatsApp do atendimento
- Horário de funcionamento, feriados
- Tema do catálogo público (cores, fonte)
- Slug auto-gerado (lowercase + sem espaços do nome) — só leitura
- Equipe, permissões
- Integrações (WhatsApp, Google Calendar)

**Perfil do usuário (ícone topo → "Meu perfil"):**
- Redireciona para `/settings` na aba do usuário
- Editar dados pessoais, foto, senha
- Também vê e edita configurações da clínica (logo, identidade)

---

## Aspectos Técnicos

- Stack atual mantida (TanStack Start + shadcn + Tailwind + AppStore mock; Supabase opcional)
- Tudo client-side em mock por enquanto (já que store é mock); estrutura preparada pra plugar Cloud depois
- Drag-and-drop: `@dnd-kit` (já instalado provavelmente, senão `bun add`)
- Datas: `date-fns` + Calendar do shadcn com `pointer-events-auto`
- Gráficos: `recharts` (já instalado)
- Imagens geradas para hero do catálogo, placeholders de procedimentos

---

## Como vamos executar

Esse plano tem ~30+ telas profundas. Fazer tudo em um turno produziria resultado raso e cheio de bugs. Proposta:

1. Você aprova esse plano geral
2. Começo pela **Fase 1** (design system + dashboard + demo populado) — base que todas as outras fases herdam
3. A cada fase concluída, você revisa e seguimos pra próxima
4. Se quiser priorizar uma fase específica antes (ex: pular pra Fase 2 — Formulários), me diz

Confirma o plano ou ajusta a ordem?