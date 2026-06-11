import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import NewSubmission from "./pages/NewSubmission";
import ProjectDetails from "./pages/ProjectDetails";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/submit"
            element={<NewSubmission />}
          />

          <Route
            path="/project/:projectName"
            element={<ProjectDetails />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;