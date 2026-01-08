import { RoleEnum } from "@uneg-lab/api-types/auth.js";
import { dataSource } from "../src/config/typeorm.js";
import { Laboratory } from "../src/laboratories/entities/laboratory.entity.js";
import { ReserveType } from "../src/reservations/entities/reserve_type.entity.js";
import { State } from "../src/reservations/entities/state.entity.js";
import { User } from "../src/users/entities/user.entity.js";

import pkgRRule from "rrule";
import { DataSource } from "typeorm";
import { Class } from "../src/reservations/entities/class.entity.js";
import { Event } from "../src/reservations/entities/event.entity.js";
import { Ocupation } from "../src/reservations/entities/ocupation.entity.js";
import { Reservation } from "../src/reservations/entities/reservation.entity.js";
const { RRule, rrulestr } = pkgRRule;

async function seedReservations(ds: DataSource) {
  console.log("📅 Sembrando Reservas, Clases y Eventos...");

  const userRepo = ds.getRepository(User);
  const labRepo = ds.getRepository(Laboratory);
  const stateRepo = ds.getRepository(State);
  const typeRepo = ds.getRepository(ReserveType);
  const resRepo = ds.getRepository(Reservation);
  const ocupationRepo = ds.getRepository(Ocupation);
  const classRepo = ds.getRepository(Class);
  const eventRepo = ds.getRepository(Event);

  // 1. Obtener referencias necesarias
  const admin = await userRepo.findOneBy({ username: "admin" });
  const lab = await labRepo.findOneBy({ number: 1 });
  const stateAprobado = await stateRepo.findOneBy({ name: "APROBADO" });
  const typeClase = await typeRepo.findOneBy({ name: "CLASE" });
  const typeEvento = await typeRepo.findOneBy({ name: "EVENTO" });

  if (!admin || !lab || !stateAprobado || !typeClase || !typeEvento) {
    throw new Error(
      "❌ Error: No se encontraron los datos maestros. Asegúrate de que los seeders previos funcionaron.",
    );
  }

  // --- CASO 1: UNA CLASE RECURRENTE (Todos los Lunes de Enero y Febrero) ---
  const classResExists = await resRepo.findOneBy({
    name: "Programación III (Sección 1)",
  });
  if (!classResExists) {
    const resClase = resRepo.create({
      name: "Programación III (Sección 1)",
      startDate: new Date("2026-01-05"), // Primer lunes de enero
      endDate: new Date("2026-03-02"),
      rrule: "FREQ=WEEKLY;BYDAY=MO",
      defaultStartTime: "07:30:00",
      defaultEndTime: "09:10:00",
      user: admin,
      laboratory: lab,
      state: stateAprobado,
      type: typeClase,
    });
    const savedResClase = await resRepo.save(resClase);

    // Generar Ocupaciones
    const dates = generateDates(
      "2026-01-05",
      "2026-03-02",
      "FREQ=WEEKLY;BYDAY=MO",
    );
    const ocupations = dates.map((d) =>
      ocupationRepo.create({
        date: d,
        startHour: "07:30:00",
        endHour: "09:10:00",
        reservation: savedResClase,
      })
    );
    await ocupationRepo.save(ocupations);

    // Crear la instancia de Clase (Profesor)
    await classRepo.save(classRepo.create({
      professor: "Ing. Victor Hugo",
      reservation: savedResClase,
    }));
    console.log("✅ Clase recurrente creada con sus ocupaciones.");
  }

  // --- CASO 2: UN EVENTO ÚNICO (Conferencia) ---
  const eventResExists = await resRepo.findOneBy({
    name: "Taller de Ciberseguridad",
  });
  if (!eventResExists) {
    const resEvento = resRepo.create({
      name: "Taller de Ciberseguridad",
      startDate: new Date("2026-02-15"),
      defaultStartTime: "10:00:00",
      defaultEndTime: "12:00:00",
      user: admin,
      laboratory: lab,
      state: stateAprobado,
      type: typeEvento,
    });
    const savedResEvento = await resRepo.save(resEvento);

    // Generar Ocupación única
    await ocupationRepo.save(ocupationRepo.create({
      date: new Date("2026-02-15T12:00:00"),
      startHour: "10:00:00",
      endHour: "12:00:00",
      reservation: savedResEvento,
    }));

    // Crear la instancia de Evento (Asistentes)
    await eventRepo.save(eventRepo.create({
      stimatedAssistants: 45,
      reservation: savedResEvento,
    }));
    console.log("✅ Evento único creado con su ocupación.");
  }
}

function generateDates(start: string, end?: string, rruleStr?: string): Date[] {
  const startDate = new Date(`${start}T12:00:00`);
  if (!rruleStr) return [startDate];
  try {
    const rule = rrulestr(rruleStr, { dtstart: startDate });
    if (!rule.options.count && !rule.options.until) {
      const options = rule.options;
      if (end) options.until = new Date(`${end}T23:59:59`);
      else options.count = 10;
      return new RRule(options).all();
    }
    return rule.all();
  } catch (e) {
    return [startDate];
  }
}

async function seed() {
  const ds = await dataSource.initialize();
  console.log("🌱 Iniciando Seeding...");

  try {
    const stateRepo = ds.getRepository(State);
    const states = ["PENDIENTE", "APROBADO", "RECHAZADO", "CANCELADO"];
    for (const name of states) {
      const exists = await stateRepo.findOneBy({ name });
      if (!exists) {
        await stateRepo.save(stateRepo.create({ name }));
        console.log(`✅ Estado creado: ${name}`);
      }
    }

    const typeRepo = ds.getRepository(ReserveType);
    const types = [
      { name: "CLASE", priority: 10, needsApproval: false, blockDuration: 1.5 },
      { name: "EVENTO", priority: 5, needsApproval: true, blockDuration: 2 },
      {
        name: "MANTENIMIENTO",
        priority: 20,
        needsApproval: false,
        blockDuration: 4,
      },
    ];
    for (const t of types) {
      const exists = await typeRepo.findOneBy({ name: t.name });
      if (!exists) {
        await typeRepo.save(typeRepo.create(t));
        console.log(`✅ Tipo de reserva creado: ${t.name}`);
      }
    }

    const labRepo = ds.getRepository(Laboratory);
    const labName = "Sala de Computación - Villa Asia";
    const labExists = await labRepo.findOneBy({ name: labName });
    if (!labExists) {
      await labRepo.save(labRepo.create({
        name: labName,
        number: 1,
        active: true,
      }));
      console.log(`✅ Laboratorio creado: ${labName}`);
    }

    const userRepo = ds.getRepository(User);
    const adminUsername = "admin";
    const adminExists = await userRepo.findOneBy({ username: adminUsername });
    if (!adminExists) {
      const admin = userRepo.create({
        username: adminUsername,
        email: "admin@uneg.edu.ve",
        name: "Administrador del Sistema",
        password: "AdminPassword123!",
        role: RoleEnum.ADMIN,
      });
      await userRepo.save(admin);
      console.log(`✅ Usuario Admin creado. ID: ${admin.id}`);
    }
    await seedReservations(ds);
    console.log("✨ Seeding completado con éxito.");
  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
  } finally {
    await ds.destroy();
  }
}

seed();
