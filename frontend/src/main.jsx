import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";

// Replace with your Clerk Publishable Key from the dashboard
const PUBLISHABLE_KEY = "pk_test_a2luZC1jcmlja2V0LTMxLmNsZXJrLmFjY291bnRzLmRldiQ";

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env.local file");
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);