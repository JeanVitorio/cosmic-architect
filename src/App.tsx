import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppStoreProvider } from "@/store/AppStore";
import { ClinicStoreProvider } from "@/store/ClinicStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { SearchProvider } from "@/context/SearchContext";
import Dashboard from "./pages/Dashboard";
import { Placeholder } from "./pages/Placeholder";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound.tsx";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

function Protected({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <NotificationsProvider>
        <AuthProvider>
          <AppStoreProvider>
            <ClinicStoreProvider>
              <SearchProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route element={<Protected><AppLayout /></Protected>}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/calendar" element={<Placeholder phase={3} title="Agenda Inteligente" description="Sua agenda do dia, semana e mês com busca por cliente, procedimento e dia. Criação de compromissos com vinculação a clientes salvos, procedimentos (auto-preenche duração e preço) e confirmação automática via WhatsApp." features={["Visões dia / semana / mês / lista","Busca por cliente, procedimento ou data","Status: agendado, confirmado, realizado, cancelado, falta","Bloqueios de horário e recorrências","Sincroniza com agendamentos vindos de formulários","Confirmação automática via WhatsApp"]} />} />
                        <Route path="/leads" element={<Placeholder phase={2} title="Kanban de Leads" description="Pipeline visual completo dos leads vindos dos formulários, com card detalhado, filtros por período, formulário e fonte." features={["Colunas customizáveis (Novo → Convertido)","Click no card abre todas as respostas do formulário","Filtros: 7d, 30d, customizado (range)","Busca por nome, telefone ou e-mail","Ações rápidas: agendar, virar cliente, WhatsApp","Histórico de notas e mudanças de etapa"]} />} />
                        <Route path="/clients" element={<Placeholder phase={3} title="Clientes 360°" description="Ficha completa de cada cliente com saúde, histórico de procedimentos, fotos antes/depois, LTV e timeline de toda interação." features={["Saúde: alergias com severidade, medicamentos, condições","Cirurgias prévias e procedimentos realizados","Fotos antes/depois com comparador","Tags (VIP, Fidelidade, Indicação)","LTV, frequência média, primeiro atendimento","Timeline visual de toda a jornada"]} />} />
                        <Route path="/procedures" element={<Placeholder phase={4} title="Procedimentos" description="Catálogo interno com edição inline, produtos consumidos por sessão (com baixa automática no estoque), formulário associado e estatísticas de faturamento." features={["Galeria de fotos e descrição rica","Produtos consumidos (privado) — desconta estoque","Formulário associado com link copiável","Estatísticas: faturamento, ticket médio, recorrência","Preço ou \"Sob consulta — alinhamos juntos\"","Contraindicações e duração editáveis"]} />} />
                        <Route path="/forms" element={<Placeholder phase={2} title="Construtor de Formulários" description="Editor drag-and-drop com 18+ tipos de campo incluindo agendador real (que cria evento na agenda), upload de imagem, assinatura, condicionais, CPF, endereço e termos." features={["Templates pré-formulados editáveis","Agendador real → cria evento na agenda","Upload de imagem/arquivo pelo lead","Campos condicionais (mostra se resposta = X)","Tema visual personalizável","Vincular a procedimento + link único copiável"]} />} />
                        <Route path="/inventory" element={<Placeholder phase={4} title="Controle de Estoque" description="Tabela rica com qtd atual, mínimo, última compra, custo médio, validade e alertas visuais. Baixa automática conforme procedimentos são realizados." features={["Alertas: crítico (vermelho), baixo (âmbar), ok","Última compra: data, qty recebida, valor","Validade com alerta de vencimento","Histórico de movimentações","Vincular produtos a procedimentos","Importar compra (NF) e ajuste manual"]} />} />
                        <Route path="/finance" element={<Placeholder phase={5} title="Financeiro Pro" description="DRE simplificado, projeção dinâmica integrada à agenda, gastos avulsos e recorrentes, parcelamentos e fluxo de caixa dos próximos 6 meses." features={["Projeção integrada com agenda confirmada","Gastos avulsos, recorrentes (mensal/anual)","Parcelamentos a pagar e a receber","Categorias customizáveis com comprovante","Gráficos: fluxo de caixa, top categorias","Saldo projetado próximos 6 meses"]} />} />
                        <Route path="/reports" element={<Placeholder phase={5} title="Relatórios Avançados" description="Dashboards prontos por profissional, procedimento, cliente e conversão, com filtros poderosos e exportação em PDF/CSV/Excel com identidade da clínica." features={["Dashboards por profissional / procedimento / cliente","Conversão de leads e retenção","Comparativos período a período","Exportar PDF/CSV/Excel com sua marca","Salvamento de visões personalizadas","Filtros: 7d, 30d, customizado"]} />} />
                        <Route path="/catalog" element={<Placeholder phase={4} title="Catálogo Público" description="Página pública linda da clínica com hero cinematográfico, grid de procedimentos com hover premium, e link individual por procedimento — pronta para compartilhar." features={["Design editorial com hero impactante","Grid de procedimentos com efeitos cinematográficos","Página individual por procedimento","Link do catálogo OU link isolado","CTA direto para o formulário","SEO otimizado e 100% responsivo"]} />} />
                        <Route path="/settings" element={<Placeholder phase={5} title="Configurações da Clínica" description="Identidade visual, contato completo, horário, integrações e perfil pessoal — tudo num só lugar com slug auto-gerado." features={["Logo, nome, descrição e slogan","Endereço completo, Instagram, WhatsApp da dona e atendente","Horário de funcionamento e feriados","Tema do catálogo público","Slug gerado automaticamente (sem campo)","Equipe, permissões e integrações"]} />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </SearchProvider>
            </ClinicStoreProvider>
          </AppStoreProvider>
        </AuthProvider>
      </NotificationsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
