import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import LoginPage     from "../Features/auth/LoginPage";
import DashboardPage from "../Features/dashboard/DashboardPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <Routes>
          <Route path="/"                 element={<LoginPage />} />
          <Route path="/admin/dashboard"  element={<DashboardPage />} />
          <Route path="/staff/dashboard"  element={<DashboardPage />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}