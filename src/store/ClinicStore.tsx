import { createContext, useContext, useState, type ReactNode } from "react";
import {
  mockClinicClients, mockProcedures, mockInventory, mockAppointments,
  mockLeads, mockFinance, mockForms, mockProcedureLogs, mockSettings,
} from "@/data/clinicMock";
import type {
  ClinicClient, Procedure, InventoryProduct, Appointment, Lead,
  FinanceEntry, ClinicForm, Procedurelog, ClinicSettings,
} from "@/types/clinic";

interface ClinicState {
  clients: ClinicClient[];
  procedures: Procedure[];
  inventory: InventoryProduct[];
  appointments: Appointment[];
  leads: Lead[];
  finance: FinanceEntry[];
  forms: ClinicForm[];
  procedureLogs: Procedurelog[];
  settings: ClinicSettings;
  setClients: (c: ClinicClient[]) => void;
  setProcedures: (p: Procedure[]) => void;
  setInventory: (i: InventoryProduct[]) => void;
  setAppointments: (a: Appointment[]) => void;
  setLeads: (l: Lead[]) => void;
  setFinance: (f: FinanceEntry[]) => void;
  setForms: (f: ClinicForm[]) => void;
  setSettings: (s: ClinicSettings) => void;
}

const Ctx = createContext<ClinicState | null>(null);

export function ClinicStoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState(mockClinicClients);
  const [procedures, setProcedures] = useState(mockProcedures);
  const [inventory, setInventory] = useState(mockInventory);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [leads, setLeads] = useState(mockLeads);
  const [finance, setFinance] = useState(mockFinance);
  const [forms, setForms] = useState(mockForms);
  const [procedureLogs] = useState(mockProcedureLogs);
  const [settings, setSettings] = useState(mockSettings);

  return (
    <Ctx.Provider value={{
      clients, procedures, inventory, appointments, leads, finance, forms, procedureLogs, settings,
      setClients, setProcedures, setInventory, setAppointments, setLeads, setFinance, setForms, setSettings,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useClinic deve estar dentro de ClinicStoreProvider");
  return ctx;
}
