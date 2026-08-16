import * as yup from "yup";
import type { DocumentType, Gender } from "@/modules/members/types";

const todayISO = () => new Date().toISOString().split("T")[0];

const yearsAgo = (n: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().split("T")[0];
};

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

/** Genera una contraseña alfanumérica que siempre contiene letras y números. */
export const generateAlphanumericPassword = (length = 12): string => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const all = upper + lower + numbers;
  let password = upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  for (let index = 3; index < length; index += 1) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split("").sort(() => Math.random() - 0.5).join("");
};

export const memberFormSchema = yup.object({
  document_type: yup.mixed<DocumentType>().oneOf(["DPI", "PASSPORT", "NIT"]).required("Selecciona el tipo de documento"),
  document_number: yup.string().required("El número de documento es requerido")
    .when("document_type", {
      is: "DPI",
      then: (s) => s.matches(/^\d{13}$/, "El DPI debe tener exactamente 13 dígitos"),
      otherwise: (s) =>
        s.when("document_type", {
          is: "PASSPORT",
          then: (s2) => s2.matches(/^\d{6}$|^\d{9}$/, "El pasaporte debe tener 6 o 9 dígitos"),
          otherwise: (s2) =>
            s2.when("document_type", {
              is: "NIT",
              then: (s3) => s3.matches(/^\d{8}$|^\d{9}$/, "El NIT debe tener 8 o 9 dígitos"),
            }),
        }),
    }),
  first_name: yup.string().required("El nombre es requerido"),
  last_name: yup.string().required("El apellido es requerido"),
  gender: yup.mixed<Gender>().oneOf(["M", "F", "OTHER"]).required("Selecciona el género"),
  birth_date: yup
    .string()
    .required("La fecha de nacimiento es requerida")
    .test("not-future", "La fecha no puede ser futura", (v) => !v || v <= todayISO())
    .test("min-age", "El socio debe tener al menos 14 años", (v) => !v || v <= yearsAgo(14))
    .test("max-age", "La fecha de nacimiento no es válida", (v) => !v || v >= yearsAgo(120)),
  email: yup.string().email("Correo inválido").test(
    "email-required-for-access",
    "El correo es requerido para crear una cuenta de acceso",
    function (value) {
      const username = this.parent.username as string | undefined;
      return !username || Boolean(value);
    },
  ),
  phone: yup
    .string()
    .transform((val) => val?.replace(/\D/g, "") || "")
    .matches(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos")
    .optional(),
  address: yup.string().optional(),
  emergency_contact_name: yup.string().optional(),
  emergency_contact_phone: yup
    .string()
    .transform((val) => val?.replace(/\D/g, "") || "")
    .matches(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos")
    .optional(),
  notes: yup.string().optional(),
  username: yup
    .string()
    .matches(/^[a-zA-Z0-9._-]{3,30}$/, "Entre 3 y 30 caracteres: letras, números, puntos y guiones"),
  password: yup.string().test("password-for-access", "Contraseña inválida", function (value) {
    const username = this.parent.username as string | undefined;
    if (!username) return true;
    if (!value) return this.createError({ message: "La contraseña es requerida" });
    if (value.length < 8) return this.createError({ message: "La contraseña debe tener al menos 8 caracteres" });
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return this.createError({ message: "La contraseña debe ser alfanumérica (solo letras y números)" });
    }
    if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
      return this.createError({ message: "Debe contener al menos una letra y un número" });
    }
    return true;
  }),
  confirm_password: yup.string().test("confirm-for-access", "Las contraseñas no coinciden", function (value) {
    const username = this.parent.username as string | undefined;
    if (!username) return true;
    if (!value) return this.createError({ message: "Confirma la contraseña" });
    return value === this.parent.password;
  }),
});

export type MemberFormValues = yup.InferType<typeof memberFormSchema>;