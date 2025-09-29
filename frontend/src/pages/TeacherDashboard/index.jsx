import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardOverview from "./DashboardOverview";
import QuizManagement from "./QuizManagement";
import DrillManagement from "./DrillManagement";
import StudentManagement from "./StudentManagement";

const TeacherDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="quizzes" element={<QuizManagement />} />
        <Route path="drills" element={<DrillManagement />} />
        <Route path="students" element={<StudentManagement />} />
      </Routes>
    </Layout>
  );
};

export default TeacherDashboard;