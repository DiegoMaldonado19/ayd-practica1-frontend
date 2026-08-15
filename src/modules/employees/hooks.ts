import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorCode, getErrorMessage } from "@/api/types";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
} from "./services";
import type {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeListParams,
  EmployeeStatus,
} from "./types";

const employeesKey = (params?: EmployeeListParams) => ["employees", params] as const;

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: employeesKey(params),
    queryFn: () => getEmployees(params),
  });
}

export function useEmployee(employeeId: number | undefined) {
  return useQuery({
    queryKey: ["employees", employeeId],
    queryFn: () => getEmployeeById(employeeId as number),
    enabled: !!employeeId,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateEmployeeDTO) => createEmployee(payload),
    onSuccess: () => {
      enqueueSnackbar("Empleado creado correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: unknown) => {
      const errorCode = getErrorCode(error);
      let message = getErrorMessage(error, "No se pudo crear el empleado");

      if (errorCode === "DOCUMENT_ALREADY_REGISTERED") {
        message = "Ya existe un empleado con ese número de documento";
      } else if (errorCode === "VALIDATION_ERROR") {
        message = "Por favor revisa los datos ingresados";
      }

      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useUpdateEmployee(employeeId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateEmployeeDTO) =>
      updateEmployee(employeeId, payload),
    onSuccess: () => {
      enqueueSnackbar("Datos actualizados", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["employees", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: unknown) => {
      const errorCode = getErrorCode(error);
      let message = getErrorMessage(error, "No se pudo actualizar");

      if (errorCode === "DOCUMENT_ALREADY_REGISTERED") {
        message = "Ya existe otro empleado con ese número de documento";
      }

      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useUpdateEmployeeStatus(employeeId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (status: EmployeeStatus) =>
      updateEmployeeStatus(employeeId, status),
    onSuccess: () => {
      enqueueSnackbar("Estado actualizado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["employees", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "No se pudo cambiar el estado");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}