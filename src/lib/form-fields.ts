// Schema dinâmico de campos para o Form Builder
export type FieldType =
  | "text" | "textarea" | "email" | "phone" | "number" | "date" | "time" | "datetime"
  | "select" | "multiselect" | "radio" | "checkbox" | "rating"
  | "image" | "heading" | "paragraph" | "address" | "cpf" | "acceptance" | "file";

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: string[];
  imageUrl?: string;
  content?: string;
  max?: number;
};

export const FIELD_CATALOG: { type: FieldType; label: string; icon: string; description: string }[] = [
  { type: "text", label: "Texto curto", icon: "Type", description: "Nome, título, palavra única" },
  { type: "textarea", label: "Texto longo", icon: "AlignLeft", description: "Mensagem, observações" },
  { type: "email", label: "E-mail", icon: "Mail", description: "Validação automática" },
  { type: "phone", label: "WhatsApp / Telefone", icon: "Phone", description: "Máscara brasileira" },
  { type: "number", label: "Número", icon: "Hash", description: "Valor numérico" },
  { type: "cpf", label: "CPF", icon: "CreditCard", description: "Documento brasileiro" },
  { type: "date", label: "Data", icon: "Calendar", description: "Data isolada" },
  { type: "time", label: "Hora", icon: "Clock", description: "Horário isolado" },
  { type: "datetime", label: "Agendar (data + hora)", icon: "CalendarClock", description: "Cria agendamento real" },
  { type: "select", label: "Lista (escolha 1)", icon: "ChevronDown", description: "Dropdown" },
  { type: "multiselect", label: "Lista (várias)", icon: "List", description: "Múltipla escolha" },
  { type: "radio", label: "Botões de opção", icon: "Circle", description: "Escolha única visível" },
  { type: "checkbox", label: "Caixas de seleção", icon: "CheckSquare", description: "Várias visíveis" },
  { type: "rating", label: "Avaliação (estrelas)", icon: "Star", description: "1 a 5 estrelas" },
  { type: "address", label: "Endereço", icon: "MapPin", description: "Rua, número, cidade" },
  { type: "file", label: "Upload de arquivo", icon: "Upload", description: "PDF, imagem etc" },
  { type: "image", label: "Bloco de imagem", icon: "Image", description: "Mostrar imagem no formulário" },
  { type: "heading", label: "Título", icon: "Heading", description: "Seção / divisão" },
  { type: "paragraph", label: "Parágrafo", icon: "FileText", description: "Texto explicativo" },
  { type: "acceptance", label: "Aceite / Termo", icon: "ShieldCheck", description: "Concordo com..." },
];

export function newField(type: FieldType): FormField {
  const id = type + "_" + Math.random().toString(36).slice(2, 7);
  const base: FormField = { id, type, label: "" };
  switch (type) {
    case "text": return { ...base, label: "Nome", placeholder: "Seu nome" };
    case "textarea": return { ...base, label: "Mensagem", placeholder: "Digite aqui..." };
    case "email": return { ...base, label: "E-mail", placeholder: "voce@exemplo.com" };
    case "phone": return { ...base, label: "WhatsApp", placeholder: "(11) 99999-9999", required: true };
    case "number": return { ...base, label: "Número" };
    case "cpf": return { ...base, label: "CPF" };
    case "date": return { ...base, label: "Data" };
    case "time": return { ...base, label: "Horário" };
    case "datetime": return { ...base, label: "Quando deseja ser atendida?", required: true };
    case "select": return { ...base, label: "Selecione", options: ["Opção 1", "Opção 2"] };
    case "multiselect": return { ...base, label: "Selecione (várias)", options: ["Opção 1", "Opção 2"] };
    case "radio": return { ...base, label: "Escolha", options: ["Sim", "Não"] };
    case "checkbox": return { ...base, label: "Marque as opções", options: ["Opção 1", "Opção 2"] };
    case "rating": return { ...base, label: "Sua avaliação", max: 5 };
    case "address": return { ...base, label: "Endereço" };
    case "file": return { ...base, label: "Anexo" };
    case "image": return { ...base, label: "", imageUrl: "" };
    case "heading": return { ...base, label: "Seção", content: "Sobre você" };
    case "paragraph": return { ...base, label: "", content: "Texto explicativo aqui." };
    case "acceptance": return { ...base, label: "Li e concordo com os termos", required: true };
  }
}

export const KANBAN_STAGES = [
  { id: "new", label: "Novo", color: "oklch(0.78 0.15 205)" },
  { id: "contacted", label: "Contatado", color: "oklch(0.78 0.16 75)" },
  { id: "scheduled", label: "Agendado", color: "oklch(0.62 0.22 305)" },
  { id: "converted", label: "Convertido", color: "oklch(0.7 0.16 165)" },
  { id: "lost", label: "Perdido", color: "oklch(0.6 0.04 260)" },
];

export function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3").trim();
}

export function maskCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2}).*/, (_, a, b, c, e) =>
    [a, b && "." + b, c && "." + c, e && "-" + e].filter(Boolean).join("")
  );
}
