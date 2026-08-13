import * as yup from "yup";
import type { TwoFactorChannel } from "./types";

export const loginSchema = yup.object({
  username: yup.string().trim().required("Ingresa tu usuario."),
  password: yup.string().required("Ingresa tu contraseña."),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;

export const verificationSchema = yup.object({
  code: yup
    .string()
    .trim()
    .matches(/^\d{6}$/, "El código debe tener 6 dígitos.")
    .required("Ingresa el código de verificación."),
});

export type VerificationFormValues = yup.InferType<typeof verificationSchema>;

export const forgotPasswordSchema = yup.object({
  username: yup.string().trim().required("Ingresa tu usuario."),
});

export type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;

export const resetPasswordSchema = yup.object({
  code: yup
    .string()
    .trim()
    .matches(/^\d{6}$/, "El código debe tener 6 dígitos.")
    .required("Ingresa el código de recuperación."),
  new_password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña no puede superar los 72 caracteres.")
    .required("Ingresa la nueva contraseña."),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Las contraseñas no coinciden.")
    .required("Confirma la nueva contraseña."),
});

export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;

export const changePasswordSchema = yup.object({
  current_password: yup.string().required("Ingresa tu contraseña actual."),
  new_password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña no puede superar los 72 caracteres.")
    .required("Ingresa la nueva contraseña."),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Las contraseñas no coinciden.")
    .required("Confirma la nueva contraseña."),
});

export type ChangePasswordFormValues = yup.InferType<typeof changePasswordSchema>;

export interface TwoFactorFormValues {
  enabled: boolean;
  channel: TwoFactorChannel;
}

// yup's `.oneOf` doesn't narrow the inferred string type to the literal
// union, so the schema is asserted against the hand-written shape above —
// the runtime validation still enforces "EMAIL" | "SMS".
export const twoFactorSchema = yup.object({
  enabled: yup.boolean().required(),
  channel: yup.string().oneOf(["EMAIL", "SMS"]).required(),
}) as yup.ObjectSchema<TwoFactorFormValues>;
