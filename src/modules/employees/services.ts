import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeListParams,
  EmployeeStatus,
} from "./types";

export async function getEmployees(
  params: EmployeeListParams
): Promise<Page<Employee>> {
  const { data } = await apiClient.get<Page<Employee>>("/employees", {
    params,
  });
  return data;
}

export async function getEmployeeById(employeeId: number): Promise<Employee> {
  const { data } = await apiClient.get<Employee>(`/employees/${employeeId}`);
  return data;
}

export async function createEmployee(
  payload: CreateEmployeeDTO
): Promise<Employee> {
  const { data } = await apiClient.post<Employee>("/employees", payload);
  return data;
}

export async function updateEmployee(
  employeeId: number,
  payload: UpdateEmployeeDTO
): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(
    `/employees/${employeeId}`,
    payload
  );
  return data;
}

export async function updateEmployeeStatus(
  employeeId: number,
  status: EmployeeStatus
): Promise<Employee> {
  const { data } = await apiClient.patch<Employee>(
    `/employees/${employeeId}/status`,
    { status }
  );
  return data;
}