import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

function PrivatePublicRoute({ authenticated, component: Component }) {
  useEffect(() => {
    if (!authenticated) toast.warn("접근할 수 없는 페이지입니다.");
  }, []);

  return !!authenticated ? Component : <Navigate to="/" />;
}

export default PrivatePublicRoute;