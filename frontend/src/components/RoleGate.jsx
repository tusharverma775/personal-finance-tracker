import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function RoleGate({ allow = ['admin','user'], children, disabledFallback = null }) {
  const { user } = useContext(AuthContext);

  const allowed = user && allow.includes(user.role);
  if (allowed) return <>{children}</>;
  if (disabledFallback) return disabledFallback;

  return React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    // safe-add disabled prop to elements that accept it
    return React.cloneElement(child, { disabled: true, title: "Read-only users cannot perform this action", className: `${child.props.className || ""} opacity-60 cursor-not-allowed` });
  });
}
