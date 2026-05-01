import type { Client, Task, User, Comment, TimeEntry } from "@/types";

export const mockUsers: User[] = [
  { id: "u1", name: "Ana Viana", email: "ana@versatil.digital", role: "leader" },
  { id: "u2", name: "Ricardo Lima", email: "ricardo@versatil.digital", role: "employee" },
  { id: "u3", name: "Maria Souza", email: "maria@versatil.digital", role: "employee" },
  { id: "u4", name: "Carlos Aguiar", email: "carlos@versatil.digital", role: "employee" },
  { id: "u5", name: "Juliana Reis", email: "juliana@versatil.digital", role: "employee" },
];

export const mockClients: Client[] = [
  { id: "c1", name: "Aurora Cosméticos", company: "Aurora SA", email: "contato@aurora.com", status: "active", created_at: new Date().toISOString() },
  { id: "c2", name: "TechNova", company: "TechNova LTDA", email: "marketing@technova.io", status: "active", created_at: new Date().toISOString() },
  { id: "c3", name: "Verde Bistrô", company: "Verde Bistrô", email: "ola@verdebistro.com", status: "active", created_at: new Date().toISOString() },
  { id: "c4", name: "Studio Pilates", company: "Studio Pilates Zen", email: "contato@studiopilates.com", status: "paused", created_at: new Date().toISOString() },
  { id: "c5", name: "Construtora Horizonte", company: "Horizonte SA", email: "marketing@horizonte.com", status: "active", created_at: new Date().toISOString() },
];

const now = Date.now();
const day = (n: number) => new Date(now + n * 86400000).toISOString();

export const mockTasks: Task[] = [
  { id: "t1", title: "Calendário editorial — Setembro", description: "Planejar 30 posts de Instagram para Aurora.", status: "in_progress", priority: "high", client_id: "c1", assignee_id: "u2", due_date: day(2), created_at: day(-3), updated_at: day(0), total_seconds: 5400 },
  { id: "t2", title: "Otimização de campanha Google Ads", description: "Reduzir CPA em 15%.", status: "in_progress", priority: "urgent", client_id: "c2", assignee_id: "u4", due_date: day(1), created_at: day(-5), updated_at: day(0), total_seconds: 12600 },
  { id: "t3", title: "Roteiro Reels lançamento", status: "review", priority: "medium", client_id: "c1", assignee_id: "u3", due_date: day(3), created_at: day(-2), updated_at: day(0), total_seconds: 3200 },
  { id: "t4", title: "Site institucional — wireframe", status: "todo", priority: "high", client_id: "c5", assignee_id: "u2", due_date: day(7), created_at: day(-1), updated_at: day(0), total_seconds: 0 },
  { id: "t5", title: "Newsletter mensal", status: "done", priority: "low", client_id: "c3", assignee_id: "u3", due_date: day(-2), created_at: day(-10), updated_at: day(-2), total_seconds: 4800 },
  { id: "t6", title: "Estratégia SEO trimestral", status: "todo", priority: "medium", client_id: "c2", assignee_id: "u5", due_date: day(10), created_at: day(0), updated_at: day(0), total_seconds: 0 },
  { id: "t7", title: "Edição de vídeo — depoimentos", status: "in_progress", priority: "medium", client_id: "c5", assignee_id: "u3", due_date: day(4), created_at: day(-2), updated_at: day(0), total_seconds: 7200 },
  { id: "t8", title: "Relatório de performance — Agosto", status: "done", priority: "high", client_id: "c1", assignee_id: "u4", due_date: day(-1), created_at: day(-8), updated_at: day(-1), total_seconds: 9000 },
  { id: "t9", title: "Briefing nova marca", status: "review", priority: "high", client_id: "c4", assignee_id: "u5", due_date: day(2), created_at: day(-3), updated_at: day(0), total_seconds: 2400 },
  { id: "t10", title: "Posts blog — 4 artigos", status: "in_progress", priority: "low", client_id: "c2", assignee_id: "u3", due_date: day(5), created_at: day(-1), updated_at: day(0), total_seconds: 1800 },
  { id: "t11", title: "Auditoria de marca", status: "todo", priority: "urgent", client_id: "c5", assignee_id: "u2", due_date: day(-1), created_at: day(-2), updated_at: day(0), total_seconds: 0 },
  { id: "t12", title: "Setup pixel Meta Ads", status: "done", priority: "medium", client_id: "c3", assignee_id: "u4", due_date: day(-3), created_at: day(-6), updated_at: day(-3), total_seconds: 3600 },
];

export const mockComments: Comment[] = [
  { id: "cm1", task_id: "t1", user_id: "u1", body: "Lembrar de incluir CTA forte na semana 3.", created_at: day(-1) },
  { id: "cm2", task_id: "t2", user_id: "u4", body: "Ajustei lances. Aguardando 48h de dados.", created_at: day(0) },
];

export const mockTimeEntries: TimeEntry[] = [];