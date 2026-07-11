import { useMemo, useState } from "react"
import { Calendar, TrendingUp, Wallet, Receipt, BarChart3 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { PageHeader } from "@/components/layout/PageHeader"
import { useSales, useExpenses, useSettings } from "@/hooks/useQueries"
import {
  formatCurrency,
  isToday,
  isThisWeek,
  isThisMonth,
  isInRange,
  getBestSellers,
} from "@/utils/formatters"

type FilterType = "today" | "week" | "month" | "custom"

export function Reports() {
  const { data: sales = [], isLoading: salesLoading } = useSales()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: settings = { Currency: "$" }, isLoading: settingsLoading } = useSettings()

  const loading = salesLoading || expensesLoading || settingsLoading

  const [filter, setFilter] = useState<FilterType>("today")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  const currency = settings.Currency || "$"

  function filterByDate(dateStr) {
    switch (filter) {
      case "today":
        return isToday(dateStr)
      case "week":
        return isThisWeek(dateStr)
      case "month":
        return isThisMonth(dateStr)
      case "custom":
        if (!customStart || !customEnd) return false
        return isInRange(dateStr, customStart, customEnd)
      default:
        return true
    }
  }

  const filteredSales = useMemo(() => sales.filter((s) => filterByDate(s.Sale_Date)), [sales, filter, customStart, customEnd])
  const filteredExpenses = useMemo(() => expenses.filter((e) => filterByDate(e.Expense_Date)), [expenses, filter, customStart, customEnd])

  const totalSales = filteredSales.reduce((sum, s) => sum + Number(s.Total_Amount || 0), 0)
  const totalProfit = filteredSales.reduce((sum, s) => sum + Number(s.Profit || 0), 0)
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.Amount || 0), 0)
  const netProfit = totalProfit - totalExpenses
  const bestSellers = useMemo(() => getBestSellers(filteredSales, 5), [filteredSales])

  const barConfig = {
    quantity: { label: "Units Sold", color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" subtitle="Business performance" />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>

      {filter === "custom" && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="start">Start Date</Label>
            <Input id="start" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
          </div>
          <div className="flex-1">
            <Label htmlFor="end">End Date</Label>
            <Input id="end" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard icon={TrendingUp} label="Total Sales" value={formatCurrency(totalSales, currency)} color="text-primary" />
          <SummaryCard icon={Wallet} label="Total Profit" value={formatCurrency(totalProfit, currency)} color="text-chart-2" />
          <SummaryCard icon={Receipt} label="Total Expenses" value={formatCurrency(totalExpenses, currency)} color="text-destructive" />
          <SummaryCard icon={Wallet} label="Net Profit" value={formatCurrency(netProfit, currency)} color={netProfit >= 0 ? "text-chart-2" : "text-destructive"} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4 text-primary" />
            Best Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestSellers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales data for this period</p>
          ) : (
            <ChartContainer config={barConfig} className="min-h-[160px] w-full">
              <BarChart data={bestSellers} layout="vertical" accessibilityLayer margin={{ left: 10, right: 10 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} barSize={18} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales in Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))
          ) : filteredSales.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales in this period</p>
          ) : (
            filteredSales.slice(0, 10).map((sale) => (
              <div key={sale.Sale_ID} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{sale.Product_Name}</p>
                  <p className="text-xs text-muted-foreground">{sale.Quantity_Sold} unit(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{formatCurrency(sale.Total_Amount, currency)}</p>
                  <p className="text-xs text-chart-2">+{formatCurrency(sale.Profit, currency)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className={`size-4 ${color}`} />
          <span className="text-xs">{label}</span>
        </div>
        <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
