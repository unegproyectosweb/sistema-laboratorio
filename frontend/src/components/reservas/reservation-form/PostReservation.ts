import { getAccessToken } from "@/lib/auth";

async function postReservation(value: any) {
  const token = await getAccessToken();
  const API_URL = import.meta.env.VITE_HOSTNAME_BACKEND;

  try {
    const res = await fetch(`${API_URL}/api/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(value),
    });

    return res;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    alert("Error al crear la reservación");
    throw new Error("Error al crear la reservación");
  }
}

export default postReservation;
