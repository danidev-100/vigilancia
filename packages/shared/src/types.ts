import type { Role, VisitorType, EntryMethod, IncidentType, PropertyStatus, PersonType, NotificationType } from './enums';

// ---- Auth ----

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  photo: string | null;
  emailVerified: boolean;
}

// ---- Properties ----

export interface PropertyDTO {
  id: string;
  ownerId: string;
  houseNumber: string;
  block: string;
  street: string;
  neighborhood: string;
  status: PropertyStatus;
  owner?: UserProfile;
}

// ---- Family Members ----

export interface FamilyMemberDTO {
  id: string;
  propertyId: string;
  fullName: string;
  nationalId: string | null;
  phone: string;
  relationship: string;
  photo: string | null;
}

// ---- Visitors ----

export interface VisitorDTO {
  id: string;
  propertyId: string;
  fullName: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  vehiclePlate: string | null;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  photo: string | null;
  notes: string | null;
  authorizedById: string;
  visitorType: VisitorType;
  validFrom: string;
  validUntil: string;
  qrCode: string | null;
  isActive: boolean;
  authorizedBy?: UserProfile;
  property?: PropertyDTO;
}

// ---- Employees ----

export interface EmployeeDTO {
  id: string;
  propertyId: string;
  fullName: string;
  nationalId: string | null;
  phone: string;
  position: string;
  company: string;
  vehiclePlate: string | null;
  workSchedule: string | null;
  photo: string | null;
  isActive: boolean;
}

// ---- Contractors ----

export interface ContractorDTO {
  id: string;
  propertyId: string;
  company: string;
  employeeName: string;
  nationalId: string | null;
  phone: string | null;
  vehiclePlate: string | null;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  serviceType: string;
  workOrder: string | null;
  authorizedUntil: string;
}

// ---- Vehicles ----

export interface VehicleDTO {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string | null;
  ownerType: PersonType;
  ownerId: string | null;
}

// ---- Entries ----

export interface EntryDTO {
  id: string;
  personType: PersonType;
  visitorId: string | null;
  employeeId: string | null;
  contractorId: string | null;
  familyMemberId: string | null;
  guardId: string;
  propertyId: string | null;
  gate: string;
  entryTime: string;
  exitTime: string | null;
  entryMethod: EntryMethod;
  photo: string | null;
  notes: string | null;
  guard?: UserProfile;
}

// ---- Incidents ----

export interface IncidentDTO {
  id: string;
  guardId: string;
  title: string;
  description: string;
  incidentType: IncidentType;
  photos: string[];
  createdAt: string;
  guard?: UserProfile;
}

// ---- Notifications ----

export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

// ---- Audit Log ----

export interface AuditLogDTO {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: UserProfile;
}

// ---- Dashboard ----

export interface DashboardStats {
  entriesToday: number;
  exitsToday: number;
  activeVisitors: number;
  activeEmployees: number;
  contractorsInside: number;
  incidentsToday: number;
  recentActivity: EntryDTO[];
}

// ---- Pagination ----

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---- Search ----

export interface SearchParams {
  query: string;
  type?: 'visitor' | 'employee' | 'contractor' | 'resident' | 'all';
  propertyId?: string;
}

export interface SearchResult {
  visitors: VisitorDTO[];
  employees: EmployeeDTO[];
  contractors: ContractorDTO[];
  familyMembers: FamilyMemberDTO[];
}
