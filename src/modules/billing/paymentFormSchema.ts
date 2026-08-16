import * as yup from "yup";
import type { DocumentType } from "@/modules/members/types";

export const paymentFormSchema = yup.object({
  member_id: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  membership_id: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  concept: yup.string().oneOf(["MEMBERSHIP", "GUEST_PASS"]).required("Selecciona un concepto"),
  payment_method: yup.string().oneOf(["CASH", "DEBIT_CARD"]).required("Selecciona un método"),
  promotion_id: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  amount: yup.number().typeError("Debe ser un número").min(0, "No puede ser negativo").required("El monto es requerido"),
  // Guest fields: required only when concept = GUEST_PASS
  guest_first_name: yup.string().when('concept', {
    is: 'GUEST_PASS',
    then: (s) => s.required('Nombre del invitado requerido'),
    otherwise: (s) => s.notRequired(),
  }),
  guest_last_name: yup.string().when('concept', {
    is: 'GUEST_PASS',
    then: (s) => s.required('Apellido del invitado requerido'),
    otherwise: (s) => s.notRequired(),
  }),
  guest_document_type: yup.mixed<DocumentType>().oneOf(["DPI", "PASSPORT", "NIT"]).when('concept', {
    is: 'GUEST_PASS',
    then: (s) => s.required('Selecciona el tipo de documento'),
    otherwise: (s) => s.notRequired(),
  }),
  guest_document_number: yup
    .string()
    .test('guest-doc-number', 'Documento inválido o requerido', function (value) {
      const parent = this.parent as Record<string, unknown> | undefined;
      const concept = parent?.concept as string | undefined;
      const docType = parent?.guest_document_type as string | undefined;
      if (concept !== 'GUEST_PASS') return true;
      if (!value) return this.createError({ message: 'Documento requerido' });
      if (docType === 'DPI' && !/^\d{13}$/.test(value)) return this.createError({ message: 'El DPI debe tener exactamente 13 dígitos' });
      if (docType === 'PASSPORT' && !/^\d{6}$|^\d{9}$/.test(value)) return this.createError({ message: 'El pasaporte debe tener 6 o 9 dígitos' });
      if (docType === 'NIT' && !/^\d{8}$|^\d{9}$/.test(value)) return this.createError({ message: 'El NIT debe tener 8 o 9 dígitos' });
      return true;
    }),
  guest_email: yup.string().email('Email inválido').nullable().notRequired(),
  guest_phone: yup.string().when('concept', {
    is: 'GUEST_PASS',
    then: (s) => s
      .transform((val) => (val ? String(val).replace(/\D/g, "") : ""))
      .nullable()
      .notRequired()
      .matches(/^$|^\d{8}$/, 'El teléfono debe tener exactamente 8 dígitos'),
    otherwise: (s) => s.notRequired(),
  }),
});

export type PaymentFormValues = yup.InferType<typeof paymentFormSchema>;