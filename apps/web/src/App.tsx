import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/guards/protected-route';
import { RoleGuard } from '@/components/guards/role-guard';

// Auth Pages
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password-page';

// Dashboard
import { DashboardPage } from '@/pages/dashboard/dashboard-page';

// Properties
import { PropertiesPage } from '@/pages/properties/properties-page';
import { PropertyDetailPage } from '@/pages/properties/property-detail-page';

// Visitors
import { VisitorsPage } from '@/pages/visitors/visitors-page';
import { VisitorDetailPage } from '@/pages/visitors/visitor-detail-page';
import { CreateVisitorPage } from '@/pages/visitors/create-visitor-page';

// Employees
import { EmployeesPage } from '@/pages/employees/employees-page';

// Contractors
import { ContractorsPage } from '@/pages/contractors/contractors-page';

// Vehicles
import { VehiclesPage } from '@/pages/vehicles/vehicles-page';

// Entries
import { EntriesPage } from '@/pages/entries/entries-page';
import { ActiveEntriesPage } from '@/pages/entries/active-entries-page';
import { EntryHistoryPage } from '@/pages/entries/entry-history-page';

// Incidents
import { IncidentsPage } from '@/pages/incidents/incidents-page';

// Notifications
import { NotificationsPage } from '@/pages/notifications/notifications-page';

// Reports
import { ReportsPage } from '@/pages/reports/reports-page';

// Search
import { SearchPage } from '@/pages/search/search-page';

// Settings
import { SettingsPage } from '@/pages/settings/settings-page';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/visitors" element={<VisitorsPage />} />
        <Route path="/visitors/:id" element={<VisitorDetailPage />} />
        <Route path="/visitors/new" element={<CreateVisitorPage />} />
        <Route path="/visitors/:id/edit" element={<CreateVisitorPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/contractors" element={<ContractorsPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/entries" element={<EntriesPage />} />
        <Route path="/entries/active" element={<ActiveEntriesPage />} />
        <Route path="/entries/history" element={<EntryHistoryPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/reports"
          element={
            <RoleGuard allowedRoles={['admin', 'manager']}>
              <ReportsPage />
            </RoleGuard>
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
