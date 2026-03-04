import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/context/UserContext";

const PrivateUserRoute = ({ component: Component }) => {
  const { user } = useAuth();

  if (user) {
    return Component;
  }

  return <Navigate to="/" replace />;
};

export default PrivateUserRoute;
