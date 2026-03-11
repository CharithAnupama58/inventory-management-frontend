import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GlobalStyles } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalStyles
      styles={{
        "*": { margin: 0, padding: 0, boxSizing: "border-box" },
        "html, body, #root": {
          width: "100%",
          height: "100%",
          minHeight: "100vh",
        },
      }}
    />
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);