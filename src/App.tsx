import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/common/components/AppLayout";
import { ExpenseDataProvider } from "@/common/context/ExpenseDataContext";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import DataSourcesPage from "@/pages/data-sources/DataSourcesPage";

export default function App() {
  return (
    <ExpenseDataProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="data-sources" element={<DataSourcesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ExpenseDataProvider>
  );
}
