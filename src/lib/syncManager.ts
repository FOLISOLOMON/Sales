import { toast } from "sonner";
import {
  addSale,
  updateSale,
  addProduct,
  updateProduct,
  deleteProduct,
  addExpense,
  deleteExpense,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  updateSettings,
} from "@/services/api";
import {
  getAllMutations,
  deleteMutation as deleteMutationRecord,
} from "@/lib/db";

type SyncApiFn = (data: Record<string, unknown>) => Promise<unknown>;

const mutationHandlers: Record<string, SyncApiFn> = {
  "add-sale": addSale,
  "update-sale": updateSale,
  "add-product": addProduct,
  "update-product": updateProduct,
  "delete-product": deleteProduct,
  "add-expense": addExpense,
  "delete-expense": deleteExpense,
  "add-customer": addCustomer,
  "update-customer": updateCustomer,
  "delete-customer": deleteCustomer,
  "update-settings": updateSettings,
};

export async function syncPendingMutations() {
  if (!navigator.onLine) return;

  const pending = await getAllMutations();
  if (pending.length === 0) return;

  toast.info(`Syncing ${pending.length} pending change${pending.length > 1 ? "s" : ""}...`);

  let synced = 0;
  let failed = 0;

  for (const mutation of pending) {
    try {
      const handler = mutationHandlers[mutation.type];
      if (!handler) {
        console.warn("[Sync] Unknown mutation type:", mutation.type);
        await deleteMutationRecord(mutation.id!);
        failed++;
        continue;
      }

      await handler(mutation.data);
      await deleteMutationRecord(mutation.id!);
      synced++;
    } catch (error) {
      console.error("[Sync] Failed to sync mutation:", mutation.id, error);
      failed++;
    }
  }

  if (synced > 0) {
    toast.success(`Synced ${synced} change${synced > 1 ? "s" : ""}`);
  }

  if (failed > 0) {
    toast.error(`Failed to sync ${failed} change${failed > 1 ? "s" : ""}. Will retry later.`);
  }
}
