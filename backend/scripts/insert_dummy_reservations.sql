-- Este script inserta 100 reservas de prueba usando datos inventados.
-- Requiere que existan usuarios, laboratorios, estados y tipos de reserva con nombres conocidos.

DO $$
DECLARE
  admin_id TEXT;
  lab_ids INTEGER[];
  state_pending INTEGER;
  state_approved INTEGER;
  state_rejected INTEGER;
  type_class INTEGER;
  type_event INTEGER;
  start_times TIME[] := ARRAY[
    '08:00:00'::time,
    '10:00:00'::time,
    '12:30:00'::time,
    '14:00:00'::time,
    '16:00:00'::time,
    '18:00:00'::time
  ];
  start_date_base DATE := DATE '2026-03-01';
  idx INTEGER;
  chosen_lab INTEGER;
  chosen_start TIME;
  chosen_end TIME;
  chosen_type INTEGER;
  chosen_state INTEGER;
BEGIN
  SELECT id INTO admin_id FROM "public"."user" WHERE username = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el usuario "admin".';
  END IF;

  SELECT array_agg(id ORDER BY number) INTO lab_ids
  FROM laboratories
  WHERE active IS TRUE;
  IF lab_ids IS NULL OR array_length(lab_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'No existen laboratorios activos para asociar a las reservas.';
  END IF;

  SELECT id INTO state_pending FROM states WHERE name = 'PENDIENTE' LIMIT 1;
  SELECT id INTO state_approved FROM states WHERE name = 'APROBADO' LIMIT 1;
  SELECT id INTO state_rejected FROM states WHERE name = 'RECHAZADO' LIMIT 1;
  IF state_pending IS NULL OR state_approved IS NULL OR state_rejected IS NULL THEN
    RAISE EXCEPTION 'Faltan estados obligatorios (PENDIENTE, APROBADO, RECHAZADO).';
  END IF;

  SELECT id INTO type_class FROM reserve_types WHERE name = 'CLASE' LIMIT 1;
  SELECT id INTO type_event FROM reserve_types WHERE name = 'EVENTO' LIMIT 1;
  IF type_class IS NULL OR type_event IS NULL THEN
    RAISE EXCEPTION 'Faltan tipos de reserva CLASE o EVENTO.';
  END IF;

  FOR idx IN 1..20 LOOP
    chosen_lab := lab_ids[((idx - 1) % array_length(lab_ids, 1)) + 1];
    chosen_start := start_times[((idx - 1) % array_length(start_times, 1)) + 1];
    chosen_end := (chosen_start + INTERVAL '2 hours')::time;
    chosen_type := CASE WHEN (idx % 2 = 0) THEN type_event ELSE type_class END;
    chosen_state := CASE
      WHEN (idx % 5 = 0) THEN state_rejected
      WHEN (idx % 3 = 0) THEN state_approved
      ELSE state_pending
    END;

    INSERT INTO reservations (
      name,
      start_date,
      end_date,
      rrule,
      default_start_time,
      default_end_time,
      created_at,
      approved_at,
      user_id,
      laboratorie_id,
      state_id,
      type_id
    ) VALUES (
      format('Reserva de prueba #%s', idx),
      start_date_base + ((idx - 1) % 30),
      start_date_base + ((idx - 1) % 30) + (CASE WHEN chosen_type = type_event THEN 0 ELSE 1 END),
      CASE
        WHEN chosen_type = type_class AND (idx % 10 = 0) THEN 'FREQ=WEEKLY;COUNT=4;BYDAY=MO'
        WHEN chosen_type = type_event AND (idx % 15 = 0) THEN 'FREQ=MONTHLY;COUNT=2;BYDAY=FR'
        ELSE NULL
      END,
      chosen_start,
      chosen_end,
      now() - ((100 - idx)::TEXT || ' days')::interval,
      CASE
        WHEN chosen_state = state_approved THEN now() - ((100 - idx)::TEXT || ' hours')::interval
        WHEN chosen_state = state_rejected THEN now() - ((100 - idx)::TEXT || ' hours')::interval * 2
        ELSE NULL
      END,
      admin_id,
      chosen_lab,
      chosen_state,
      chosen_type
    );
  END LOOP;
END
$$;
