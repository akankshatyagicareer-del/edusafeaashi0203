import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardOverview from "./DashboardOverview";
import StudentProgress from "./StudentProgress";
import EmergencyContacts from "./EmergencyContacts";

const ParentDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="emergency" element={<EmergencyContacts />} />
      </Routes>
    </Layout>
  );
};

export default ParentDashboard;