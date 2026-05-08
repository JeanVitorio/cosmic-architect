import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClinic(slug: string) {
  return useQuery({
    queryKey: ["clinic", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("clinics").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data;
    },
  });
}
