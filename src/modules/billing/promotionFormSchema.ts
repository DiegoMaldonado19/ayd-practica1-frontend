import * as yup from "yup";
import type { PromotionDiscountType } from "@/modules/billing/types";

const todayISO = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getDayDiff = (from: string, to: string): number => {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 86400000);
};

export { todayISO };

export const promotionFormSchema = yup.object({
  code: yup.string().trim().required("El código es requerido"),
  name: yup.string().trim().required("El nombre es requerido"),
  description: yup.string().trim().optional(),
  discount_type: yup
    .mixed<PromotionDiscountType>()
    .oneOf(["PERCENTAGE", "FIXED_AMOUNT"])
    .required("Selecciona el tipo de descuento"),
  discount_value: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("El valor del descuento es requerido"),
  valid_from: yup
    .string()
    .required("La fecha de inicio es requerida")
    .test("not-past", "La fecha de inicio no puede ser anterior a hoy", (value) => {
      if (!value) return true;
      return new Date(`${value}T00:00:00`) >= new Date(`${todayISO()}T00:00:00`);
    }),
  valid_to: yup
    .string()
    .required("La fecha de fin es requerida")
    .test("valid-range", "La fecha de fin no puede ser anterior a la fecha de inicio", function (value) {
      if (!value || !this.parent.valid_from) return true;
      return getDayDiff(this.parent.valid_from, value) >= 0;
    }),
  max_uses: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  max_uses_per_member: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
});

export type PromotionFormValues = yup.InferType<typeof promotionFormSchema>;