import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardOverview from "./DashboardOverview";
import LearningResources from "./LearningResources";
import Quizzes from "./Quizzes";
import SafetyDrills from "./SafetyDrills";
import EmergencyContacts from "./EmergencyContacts";
import TakeQuiz from "./TakeQuiz";
import MessageCenter from "./MessageCenter";
import { MessageCircle } from "lucide-react";

const StudentDashboard = () => {
  return (
    <Layout>
      {/* Temporary Messages Quick Access Button */}
      <div className="mb-4 flex justify-end">
        <Link 
          to="/student-dashboard/messages"
          className="btn btn-primary flex items-center"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Messages
        </Link>
      </div>
      
      <Routes>
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="resources" element={<LearningResources />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="quizzes/:quizId/take" element={<TakeQuiz />} />
        <Route path="drills" element={<SafetyDrills />} />
        <Route path="emergency" element={<EmergencyContacts />} />
        <Route path="messages" element={<MessageCenter />} />
      </Routes>
    </Layout>
  );
};

export default StudentDashboard;