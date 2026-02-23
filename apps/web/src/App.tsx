import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './system/stores/authStore';
import { ToastContainer } from './system/components/Toast';
import { DashboardLayout } from './system/components/DashboardLayout';
import { ProtectedLayout } from './system/components/ProtectedRoute';

import { LoginPage } from './domains/auth/pages/LoginPage';
import { VerifyPage } from './domains/auth/pages/VerifyPage';
import { ProfilePage } from './domains/auth/pages/ProfilePage';

import { DiscoveryPage } from './domains/jobs/pages/DiscoveryPage';
import { ClaimedJobPage } from './domains/jobs/pages/ClaimedJobPage';
import { ReviewDeliverablePage } from './domains/jobs/pages/ReviewDeliverablePage';
import { PostJobPage } from './domains/jobs/pages/PostJobPage';
import { MyJobsPage } from './domains/jobs/pages/MyJobsPage';

import { WalletPage } from './domains/wallet/pages/WalletPage';

export function App() {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyPage />} />

        <Route
          element={
            <ProtectedLayout>
              <DashboardLayout>
                <Routes>
                  <Route path="/discovery" element={<DiscoveryPage />} />
                  <Route path="/claimed/:id" element={<ClaimedJobPage />} />
                  <Route path="/review/:id" element={<ReviewDeliverablePage />} />
                  <Route path="/post" element={<PostJobPage />} />
                  <Route path="/my-jobs" element={<MyJobsPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/" element={<Navigate to="/discovery" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/discovery" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
