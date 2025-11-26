import { Button } from "@/components/ui/button";
import { Form } from "react-router";
import type { Route } from "./+types/index";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Sistema de Reservas de Laboratorio - UNEG" },
    {
      name: "description",
      content:
        "Sistema de reservas de laboratorios de la UNEG, donde los usuarios pueden gestionar y visualizar sus reservas.",
    },
  ];
}

export default function Home() {
  return (
    <>
      <h1>Welcome to React Router</h1>
      <p>This is the home page.</p>
      <Form action="/logout" method="post" className="contents">
        <Button type="submit">Logout</Button>
      </Form>
    </>
  );
}
