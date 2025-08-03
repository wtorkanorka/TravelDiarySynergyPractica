import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";

import Layout from "./Layout.tsx";
import { useEffect, useState } from "react";
import axios from "axios";
import { SignUpPage } from "./Pages/SignUpPage.tsx";
import { LoginPage } from "./Pages/LoginPage.tsx";
import { UserTravelDiary } from "./Pages/[id]/UserTravelDiary.tsx";

function AuthProvider({ children }: { children: React.ReactNode }) {
  // const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000" // Для разработки
      : "https://blog-synergy.vercel.app"; // Для продакшена

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/session");
        // setSession(response.data?.data?.session);
        return response;
      } catch (error) {
        console.error("Auth check failed:", error);
        // setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // const token = JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data
  //   ?.session?.access_token;
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get("/session");

        if (response.data?.session) {
          setIsAuthenticated(true);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        navigate("/login");
      }
    };

    verifySession();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <Layout>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/userTravelDiary/:id" element={<UserTravelDiary />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </Layout>
);
