import { useEffect, useState, useCallback } from "react"
import { Plus, Receipt, Trash2, Wallet, TrendingDown } from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PageHeader } from "@/components/layout/PageHeader"
import { getExpenses, getSales, addExpense, deleteExpense, getSettings } from "@/services/api"
import { formatCurrency, formatShortDate, getTodayString } from "@/utils/formatters"

export function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [sales, setSales] = useState([])
  const [settings, setSettings] = useState({ Currency: "$" })
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [form, setForm] = useState({
    Expense_Name: "",
    Amount: "",
    Description: "",
    Expense_Date: getTodayString(),
  })

  const load = useCallback(async () => {
    setLoading(true)
    const [e, s, st] = await Promise.all([getExpenses(), getSales(), getSettings()])
    setExpenses(e)
    setSales(s)
    setSettings(st)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const currency = settings.Currency || "$"

  const totalExpenses = expenses.reduce((sum, e) => sum + e.Amount, 0)
  const totalProfit = sales.reduce((sum, s) => sum + s.Profit, 0)
  const netProfit = totalProfit - totalExpenses

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.Expense_Name || !form.Amount) {
      toast.error("Please fill in expense name and amount")
      return
    }

    const data = {
      Expense_Name: form.Expense_Name,
      Amount: parseFloat(form.Amount) || 0,
      Description: form.Description,
      Expense_Date: form.Expense_Date,
    }

    await addExpense(data)
    toast.success("Expense added")
    setSheetOpen(false)
    setForm({ Expense_Name: "", Amount: "", Description: "", Expense_Date: getTodayString() })
    load()
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteExpense(deleteId)
    toast.success("Expense deleted")
    setDeleteId(null)
    load()
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Expenses" subtitle="Track business costs">
        <Button size="icon" onClick={() => setSheetOpen(true)} className="bg-primary text-primary-foreground">
          <Plus className="size-5" />
        </Button>
      </PageHeader>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingDown className="size-4 text-destructive" />
                <span className="text-xs">Total Expenses</span>
              </div>
              <p className="mt-2 text-xl font-bold text-destructive">
                {formatCurrency(totalExpenses, currency)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="size-4 text-primary" />
                <span className="text-xs">Net Profit</span>
              </div>
              <p className={`mt-2 text-xl font-bold ${netProfit >= 0 ? "text-chart-2" : "text-destructive"}`}>
                {formatCurrency(netProfit, currency)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Receipt className="size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No expenses recorded</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.Expense_ID}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{expense.Expense_Name}</p>
                  {expense.Description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {expense.Description}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatShortDate(expense.Expense_Date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-destructive">
                    -{formatCurrency(expense.Amount, currency)}
                  </p>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => setDeleteId(expense.Expense_ID)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Expense Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Expense</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-3 px-4">
            <div>
              <Label htmlFor="exp-name">Expense Name</Label>
              <Input
                id="exp-name"
                value={form.Expense_Name}
                onChange={(e) => setForm({ ...form, Expense_Name: e.target.value })}
                placeholder="e.g. Packaging Materials"
              />
            </div>
            <div>
              <Label htmlFor="exp-amount">Amount</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                value={form.Amount}
                onChange={(e) => setForm({ ...form, Amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="exp-desc">Description</Label>
              <Textarea
                id="exp-desc"
                value={form.Description}
                onChange={(e) => setForm({ ...form, Description: e.target.value })}
                placeholder="Optional details..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="exp-date">Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={form.Expense_Date}
                onChange={(e) => setForm({ ...form, Expense_Date: e.target.value })}
              />
            </div>
            <SheetFooter>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">
                Add Expense
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
