import React, { useState } from "react";
import { useAuth } from "../store/context/UserContext";
import AdminLoginPage from "../pages/admin/AdminLoginPage";

const PrivateMasterRoute = ({ component: Component }) => {
  const { user } = useAuth();
  const [loginSuccess, setLoginSuccess] = useState(false);

  const isAdmin = user && user.authName === "ROLE_ADMIN";

  if (isAdmin || loginSuccess) {
    return Component;
  }

  return <AdminLoginPage onLoginSuccess={() => setLoginSuccess(true)} />;
};

export default PrivateMasterRoute;
