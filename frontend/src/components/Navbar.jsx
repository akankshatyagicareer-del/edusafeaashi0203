import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { Menu, User, LogOut, Settings, Shield, School, GraduationCap, Users } from "lucide-react";

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    return `/${user.role}-dashboard`;
  };

  // Role-based icons and colors
  const getRoleConfig = () => {
    const config = {
      director: { 
        icon: Shield, 
        color: "from-purple-500 to-purple-600", 
        bgColor: "bg-purple-100",
        ringColor: "ring-purple-200"
      },
      teacher: { 
        icon: School, 
        color: "from-blue-500 to-blue-600", 
        bgColor: "bg-blue-100",
        ringColor: "ring-blue-200"
      },
      student: { 
        icon: GraduationCap, 
        color: "from-green-500 to-green-600", 
        bgColor: "bg-green-100",
        ringColor: "ring-green-200"
      },
      parent: { 
        icon: Users, 
        color: "from-orange-500 to-orange-600", 
        bgColor: "bg-orange-100",
        ringColor: "ring-orange-200"
      }
    };
    return config[user?.role] || { icon: User, color: "from-slate-500 to-slate-600", bgColor: "bg-slate-100" };
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4 sticky top-0 z-50 shadow-soft animate-slide-down">
      <div className="flex items-center justify-between">
        {/* Left Section - Brand and Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 rounded-2xl hover:bg-primary-50 transition-all duration-300 text-slate-600 hover:text-primary-600 border border-transparent hover:border-primary-100 group"
          >
            <Menu className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          </button>
          
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate(getDashboardPath())}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            
            <div className="hidden md:block transform transition-all duration-300 group-hover:translate-x-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                EduSafe
              </h1>
              <p className="text-xs text-slate-500 font-medium">Safety & Education Platform</p>
            </div>
          </div>
        </div>

        {/* Right Section - User Info */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              {/* User Info Badge */}
              <div className="hidden lg:flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-slate-200/50 shadow-soft hover:shadow-medium transition-all duration-300 group">
                <div className={`p-2 rounded-full ${roleConfig.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                  <RoleIcon className="h-4 w-4 text-slate-700" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 transition-all duration-300 group-hover:text-primary-600">
                    {user.firstName || user.username}
                  </p>
                  <p className="text-xs text-slate-600 capitalize font-medium">{user.role}</p>
                </div>
              </div>

              {/* User Avatar with Dropdown */}
              <div className="relative group">
                <button className="flex items-center justify-center h-12 w-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white ring-2 ring-primary-200">
                  {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                </button>
                
                {/* Animated dropdown menu */}
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                  {/* Dropdown header */}
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
                    <p className="font-semibold truncate">{user.firstName || user.username}</p>
                    <p className="text-sm opacity-90 capitalize">{user.role}</p>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-primary-50 flex items-center space-x-3 transition-all duration-200 group/item">
                      <User className="h-4 w-4 text-primary-600 transition-transform duration-300 group-hover/item:scale-110" />
                      <span className="group-hover/item:text-primary-600 transition-colors duration-200">Profile Settings</span>
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-primary-50 flex items-center space-x-3 transition-all duration-200 group/item">
                      <Settings className="h-4 w-4 text-primary-600 transition-transform duration-300 group-hover/item:scale-110" />
                      <span className="group-hover/item:text-primary-600 transition-colors duration-200">Account Settings</span>
                    </button>
                    <hr className="my-2 border-slate-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-all duration-200 group/item"
                    >
                      <LogOut className="h-4 w-4 transition-transform duration-300 group-hover/item:scale-110" />
                      <span className="group-hover/item:text-red-700 transition-colors duration-200">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;