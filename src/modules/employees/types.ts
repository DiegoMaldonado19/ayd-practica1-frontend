import type { DocumentType, PersonDTO, Gender } from "@/modules/members/types";

export type EmployeeStatus = "ACTIVE" | "SUSPENDED" | "TERMINATED";
export type Position = "ADMIN" | "RECEPTIONIST" | "TRAINER";

export interface Employee {
  employee_id: number;
  employee_code: string;
  person: PersonDTO;
  position: Position;
  hired_on: string;
  terminated_on: string | null;
  status: EmployeeStatus;
  trainer_id: number | null;
}

export interface CreateEmployeeDTO {
  person: {
    document_type: DocumentType;
    document_number: string;
    first_name: string;
    last_name: string;
    gender?: Gender;
    birth_date?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  position: Position;
  hired_on: string;
  max_member_load?: number;
  bio?: string;
}

export interface UpdateEmployeeDTO {
  person: {
    document_type: DocumentType;
    document_number: string;
    first_name: string;
    last_name: string;
    gender?: Gender;
    birth_date?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  hired_on: string;
}

export interface EmployeeListParams {
  page?: number;
  size?: number;
  status?: EmployeeStatus;
  position?: Position;
  search?: string;
  sort?: string;
}