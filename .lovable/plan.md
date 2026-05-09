# Plano — Evolução completa do UNA

Escopo grande. Vou dividir em **6 entregas sequenciais** dentro deste mesmo turno (não vou parar entre elas), cada uma com migração + UI. Confirme o plano e eu sigo direto.

---

## Entrega 1 — Banco de dados (1 migração grande)

Novas tabelas e colunas:

- `clinics`: + `address`, `city`, `state`, `zip`, `description`, `instagram`, `whatsapp_owner`, `whatsapp_attendant`, `cover_url`, `catalog_slug`
- `clients`: + `cpf`, `gender`, `address`, `allergies` (text[]), `medications` (text[]), `chronic_conditions` (text[]), `surgeries` (jsonb), `previous_procedures` (jsonb), `skin_type`, `emergency_contact`, `how_found_us`, `avatar_url`
- `procedures`: + `cover_url`, `images` (text[]), `category`, `show_price` (bool), `lead_form_id` (link), `instructions_pre`, `instructions_post`
- **`products`** (estoque): name, sku, brand, category, unit, current_stock, min_stock, last_purchase_price, last_purchase_qty, last_purchase_date, supplier, notes, image_url
- **`stock_movements`**: product_id, type (in/out/adjustment), quantity, unit_cost, reason, appointment_id, created_by
- **`procedure_products`**: procedure_id, product_id, quantity_used (consumo automático)
- `lead_forms`: + `description`, `fields` (jsonb — schema dinâmico), `cover_url`, `theme_color`, `success_message`, `redirect_url`, `kind` (procedure|product|appointment|generic), `procedure_id` opcional
- **`lead_form_templates`** (pré-formulados editáveis): name, kind, fields jsonb, cover
- `leads`: + `form_data` (jsonb com todas as respostas), `kanban_stage` (new/contacted/scheduled/converted/lost), `assigned_to`, `scheduled_appointment_id`
- **`expenses`** (financeiro): description, amount, category, date, recurring (bool), recurrence (monthly/weekly/yearly), installments_total, installments_paid, parent_expense_id, paid (bool)
- **`financial_categories`**: name, type (income/expense), color
- `appointments`: + `confirmed` (bool), `reminder_sent` (bool)

Todas com RLS por `clinic_id`.

## Entrega 2 — Design system premium

- Refino completo de `src/styles.css`: paleta mais sofisticada (blue/cyan + violet accent), gradientes, sombras em camadas, glass surfaces, animações (fade-in, slide-up, hover-lift)
- Novo `Sidebar` com seções agrupadas (Operacional, Comercial, Gestão), avatar do usuário no rodapé com menu (Meu perfil → configurações)
- Novos componentes: `StatCard` (com sparkline), `EmptyState`, `PageHeader`, `SectionCard`, `MetricRing`, `KanbanColumn`, `KanbanCard`
- Animações com `tailwindcss-animate` + classes utilitárias (`hover-lift`, `shadow-brand-glow`)

## Entrega 3 — Form Builder + Captação + Kanban

- **`/app/$slug/captacao`** (renomear "Leads"): tabs **Formulários** | **Kanban de Leads** | **Templates**
- **Form Builder visual** (drag & drop com `@dnd-kit/core`):
  - Componentes: Texto curto, Texto longo, E-mail, Telefone (BR mask), Número, Data, Hora, **Date+Time picker que cria appointment**, Select, Multi-select, Radio, Checkbox, Upload de imagem (storage), Avaliação por estrelas, **Bloco de imagem**, **Bloco de título/markdown**, Endereço, CPF, Termo de aceite
  - Cada campo: label, placeholder, obrigatório, validação, ajuda
  - Preview ao vivo lado a lado
  - Cor do tema, capa, mensagem de sucesso, redirect
  - Botão "Copiar link público" e "Copiar link WhatsApp"
- **Templates pré-formulados editáveis**: Avaliação inicial, Pré-procedimento, Agendamento rápido, Catálogo de produtos, Pós-atendimento (NPS) — usuário clica "Usar template" → cria cópia editável
- **Kanban de leads**: colunas Novo / Contatado / Agendado / Convertido / Perdido. Drag & drop entre colunas. Card mostra nome, formulário origem, tempo. **Click no card → Dialog** com todas as respostas formatadas + ações (WhatsApp, Marcar agenda, Mover stage, Converter em cliente)
- **Filtro de período**: 7d / 30d / Customizado (Popover com Calendar range)
- **Página pública `/c/$slug/f/$formSlug`**: renderiza formulário dinâmico bonito; campo Date+Time **agenda real** no `appointments` ao submeter

## Entrega 4 — Procedimentos + Catálogo público + Clientes + Agenda + Prontuário

- **Procedimentos**:
  - Lista em grid com cover image, badge categoria
  - **Click → página detalhe `/app/$slug/procedimentos/$id`** com: editar tudo, galeria de imagens (upload), instruções pré/pós, **produtos consumidos** (selecionar do estoque + qtd), associar a formulário (gera link único), **estatísticas** (faturamento, nº atendimentos, clientes únicos) com filtro 7d/30d/custom
  - Toggle "Mostrar preço público" (se off → "Sob consulta — combine com a profissional")
  - Botões "Copiar link do formulário" / "Copiar link no catálogo"
- **Catálogo público `/c/$slug/catalogo`**: hero com logo+capa, grid lindo de procedimentos com fotos, click abre detalhe + CTA "Tenho interesse" (abre form ou WhatsApp). Design único: tipografia display, cards glass, gradiente
- **Clientes**:
  - Lista com avatar, tags, último atendimento, LTV
  - **Detalhe `/app/$slug/clientes/$id`** com tabs: Dados pessoais, Anamnese (alergias, medicações, condições, cirurgias, procedimentos anteriores, tipo de pele, contato emergência), Histórico de atendimentos, Fotos evolução, Pacotes, Financeiro do cliente
  - Form de novo cliente em wizard de 3 etapas
- **Agenda**:
  - View semanal + diária + mensal (toggle)
  - **Botão "Novo compromisso" → Dialog** com: cliente (Combobox com busca), procedimento (Combobox), profissional, sala, data (Calendar), hora+minuto, duração auto pelo procedimento, observações
  - Combobox de cliente busca em tempo real
  - **Barra de busca** filtra por cliente/procedimento/data
  - Cards coloridos pela cor do profissional
- **Prontuário**:
  - Lista por cliente, timeline com fotos antes/depois lado a lado, anotações ricas, evolução visual
  - Upload múltiplo, comparação de fotos (slider), exportar PDF do atendimento

## Entrega 5 — Estoque + Financeiro + Relatórios

- **Estoque `/app/$slug/estoque`**:
  - Grid de produtos com imagem, nome, **estoque atual em destaque**, última compra (qtd + preço unit + data), badge "baixo estoque" se < min_stock
  - CRUD completo, registrar entrada (compra) com fornecedor, registrar saída avulsa, histórico de movimentações
  - Alertas no topo: produtos abaixo do mínimo
  - Quando appointment é marcado como "completed" → desconta automaticamente os `procedure_products` do estoque (trigger)
- **Financeiro**:
  - Tabs: Visão geral | Receitas | Despesas | Recorrentes | Parcelamentos | Projeção
  - **Despesas avulsas e recorrentes** (mensal/semanal/anual) com geração automática
  - **Parcelamentos**: 1 despesa pai → N parcelas filhas com vencimento
  - **Projeção próximos 6 meses**: receita estimada (appointments confirmados + recorrentes esperados) vs despesas (recorrentes + parcelas pendentes) → gráfico de fluxo de caixa projetado
  - Categorias customizáveis com cor, gráfico de pizza por categoria
  - Atualização automática conforme agendamentos confirmam
- **Relatórios** (reformulação total):
  - Cards executivos: Faturamento (mês/comp. mês ant.), Ticket médio, Taxa conversão de leads, Taxa de no-show, Cliente mais valioso, Procedimento campeão
  - Gráficos: Faturamento mensal (linha), Receita por procedimento (barras), Funil de leads (kanban → conversão), Mapa de calor de horários mais ocupados, Retenção de clientes
  - Filtro de período global
  - Botão exportar PDF/CSV

## Entrega 6 — Configurações + Perfil + Demo seed massivo

- **Configurações** (reformulação):
  - Tabs: **Clínica** (nome, descrição, endereço completo, instagram, WhatsApp proprietária, WhatsApp atendimento, logo upload, capa upload — slug **escondido**, gerado automaticamente a partir do nome) | **Equipe** (profissionais com cor, especialidades, foto, convidar membro) | **Salas** | **Horário de funcionamento** | **Categorias financeiras** | **Identidade visual** (cor primária custom)
- **Menu do usuário** (avatar canto superior): Meu Perfil, Configurações da clínica, Tema, Sair. "Meu Perfil" → `/app/$slug/configuracoes?tab=perfil` editando nome próprio, foto, e atalhos para clínica
- **Demo seed massivo**: popular **tudo** — 25 clientes com anamnese completa, 15 procedimentos com fotos e produtos vinculados, 20 produtos de estoque com movimentações, 80 appointments espalhados (passados/futuros/cancelados), 60 pagamentos, 30 leads em vários stages do kanban, 5 formulários (1 por kind), 12 despesas (avulsas/recorrentes/parceladas), templates de form, fotos de evolução, 4 profissionais, 3 salas. Dashboard fica **cheia** de dados visuais

---

## Detalhes técnicos

- Drag & drop: `@dnd-kit/core` + `@dnd-kit/sortable`
- Combobox: `cmdk` (já instalado via shadcn `command`)
- Calendar range: shadcn `calendar` mode="range"
- Markdown leve: `react-markdown`
- PDF: `jspdf` + `html2canvas`
- Upload: bucket `clinic-media` com pastas `clinics/`, `procedures/`, `products/`, `clients/`, `forms/`
- Renderer público de formulário lê `fields` jsonb e renderiza componente correspondente
- Trigger SQL: `appointment.status='completed'` → insere `stock_movements` negativos por `procedure_products`
- Trigger SQL: `expenses.recurring=true` → função que gera próximas ocorrências (cron via pg_cron diário)
- Catálogo: rota pública SSR-friendly com og tags e og:image = cover da clínica

## Riscos / decisões automáticas

- Slug da clínica passa a ser derivado do nome (slugificado). Migrei o existente preservando valor atual; só novos cadastros recebem slug auto.
- Trigger de consumo de estoque só dispara em transição para "completed" — evita duplicar.
- Form fields como jsonb (sem tabela normalizada) — flexibilidade máxima, validado por zod no client.

Confirma? Se sim, começo pela migração e sigo direto até a entrega 6 sem parar.