import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  AlertTriangle, 
  BarChart3,
  FileText,
  AlarmClock,
  Phone,
  Users,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  User,
  Shield,
  School
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  // Enhanced icon mapping with animations
  const iconMap = {
    "🏠": <Home className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "📚": <BookOpen className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "⚠️": <AlertTriangle className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "📊": <BarChart3 className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "📝": <FileText className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "🚨": <AlarmClock className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "📞": <Phone className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "👨‍🎓": <Users className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "👨‍🏫": <GraduationCap className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "📈": <TrendingUp className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />,
    "👤": <User className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
  };

  // Role-based links with enhanced structure
  const linksByRole = {
    director: [
      { path: "/director-dashboard/overview", label: "Dashboard Overview", icon: "🏠" },
      { path: "/director-dashboard/resources", label: "Resource Management", icon: "📚" },
      { path: "/director-dashboard/alerts", label: "Alert System", icon: "⚠️" },
      { path: "/director-dashboard/reports", label: "Analytics & Reports", icon: "📊" },
    ],
    teacher: [
      { path: "/teacher-dashboard/overview", label: "Dashboard Overview", icon: "🏠" },
      { path: "/teacher-dashboard/quizzes", label: "Quiz Management", icon: "📝" },
      { path: "/teacher-dashboard/drills", label: "Drill Scheduling", icon: "🚨" },
      { path: "/teacher-dashboard/students", label: "Student Management", icon: "👨‍🎓" },
    ],
    student: [
      { path: "/student-dashboard/overview", label: "Dashboard Overview", icon: "🏠" },
      { path: "/student-dashboard/resources", label: "Learning Resources", icon: "📚" },
      { path: "/student-dashboard/quizzes", label: "Quizzes & Tests", icon: "📝" },
      { path: "/student-dashboard/drills", label: "Safety Drills", icon: "🚨" },
      { path: "/student-dashboard/emergency", label: "Emergency Contacts", icon: "📞" },
    ],
    parent: [
      { path: "/parent-dashboard/overview", label: "Dashboard Overview", icon: "🏠" },
      { path: "/parent-dashboard/progress", label: "Student Progress", icon: "📊" },
      { path: "/parent-dashboard/emergency", label: "Emergency Contacts", icon: "📞" },
    ],
  };

  const links = linksByRole[user?.role] || [];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const isActiveLink = (path) => {
    return location.pathname.startsWith(path) || location.pathname === path;
  };

  // Role-based sidebar header icon
  const getRoleIcon = () => {
    switch(user?.role) {
      case 'director': return <Shield className="h-6 w-6" />;
      case 'teacher': return <School className="h-6 w-6" />;
      case 'student': return <GraduationCap className="h-6 w-6" />;
      case 'parent': return <Users className="h-6 w-6" />;
      default: return <Shield className="h-6 w-6" />;
    }
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 transform transition-all duration-500 ease-out z-40
        ${isOpen ? "translate-x-0 lg:w-64" : "-translate-x-full lg:w-20"}
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-6 border-b border-slate-700/50">
        {isOpen ? (
          <div className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-2xl shadow-lg transform transition-all duration-300 group-hover:scale-110">
              {getRoleIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                EduSafe
              </h2>
              <p className="text-xs text-slate-400 capitalize">{user?.role} Portal</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-110">
            {getRoleIcon()}
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-slate-300 hover:text-white transition-all duration-300 transform hover:scale-110"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* User Info */}
      {isOpen && user && (
        <div className="px-4 py-4 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <p className="text-sm text-slate-400">Welcome back,</p>
          <p className="font-semibold truncate text-white">
            {user.firstName || user.username || user.email}
          </p>
          <p className="text-xs text-slate-300 capitalize">{user.role}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-4 px-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {/* Dashboard Dropdown */}
          <li>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="sidebar-item group relative flex items-center justify-between w-full gap-3 px-3 py-3 rounded-xl transition-all duration-300 text-slate-200 hover:bg-slate-700/50 hover:text-white border border-transparent hover:border-slate-600/50"
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110">
                  <Home className="h-5 w-5" />
                </span>
                {isOpen && <span className="font-medium">Dashboard</span>}
              </div>
              
              {isOpen && (
                <span className="flex-shrink-0 transform transition-transform duration-300">
                  {dropdownOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}

              {/* Enhanced Tooltip for collapsed state */}
              {!isOpen && (
                <span className="absolute left-full ml-2 px-3 py-2 text-sm rounded-lg bg-slate-900 text-white opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-2xl z-50 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  Dashboard
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-slate-900"></div>
                </span>
              )}
            </button>

            {/* Enhanced Dropdown Menu */}
            {dropdownOpen && isOpen && (
              <ul className="ml-6 mt-2 space-y-1 border-l-2 border-slate-600/50 pl-4 animate-fade-in">
                {links.map((link, index) => (
                  <li key={link.path} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <button
                      onClick={() => handleNavigation(link.path)}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 w-full text-left
                        ${
                          isActiveLink(link.path)
                            ? "bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30 shadow-lg"
                            : "text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent"
                        }`}
                    >
                      <span className="flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110">
                        {iconMap[link.icon] || <span>{link.icon}</span>}
                      </span>
                      <span className="text-sm font-medium">{link.label}</span>
                      
                      {/* Active indicator */}
                      {isActiveLink(link.path) && (
                        <div className="absolute right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft"></div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
          
          {/* Individual links for collapsed sidebar */}
          {!isOpen && links.map((link) => (
            <li key={link.path}>
              <button
                onClick={() => handleNavigation(link.path)}
                className={`sidebar-item group relative flex items-center justify-center w-full px-3 py-3 rounded-xl transition-all duration-300
                  ${
                    isActiveLink(link.path)
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  }`}
              >
                <span className="flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110">
                  {iconMap[link.icon] || <span>{link.icon}</span>}
                </span>

                {/* Enhanced Tooltip for collapsed state */}
                <span className="absolute left-full ml-2 px-3 py-2 text-sm rounded-lg bg-slate-900 text-white opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-2xl z-50 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  {link.label}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-slate-900"></div>
                </span>

                {/* Active indicator */}
                {isActiveLink(link.path) && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary-400 rounded-full animate-pulse-soft"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <p className="text-xs text-slate-400 text-center">
            v2.0.0 • {new Date().getFullYear()}
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">Safety First</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;