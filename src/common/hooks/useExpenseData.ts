import { useContext } from "react";
import {
  ExpenseDataContext,
  type ExpenseData,
} from "@/common/context/ExpenseDataContext";

export function useExpenseData(): ExpenseData {
  const ctx = useContext(ExpenseDataContext);
  if (!ctx)
    throw new Error("useExpenseData must be used inside <ExpenseDataProvider>");
  return ctx;
}
