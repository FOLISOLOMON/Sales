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
import { AnimatedCard } from "@/components/AnimatedCard"
import { motion } from "motion/react"
import { stagger } from "@/lib/motion"
import { useSettings, useUpdateSettings } from "@/hooks/useQueries"
import { usePageTitle } from "@/components/layout/AppShell"

export function SettingsPage() {
  const { data: settings, isLoading, refetch } = useSettings()
  const { setTitle } = usePageTitle()
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
    setTitle("Settings", "Business configuration")
  }, [setTitle])

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
      <motion.div
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: stagger.item } },
        }}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          <AnimatedCard>
            <Card className="border-border/50 bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Store className="size-4 text-primary" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="biz-name">Business Name</Label>
                  <Input id="biz-name" value={form.Business_Name || ""} onChange={(e) => update("Business_Name", e.target.value)} className="focus-glow" />
                </div>
                <div>
                  <Label htmlFor="currency">Currency Symbol</Label>
                  <Input id="currency" value={form.Currency || ""} onChange={(e) => update("Currency", e.target.value)} placeholder="$" maxLength={3} className="focus-glow" />
                </div>
                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Input id="address" value={form.Business_Address || ""} onChange={(e) => update("Business_Address", e.target.value)} placeholder="Street, City, State" className="focus-glow" />
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          <AnimatedCard delay={0.05}>
            <Card className="border-border/50 bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="size-4 text-primary" />
                  Owner Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="owner">Owner Name</Label>
                  <Input id="owner" value={form.Owner_Name || ""} onChange={(e) => update("Owner_Name", e.target.value)} className="focus-glow" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={form.Phone_Number || ""} onChange={(e) => update("Phone_Number", e.target.value)} placeholder="+1 555-0000" className="focus-glow" />
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          <AnimatedCard delay={0.1}>
            <Card className="border-border/50 bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="size-4 text-primary" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="low-stock">Low Stock Alert Limit</Label>
                  <Input id="low-stock" type="number" min="1" value={form.Low_Stock_Limit || "3"} onChange={(e) => update("Low_Stock_Limit", e.target.value)} className="focus-glow" />
                  <p className="mt-1 text-xs text-muted-foreground">Products at or below this quantity will show a low stock warning</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </motion.div>
      </motion.div>

      <Separator />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.15 }}
      >
        <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground" size="lg">
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground">Remedy Manager v1.0 · Made for perfume businesses</p>
    </div>
  )
}
