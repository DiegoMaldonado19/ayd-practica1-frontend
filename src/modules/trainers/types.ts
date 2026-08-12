import type { PersonDTO } from "@/modules/members/types";

export type Specialty =
  | "WEIGHT_LOSS"
  | "MUSCLE_GAIN"
  | "REHABILITATION"
  | "FUNCTIONAL"
  | "CARDIO";

export interface Trainer {
  trainer_id: number;
  person: PersonDTO;
  max_member_load: number;
  specialties: Specialty[];
  bio?: string; 
  active?: boolean; 
}

export interface UpdateTrainerLoadDTO {
  max_member_load: number;
  bio?: string;
}

export interface ReplaceSpecialtiesDTO {
  specialties: Specialty[];
}

export interface TrainerListParams {
  page?: number;
  size?: number;
  specialty?: Specialty;
  search?: string;
  sort?: string;
}
export interface Trainer {
  trainer_id: number;
  employee_id: number; 
  employee_code: string; 
  person: PersonDTO;
  max_member_load: number;
  specialties: Specialty[];
  bio?: string;
  active?: boolean;
}