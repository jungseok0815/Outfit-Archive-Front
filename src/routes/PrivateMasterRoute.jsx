import React, { useState } from "react";
import { useAuth } from "../store/context/UserContext";
import AdminLoginPage from "../pages/admin/AdminLoginPage";

const PrivateMasterRoute = ({ component: Component }) => {
  const { adminUser } = useAuth();
  const [loginSuccess, setLoginSuccess] = useState(false);

  if (adminUser || loginSuccess) {
    return Component;
  }

  return <AdminLoginPage onLoginSuccess={() => setLoginSuccess(true)} />;
};

export default PrivateMasterRoute;
