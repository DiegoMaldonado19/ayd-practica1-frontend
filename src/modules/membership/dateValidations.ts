import dayjs from "dayjs";
import * as yup from "yup";

// Rango general aceptado para fechas de negocio
const MIN_YEAR = 1900;

/** Fecha mínima aceptable (1 enero 1900) */
export function minAcceptableDate(): Date {
  return new Date(MIN_YEAR, 0, 1);
}

/** Hoy a las 00:00 (para comparar sin hora) */
export function today(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/** Fecha máxima futura aceptable (10 años desde hoy) */
export function maxFutureDate(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 10);
  return d;
}

/**
 * Regla yup: la fecha no puede ser anterior a `minDate` (por defecto, 1900).
 */
export function notBefore(
  minDate: Date = minAcceptableDate(),
  message = `La fecha no puede ser anterior a ${minDate.getFullYear()}`
) {
  return yup.date().test(
    "not-before",
    message,
    (value) => !value || dayjs(value).isAfter(dayjs(minDate).subtract(1, "day"))
  );
}

/**
 * Regla yup: la fecha no puede ser posterior a `maxDate` (por defecto, hoy).
 */
export function notAfter(
  maxDate: Date = today(),
  message = "La fecha no puede ser futura"
) {
  return yup.date().test(
    "not-after",
    message,
    (value) => !value || !dayjs(value).isAfter(dayjs(maxDate))
  );
}

/**
 * Regla yup: edad entre `min` y `max` años a la fecha de referencia (por defecto hoy).
 */
export function ageBetween(min: number, max: number) {
  return yup.date().test(
    "age-between",
    `La edad debe estar entre ${min} y ${max} años`,
    (value) => {
      if (!value) return true;
      const years = dayjs().diff(dayjs(value), "year");
      return years >= min && years <= max;
    }
  );
}

/**
 * Regla yup: la fecha debe estar a lo sumo `days` días en el futuro desde `from`.
 */
export function maxDaysFromNow(days: number, from: Date = today()) {
  return yup.date().test(
    "max-days-from",
    `No puede ser más de ${days} días desde hoy`,
    (value) => {
      if (!value) return true;
      const limit = dayjs(from).add(days, "day");
      return !dayjs(value).isAfter(limit);
    }
  );
}