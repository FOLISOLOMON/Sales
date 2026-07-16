import { useState, useEffect, useCallback } from "react"
import { Plus, ShoppingCart, Search, Loader2, Users, Ban } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataError } from "@/components/DataError"
import { AnimatedCard } from "@/components/AnimatedCard"
import { motion } from "motion/react"
import { stagger } from "@/lib/motion"
import {
  useSales,
  useProducts,
  useCustomers,
  useSettings,
  useAddSale,
  useUpdateSale,
  useVoidSale,
} from "@/hooks/useQueries"
import { formatCurrency, formatShortDate, getTodayString } from "@/utils/formatters"
import { usePageTitle, useAddAction } from "@/components/layout/AppShell"

export function Sales() {
  const { data: sales = [], isLoading: salesLoading, isError: salesError, refetch: refetchSales } = useSales()
  const { data: products = [], isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useProducts()
  const { data: customers = [], isLoading: customersLoading, isError: customersError, refetch: refetchCustomers } = useCustomers()
  const { data: settings = { Currency: "$" }, isLoading: settingsLoading, isError: settingsError, refetch: refetchSettings } = useSettings()
  const { setTitle } = usePageTitle()
  const addSaleMutation = useAddSale()
  const updateSaleMutation = useUpdateSale()
  const voidSaleMutation = useVoidSale()

  const loading = salesLoading || productsLoading || customersLoading || settingsLoading
  const isError = salesError || productsError || customersError || settingsError
  const retryAll = () => {
    refetchSales()
    refetchProducts()
    refetchCustomers()
    refetchSettings()
  }
  const isSaving = addSaleMutation.isPending || updateSaleMutation.isPending

  useEffect(() => {
    setTitle("Sales", `${sales.length} total sales`)
  }, [sales, setTitle])

  const customerMap = Object.fromEntries(
    customers.map((c) => [c.Customer_ID, c.Customer_Name])
  )

  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState("")

  const [assignOpen, setAssignOpen] = useState(false)
  const [assignSaleId, setAssignSaleId] = useState("")
  const [assignCustomerId, setAssignCustomerId] = useState("none")

  const [voidSaleId, setVoidSaleId] = useState("")

  const [form, setForm] = useState({
    Product_ID: "",
    Quantity_Sold: "1",
    Payment_Method: "Cash",
    Customer_ID: "none",
    Selling_Price: "",
    Sale_Date: getTodayString(),
  })

  const currency = settings.Currency || "$"

  const selectedProduct = products.find((p) => p.Product_ID === form.Product_ID)
  const basePrice = Number(selectedProduct?.Selling_Price || 0)
  const costPrice = Number(selectedProduct?.Cost_Price || 0)
  const quantity = parseInt(form.Quantity_Sold, 10) || 0
  const finalPrice = Number(form.Selling_Price) || 0
  const discountPct = basePrice > 0 ? (1 - finalPrice / basePrice) * 100 : 0
  const totalAmount = quantity * finalPrice
  const costTotal = quantity * costPrice
  const profit = totalAmount - costTotal

  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase()
    return s.Product_Name?.toLowerCase().includes(q) || s.Sale_ID?.toLowerCase().includes(q)
  })

  const openAdd = useCallback(() => {
    setForm({
      Product_ID: "",
      Quantity_Sold: "1",
      Payment_Method: "Cash",
      Customer_ID: "none",
      Selling_Price: "",
      Sale_Date: getTodayString(),
    })
    setSheetOpen(true)
  }, [])

  const registerAddAction = useAddAction()

  useEffect(() => {
    registerAddAction(openAdd)
    return () => registerAddAction(undefined)
  }, [registerAddAction, openAdd])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.Product_ID) {
      toast.error("Please select a product")
      return
    }
    if (!form.Sale_Date) {
      toast.error("Please select a sale date")
      return
    }
    if (quantity < 1) {
      toast.error("Quantity must be at least 1")
      return
    }
    if (selectedProduct && quantity > Number(selectedProduct.Stock_Quantity || 0)) {
      toast.error(
        Number(selectedProduct.Stock_Quantity || 0) === 0
          ? "This product is out of stock"
          : `Only ${selectedProduct.Stock_Quantity} in stock`
      )
      return
    }
    if (finalPrice <= 0) {
      toast.error("Selling price must be greater than 0")
      return
    }
    if (basePrice > 0 && finalPrice > basePrice) {
      toast.error("Selling price cannot exceed the base price")
      return
    }

    const saleData = {
      Product_ID: form.Product_ID,
      Product_Name: selectedProduct.Product_Name,
      Quantity_Sold: quantity,
      Selling_Price: finalPrice,
      Discount_Pct: discountPct,
      Total_Amount: totalAmount,
      Cost_Total: costTotal,
      Profit: profit,
      Sale_Date: form.Sale_Date,
      Payment_Method: form.Payment_Method,
      Customer_ID: form.Customer_ID === "none" ? "" : form.Customer_ID,
    }

    await addSaleMutation.mutateAsync(saleData)
    toast.success("Sale recorded successfully")
    setSheetOpen(false)
    refetchSales()
  }

  function openAssign(sale) {
    setAssignSaleId(sale.Sale_ID)
    setAssignCustomerId(sale.Customer_ID || "none")
    setAssignOpen(true)
  }

  async function handleAssign(e) {
    e.preventDefault()
    const customerId = assignCustomerId === "none" ? "" : assignCustomerId
    await updateSaleMutation.mutateAsync({
      saleId: assignSaleId,
      updates: { Customer_ID: customerId },
    })
    toast.success(customerId ? "Customer assigned to sale" : "Customer removed from sale")
    setAssignOpen(false)
  }

  async function handleVoid() {
    if (!voidSaleId) return
    await voidSaleMutation.mutateAsync(voidSaleId)
    toast.success("Sale voided. Stock has been restored.")
    setVoidSaleId("")
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search sales..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <motion.div
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: stagger.item } },
        }}
        initial="hidden"
        animate="show"
        className="space-y-2.5"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))
        ) : isError && filteredSales.length === 0 ? (
          <DataError onRetry={retryAll} />
        ) : filteredSales.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingCart className="size-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No sales found</p>
          </div>
        ) : (
          filteredSales.map((sale, index) => {
            const customerName = sale.Customer_ID ? customerMap[sale.Customer_ID] : ""
            const isPending = sale._pendingSync || String(sale.Sale_ID).startsWith("temp-")
            const isVoided = sale.Status === "Voided"
            return (
              <motion.div
                key={sale.Sale_ID}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
              >
                <AnimatedCard delay={index * 0.04}>
                  <Card className={`border-border/50 bg-transparent ${isVoided ? "opacity-60" : ""}`}>
                    <CardContent className="py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`truncate font-medium ${isVoided ? "line-through" : ""}`}>{sale.Product_Name}</p>
                            {isVoided && (
                              <Badge variant="destructive" className="shrink-0 text-[10px]">
                                Voided
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {sale.Quantity_Sold} unit(s)
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatShortDate(sale.Sale_Date)}</span>
                            {customerName ? (
                              <Badge variant="outline" className="gap-1 text-[10px]">
                                <Users className="size-3" />
                                {customerName}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Walk-in</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <p className={`font-semibold ${isVoided ? "text-muted-foreground line-through" : "text-primary"}`}>{formatCurrency(sale.Total_Amount, currency)}</p>
                          <p className="text-xs text-chart-2">+{formatCurrency(sale.Profit, currency)} profit</p>
                          <div className="flex items-center gap-1">
                            <motion.div whileTap={{ scale: 0.95 }}>
                              <Button
                                size="xs"
                                variant="ghost"
                                disabled={isPending || isVoided}
                                onClick={() => openAssign(sale)}
                                title={isPending ? "Synced sales only" : "Assign customer"}
                              >
                                <Users className="size-3" />
                                {customerName ? "Reassign" : "Assign"}
                              </Button>
                            </motion.div>
                            <motion.div whileTap={{ scale: 0.95 }}>
                              <Button
                                size="xs"
                                variant="ghost"
                                disabled={isPending || isVoided}
                                onClick={() => setVoidSaleId(sale.Sale_ID)}
                                className="text-destructive hover:text-destructive"
                                title={isPending ? "Synced sales only" : isVoided ? "Already voided" : "Void sale"}
                              >
                                <Ban className="size-3" />
                                {isVoided ? "Voided" : "Void"}
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </motion.div>
            )
          })
        )}
      </motion.div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record New Sale</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-3 px-4">
            <div>
              <Label>Select Product</Label>
              <Select
                value={form.Product_ID}
                onValueChange={(v) => {
                  const product = products.find((p) => p.Product_ID === v)
                  setForm({
                    ...form,
                    Product_ID: v,
                    Selling_Price: product ? String(product.Selling_Price) : "",
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.Product_ID} value={p.Product_ID}>
                      {Number(p.Stock_Quantity || 0) === 0
                        ? `${p.Product_Name} (Out of stock)`
                        : `${p.Product_Name} (${p.Stock_Quantity} in stock)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sale-date">Sale Date</Label>
              <Input
                id="sale-date"
                type="date"
                max={getTodayString()}
                value={form.Sale_Date}
                onChange={(e) => setForm({ ...form, Sale_Date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" min="1" value={form.Quantity_Sold} onChange={(e) => setForm({ ...form, Quantity_Sold: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="price">Selling Price (editable)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                disabled={!selectedProduct}
                value={form.Selling_Price}
                onChange={(e) => setForm({ ...form, Selling_Price: e.target.value })}
              />
              {selectedProduct && basePrice > 0 && finalPrice !== basePrice && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Base: {formatCurrency(basePrice, currency)} ·{" "}
                  <span className="font-medium text-chart-2">
                    {discountPct > 0 ? `${discountPct.toFixed(1)}% off` : `${Math.abs(discountPct).toFixed(1)}% over`}
                  </span>
                </p>
              )}
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={form.Payment_Method} onValueChange={(v) => setForm({ ...form, Payment_Method: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Customer (optional)</Label>
              <Select value={form.Customer_ID} onValueChange={(v) => setForm({ ...form, Customer_ID: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Walk-in customer</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.Customer_ID} value={c.Customer_ID}>
                      {c.Customer_Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <div className="space-y-1.5 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Price</span>
                  <span>{formatCurrency(basePrice, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selling Price</span>
                  <span className="font-semibold">{formatCurrency(finalPrice, currency)}</span>
                </div>
                {discountPct !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-chart-2">
                      {discountPct > 0 ? `${discountPct.toFixed(1)}% off` : `${Math.abs(discountPct).toFixed(1)}% over`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">{formatCurrency(totalAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cost Total</span>
                  <span>{formatCurrency(costTotal, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-1.5 text-sm">
                  <span className="text-muted-foreground">Profit</span>
                  <span className="font-semibold text-chart-2">{formatCurrency(profit, currency)}</span>
                </div>
              </div>
            )}

            <SheetFooter>
              <Button type="submit" disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Complete Sale"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={assignOpen} onOpenChange={setAssignOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Assign Customer</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAssign} className="space-y-3 px-4">
            <div>
              <Label>Customer</Label>
              <Select value={assignCustomerId} onValueChange={setAssignCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Walk-in customer</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.Customer_ID} value={c.Customer_ID}>
                      {c.Customer_Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <SheetFooter>
              <Button type="submit" disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!voidSaleId} onOpenChange={(open) => !open && setVoidSaleId("")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Sale</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the sale as voided and returns the sold quantity to stock. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVoid} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Void Sale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
