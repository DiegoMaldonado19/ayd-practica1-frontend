import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type {
  CancelSessionDTO,
  ClassEnrollment,
  ClassSession,
  ClassSessionListParams,
  CreateEnrollmentDTO,
  CreateGroupClassDTO,
  CreateWaitlistEntryDTO,
  GenerateSessionsDTO,
  GroupClass,
  GroupClassListParams,
  MarkAttendanceDTO,
  SessionStatusDTO,
  UpdateGroupClassDTO,
  WaitlistEntry,
} from "./types";

export async function getGroupClasses(
  params: GroupClassListParams = {}
): Promise<Page<GroupClass>> {
  const { data } = await apiClient.get<Page<GroupClass>>("/group-classes", {
    params,
  });
  return data;
}

export async function getGroupClassById(groupClassId: number): Promise<GroupClass> {
  const { data } = await apiClient.get<GroupClass>(`/group-classes/${groupClassId}`);
  return data;
}

export async function createGroupClass(
  payload: CreateGroupClassDTO
): Promise<GroupClass> {
  const { data } = await apiClient.post<GroupClass>("/group-classes", payload);
  return data;
}

export async function updateGroupClass(
  groupClassId: number,
  payload: UpdateGroupClassDTO
): Promise<GroupClass> {
  const { data } = await apiClient.put<GroupClass>(`/group-classes/${groupClassId}`, payload);
  return data;
}

export async function generateGroupClassSessions(
  groupClassId: number,
  payload: GenerateSessionsDTO
): Promise<ClassSession[]> {
  const { data } = await apiClient.post<ClassSession[]>(
    `/group-classes/${groupClassId}/sessions`,
    payload
  );
  return data;
}

export async function getClassSessions(
  params: ClassSessionListParams = {}
): Promise<Page<ClassSession>> {
  const { data } = await apiClient.get<Page<ClassSession>>("/class-sessions", {
    params,
  });
  return data;
}

export async function getClassSessionById(classSessionId: number): Promise<ClassSession> {
  const { data } = await apiClient.get<ClassSession>(`/class-sessions/${classSessionId}`);
  return data;
}

export async function enrollMemberInClassSession(
  classSessionId: number,
  payload: CreateEnrollmentDTO
): Promise<ClassEnrollment> {
  const { data } = await apiClient.post<ClassEnrollment>(
    `/class-sessions/${classSessionId}/enrollments`,
    payload
  );
  return data;
}

export async function getClassSessionEnrollments(
  classSessionId: number,
  params: { page?: number; size?: number } = {}
): Promise<Page<ClassEnrollment>> {
  const { data } = await apiClient.get<Page<ClassEnrollment>>(
    `/class-sessions/${classSessionId}/enrollments`,
    { params }
  );
  return data;
}

export async function createWaitlistEntry(
  classSessionId: number,
  payload: CreateWaitlistEntryDTO
): Promise<WaitlistEntry> {
  const { data } = await apiClient.post<WaitlistEntry>(
    `/class-sessions/${classSessionId}/waitlist-entries`,
    payload
  );
  return data;
}

export async function getClassSessionWaitlist(
  classSessionId: number,
  params: { page?: number; size?: number } = {}
): Promise<Page<WaitlistEntry>> {
  const { data } = await apiClient.get<Page<WaitlistEntry>>(
    `/class-sessions/${classSessionId}/waitlist-entries`,
    { params }
  );
  return data;
}

export async function cancelEnrollment(enrollmentId: number): Promise<void> {
  await apiClient.delete(`/enrollments/${enrollmentId}`);
}

export async function cancelWaitlistEntry(waitlistEntryId: number): Promise<void> {
  await apiClient.delete(`/waitlist-entries/${waitlistEntryId}`);
}

export async function confirmWaitlistEntry(waitlistEntryId: number): Promise<ClassEnrollment> {
  const { data } = await apiClient.post<ClassEnrollment>(
    `/waitlist-entries/${waitlistEntryId}/confirmations`
  );
  return data;
}

/**
 * Las dos rutas que un socio sí puede leer: el roster y la cola de la sesión son
 * exclusivos del personal, así que estas son su única fuente para saber si ya está
 * inscrito y para obtener el waitlist_entry_id que necesita al confirmar.
 */
export async function getMemberEnrollments(
  memberId: number,
  params: { from?: string; to?: string } = {}
): Promise<Page<ClassEnrollment>> {
  const { data } = await apiClient.get<Page<ClassEnrollment>>(
    `/members/${memberId}/enrollments`,
    { params }
  );
  return data;
}

export async function getMemberWaitlistEntries(memberId: number): Promise<WaitlistEntry[]> {
  const { data } = await apiClient.get<WaitlistEntry[]>(`/members/${memberId}/waitlist-entries`);
  return data;
}

export async function markAttendance(
  classSessionId: number,
  payload: MarkAttendanceDTO
): Promise<ClassEnrollment[]> {
  const { data } = await apiClient.put<ClassEnrollment[]>(
    `/class-sessions/${classSessionId}/attendances`,
    payload
  );
  return data;
}

export async function updateClassSessionStatus(
  classSessionId: number,
  payload: SessionStatusDTO
): Promise<ClassSession> {
  const { data } = await apiClient.patch<ClassSession>(
    `/class-sessions/${classSessionId}/status`,
    payload
  );
  return data;
}

export async function cancelClassSession(
  classSessionId: number,
  payload: CancelSessionDTO
): Promise<ClassSession> {
  const { data } = await apiClient.post<ClassSession>(
    `/class-sessions/${classSessionId}/cancellations`,
    payload
  );
  return data;
}
