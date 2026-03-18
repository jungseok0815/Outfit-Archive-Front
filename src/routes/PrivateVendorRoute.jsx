import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const PrivateVendorRoute = ({ authenticated, component: Component }) => {
  useEffect(() => {
    if (authenticated !== "USER") toast.warn("접근할 수 없는 페이지입니다.");
  }, []);

  return authenticated === "USER" ? Component : <Navigate to="/" />;
};

export default PrivateVendorRoute;
