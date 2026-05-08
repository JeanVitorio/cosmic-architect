# UNA — SaaS para Clínicas de Estética

Sistema multi-tenant completo com landing page pública, cadastro de clínicas com aprovação manual, e ambiente interno por clínica (slug na URL). Visual premium combinando com a logo (águia em gradiente azul → ciano → verde-água), com tema claro e escuro.

## Stack

- TanStack Start (React 19 + TanStack Router) — já é o stack do template
- Lovable Cloud (Supabase por baixo) — Auth, Postgres, Storage, RLS
- Tailwind v4 + shadcn/ui + tokens em `src/styles.css` (oklch)
- React Hook Form + Zod, TanStack Query, date-fns, recharts

> Observação: o template usa TanStack Router (não React Router DOM). Vou seguir a convenção do projeto — funcionalmente idêntico para o usuário final.

---

## 1. Identidade visual

Inspirada na logo enviada:

- **Primary**: azul royal `#1E5FFF`
- **Accent**: ciano `#22D3EE`
- **Success/brand-soft**: verde-água `#34E0B8`
- **Gradiente da marca**: `linear-gradient(135deg, #1E5FFF, #22D3EE, #34E0B8)`
- Tipografia: Inter (UI) + Sora (títulos)
- Tema claro: fundo off-white levemente azulado; tema escuro: fundo `#0B1220` com superfícies `#111A2E`
- Sombras suaves, cantos `rounded-2xl`, glassmorphism leve no header da landing
- Toggle de tema no header (claro/escuro/sistema)

---

## 2. Modelo multi-tenant

- Cada **clinic** tem `slug` único e `status` (`pending` | `active` | `suspended`).
- Usuários pertencem a uma clínica via `clinic_members(user_id, clinic_id, role)`.
- Roles: `owner`, `admin`, `reception`, `professional`, `finance`.
- Toda tabela de domínio tem `clinic_id` e RLS força `clinic_id IN (SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid())`.
- Função `SECURITY DEFINER` `is_member_of(clinic_id)` e `has_clinic_role(clinic_id, role)` para evitar recursão.
- Login só é permitido se a clínica do usuário estiver `active` (verificação no client + bloqueio via RLS).

---

## 3. Estrutura do banco (resumo)

```text
clinics(id, name, slug, email, phone, status, plan, created_at)
profiles(id=auth.uid, full_name, avatar_url, phone)
app_role  ENUM('owner','admin','reception','professional','finance')
clinic_members(id, clinic_id, user_id, role, active)

clients(id, clinic_id, full_name, email, phone, birth_date, notes, tags[])
client_anamnesis(id, client_id, clinic_id, data jsonb, updated_at)
client_photos(id, client_id, clinic_id, url, kind 'before'|'after'|'evolution', taken_at, procedure_id)

professionals(id, clinic_id, user_id?, name, color, specialties[])
rooms(id, clinic_id, name)
business_hours(id, clinic_id, weekday, opens_at, closes_at)
schedule_blocks(id, clinic_id, professional_id?, room_id?, starts_at, ends_at, reason)

procedures(id, clinic_id, name, description, price, duration_min, photos[], active)
appointments(id, clinic_id, client_id, professional_id, room_id?, procedure_id,
             starts_at, ends_at, status 'scheduled'|'confirmed'|'done'|'no_show'|'canceled', notes)

lead_forms(id, clinic_id, procedure_id, slug, headline, subheadline, active)
leads(id, clinic_id, lead_form_id?, procedure_id?, name, phone, email, message, source, status, created_at)

treatment_records(id, clinic_id, client_id, professional_id, procedure_id,
                  performed_at, notes, photos[])
packages(id, clinic_id, client_id, procedure_id, total_sessions, used_sessions, price, status)
payments(id, clinic_id, client_id, package_id?, appointment_id?, amount, method, paid_at, status)
```

Todas com RLS habilitada e policies por `clinic_id`. SQL completo entregue ao final do desenvolvimento (também irá rodar via migrations do Cloud).

---

## 4. Telas

### Públicas
- `/` **Landing**: hero com gradiente da marca + mockup, benefícios, "como funciona", módulos, depoimentos, planos, FAQ, CTA, footer.
- `/cadastro` Cria clínica + usuário owner. Mostra "Conta criada — aguardando ativação".
- `/login` Email + senha. Bloqueia se clínica `pending`.
- `/c/:slug/captacao/:formSlug` Formulário público de captação de leads (gera link único por procedimento).

### Internas (`/app/:slug/...`)
- **Dashboard** — agendamentos do dia, novos leads, faturamento do mês, taxa de no-show, próximos aniversariantes.
- **Agenda** — calendário semanal e diário, filtro por profissional/sala, drag-to-create, bloqueios.
- **Clientes** — lista com busca, ficha completa (dados, anamnese, fotos antes/depois, histórico, pacotes).
- **Procedimentos** — CRUD com preço, duração, fotos, descrição.
- **Captação** — gerar links de formulário por procedimento, listar leads, mover para cliente, botão WhatsApp.
- **Prontuário** — timeline por cliente com fotos e procedimentos.
- **Financeiro** — pacotes, sessões restantes, pagamentos, recebíveis do mês.
- **Relatórios** — faturamento, procedimentos mais vendidos, ocupação de agenda, conversão de leads.
- **Configurações** — clínica, horários de funcionamento, profissionais, salas, equipe (convites por email), tema.

Botões "Enviar WhatsApp" abrem `https://wa.me/<phone>?text=...` em nova aba.

---

## 5. Fluxo de usuário

1. Visitante acessa `/` → clica em "Criar conta" → preenche `/cadastro`.
2. Sistema cria `auth.user`, `clinic` (status `pending`, slug gerado), `clinic_members` (role `owner`).
3. Tela "Aguardando aprovação". Você (super-admin) muda `status` para `active` no Supabase.
4. Usuário faz login → redireciona para `/app/{slug}/dashboard`.
5. Dentro do app, sidebar com módulos; topbar com troca de clínica (se o user pertencer a mais de uma) e toggle de tema.

---

## 6. Plano de execução (passo a passo)

1. Ativar Lovable Cloud.
2. Criar migration com schema completo + RLS + funções `is_member_of` / `has_clinic_role` + trigger `on_auth_user_created` para criar `profile`.
3. Configurar design system em `src/styles.css` (tokens claro/escuro + gradiente + fontes) e `ThemeProvider`.
4. Layout base: `__root` com QueryClient + Theme + Toaster; rotas públicas vs `/app/$slug` (layout autenticado com guard).
5. Landing page (`/`) — hero, features, depoimentos, pricing, FAQ, CTA, footer.
6. `/cadastro` e `/login` com validação Zod e mensagens claras.
7. Layout interno `/app/$slug` com sidebar, topbar, breadcrumbs, guard de membership + status `active`.
8. Módulos na ordem: Dashboard → Clientes → Procedimentos → Agenda → Captação/Leads → Prontuário → Financeiro → Relatórios → Configurações.
9. Storage bucket `clinic-media` (fotos de clientes/procedimentos) com policies por clínica.
10. Polimento, responsividade, dark mode, estados de loading/empty/erro.
11. Entrega do SQL completo num arquivo `docs/schema.sql` para você copiar/colar se quiser rodar manualmente (além da migration aplicada).

---

## Detalhes técnicos

- **Slug**: gerado de `name` com fallback numérico se colidir (`minha-clinica`, `minha-clinica-2`).
- **Guard de rota**: `beforeLoad` em `/app/$slug` busca membership via server fn; redireciona para `/login` ou `/sem-acesso`.
- **RLS**: usar `SECURITY DEFINER` functions para evitar recursão (padrão do guia user-roles).
- **Storage**: caminho `clinic-media/{clinic_id}/clients/{client_id}/{uuid}.jpg`; policies validam `clinic_id` no path.
- **Performance**: TanStack Query para cache; loaders por rota onde fizer sentido (dentro de `_authenticated`).
- **SEO**: cada rota pública com `head()` próprio (title, description, og).

Pronto para começar pela ativação do Cloud e migration do schema assim que aprovar.