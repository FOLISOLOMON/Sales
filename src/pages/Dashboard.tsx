import { useMemo } from "react"
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Wallet,
  BarChart3,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { useSales, useProducts, useSettings } from "@/hooks/useQueries"
import {
  formatCurrency,
  formatShortDate,
  getLast7Days,
  getBestSellers,
  getTodayString,
} from "@/utils/formatters"

export function Dashboard() {
  const { data: sales = [], isLoading: salesLoading } = useSales()
  const { data: products = [], isLoading: productsLoading } = useProducts()
  const { data: settings = { Currency: "$", Business_Name: "Veloura" }, isLoading: settingsLoading } = useSettings()

  const loading = salesLoading || productsLoading || settingsLoading

  const currency = settings.Currency || "$"
  const trendData = getLast7Days(sales)
  const bestSellers = useMemo(() => getBestSellers(sales, 5), [sales])

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const todayStr = getTodayString()
  const lowStockLimit = parseInt(settings.Low_Stock_Limit || "3", 10)

  const todaySales = sales
    .filter((s) => s.Sale_Date === todayStr)
    .reduce((sum, s) => sum + (Number(s.Total_Amount) || 0), 0)

  const todayProfit = sales
    .filter((s) => s.Sale_Date === todayStr)
    .reduce((sum, s) => sum + (Number(s.Profit) || 0), 0)

  const monthlyRevenue = sales
    .filter((s) => {
      if (!s.Sale_Date) return false
      const [y, m] = s.Sale_Date.split("-").map(Number)
      return y === currentYear && m === currentMonth
    })
    .reduce((sum, s) => sum + (Number(s.Total_Amount) || 0), 0)

  const monthlyProfit = sales
    .filter((s) => {
      if (!s.Sale_Date) return false
      const [y, m] = s.Sale_Date.split("-").map(Number)
      return y === currentYear && m === currentMonth
    })
    .reduce((sum, s) => sum + (Number(s.Profit) || 0), 0)

  const totalProducts = products.length

  const totalStockValue = products.reduce(
    (sum, p) => sum + (Number(p.Stock_Quantity) || 0) * (Number(p.Selling_Price) || 0),
    0
  )

  const lowStockCount = products.filter((p) => (Number(p.Stock_Quantity) || 0) <= lowStockLimit).length

  const chartConfig = {
    sales: { label: "Sales", color: "var(--chart-1)" },
    profit: { label: "Profit", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const barConfig = {
    quantity: { label: "Units Sold", color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <div className="space-y-5">
      <PageHeader title={settings.Business_Name || "Veloura"} subtitle="Business Overview" />

      {loading ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : (
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Sparkles className="size-4 text-primary" />
                  Today's Sales
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-gold-gradient">
                  {formatCurrency(todaySales, currency)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Profit: {" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(todayProfit, currency)}
                  </span>
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                <DollarSign className="size-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard icon={TrendingUp} label="Monthly Revenue" value={formatCurrency(monthlyRevenue, currency)} />
            <StatCard icon={Wallet} label="Monthly Profit" value={formatCurrency(monthlyProfit, currency)} />
            <StatCard icon={Package} label="Total Products" value={String(totalProducts)} />
            <StatCard icon={DollarSign} label="Stock Value" value={formatCurrency(totalStockValue, currency)} />
          </>
        )}
      </div>

      {!loading && lowStockCount > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Low Stock Alert</p>
                <p className="text-xs text-muted-foreground">
                  {lowStockCount} item(s) need restocking
                </p>
              </div>
              <Badge variant="destructive">{lowStockCount}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4 text-primary" />
            Sales & Profit Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
            <AreaChart data={trendData} accessibilityLayer>
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                width={40}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="sales" stroke="var(--color-sales)" fill="url(#fillSales)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke="var(--color-profit)" fill="url(#fillProfit)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-primary" />
            Best Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="min-h-[160px] w-full">
            <BarChart data={bestSellers} layout="vertical" accessibilityLayer margin={{ left: 10, right: 10 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.15} />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} barSize={18} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))
          ) : (
            sales.slice(0, 5).map((sale) => (
              <div key={sale.Sale_ID} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{sale.Product_Name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sale.Quantity_Sold} unit(s) · {formatShortDate(sale.Sale_Date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{formatCurrency(sale.Total_Amount, currency)}</p>
                  <p className="flex items-center justify-end gap-0.5 text-xs text-muted-foreground">
                    <ArrowUpRight className="size-3 text-chart-2" />
                    {formatCurrency(sale.Profit, currency)}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4 text-primary" />
          <span className="text-xs">{label}</span>
        </div>
        <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}
