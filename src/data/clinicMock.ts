import type {
  ClinicClient, Procedure, InventoryProduct, Appointment, Lead,
  FinanceEntry, ClinicForm, Procedurelog, ClinicSettings,
} from "@/types/clinic";

const now = Date.now();
const day = (n: number) => new Date(now + n * 86400000).toISOString();
const at = (offsetDays: number, hour: number, minute = 0) => {
  const d = new Date(now + offsetDays * 86400000);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// ---------- Settings ----------
export const mockSettings: ClinicSettings = {
  name: "Lumière Estética Avançada",
  description: "Estética facial e corporal com tecnologia e acolhimento.",
  slogan: "Sua melhor versão começa aqui.",
  logo_url: undefined,
  address: "Av. Paulista, 1500 — Sala 1204, São Paulo/SP",
  phone: "(11) 99999-1234",
  email: "contato@lumiere.com.br",
  instagram: "@lumiere.estetica",
  whatsapp_owner: "5511999991234",
  whatsapp_attendant: "5511988887777",
  business_hours: [
    { day: "Segunda", open: "09:00", close: "19:00" },
    { day: "Terça", open: "09:00", close: "19:00" },
    { day: "Quarta", open: "09:00", close: "19:00" },
    { day: "Quinta", open: "09:00", close: "20:00" },
    { day: "Sexta", open: "09:00", close: "20:00" },
    { day: "Sábado", open: "09:00", close: "14:00" },
    { day: "Domingo", open: "", close: "", closed: true },
  ],
  catalog_theme: { primary: "#0e8a9e", font: "Plus Jakarta Sans" },
  slug: "lumiere-estetica-avancada",
};

// ---------- Procedures ----------
export const mockProcedures: Procedure[] = [
  { id: "p1",  name: "Limpeza de Pele Profunda",      category: "Facial",   description: "Higienização, esfoliação, extração e máscara calmante.",         duration_min: 60, price: 180, image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800", consumables: [{ product_id: "i1", qty: 1 }, { product_id: "i2", qty: 2 }], form_id: "f1", active: true, contraindications: ["Lesões ativas", "Acne grau IV"], created_at: day(-180) },
  { id: "p2",  name: "Peeling de Diamante",           category: "Facial",   description: "Esfoliação mecânica para renovação celular.",                    duration_min: 45, price: 220, image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800", consumables: [{ product_id: "i2", qty: 1 }], form_id: "f1", active: true, created_at: day(-160) },
  { id: "p3",  name: "Microagulhamento Facial",       category: "Facial",   description: "Drug delivery com indução de colágeno.",                          duration_min: 75, price: 380, image_url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800", consumables: [{ product_id: "i3", qty: 1 }, { product_id: "i4", qty: 1 }], form_id: "f1", active: true, contraindications: ["Gestantes", "Anticoagulantes"], created_at: day(-150) },
  { id: "p4",  name: "Hydrafacial Premium",           category: "Facial",   description: "Hidratação, esfoliação e nutrição em uma sessão.",               duration_min: 60, price: 450, image_url: "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800", consumables: [{ product_id: "i5", qty: 1 }], form_id: "f1", active: true, created_at: day(-140) },
  { id: "p5",  name: "Botox — Aplicação Facial",      category: "Injetável",description: "Toxina botulínica para linhas de expressão.",                    duration_min: 45, price: undefined, image_url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800", consumables: [{ product_id: "i6", qty: 1 }], form_id: "f2", active: true, contraindications: ["Gestantes", "Lactantes", "Miastenia gravis"], created_at: day(-120) },
  { id: "p6",  name: "Preenchimento Labial",          category: "Injetável",description: "Ácido hialurônico para volume e contorno.",                       duration_min: 60, price: undefined, image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800", consumables: [{ product_id: "i7", qty: 1 }], form_id: "f2", active: true, created_at: day(-110) },
  { id: "p7",  name: "Drenagem Linfática",            category: "Corporal", description: "Massagem manual modeladora e desintoxicante.",                   duration_min: 60, price: 160, image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800", consumables: [{ product_id: "i8", qty: 1 }], form_id: "f3", active: true, created_at: day(-100) },
  { id: "p8",  name: "Criolipólise",                  category: "Corporal", description: "Redução de gordura localizada por congelamento.",                duration_min: 90, price: 550, image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800", consumables: [{ product_id: "i9", qty: 2 }], form_id: "f3", active: true, contraindications: ["Hérnias", "Crioglobulinemia"], created_at: day(-90) },
  { id: "p9",  name: "Radiofrequência Corporal",      category: "Corporal", description: "Aquecimento profundo para flacidez e firmeza.",                  duration_min: 45, price: 200, image_url: "https://images.unsplash.com/photo-1604595849472-238f6916f87e?w=800", consumables: [{ product_id: "i10", qty: 1 }], form_id: "f3", active: true, created_at: day(-85) },
  { id: "p10", name: "Depilação a Laser — Axilas",    category: "Laser",    description: "Tecnologia diodo, indolor e duradoura.",                          duration_min: 20, price: 90,  image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800", consumables: [], form_id: "f4", active: true, created_at: day(-80) },
  { id: "p11", name: "Depilação a Laser — Pernas",    category: "Laser",    description: "Sessão completa pernas inteiras.",                                duration_min: 60, price: 320, image_url: "https://images.unsplash.com/photo-1612699878381-1ca65b3d11df?w=800", consumables: [], form_id: "f4", active: true, created_at: day(-75) },
  { id: "p12", name: "Massagem Relaxante",            category: "Bem-estar",description: "60 minutos de relaxamento profundo com aromaterapia.",          duration_min: 60, price: 150, image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800", consumables: [{ product_id: "i8", qty: 1 }], form_id: "f3", active: true, created_at: day(-70) },
  { id: "p13", name: "Design de Sobrancelhas",        category: "Estética", description: "Design personalizado com henna ou natural.",                     duration_min: 30, price: 70,  image_url: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800", consumables: [], form_id: "f1", active: true, created_at: day(-60) },
  { id: "p14", name: "Lash Lifting + Tintura",        category: "Estética", description: "Curvatura e definição natural dos cílios.",                     duration_min: 60, price: 130, image_url: "https://images.unsplash.com/photo-1531214159270-09907fab8e1e?w=800", consumables: [{ product_id: "i11", qty: 1 }], form_id: "f1", active: true, created_at: day(-55) },
  { id: "p15", name: "Bioestimulador de Colágeno",    category: "Injetável",description: "Estimula produção natural de colágeno (Sculptra/Radiesse).",    duration_min: 60, price: undefined, image_url: "https://images.unsplash.com/photo-1614859455050-90c8a3e7fef9?w=800", consumables: [{ product_id: "i12", qty: 1 }], form_id: "f2", active: true, created_at: day(-50) },
  { id: "p16", name: "Skinbooster",                    category: "Injetável",description: "Hidratação profunda e melhora de textura.",                     duration_min: 45, price: 850, image_url: "https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=800", consumables: [{ product_id: "i13", qty: 1 }], form_id: "f2", active: true, created_at: day(-45) },
  { id: "p17", name: "Microagulhamento Capilar",      category: "Capilar",  description: "Estímulo para queda e calvície inicial.",                        duration_min: 45, price: 250, image_url: "https://images.unsplash.com/photo-1559599076-9c61d8e1b77c?w=800", consumables: [{ product_id: "i14", qty: 1 }], form_id: "f1", active: true, created_at: day(-40) },
  { id: "p18", name: "Carboxiterapia",                category: "Corporal", description: "Aplicação de CO² para celulite e estrias.",                      duration_min: 30, price: 180, image_url: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800", consumables: [{ product_id: "i15", qty: 1 }], form_id: "f3", active: true, created_at: day(-30) },
  { id: "p19", name: "Avaliação Inicial",              category: "Avaliação",description: "Anamnese completa para plano personalizado.",                    duration_min: 45, price: 0,   image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800", consumables: [], form_id: "f5", active: true, created_at: day(-20) },
  { id: "p20", name: "Pacote Noiva — 6 sessões",      category: "Pacote",   description: "Limpeza + peeling + hidratação até o grande dia.",               duration_min: 90, price: 1980, image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", consumables: [{ product_id: "i1", qty: 6 }], form_id: "f1", active: true, created_at: day(-15) },
];

// ---------- Inventory ----------
export const mockInventory: InventoryProduct[] = [
  { id: "i1",  name: "Sabonete de Limpeza Profunda", brand: "Adcos",         unit: "ml", qty_on_hand: 320, qty_min: 200, last_purchase: { date: day(-22), qty: 500, total_cost: 380 }, avg_unit_cost: 0.76, category: "Facial" },
  { id: "i2",  name: "Esfoliante Diamante 50g",      brand: "Buona Vita",    unit: "g",  qty_on_hand: 90,  qty_min: 100, last_purchase: { date: day(-40), qty: 200, total_cost: 320 }, avg_unit_cost: 1.60, category: "Facial" },
  { id: "i3",  name: "Vitamina C Drug Delivery",     brand: "Skinceuticals", unit: "ml", qty_on_hand: 45,  qty_min: 30,  last_purchase: { date: day(-10), qty: 60,  total_cost: 540 }, avg_unit_cost: 9.00, category: "Facial" },
  { id: "i4",  name: "Agulhas para Microagulhamento", brand: "DermaPen",     unit: "un", qty_on_hand: 18,  qty_min: 25,  last_purchase: { date: day(-30), qty: 50,  total_cost: 650 }, avg_unit_cost: 13.00, category: "Descartável" },
  { id: "i5",  name: "Soro Hydrafacial",             brand: "Hydrafacial",   unit: "ml", qty_on_hand: 240, qty_min: 200, last_purchase: { date: day(-25), qty: 300, total_cost: 1500 }, avg_unit_cost: 5.00, category: "Facial" },
  { id: "i6",  name: "Toxina Botulínica 100u",       brand: "Botox Allergan",unit: "u",  qty_on_hand: 320, qty_min: 200, last_purchase: { date: day(-15), qty: 400, total_cost: 4400 }, avg_unit_cost: 11.00, expires_at: day(180), category: "Injetável" },
  { id: "i7",  name: "Ácido Hialurônico 1ml",        brand: "Juvederm",      unit: "ml", qty_on_hand: 8,   qty_min: 6,   last_purchase: { date: day(-50), qty: 10,  total_cost: 7800 }, avg_unit_cost: 780, expires_at: day(220), category: "Injetável" },
  { id: "i8",  name: "Óleo Essencial Lavanda",       brand: "WNF",           unit: "ml", qty_on_hand: 280, qty_min: 200, last_purchase: { date: day(-35), qty: 500, total_cost: 220 }, avg_unit_cost: 0.44, category: "Massagem" },
  { id: "i9",  name: "Manta Aplicadora Crio",         brand: "Adoxy",         unit: "un", qty_on_hand: 6,   qty_min: 4,   last_purchase: { date: day(-90), qty: 8, total_cost: 1200 }, avg_unit_cost: 150, category: "Descartável" },
  { id: "i10", name: "Gel Condutor Radiofreq.",      brand: "RMC",           unit: "ml", qty_on_hand: 180, qty_min: 150, last_purchase: { date: day(-20), qty: 300, total_cost: 240 }, avg_unit_cost: 0.80, category: "Aparelho" },
  { id: "i11", name: "Kit Lash Lifting",             brand: "Yumi",          unit: "un", qty_on_hand: 12,  qty_min: 10,  last_purchase: { date: day(-60), qty: 20, total_cost: 480 }, avg_unit_cost: 24, category: "Estética" },
  { id: "i12", name: "Bioestimulador Sculptra",      brand: "Galderma",      unit: "fr", qty_on_hand: 4,   qty_min: 3,   last_purchase: { date: day(-12), qty: 5,  total_cost: 9500 }, avg_unit_cost: 1900, expires_at: day(300), category: "Injetável" },
  { id: "i13", name: "Skinbooster Restylane",        brand: "Galderma",      unit: "ml", qty_on_hand: 9,   qty_min: 6,   last_purchase: { date: day(-8),  qty: 10, total_cost: 6800 }, avg_unit_cost: 680, expires_at: day(240), category: "Injetável" },
  { id: "i14", name: "Sérum Capilar Peptídeos",      brand: "Theraskin",     unit: "ml", qty_on_hand: 120, qty_min: 100, last_purchase: { date: day(-18), qty: 200, total_cost: 480 }, avg_unit_cost: 2.40, category: "Capilar" },
  { id: "i15", name: "Cilindro CO² Medicinal",       brand: "White Martins", unit: "L",  qty_on_hand: 1,   qty_min: 2,   last_purchase: { date: day(-110), qty: 2, total_cost: 480 }, avg_unit_cost: 240, category: "Aparelho" },
  { id: "i16", name: "Máscara de LED",               brand: "BiosLight",     unit: "un", qty_on_hand: 2,   qty_min: 1,   last_purchase: { date: day(-200), qty: 2, total_cost: 4800 }, avg_unit_cost: 2400, category: "Aparelho" },
  { id: "i17", name: "Algodão Premium 500g",         brand: "Cremer",        unit: "g",  qty_on_hand: 1500,qty_min: 800, last_purchase: { date: day(-7),  qty: 2000, total_cost: 80 }, avg_unit_cost: 0.04, category: "Descartável" },
  { id: "i18", name: "Luvas Nitrílica P",            brand: "Descarpack",    unit: "un", qty_on_hand: 60,  qty_min: 100, last_purchase: { date: day(-25), qty: 200, total_cost: 90 }, avg_unit_cost: 0.45, category: "Descartável" },
];

// ---------- Clients (50+) ----------
const firstNames = ["Ana","Beatriz","Carolina","Daniela","Eduarda","Fernanda","Giovanna","Helena","Isabela","Júlia","Karen","Larissa","Mariana","Natália","Olívia","Patrícia","Renata","Sofia","Tatiane","Vanessa","Bianca","Camila","Débora","Elaine","Flávia","Gabriela","Heloísa","Letícia","Manuela","Nicole"];
const lastNames = ["Silva","Souza","Oliveira","Pereira","Costa","Rodrigues","Almeida","Carvalho","Gomes","Martins","Lima","Araújo","Ribeiro","Cardoso","Mendes","Barbosa"];
const conditionsPool = ["Hipertensão", "Diabetes tipo 2", "Hipotireoidismo", "Gestante (24sem)", "Lactante", "Anemia leve"];
const allergiesPool = [
  { name: "Lidocaína", severity: "high" as const },
  { name: "Látex", severity: "medium" as const },
  { name: "Níquel", severity: "low" as const },
  { name: "Frutos do mar", severity: "medium" as const },
  { name: "Penicilina", severity: "high" as const },
];

export const mockClinicClients: ClinicClient[] = Array.from({ length: 56 }, (_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const id = `cl${i + 1}`;
  const tags: string[] = [];
  if (i % 11 === 0) tags.push("VIP");
  if (i % 7 === 0) tags.push("Fidelidade");
  if (i % 9 === 0) tags.push("Indicação");
  return {
    id,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
    phone: `(11) 9${String(8000 + i).padStart(4, "0")}-${String(1000 + i * 7).padStart(4, "0")}`,
    birthdate: new Date(1985 + (i % 25), i % 12, (i % 27) + 1).toISOString(),
    cpf: `${String(100 + i)}.${String(200 + i)}.${String(300 + i)}-${String(10 + (i % 89)).padStart(2, "0")}`,
    address: `Rua das Flores, ${100 + i * 3} — São Paulo/SP`,
    instagram: `@${fn.toLowerCase()}_${ln.toLowerCase().slice(0,3)}`,
    tags,
    allergies: i % 5 === 0 ? [allergiesPool[i % allergiesPool.length]] : [],
    medications: i % 6 === 0 ? ["Anticoncepcional"] : [],
    conditions: i % 8 === 0 ? [conditionsPool[i % conditionsPool.length]] : [],
    surgeries: i % 13 === 0 ? [{ name: "Apendicectomia", year: 2015 + (i % 8) }] : [],
    notes: i % 4 === 0 ? "Cliente sensível a luz. Preferência por horários da tarde." : undefined,
    created_at: day(-300 + i * 4),
    first_visit_at: day(-260 + i * 4),
  };
});

// ---------- Appointments (passados e futuros) ----------
export const mockAppointments: Appointment[] = (() => {
  const list: Appointment[] = [];
  let id = 1;
  // Passados (90 dias)
  for (let d = -90; d <= -1; d++) {
    const count = (d % 4 === 0) ? 0 : 1 + ((Math.abs(d) % 4));
    for (let k = 0; k < count; k++) {
      const proc = mockProcedures[(Math.abs(d) + k) % mockProcedures.length];
      const client = mockClinicClients[(Math.abs(d) * 3 + k) % mockClinicClients.length];
      list.push({
        id: `ap${id++}`,
        client_id: client.id,
        procedure_id: proc.id,
        start_at: at(d, 9 + (k * 2), 0),
        duration_min: proc.duration_min,
        status: Math.random() > 0.1 ? "done" : "no_show",
        price_charged: proc.price ?? 600,
        created_at: at(d - 7, 10),
      });
    }
  }
  // Futuros (30 dias)
  for (let d = 0; d <= 30; d++) {
    const count = d === 0 ? 5 : (d % 7 === 0 ? 0 : 2 + (d % 3));
    for (let k = 0; k < count; k++) {
      const proc = mockProcedures[(d * 5 + k) % mockProcedures.length];
      const client = mockClinicClients[(d * 7 + k * 3) % mockClinicClients.length];
      list.push({
        id: `ap${id++}`,
        client_id: client.id,
        procedure_id: proc.id,
        start_at: at(d, 9 + (k * 2), k % 2 === 0 ? 0 : 30),
        duration_min: proc.duration_min,
        status: d === 0 ? (k < 2 ? "done" : "confirmed") : (Math.random() > 0.5 ? "confirmed" : "scheduled"),
        price_charged: proc.price ?? 600,
        created_at: at(d - 14, 10),
      });
    }
  }
  return list;
})();

// ---------- Forms ----------
export const mockForms: ClinicForm[] = [
  {
    id: "f1", name: "Anamnese Estética Facial", description: "Avaliação inicial para procedimentos faciais.", published: true, created_at: day(-90),
    theme: { color: "#0e8a9e" },
    fields: [
      { id: "q1", type: "short_text", label: "Nome completo", required: true },
      { id: "q2", type: "phone", label: "WhatsApp", required: true },
      { id: "q3", type: "email", label: "E-mail" },
      { id: "q4", type: "date", label: "Data de nascimento" },
      { id: "q5", type: "multi_select", label: "Quais suas principais queixas?", options: ["Manchas", "Acne", "Linhas finas", "Flacidez", "Olheiras", "Poros dilatados"] },
      { id: "q6", type: "radio", label: "Possui alguma alergia conhecida?", options: ["Sim", "Não"], required: true },
      { id: "q7", type: "long_text", label: "Se sim, qual?", show_if: { field_id: "q6", equals: "Sim" } },
      { id: "q8", type: "image_upload", label: "Foto sem maquiagem (opcional)" },
      { id: "q9", type: "scheduler", label: "Escolha um horário para sua avaliação" },
      { id: "q10", type: "terms", label: "Aceito a política de privacidade", required: true },
    ],
  },
  { id: "f2", name: "Pré-procedimento Injetável", description: "Triagem para botox e preenchimento.", published: true, created_at: day(-80), fields: [
    { id: "q1", type: "short_text", label: "Nome", required: true },
    { id: "q2", type: "phone", label: "WhatsApp", required: true },
    { id: "q3", type: "radio", label: "Está gestante ou amamentando?", options: ["Sim", "Não"], required: true },
    { id: "q4", type: "radio", label: "Toma anticoagulantes?", options: ["Sim", "Não"], required: true },
    { id: "q5", type: "multi_select", label: "Áreas de interesse", options: ["Testa", "Glabela", "Pés-de-galinha", "Lábios", "Maçãs do rosto", "Mandíbula"] },
  ]},
  { id: "f3", name: "Anamnese Corporal", description: "Procedimentos corporais.", published: true, created_at: day(-70), fields: [
    { id: "q1", type: "short_text", label: "Nome", required: true },
    { id: "q2", type: "phone", label: "WhatsApp", required: true },
    { id: "q3", type: "scale", label: "Como avalia sua autoestima corporal hoje? (1-10)", min: 1, max: 10 },
    { id: "q4", type: "multi_select", label: "Áreas que deseja tratar", options: ["Abdômen", "Flancos", "Coxas", "Braços", "Glúteos", "Costas"] },
  ]},
  { id: "f4", name: "Captação Depilação a Laser", description: "Funil para sessões de laser.", published: true, created_at: day(-60), fields: [
    { id: "q1", type: "short_text", label: "Nome", required: true },
    { id: "q2", type: "phone", label: "WhatsApp", required: true },
    { id: "q3", type: "multi_select", label: "Áreas de interesse", options: ["Axilas", "Pernas", "Buço", "Virilha", "Rosto inteiro"] },
  ]},
  { id: "f5", name: "Avaliação Inicial Gratuita", description: "Captação geral.", published: true, created_at: day(-50), fields: [
    { id: "q1", type: "short_text", label: "Nome completo", required: true },
    { id: "q2", type: "phone", label: "WhatsApp", required: true },
    { id: "q3", type: "select", label: "Como nos conheceu?", options: ["Instagram", "Indicação", "Google", "Outro"] },
    { id: "q4", type: "scheduler", label: "Agende sua avaliação gratuita" },
  ]},
];

// ---------- Leads (Kanban) ----------
const stages = ["new","contacted","scheduled","showed","converted","lost"] as const;
export const mockLeads: Lead[] = Array.from({ length: 84 }, (_, i) => {
  const stage = stages[i % stages.length];
  const proc = mockProcedures[i % mockProcedures.length];
  const form = mockForms[i % mockForms.length];
  const fn = firstNames[(i + 3) % firstNames.length];
  const ln = lastNames[(i + 5) % lastNames.length];
  return {
    id: `ld${i + 1}`,
    name: `${fn} ${ln}`,
    phone: `(11) 9${String(7000 + i).padStart(4, "0")}-${String(2000 + i).padStart(4, "0")}`,
    email: `${fn.toLowerCase()}@email.com`,
    procedure_interest_id: proc.id,
    form_id: form.id,
    responses: { Nome: `${fn} ${ln}`, "Áreas de interesse": ["Lábios", "Glabela"][i % 2], "Como nos conheceu?": ["Instagram", "Indicação", "Google"][i % 3] },
    stage,
    source: ["Instagram","Google","Indicação","Site"][i % 4],
    notes: i % 3 === 0 ? [{ id: "n1", body: "Cliente pediu para retornar contato à tarde.", created_at: day(-1) }] : [],
    created_at: day(-(i % 30)),
    stage_changed_at: day(-(i % 14)),
  };
});

// ---------- Finance (6 meses) ----------
export const mockFinance: FinanceEntry[] = (() => {
  const list: FinanceEntry[] = [];
  let id = 1;
  // Recorrentes
  list.push(
    { id: `fe${id++}`, kind: "expense", category: "Aluguel", description: "Aluguel da clínica", amount: 4500, date: day(-180), frequency: "monthly", paid: true },
    { id: `fe${id++}`, kind: "expense", category: "Pessoal", description: "Salário recepcionista", amount: 2200, date: day(-180), frequency: "monthly", paid: true },
    { id: `fe${id++}`, kind: "expense", category: "Pessoal", description: "Salário esteticista", amount: 3500, date: day(-180), frequency: "monthly", paid: true },
    { id: `fe${id++}`, kind: "expense", category: "Marketing", description: "Tráfego pago Instagram", amount: 1800, date: day(-180), frequency: "monthly", paid: true },
    { id: `fe${id++}`, kind: "expense", category: "Software", description: "Lumière SaaS", amount: 197, date: day(-180), frequency: "monthly", paid: true },
    { id: `fe${id++}`, kind: "expense", category: "Limpeza", description: "Limpeza terceirizada", amount: 600, date: day(-180), frequency: "monthly", paid: true },
  );
  // Avulsos
  for (let m = -5; m <= 0; m++) {
    list.push({ id: `fe${id++}`, kind: "expense", category: "Insumos", description: "Compra de insumos do mês", amount: 1200 + (Math.abs(m) * 80), date: day(m * 30), frequency: "once", paid: m < 0 });
    list.push({ id: `fe${id++}`, kind: "expense", category: "Manutenção", description: "Manutenção aparelho", amount: 380, date: day(m * 30 + 5), frequency: "once", paid: m < 0 });
  }
  // Parcelamento de equipamento
  list.push({ id: `fe${id++}`, kind: "expense", category: "Equipamento", description: "Aparelho de Radiofrequência", amount: 12000, date: day(-90), frequency: "monthly", installments: { total: 12, paid: 3, per_installment: 1000 }, paid: false });
  // Receitas (espelham appointments concluídos)
  mockAppointments.filter(a => a.status === "done").slice(0, 80).forEach(a => {
    list.push({ id: `fe${id++}`, kind: "income", category: "Procedimentos", description: `Procedimento — ${a.id}`, amount: a.price_charged ?? 0, date: a.start_at, frequency: "once", appointment_id: a.id, paid: true });
  });
  return list;
})();

// ---------- Procedure Logs ----------
export const mockProcedureLogs: Procedurelog[] = mockAppointments.filter(a => a.status === "done").slice(0, 30).map((a, i) => ({
  id: `pl${i + 1}`,
  client_id: a.client_id,
  procedure_id: a.procedure_id,
  appointment_id: a.id,
  date: a.start_at,
  evolution: "Sessão realizada sem intercorrências. Pele reagiu bem ao protocolo. Próxima sessão em 30 dias.",
  photos_before: [],
  photos_after: [],
  prescriptions: i % 3 === 0 ? "Hidratação 2x ao dia, protetor solar FPS 60." : undefined,
}));
