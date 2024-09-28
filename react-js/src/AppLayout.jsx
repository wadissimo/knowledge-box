import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./features/ui/Sidebar";

export default function AppLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
