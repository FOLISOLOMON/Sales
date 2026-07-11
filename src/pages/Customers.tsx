import { useState } from "react"
import { Plus, Pencil, Trash2, Users, Phone, MapPin, ShoppingBag, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  useCustomers,
  useSales,
  useSettings,
  useAddCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/useQueries"
import { formatCurrency, formatShortDate, getTodayString, getInitials } from "@/utils/formatters"

export function Customers() {
  const { data: customers = [], isLoading: customersLoading, refetch: refetchCustomers } = useCustomers()
  const { data: sales = [], isLoading: salesLoading } = useSales()
  const { data: settings = { Currency: "$" }, isLoading: settingsLoading } = useSettings()
  const addCustomerMutation = useAddCustomer()
  const updateCustomerMutation = useUpdateCustomer()
  const deleteCustomerMutation = useDeleteCustomer()

  const loading = customersLoading || salesLoading || settingsLoading
  const isSaving = addCustomerMutation.isPending || updateCustomerMutation.isPending

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const [form, setForm] = useState({
    Customer_Name: "",
    Phone_Number: "",
    Location: "",
    Date_Added: getTodayString(),
  })

  const currency = settings.Currency || "$"

  function getCustomerPurchases(customerId) {
    return sales.filter((s) => s.Customer_ID === customerId)
  }

  function getCustomerTotal(customerId) {
    return getCustomerPurchases(customerId).reduce((sum, s) => sum + (Number(s.Total_Amount) || 0), 0)
  }

  function openAdd() {
    setEditing(null)
    setForm({
      Customer_Name: "",
      Phone_Number: "",
      Location: "",
      Date_Added: getTodayString(),
    })
    setSheetOpen(true)
  }

  function openEdit(customer) {
    setEditing(customer)
    setForm({
      Customer_Name: customer.Customer_Name || "",
      Phone_Number: customer.Phone_Number || "",
      Location: customer.Location || "",
      Date_Added: customer.Date_Added || getTodayString(),
    })
    setSheetOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.Customer_Name) {
      toast.error("Please enter customer name")
      return
    }

    if (editing) {
      await updateCustomerMutation.mutateAsync({ customerId: editing.Customer_ID, updates: form })
      toast.success("Customer updated")
    } else {
      await addCustomerMutation.mutateAsync(form)
      toast.success("Customer added")
    }
    setSheetOpen(false)
    refetchCustomers()
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteCustomerMutation.mutateAsync(deleteId)
    toast.success("Customer deleted")
    setDeleteId(null)
    refetchCustomers()
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Customers" subtitle={`${customers.length} customers`}>
        <Button size="icon" onClick={openAdd} className="bg-primary text-primary-foreground">
          <Plus className="size-5" />
        </Button>
      </PageHeader>

      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Users className="size-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No customers yet</p>
          </div>
        ) : (
          customers.map((customer) => {
            const purchases = getCustomerPurchases(customer.Customer_ID)
            const totalSpent = getCustomerTotal(customer.Customer_ID)
            const isExpanded = expandedId === customer.Customer_ID

            return (
              <Card key={customer.Customer_ID} className="border-border/50">
                <CardContent className="py-3.5">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : customer.Customer_ID)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                          {getInitials(customer.Customer_Name)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.Customer_Name}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="size-3" />
                            {customer.Phone_Number}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatCurrency(totalSpent, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {purchases.length} purchase(s)
                        </p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                      {customer.Location && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {customer.Location}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <ShoppingBag className="size-3" />
                        Purchase History
                      </div>
                      {purchases.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No purchases yet</p>
                      ) : (
                        purchases.slice(0, 5).map((sale) => (
                          <div
                            key={sale.Sale_ID}
                            className="flex items-center justify-between rounded-lg bg-muted/30 px-2.5 py-1.5"
                          >
                            <div>
                              <p className="text-xs font-medium">{sale.Product_Name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {sale.Quantity_Sold} unit(s) · {formatShortDate(sale.Sale_Date)}
                              </p>
                            </div>
                            <p className="text-xs font-semibold text-primary">
                              {formatCurrency(sale.Total_Amount, currency)}
                            </p>
                          </div>
                        ))
                      )}
                      <div className="flex gap-1.5 pt-1">
                        <Button size="xs" variant="ghost" onClick={() => openEdit(customer)}>
                          <Pencil className="size-3" />
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setDeleteId(customer.Customer_ID)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Customer" : "Add Customer"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-3 px-4">
            <div>
              <Label htmlFor="cust-name">Customer Name</Label>
              <Input
                id="cust-name"
                value={form.Customer_Name}
                onChange={(e) => setForm({ ...form, Customer_Name: e.target.value })}
                placeholder="e.g. Sophia Laurent"
              />
            </div>
            <div>
              <Label htmlFor="cust-phone">Phone Number</Label>
              <Input
                id="cust-phone"
                value={form.Phone_Number}
                onChange={(e) => setForm({ ...form, Phone_Number: e.target.value })}
                placeholder="+1 555-0100"
              />
            </div>
            <div>
              <Label htmlFor="cust-location">Location</Label>
              <Input
                id="cust-location"
                value={form.Location}
                onChange={(e) => setForm({ ...form, Location: e.target.value })}
                placeholder="City, State"
              />
            </div>
            <SheetFooter>
              <Button type="submit" disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {editing ? "Saving..." : "Adding..."}
                  </span>
                ) : editing ? (
                  "Save Changes"
                ) : (
                  "Add Customer"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
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
