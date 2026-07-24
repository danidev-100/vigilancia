export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'guard' | 'resident' | 'manager';
  phone?: string;
  avatar?: string;
  propertyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'house' | 'apartment' | 'commercial' | 'other';
  status: 'active' | 'inactive';
  ownerId: string;
  owner?: User;
  residents: User[];
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visitor {
  id: string;
  name: string;
  documentType: 'dni' | 'passport' | 'other';
  documentNumber: string;
  phone?: string;
  email?: string;
  photo?: string;
  vehiclePlate?: string;
  propertyId: string;
  property?: Property;
  type: 'guest' | 'delivery' | 'service' | 'family' | 'other';
  status: 'active' | 'inactive' | 'blacklisted';
  authorizedBy?: string;
  authorizedUntil?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  documentType: 'dni' | 'passport' | 'other';
  documentNumber: string;
  phone: string;
  email: string;
  position: string;
  propertyId: string;
  property?: Property;
  schedule?: string;
  status: 'active' | 'inactive';
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contractor {
  id: string;
  companyName: string;
  responsibleName: string;
  documentType: 'dni' | 'passport' | 'other';
  documentNumber: string;
  phone: string;
  email: string;
  service: string;
  propertyId: string;
  property?: Property;
  status: 'active' | 'inactive';
  validUntil?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  type: 'car' | 'motorcycle' | 'truck' | 'other';
  ownerId: string;
  ownerType: 'resident' | 'visitor' | 'employee' | 'contractor';
  ownerName: string;
  propertyId: string;
  property?: Property;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  propertyId: string;
  property?: Property;
  personType: 'visitor' | 'employee' | 'contractor' | 'resident';
  personId: string;
  personName: string;
  personDocument: string;
  vehiclePlate?: string;
  entryType: 'entry' | 'exit';
  timestamp: string;
  registeredById: string;
  registeredBy?: User;
  notes?: string;
  authorizationMethod: 'qr' | 'manual' | 'pre_registered' | 'emergency';
  status: 'active' | 'completed';
  exitTimestamp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  propertyId?: string;
  property?: Property;
  type: 'security' | 'maintenance' | 'noise' | 'suspicious' | 'accident' | 'fire' | 'theft' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'reported' | 'investigating' | 'resolved' | 'dismissed';
  reportedById: string;
  reportedBy?: User;
  assignedToId?: string;
  assignedTo?: User;
  location?: string;
  mediaUrls?: string[];
  resolvedAt?: string;
  resolvedNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardStats {
  entriesToday: number;
  exitsToday: number;
  activeVisitors: number;
  activeEmployees: number;
  activeContractors: number;
  pendingIncidents: number;
  recentEntries: Entry[];
  recentIncidents: Incident[];
}

export interface SearchResult {
  type: 'visitor' | 'employee' | 'contractor' | 'property' | 'vehicle' | 'incident';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
