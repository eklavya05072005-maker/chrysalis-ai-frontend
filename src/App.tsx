import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page with Sculpture Hero WebGL engine */}
        <Route path="/" element={<LandingPage />} />

        {/* Console / Dashboard */}
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/projects" element={<DashboardPage />} />

        {/* Ingest Specification / New Project */}
        <Route path="/app/projects/new" element={<NewProjectPage />} />

        {/* Project Workspaces & Workflow Tabs */}
        <Route path="/app/projects/:id" element={<ProjectWorkspacePage />} />
        <Route path="/app/projects/:id/:tab" element={<ProjectWorkspacePage />} />

        {/* Settings & Backend Diagnostic */}
        <Route path="/app/settings" element={<SettingsPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
