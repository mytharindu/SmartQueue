import { useState } from 'react'
import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { RequireAuth } from "@/components/RequireAuth";
import IndexPage from "@/pages/Index";
import BookPage from "@/pages/Book";
import MyTokensPage from "@/pages/MyTokens";
import LivePage from "@/pages/Live";
import OfficerPage from "@/pages/Officer";
import AdminPage from "@/pages/Admin";
import CountersPage from "@/pages/Counters";
import ServicesPage from "@/pages/Services";
import DepartmentsPage from "@/pages/Departments";
import TimeSlotsPage from "@/pages/TimeSlots";
import StaffPage from "@/pages/Staff";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
//import './App.css'

function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function App() {
  //const [count, setCount] = useState(0)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/my-tokens" element={<MyTokensPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/officer" element={<RequireAuth><OfficerPage /></RequireAuth>} />
            <Route
              path="/admin"
              element={
                <RequireAuth roles={["supervisor", "manager", "admin"]}>
                  <AdminPage />
                </RequireAuth>
              }
            />
            <Route path="/counters" element={<RequireAuth><CountersPage /></RequireAuth>} />
            <Route
              path="/services"
              element={
                <RequireAuth roles={["supervisor", "manager", "admin"]}>
                  <ServicesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/departments"
              element={
                <RequireAuth roles={["supervisor", "manager", "admin"]}>
                  <DepartmentsPage />
                </RequireAuth>
              }
            />
            <Route path="/time-slots" element={<RequireAuth><TimeSlotsPage /></RequireAuth>} />
            <Route path="/staff" element={<RequireAuth roles={["admin"]}><StaffPage /></RequireAuth>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </div>
  )
}

export default App
