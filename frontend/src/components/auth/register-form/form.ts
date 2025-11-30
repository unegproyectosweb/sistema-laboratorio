import { extractErrorMessages } from "@/lib/api";
import { register, registerAdministrator } from "@/lib/auth";
import { useForm, type SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { redirect, useNavigation } from "react-router";
import * as z from "zod";

const schema = z
  .object({
    username: z
      .string({ error: "El nombre de usuario es requerido" })
      .nonempty({ error: "El nombre de usuario es requerido" }),
    name: z
      .string({ error: "El nombre es requerido" })
      .nonempty({ error: "El nombre es requerido" }),
    email: z.email({ error: "Correo electrónico inválido" }),
    password: z
      .string({ error: "La contraseña es requerida" })
      .min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z.string({ error: "Confirma la contraseña" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export async function submitRegisterForm(
  request: Request,
  options: { admin: boolean },
) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const promise = options.admin
    ? registerAdministrator(submission.value)
    : register(submission.value);

  return await promise.then(
    () => {
      throw redirect("/");
    },
    async (error) => {
      const errors = await extractErrorMessages(error);
      return submission.reply({ formErrors: errors });
    },
  );
}

export function useRegisterForm({
  lastResult,
}: {
  lastResult: SubmissionResult<string[]> | undefined;
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [form, fields] = useForm({
    lastResult,
    onValidate(context) {
      return parseWithZod(context.formData, { schema });
    },
  });

  return { form, fields, isSubmitting };
}
