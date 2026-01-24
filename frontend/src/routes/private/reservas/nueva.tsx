/* eslint-disable react-hooks/exhaustive-deps */
import ReservationForm from "@/components/reservas/reservation-form";
import { AvailableHours, AvailableLaboratorys } from "@/components/reservas/reservation-form/schema";
import type { Route } from "./+types/nueva";
import { useEffect } from "react";
import { getAccessToken } from "@/lib/auth";
import { useState } from "react";

export async function clientLoader() {
  return {
    availableHours: AvailableHours,
    availableLaboratory: AvailableLaboratorys,
  };
}


export default function NuevaReserva({ loaderData }: Route.ComponentProps) {
  const [laboratorys, setLaboratorys] = useState<string[]>([]);
  const [stateEventType, setEventType] = useState<any[]>([]);
  
  
  useEffect( () => {
     
     const fetchDataLaboratory = async () => {
    const token = await getAccessToken();

    console.log(token)
    try {
      const res = await fetch('http://localhost:3001/api/laboratories', {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();

      setLaboratorys(data)
      console.log("pene", token);
    } catch (error) {
      console.error("Error al obtener laboratorios:", error);
    }
  };

 const fetchDataTypeActivity = async () => {
    const token = await getAccessToken();
    try {
      const res = await fetch('http://localhost:3001/api/reserve-types', {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();

      setEventType(data)
    } catch (error) {
      console.error("Error al obtener laboratorios:", error);
    }
  };
  
  fetchDataTypeActivity()
  fetchDataLaboratory();
}, []);



  return <ReservationForm availableHours={loaderData.availableHours} availableLaboratory={laboratorys} stateTypeEvent={stateEventType} />;
}
