import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const DEMO_EMAIL = "demo@una.app";
const DEMO_PASSWORD = "demo123456";
const DEMO_SLUG = "demo";

export const ensureDemoAccount = createServerFn({ method: "POST" }).handler(async () => {
  // 1. Ensure user exists
  let userId: string | undefined;
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Demo Una", phone: "11999999999" },
    });
    if (error) throw new Error(error.message);
    userId = created.user!.id;
  }
  if (!userId) throw new Error("Falha ao garantir usuário demo");

  // 2. Ensure profile
  await supabaseAdmin.from("profiles").upsert({ id: userId, full_name: "Demo Una", phone: "11999999999" });

  // 3. Ensure clinic
  let clinicId: string;
  const { data: clinic } = await supabaseAdmin.from("clinics").select("id").eq("slug", DEMO_SLUG).maybeSingle();
  if (clinic) {
    clinicId = clinic.id;
    await supabaseAdmin.from("clinics").update({ status: "active" }).eq("id", clinicId);
  } else {
    const { data: nc, error } = await supabaseAdmin.from("clinics").insert({
      name: "Clínica Demo UNA",
      slug: DEMO_SLUG,
      status: "active",
      email: DEMO_EMAIL,
      phone: "11999999999",
      primary_color: "#1E5FFF",
      plan: "pro",
    }).select("id").single();
    if (error) throw new Error(error.message);
    clinicId = nc.id;
  }

  // 4. Ensure membership
  const { data: member } = await supabaseAdmin.from("clinic_members")
    .select("id").eq("clinic_id", clinicId).eq("user_id", userId).maybeSingle();
  if (!member) {
    await supabaseAdmin.from("clinic_members").insert({
      clinic_id: clinicId, user_id: userId, role: "owner", active: true,
    });
  }

  // 5. Seed sample data (only if empty)
  const { count: clientsCount } = await supabaseAdmin.from("clients")
    .select("id", { count: "exact", head: true }).eq("clinic_id", clinicId);

  if ((clientsCount ?? 0) === 0) {
    // Procedures
    const { data: procs } = await supabaseAdmin.from("procedures").insert([
      { clinic_id: clinicId, name: "Limpeza de Pele", description: "Limpeza profunda + extração", price: 180, duration_min: 60 },
      { clinic_id: clinicId, name: "Botox Testa", description: "Aplicação de toxina botulínica", price: 850, duration_min: 45 },
      { clinic_id: clinicId, name: "Drenagem Linfática", description: "Sessão de 60min", price: 150, duration_min: 60 },
      { clinic_id: clinicId, name: "Microagulhamento", description: "Estímulo de colágeno", price: 450, duration_min: 90 },
      { clinic_id: clinicId, name: "Peeling Químico", description: "Renovação celular", price: 320, duration_min: 60 },
    ]).select("id, name, price");

    // Professionals
    const { data: profs } = await supabaseAdmin.from("professionals").insert([
      { clinic_id: clinicId, name: "Dra. Ana Souza", color: "#1E5FFF", specialties: ["Estética facial", "Botox"] },
      { clinic_id: clinicId, name: "Dra. Beatriz Lima", color: "#22D3EE", specialties: ["Limpeza", "Peeling"] },
      { clinic_id: clinicId, name: "Carla Mendes", color: "#34E0B8", specialties: ["Drenagem", "Massagem"] },
    ]).select("id, name");

    // Rooms
    await supabaseAdmin.from("rooms").insert([
      { clinic_id: clinicId, name: "Sala 1" },
      { clinic_id: clinicId, name: "Sala 2" },
      { clinic_id: clinicId, name: "Sala VIP" },
    ]);

    // Clients
    const { data: clients } = await supabaseAdmin.from("clients").insert([
      { clinic_id: clinicId, full_name: "Mariana Oliveira", email: "mariana@example.com", phone: "11988887777", birth_date: "1990-05-12", tags: ["VIP"] },
      { clinic_id: clinicId, full_name: "Juliana Costa", email: "juliana@example.com", phone: "11977776666", birth_date: "1985-08-22", tags: ["Recorrente"] },
      { clinic_id: clinicId, full_name: "Patricia Alves", email: "patricia@example.com", phone: "11966665555", birth_date: "1992-03-08" },
      { clinic_id: clinicId, full_name: "Renata Silva", email: "renata@example.com", phone: "11955554444", birth_date: "1988-11-30", tags: ["Novo"] },
      { clinic_id: clinicId, full_name: "Camila Rocha", email: "camila@example.com", phone: "11944443333", birth_date: "1995-07-15" },
      { clinic_id: clinicId, full_name: "Fernanda Dias", email: "fernanda@example.com", phone: "11933332222", birth_date: "1991-02-19", tags: ["VIP", "Recorrente"] },
    ]).select("id, full_name");

    // Appointments (next 7 days)
    if (procs && profs && clients) {
      const now = new Date();
      const appts = [];
      for (let i = 0; i < 12; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() + Math.floor(i / 3));
        day.setHours(9 + (i % 8), 0, 0, 0);
        const proc = procs[i % procs.length];
        const end = new Date(day.getTime() + 60 * 60 * 1000);
        appts.push({
          clinic_id: clinicId,
          client_id: clients[i % clients.length].id,
          professional_id: profs[i % profs.length].id,
          procedure_id: proc.id,
          starts_at: day.toISOString(),
          ends_at: end.toISOString(),
          status: (i < 3 ? "done" : "scheduled") as "done" | "scheduled",
        });
      }
      await supabaseAdmin.from("appointments").insert(appts);

      // Payments
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      await supabaseAdmin.from("payments").insert([
        { clinic_id: clinicId, client_id: clients[0].id, amount: 850, method: "pix", status: "paid", paid_at: monthStart.toISOString() },
        { clinic_id: clinicId, client_id: clients[1].id, amount: 180, method: "cartão", status: "paid", paid_at: new Date(monthStart.getTime() + 86400000 * 3).toISOString() },
        { clinic_id: clinicId, client_id: clients[2].id, amount: 450, method: "pix", status: "paid", paid_at: new Date(monthStart.getTime() + 86400000 * 7).toISOString() },
        { clinic_id: clinicId, client_id: clients[3].id, amount: 320, method: "dinheiro", status: "pending" },
        { clinic_id: clinicId, client_id: clients[4].id, amount: 1500, method: "cartão", status: "paid", paid_at: new Date(monthStart.getTime() + 86400000 * 12).toISOString() },
      ]);

      // Packages
      await supabaseAdmin.from("packages").insert([
        { clinic_id: clinicId, client_id: clients[0].id, procedure_id: procs[0].id, total_sessions: 10, used_sessions: 3, price: 1500, status: "active" },
        { clinic_id: clinicId, client_id: clients[5].id, procedure_id: procs[2].id, total_sessions: 8, used_sessions: 2, price: 1100, status: "active" },
      ]);

      // Lead form + leads
      const { data: form } = await supabaseAdmin.from("lead_forms").insert({
        clinic_id: clinicId, slug: "promo-botox", headline: "Botox em promoção",
        subheadline: "Agende sua avaliação gratuita", procedure_id: procs[1].id, active: true,
      }).select("id").single();

      if (form) {
        await supabaseAdmin.from("leads").insert([
          { clinic_id: clinicId, lead_form_id: form.id, name: "Aline Pereira", phone: "11900001111", email: "aline@ex.com", source: "instagram", status: "new" },
          { clinic_id: clinicId, lead_form_id: form.id, name: "Bruna Nogueira", phone: "11900002222", source: "facebook", status: "contacted" },
          { clinic_id: clinicId, lead_form_id: form.id, name: "Carolina Mota", phone: "11900003333", email: "carol@ex.com", source: "google", status: "scheduled" },
          { clinic_id: clinicId, lead_form_id: form.id, name: "Daniela Reis", phone: "11900004444", source: "indicação", status: "new" },
        ]);
      }
    }
  }

  return { email: DEMO_EMAIL, password: DEMO_PASSWORD, slug: DEMO_SLUG };
});
