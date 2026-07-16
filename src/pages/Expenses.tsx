import { useState, useEffect } from "react"
import { Plus, Receipt, Trash2, Wallet, TrendingDown, Loader2 } from "lucide-react"
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
import { DataError } from "@/components/DataError"
import { AnimatedCard } from "@/components/AnimatedCard"
import { AnimatedCounter } from "@/components/AnimatedCounter"
import { motion } from "motion/react"
import { stagger } from "@/lib/motion"
import {
  useExpenses,
  useSales,
  useSettings,
  useAddExpense,
  useDeleteExpense,
} from "@/hooks/useQueries"
import { formatCurrency, formatShortDate, getTodayString } from "@/utils/formatters"
import { usePageTitle, useAddAction } from "@/components/layout/AppShell"

export function Expenses() {
  const { data: expenses = [], isLoading: expensesLoading, isError: expensesError, refetch: refetchExpenses } = useExpenses()
  const { data: sales = [], isLoading: salesLoading, isError: salesError, refetch: refetchSales } = useSales()
  const { data: settings = { Currency: "$" }, isLoading: settingsLoading, isError: settingsError, refetch: refetchSettings } = useSettings()
  const { setTitle } = usePageTitle()
  const addExpenseMutation = useAddExpense()
  const deleteExpenseMutation = useDeleteExpense()

  const loading = expensesLoading || salesLoading || settingsLoading
  const isError = expensesError || salesError || settingsError
  const retryAll = () => {
    refetchExpenses()
    refetchSales()
    refetchSettings()
  }
  const isSaving = addExpenseMutation.isPending

  useEffect(() => {
    setTitle("Expenses", "Track business costs")
  }, [setTitle])

  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const registerAddAction = useAddAction()

  useEffect(() => {
    registerAddAction(() => setSheetOpen(true))
    return () => registerAddAction(undefined)
  }, [registerAddAction, setSheetOpen])

  const [form, setForm] = useState({
    Expense_Name: "",
    Amount: "",
    Description: "",
    Expense_Date: getTodayString(),
  })

  const currency = settings.Currency || "$"

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.Amount || 0), 0)
  const totalProfit = sales.reduce((sum, s) => sum + Number(s.Profit || 0), 0)
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

    await addExpenseMutation.mutateAsync(data)
    toast.success("Expense added")
    setSheetOpen(false)
    setForm({ Expense_Name: "", Amount: "", Description: "", Expense_Date: getTodayString() })
    refetchExpenses()
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteExpenseMutation.mutateAsync(deleteId)
    toast.success("Expense deleted")
    setDeleteId(null)
    refetchExpenses()
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <motion.div
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: stagger.item } },
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3"
        >
          <AnimatedCard>
            <Card className="border-border/50 bg-transparent">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingDown className="size-4 text-destructive" />
                  <span className="text-xs">Total Expenses</span>
                </div>
                <p className="mt-2 text-xl font-bold text-destructive">
                  <AnimatedCounter value={totalExpenses} prefix={currency} />
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.05}>
            <Card className="border-primary/20 bg-primary/5 bg-transparent">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="size-4 text-primary" />
                  <span className="text-xs">Net Profit</span>
                </div>
                <p className={`mt-2 text-xl font-bold ${netProfit >= 0 ? "text-chart-2" : "text-destructive"}`}>
                  <AnimatedCounter value={netProfit} prefix={currency} />
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))
          ) : isError && expenses.length === 0 ? (
            <DataError onRetry={retryAll} />
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Receipt className="size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No expenses recorded</p>
            </div>
          ) : (
            <motion.div
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: stagger.item } },
              }}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {expenses.map((expense, index) => (
                <motion.div
                  key={expense.Expense_ID}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                >
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{expense.Expense_Name}</p>
                      {expense.Description && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{expense.Description}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatShortDate(expense.Expense_Date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-destructive">-{formatCurrency(expense.Amount, currency)}</p>
                      <Button size="icon-xs" variant="ghost" onClick={() => setDeleteId(expense.Expense_ID)} className="text-destructive hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Expense</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-3 px-4">
            <div>
              <Label htmlFor="exp-name">Expense Name</Label>
              <Input id="exp-name" value={form.Expense_Name} onChange={(e) => setForm({ ...form, Expense_Name: e.target.value })} placeholder="e.g. Packaging Materials" />
            </div>
            <div>
              <Label htmlFor="exp-amount">Amount</Label>
              <Input id="exp-amount" type="number" step="0.01" value={form.Amount} onChange={(e) => setForm({ ...form, Amount: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="exp-desc">Description</Label>
              <Textarea id="exp-desc" value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} placeholder="Optional details..." rows={3} />
            </div>
            <div>
              <Label htmlFor="exp-date">Date</Label>
              <Input id="exp-date" type="date" value={form.Expense_Date} onChange={(e) => setForm({ ...form, Expense_Date: e.target.value })} />
            </div>
            <SheetFooter>
              <Button type="submit" disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Add Expense"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
