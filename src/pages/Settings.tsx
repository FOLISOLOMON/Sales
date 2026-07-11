import { useEffect, useState } from "react"
import { Save, Store, User, AlertTriangle } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/layout/PageHeader"
import { useSettings, useUpdateSettings } from "@/hooks/useQueries"

export function SettingsPage() {
  const { data: settings, isLoading, refetch } = useSettings()
  const updateSettingsMutation = useUpdateSettings()

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    Business_Name: "",
    Currency: "$",
    Business_Address: "",
    Owner_Name: "",
    Phone_Number: "",
    Low_Stock_Limit: "3",
  })

  useEffect(() => {
    if (settings) {
      setForm({
        Business_Name: settings.Business_Name || "",
        Currency: settings.Currency || "$",
        Business_Address: settings.Business_Address || "",
        Owner_Name: settings.Owner_Name || "",
        Phone_Number: settings.Phone_Number || "",
        Low_Stock_Limit: settings.Low_Stock_Limit || "3",
      })
    }
  }, [settings])

  if (isLoading || !settings) {
    return (
      <div className="space-y-4">
        <PageHeader title="Settings" subtitle="Business configuration" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  function update(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handleSave() {
    setSaving(true)
    await updateSettingsMutation.mutateAsync(form)
    toast.success("Settings saved")
    setSaving(false)
    refetch()
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Business configuration" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="size-4 text-primary" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="biz-name">Business Name</Label>
            <Input id="biz-name" value={form.Business_Name || ""} onChange={(e) => update("Business_Name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="currency">Currency Symbol</Label>
            <Input id="currency" value={form.Currency || ""} onChange={(e) => update("Currency", e.target.value)} placeholder="$" maxLength={3} />
          </div>
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input id="address" value={form.Business_Address || ""} onChange={(e) => update("Business_Address", e.target.value)} placeholder="Street, City, State" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-primary" />
            Owner Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="owner">Owner Name</Label>
            <Input id="owner" value={form.Owner_Name || ""} onChange={(e) => update("Owner_Name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={form.Phone_Number || ""} onChange={(e) => update("Phone_Number", e.target.value)} placeholder="+1 555-0000" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-primary" />
            Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="low-stock">Low Stock Alert Limit</Label>
            <Input id="low-stock" type="number" min="1" value={form.Low_Stock_Limit || "3"} onChange={(e) => update("Low_Stock_Limit", e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">Products at or below this quantity will show a low stock warning</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground" size="lg">
        <Save className="size-4" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">Remedy Manager v1.0 · Made for perfume businesses</p>
    </div>
  )
}
