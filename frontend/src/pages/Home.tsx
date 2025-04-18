import "bootstrap/dist/css/bootstrap.css";
import SectionOne from "../components/SectionOne";
import SectionTwo from "../components/SectionTwo";

import { useContext, useEffect, useState } from "react";
import AddEditExpenseDialog from "../components/AddEditExpenseDialog";
import { Expense } from "../models/expense";
import { Category } from "../models/category";
import * as expensesApi from "../network/expenses_api";
import { months } from "../models/expense";
import Filter from "../components/filter/Filter";
import Loader from "../components/loader/Loader";
import { Context } from "../App";
import Overlay from "../Overlay.tsx";

function Home() {
  const [selectedExpense, setSelectedExpense] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useContext(Context);
  const [showOverlay, setShowOverlay] = useState(false);
  
  const FilteredMonth = selectedMonth
    ? expenses.filter((expense) => {
        // Parse the date string into a JavaScript Date object
        const expenseDate = new Date(expense.date);
        // Get the month index (0-indexed) from the Date object
        const expenseMonth = months[expenseDate.getMonth()];
        // Compare the month abbreviation with the selected month
        return expenseMonth === selectedMonth;
      })
    : expenses;

    const FilteredYear = selectedYear
    ? FilteredMonth.filter((expense) => {
        // Parse the date string into a JavaScript Date object
        const expenseDate = new Date(expense.date);
        // Get the month index (0-indexed) from the Date object
        const expenseYear = expenseDate.getFullYear().toString();
        // Compare the month abbreviation with the selected month
        return expenseYear === selectedYear;
      })
    : FilteredMonth;

  const selectedExpenses = selectedCategory
    ? FilteredYear.filter((e) => e.category === selectedCategory)
    : FilteredYear;

    const selectedExpenses2 = selectedType
    ? selectedExpenses.filter((expense) => {
        const category = categories.find((cat) => cat.name === expense.category);
        return category && category.type === selectedType;
      })
    : selectedExpenses;

  useEffect(() => {
      async function loadCategories() {
        try {
            setLoading(true);
            const categories = await expensesApi.fetchCategory();
            setLoading(false);
            setCategories(categories);
        } catch (error) {
            console.error(error);
        }
      }
      loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [categories]);

  useEffect(() => {
    async function loadExpenses() {
      try {
        setLoading(true);
        const expenses = await expensesApi.fetchExpense();
        setLoading(false);
        setExpenses(expenses);
      } catch (error) {
        console.error(error);
      }
    }
    loadExpenses();
  }, []);

  async function deleteExpense(expense: Expense) {
    const isConfirmed = window.confirm("Are you sure you want to delete the transaction?");
    if (!isConfirmed) {
      return;
    }
    try {
      setLoading(true);
      await expensesApi.deleteExpense(expense._id);
      setLoading(false);
      setExpenses(expenses.filter((e) => e._id !== expense._id));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="container content mb-5">
          {showOverlay && <Overlay />}
          <div className="row">
            <SectionOne expenses={expenses} categories={categories} />
            <SectionTwo
              expenses={FilteredYear}
              categories={categories}
              selectedExpenses={selectedExpenses2}
              onDelete={(id) => deleteExpense(id)}
              onAddEdit={() => setShowAddDialog(true)}
              onEdit={(id) => setSelectedExpense(id)}
              onFilter={() => setShowFilter(true)}
            />
          </div>

          {showAddDialog && (
            <AddEditExpenseDialog
              expenseToEdit={selectedExpense}
              expenses={expenses}
              onDismiss={() => {
                setShowAddDialog(false);
                setSelectedExpense("");
              }}
              updateExpenses={setExpenses}
              categories={categories}
            />
          )}

          {showFilter && (
            <Filter
              onDismiss={() => setShowFilter(false)}
              onSelectMonth={(month) => setSelectedMonth(month)}
              onSelectYear = {(year) => setSelectedYear(year)}
              onSelectCategory={(category) => setSelectedCategory(category)}
              onSelectType={(type) => setSelectedType(type)}
              categories={categories}
              month={selectedMonth}
              year = {selectedYear}
              category={selectedCategory}
              type={selectedType}
            />
          )}
        </div>
      )}
    </>
  );
}

export default Home;
