import type { DocumentType } from '@/modules/members/types';

export type PassType = 'FREE_TRIAL' | 'PAID_DAY_PASS' | 'MEMBER_GUEST';
export type VisitChannel = 'FRONT_DESK' | 'SELF_SERVICE';

export interface PersonDTO {
  person_id: number;
  document_type: DocumentType;
  document_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
}

export interface Visit {
  facility_visit_id: number;
  member_id: number;
  membership_id: number;
  checked_in_at: string;
  checked_out_at: string | null;
  channel: VisitChannel;
  minutes_inside: number | null;
}

export interface GuestPass {
  guest_pass_id: number;
  person: PersonDTO;
  pass_type: PassType;
  host_member_id: number | null;
  checked_in_at: string;
  notes: string | null;
}

export interface CreateVisitDTO {
  member_id: number;
}

export interface CreateGuestPassDTO {
  person: {
    document_type: DocumentType;
    document_number: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  pass_type: PassType;
  host_member_id?: number;
}

export interface VisitListParams {
  open?: boolean;
  member_id?: number;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface GuestPassListParams {
  pass_type?: PassType;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}