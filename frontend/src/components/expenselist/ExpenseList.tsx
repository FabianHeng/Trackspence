import { Expense } from "../../models/expense";
import { Category } from "../../models/category";
import { MdDelete, MdEdit } from "react-icons/md";
import { BaseCurrency } from "../../App";

import "./ExpenseList.css";
import { useState, useContext } from "react";
import { currencies } from "../../models/user";
interface Props {
  expenses: Expense[];
  onDelete: (expense: Expense) => void;
  onAddEdit: () => void;
  onEdit: (id: string) => void;
  categories: Category[];
}

const ExpenseList = ({ expenses, onDelete, onAddEdit, onEdit, categories }: Props) => {
  const [baseC] = useContext(BaseCurrency);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Expense | null;
    direction: string;
  }>({ key: "date", direction: "desc" });

  const sortedExpenses = expenses.sort((a, b) => {
    if (sortConfig.key === null) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    } else if (sortConfig.key === "date") {
      const dateA = new Date(aValue as string | number | Date);
      const dateB = new Date(bValue as string | number | Date);
      return sortConfig.direction === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    return 0;
  });

  const handleSort = (key: any) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const totalExpenses = expenses.reduce((sum, expense) => {
    const category = categories.find(cat => cat.name === expense.category);
    if (category && category.type !== "Income") {
      return sum + expense.amount;
    }
    return sum;
  }, 0);

  const totalIncome = expenses.reduce((sum, expense) => {
    const category = categories.find(cat => cat.name === expense.category);
    if (category && category.type !== "Expense") {
      return sum + expense.amount;
    }
    return sum;
  }, 0);

  return (
    <>
      <div className="d-flex justify-content-center table-responsive">
        <table className="table table-bordered table-striped text-center">
          <thead>
            <tr>
              <th
                onClick={() => handleSort("description")}
                className="expenselist-heading"
              >
                Description
                {sortConfig.key === "description" &&
                  (sortConfig.direction === "asc" ? " 🔼" : " 🔽")}
              </th>
              <th
                onClick={() => handleSort("amount")}
                className="expenselist-heading"
              >
                Amount
                {sortConfig.key === "amount" &&
                  (sortConfig.direction === "asc" ? " 🔼" : " 🔽")}
              </th>
              <th
                onClick={() => handleSort("category")}
                className="expenselist-heading hide-header"
              >
                Category
                {sortConfig.key === "category" &&
                  (sortConfig.direction === "asc" ? " 🔼" : " 🔽")}
              </th>
              <th
                onClick={() => handleSort("date")}
                className="expenselist-heading hide-header"
              >
                Date
                {sortConfig.key === "date" &&
                  (sortConfig.direction === "asc" ? " 🔼" : " 🔽")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map((expense) => {
              const date = new Date(expense.date);
              const formattedDate = `${date
                .getDate()
                .toString()
                .padStart(2, "0")}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${date.getFullYear().toString().slice(2)}`;

              return (
                <tr
                  key={expense._id}
                  onClick={(e) => {
                    onAddEdit();
                    onEdit(expense._id);
                    e.stopPropagation();
                  }}
                >
                  <td>{expense.description}</td>
                  
                    {(() => {
                      const expenseCategory = categories.find(cat => cat.name === expense.category);
                      return expenseCategory && expenseCategory.type === "Income" 
                        ? <td style={{color: "var(--light-green)"}}>+{currencies.symbol[baseC as keyof typeof currencies.symbol] || "$"}{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        : <td style={{color: "var(--light-red)"}}>-{currencies.symbol[baseC as keyof typeof currencies.symbol] || "$"}{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    })()}
                  
                  <td className="hide-cell">{expense.category}</td>
                  <td className="hide-cell">{formattedDate}</td>
                  <td>
                    <div className="expenselist-button-container gap-2">
                      <MdEdit
                        className="text-muted expenselist-editdel"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddEdit();
                          onEdit(expense._id);
                        }}
                      />
                      <MdDelete
                        className="text-muted expenselist-editdel"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDelete(expense);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>
                {(totalIncome - totalExpenses) < 0 
                  ? `-${currencies.symbol[baseC as keyof typeof currencies.symbol] || "$"}${Math.abs(totalIncome - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${currencies.symbol[baseC as keyof typeof currencies.symbol] || "$"}${(totalIncome - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default ExpenseList;
