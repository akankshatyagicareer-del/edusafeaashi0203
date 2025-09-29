import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardOverview from "./DashboardOverview";
import ResourceManagement from "./ResourceManagement";
import AlertSystem from "./AlertSystem";
import AnalyticsReports from "./AnalyticsReports";

const DirectorDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="resources" element={<ResourceManagement />} />
        <Route path="alerts" element={<AlertSystem />} />
        <Route path="reports" element={<AnalyticsReports />} />
      </Routes>
    </Layout>
  );
};

export default DirectorDashboard;