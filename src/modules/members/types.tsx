export type MemberStatus = "ACTIVE" | "INACTIVE" | "WITHDRAWN";
export type DocumentType = "DPI" | "PASSPORT" | "NIT";
export type Gender = "M" | "F" | "OTHER"; // Confirmar en schema.sql si "OTHER" es válido

export interface PersonDTO {
  person_id: number;
  document_type: DocumentType;
  document_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: Gender;
  birth_date: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface Member {
  member_id: number;
  person: PersonDTO;
  member_code: string;
  joined_on: string;
  status: MemberStatus;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  terminated_on: string | null;
  notes: string | null;
}

export interface CreateMemberDTO {
  person: {
    document_type: DocumentType;
    document_number: string;
    first_name: string;
    last_name: string;
    gender: Gender;
    birth_date: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface UpdateMemberDTO {
  person: {
    document_type: DocumentType;
    document_number: string;
    first_name: string;
    last_name: string;
    gender: Gender;
    birth_date: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string; // ✅ AGREGADO
}

export interface MemberListParams {
  page?: number;
  size?: number;
  status?: MemberStatus;
  search?: string;
  sort?: string;
  plan_code?: string;
  membership_status?: string;
}