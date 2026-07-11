<<<<<<< HEAD
import { useState } from "react"
=======
import { useEffect, useState, useCallback } from "react"
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
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
<<<<<<< HEAD
import {
  useSettings,
  useUpdateSettings,
} from "@/hooks/useQueries"

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

  if (isLoading || !settings) {
=======
import { getSettings, updateSettings } from "@/services/api"

export function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const s = await getSettings()
    setSettings(s)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function update(key, value) {
    setSettings({ ...settings, [key]: value })
  }

  async function handleSave() {
    setSaving(true)
    await updateSettings(settings)
    toast.success("Settings saved")
    setSaving(false)
  }

  if (loading || !settings) {
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
    return (
      <div className="space-y-4">
        <PageHeader title="Settings" subtitle="Business configuration" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

<<<<<<< HEAD
  // Sync local form when settings load or change externally
  if (
    settings &&
    (form.Business_Name !== (settings.Business_Name || "") ||
      form.Currency !== (settings.Currency || "$") ||
      form.Business_Address !== (settings.Business_Address || "") ||
      form.Owner_Name !== (settings.Owner_Name || "") ||
      form.Phone_Number !== (settings.Phone_Number || "") ||
      form.Low_Stock_Limit !== (settings.Low_Stock_Limit || "3"))
  ) {
    setForm({
      Business_Name: settings.Business_Name || "",
      Currency: settings.Currency || "$",
      Business_Address: settings.Business_Address || "",
      Owner_Name: settings.Owner_Name || "",
      Phone_Number: settings.Phone_Number || "",
      Low_Stock_Limit: settings.Low_Stock_Limit || "3",
    })
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

=======
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Business configuration" />

      {/* Business settings */}
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
            <Input
              id="biz-name"
<<<<<<< HEAD
              value={form.Business_Name || ""}
=======
              value={settings.Business_Name || ""}
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
              onChange={(e) => update("Business_Name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency Symbol</Label>
            <Input
              id="currency"
<<<<<<< HEAD
              value={form.Currency || ""}
=======
              value={settings.Currency || ""}
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
              onChange={(e) => update("Currency", e.target.value)}
              placeholder="$"
              maxLength={3}
            />
          </div>
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
<<<<<<< HEAD
              value={form.Business_Address || ""}
=======
              value={settings.Business_Address || ""}
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
              onChange={(e) => update("Business_Address", e.target.value)}
              placeholder="Street, City, State"
            />
          </div>
        </CardContent>
      </Card>

      {/* Owner settings */}
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
            <Input
              id="owner"
<<<<<<< HEAD
              value={form.Owner_Name || ""}
=======
              value={settings.Owner_Name || ""}
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
              onChange={(e) => update("Owner_Name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
<<<<<<< HEAD
              value={form.Phone_Number || ""}
=======
              value={settings.Phone_Number || ""}
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
              onChange={(e) => update("Phone_Number", e.target.value)}
              placeholder="+1 555-0000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory settings */}
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
            <Input
              id="low-stock"
              type="number"
              min="1"
<<<<<<< HEAD
              value={form.Low_Stock_Limit || "3"}
=======
              value={settings.Low_Stock_Limit || "3"}
>>>>>>> 515ee115e644d6ebf2d30cf2204548394dd397fb
              onChange={(e) => update("Low_Stock_Limit", e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Products at or below this quantity will show a low stock warning
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-primary-foreground"
        size="lg"
      >
        <Save className="size-4" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Remedy Manager v1.0 · Made for perfume businesses
      </p>
    </div>
  )
}
