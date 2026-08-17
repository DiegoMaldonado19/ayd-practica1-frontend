import * as yup from "yup";
import type { Position } from "@/modules/employees/types";
import type { DocumentType, Gender } from "@/modules/members/types";

const todayISO = () => new Date().toISOString().split("T")[0];
const yearsAgo = (n: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().split("T")[0];
};
const yearsAfter = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setFullYear(d.getFullYear() + n);
  return d.toISOString().split("T")[0];
};

/** Formatea teléfono guatemalteco: 12345678 → "1234-5678" */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

/** Genera una contraseña alfanumérica aleatoria segura de 12 caracteres */
export const generateAlphanumericPassword = (length = 12): string => {
  const lettersUpper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lettersLower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const all = lettersUpper + lettersLower + numbers;

  let pass = "";
  pass += lettersUpper.charAt(Math.floor(Math.random() * lettersUpper.length));
  pass += lettersLower.charAt(Math.floor(Math.random() * lettersLower.length));
  pass += numbers.charAt(Math.floor(Math.random() * numbers.length));

  for (let i = 3; i < length; i++) {
    pass += all.charAt(Math.floor(Math.random() * all.length));
  }

  return pass.split("").sort(() => 0.5 - Math.random()).join("");
};

export const employeeFormSchema = yup.object({
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
  gender: yup.mixed<Gender>().oneOf(["M", "F", "OTHER"]).optional(),
  birth_date: yup
    .string()
    .optional()
    .test("not-future", "La fecha no puede ser futura", (v) => !v || v <= todayISO())
    .test("min-age", "El empleado debe tener al menos 18 años", (v) => !v || v <= yearsAgo(18))
    .test("max-age", "La fecha de nacimiento no es válida", (v) => !v || v >= yearsAgo(120)),
  email: yup
    .string()
    .email("Correo inválido")
    .test(
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
    .test("phone-format", "El teléfono debe tener exactamente 8 dígitos", (val) => !val || /^\d{8}$/.test(val))
    .optional(),
  address: yup.string().optional(),
  position: yup.mixed<Position>().oneOf(["ADMIN", "RECEPTIONIST", "TRAINER"]).required("Selecciona el puesto"),
  hired_on: yup
    .string()
    .required("La fecha de contratación es requerida")
    .test("not-future", "La fecha de contratación no puede ser futura", (v) => !v || v <= todayISO())
    .test("after-18th-birthday", "El empleado debe tener al menos 18 años al momento de la contratación", function (value) {
      const birth = this.parent.birth_date as string | undefined;
      if (!value || !birth) return true;
      return value >= yearsAfter(birth, 18);
    }),
  max_member_load: yup
    .number()
    .positive("Debe ser un número positivo")
    .typeError("Debe ser un número")
    .integer("Debe ser un número entero")
    .max(200, "La carga máxima no puede superar 200 socios")
    .when("position", {
      is: "TRAINER",
      then: (s) => s.required("La carga máxima es requerida para un entrenador"),
      otherwise: (s) => s.optional(),
    }),
  bio: yup.string().max(500, "La biografía no puede superar 500 caracteres").optional(),
  username: yup
    .string()
    .test("username-format", "Entre 3 y 30 caracteres: letras, números, puntos y guiones", (val) => !val || /^[a-zA-Z0-9._-]{3,30}$/.test(val)),
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

export type EmployeeFormValues = yup.InferType<typeof employeeFormSchema>;