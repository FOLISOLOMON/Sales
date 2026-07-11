import { useState } from "react"
import { Search, Plus, Pencil, Trash2, Package, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import {
  useProducts,
  useSettings,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useQueries"
import { formatCurrency, getTodayString } from "@/utils/formatters"

export function Products() {
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts()
  const { data: settings = { Currency: "$", Low_Stock_Limit: "3" }, isLoading: settingsLoading } = useSettings()
  const addProductMutation = useAddProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()

  const loading = productsLoading || settingsLoading

  const [search, setSearch] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [form, setForm] = useState({
    Product_Name: "",
    Brand: "",
    Category: "",
    Cost_Price: "",
    Selling_Price: "",
    Stock_Quantity: "",
    Date_Added: getTodayString(),
  })

  const currency = settings.Currency || "$"
  const lowStockLimit = parseInt(settings.Low_Stock_Limit || "3", 10)

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.Product_Name?.toLowerCase().includes(q) ||
      p.Brand?.toLowerCase().includes(q) ||
      p.Category?.toLowerCase().includes(q)
    )
  })

  const profitPerItem = (parseFloat(form.Selling_Price) || 0) - (parseFloat(form.Cost_Price) || 0)

  function openAdd() {
    setEditing(null)
    setForm({
      Product_Name: "",
      Brand: "",
      Category: "",
      Cost_Price: "",
      Selling_Price: "",
      Stock_Quantity: "",
      Date_Added: getTodayString(),
    })
    setSheetOpen(true)
  }

  function openEdit(product) {
    setEditing(product)
    setForm({
      Product_Name: product.Product_Name || "",
      Brand: product.Brand || "",
      Category: product.Category || "",
      Cost_Price: String(product.Cost_Price || ""),
      Selling_Price: String(product.Selling_Price || ""),
      Stock_Quantity: String(product.Stock_Quantity || ""),
      Date_Added: product.Date_Added || getTodayString(),
    })
    setSheetOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.Product_Name || !form.Selling_Price) {
      toast.error("Please fill in product name and selling price")
      return
    }

    const data = {
      ...form,
      Cost_Price: parseFloat(form.Cost_Price) || 0,
      Selling_Price: parseFloat(form.Selling_Price) || 0,
      Stock_Quantity: parseInt(form.Stock_Quantity, 10) || 0,
    }

    if (editing) {
      await updateProductMutation.mutateAsync({ productId: editing.Product_ID, updates: data })
      toast.success("Product updated")
    } else {
      await addProductMutation.mutateAsync(data)
      toast.success("Product added")
    }
    setSheetOpen(false)
    refetchProducts()
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteProductMutation.mutateAsync(deleteId)
    toast.success("Product deleted")
    setDeleteId(null)
    refetchProducts()
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Products" subtitle={`${products.length} items in inventory`}>
        <Button size="icon" onClick={openAdd} className="bg-primary text-primary-foreground">
          <Plus className="size-5" />
        </Button>
      </PageHeader>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Package className="size-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        ) : (
          filtered.map((product) => {
            const isLowStock = Number(product.Stock_Quantity || 0) <= lowStockLimit
            const profit = (Number(product.Selling_Price) || 0) - (Number(product.Cost_Price) || 0)
            return (
              <Card key={product.Product_ID} className="border-border/50">
                <CardContent className="py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{product.Product_Name}</p>
                        {isLowStock && (
                          <Badge variant="destructive" className="shrink-0 gap-1 text-[10px]">
                            <AlertTriangle className="size-2.5" />
                            Low
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{product.Brand} · {product.Category}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground">
                          Stock: <span className="font-medium text-foreground">{product.Stock_Quantity}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Profit: <span className="font-medium text-chart-2">{formatCurrency(profit, currency)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-semibold text-primary">{formatCurrency(product.Selling_Price, currency)}</p>
                      <div className="flex gap-1">
                        <Button size="icon-xs" variant="ghost" onClick={() => openEdit(product)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="icon-xs" variant="ghost" onClick={() => setDeleteId(product.Product_ID)} className="text-destructive hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Product" : "Add Product"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-3 px-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={form.Product_Name} onChange={(e) => setForm({ ...form, Product_Name: e.target.value })} placeholder="e.g. Oud Royal" />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={form.Brand} onChange={(e) => setForm({ ...form, Brand: e.target.value })} placeholder="e.g. Veloura" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={form.Category} onChange={(e) => setForm({ ...form, Category: e.target.value })} placeholder="e.g. Eau de Parfum" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cost">Cost Price</Label>
                <Input id="cost" type="number" step="0.01" value={form.Cost_Price} onChange={(e) => setForm({ ...form, Cost_Price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="selling">Selling Price</Label>
                <Input id="selling" type="number" step="0.01" value={form.Selling_Price} onChange={(e) => setForm({ ...form, Selling_Price: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" value={form.Stock_Quantity} onChange={(e) => setForm({ ...form, Stock_Quantity: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label htmlFor="date">Date Added</Label>
                <Input id="date" type="date" value={form.Date_Added} onChange={(e) => setForm({ ...form, Date_Added: e.target.value })} />
              </div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profit per item</span>
                <span className="font-semibold text-primary">{formatCurrency(profitPerItem, currency)}</span>
              </div>
            </div>
            <SheetFooter>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">
                {editing ? "Save Changes" : "Add Product"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
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
