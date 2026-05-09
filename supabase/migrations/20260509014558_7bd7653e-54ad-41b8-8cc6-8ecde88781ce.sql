
CREATE OR REPLACE FUNCTION public.consume_stock_on_complete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE r record;
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') AND NEW.procedure_id IS NOT NULL THEN
    FOR r IN SELECT product_id, quantity_used FROM public.procedure_products WHERE procedure_id = NEW.procedure_id LOOP
      INSERT INTO public.stock_movements (clinic_id, product_id, type, quantity, reason, appointment_id)
      VALUES (NEW.clinic_id, r.product_id, 'out', r.quantity_used, 'Consumo automático em atendimento', NEW.id);
    END LOOP;
  END IF;
  RETURN NEW;
END $$;
