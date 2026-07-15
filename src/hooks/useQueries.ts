import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getSales,
  getProducts,
  getSettings,
  addSale,
  updateSale,
  addProduct,
  updateProduct,
  deleteProduct,
  addExpense,
  deleteExpense,
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getExpenses,
  updateSettings,
} from "@/services/api"
import { enqueueMutation } from "@/lib/db"
import { toast } from "sonner"

export const queryKeys = {
  sales: ["sales"] as const,
  products: ["products"] as const,
  settings: ["settings"] as const,
  customers: ["customers"] as const,
  expenses: ["expenses"] as const,
}

export function useSales() {
  return useQuery({
    queryKey: queryKeys.sales,
    queryFn: getSales,
    staleTime: 1000 * 30,
  })
}

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: getProducts,
    staleTime: 1000 * 30,
  })
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: getCustomers,
    staleTime: 1000 * 30,
  })
}

export function useExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses,
    queryFn: getExpenses,
    staleTime: 1000 * 30,
  })
}

export function useAddSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (saleData: Record<string, unknown>) => {
      if (!navigator.onLine) {
        await enqueueMutation("add-sale", saleData)
        return { offline: true, data: saleData }
      }
      const result = await addSale(saleData)
      return { offline: false, data: result }
    },
    onMutate: async (saleData) => {
      await qc.cancelQueries({ queryKey: queryKeys.sales })
      const previous = qc.getQueryData(queryKeys.sales)
      const optimisticSale = {
        ...saleData,
        Sale_ID: `temp-${Date.now()}`,
        _pendingSync: true,
      }
      qc.setQueryData(queryKeys.sales, (old: any[] = []) => [...old, optimisticSale])
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Sale saved offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.sales })
        qc.invalidateQueries({ queryKey: queryKeys.products })
        qc.invalidateQueries({ queryKey: queryKeys.customers })
        qc.invalidateQueries({ queryKey: queryKeys.settings })
      }
    },
    onError: (_err, _saleData, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.sales, context.previous)
      }
    },
  })
}

export function useUpdateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ saleId, updates }: { saleId: string; updates: Record<string, unknown> }) => {
      if (!navigator.onLine) {
        await enqueueMutation("update-sale", { Sale_ID: saleId, ...updates })
        return { offline: true }
      }
      await updateSale(saleId, updates)
      return { offline: false }
    },
    onMutate: async ({ saleId, updates }) => {
      await qc.cancelQueries({ queryKey: queryKeys.sales })
      const previous = qc.getQueryData(queryKeys.sales)
      qc.setQueryData(queryKeys.sales, (old: any[] = []) =>
        old.map((s) => (s.Sale_ID === saleId ? { ...s, ...updates, _pendingSync: true } : s))
      )
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Sale updated offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.sales })
        qc.invalidateQueries({ queryKey: queryKeys.customers })
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.sales, context.previous)
      }
    },
  })
}

export function useAddProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (productData: Record<string, unknown>) => {
      if (!navigator.onLine) {
        await enqueueMutation("add-product", productData)
        return { offline: true, data: productData }
      }
      const result = await addProduct(productData)
      return { offline: false, data: result }
    },
    onMutate: async (productData) => {
      await qc.cancelQueries({ queryKey: queryKeys.products })
      const previous = qc.getQueryData(queryKeys.products)
      const optimisticProduct = {
        ...productData,
        Product_ID: `temp-${Date.now()}`,
        _pendingSync: true,
      }
      qc.setQueryData(queryKeys.products, (old: any[] = []) => [...old, optimisticProduct])
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Product saved offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.products })
        qc.invalidateQueries({ queryKey: queryKeys.settings })
      }
    },
    onError: (_err, _productData, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.products, context.previous)
      }
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ productId, updates }: { productId: string; updates: Record<string, unknown> }) => {
      if (!navigator.onLine) {
        await enqueueMutation("update-product", { Product_ID: productId, ...updates })
        return { offline: true }
      }
      await updateProduct(productId, updates)
      return { offline: false }
    },
    onMutate: async ({ productId, updates }) => {
      await qc.cancelQueries({ queryKey: queryKeys.products })
      const previous = qc.getQueryData(queryKeys.products)
      qc.setQueryData(queryKeys.products, (old: any[] = []) =>
        old.map((p) => (p.Product_ID === productId ? { ...p, ...updates, _pendingSync: true } : p))
      )
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Product updated offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.products })
        qc.invalidateQueries({ queryKey: queryKeys.settings })
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.products, context.previous)
      }
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!navigator.onLine) {
        await enqueueMutation("delete-product", { Product_ID: productId })
        return { offline: true }
      }
      await deleteProduct(productId)
      return { offline: false }
    },
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: queryKeys.products })
      const previous = qc.getQueryData(queryKeys.products)
      qc.setQueryData(queryKeys.products, (old: any[] = []) =>
        old.filter((p) => p.Product_ID !== productId)
      )
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Product deleted offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.products })
        qc.invalidateQueries({ queryKey: queryKeys.settings })
      }
    },
    onError: (_err, _productId, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.products, context.previous)
      }
    },
  })
}

export function useAddExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (expenseData: Record<string, unknown>) => {
      if (!navigator.onLine) {
        await enqueueMutation("add-expense", expenseData)
        return { offline: true, data: expenseData }
      }
      const result = await addExpense(expenseData)
      return { offline: false, data: result }
    },
    onMutate: async (expenseData) => {
      await qc.cancelQueries({ queryKey: queryKeys.expenses })
      const previous = qc.getQueryData(queryKeys.expenses)
      const optimisticExpense = {
        ...expenseData,
        Expense_ID: `temp-${Date.now()}`,
        _pendingSync: true,
      }
      qc.setQueryData(queryKeys.expenses, (old: any[] = []) => [...old, optimisticExpense])
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Expense saved offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.expenses })
        qc.invalidateQueries({ queryKey: queryKeys.sales })
        qc.invalidateQueries({ queryKey: queryKeys.settings })
      }
    },
    onError: (_err, _expenseData, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.expenses, context.previous)
      }
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (expenseId: string) => {
      if (!navigator.onLine) {
        await enqueueMutation("delete-expense", { Expense_ID: expenseId })
        return { offline: true }
      }
      await deleteExpense(expenseId)
      return { offline: false }
    },
    onMutate: async (expenseId) => {
      await qc.cancelQueries({ queryKey: queryKeys.expenses })
      const previous = qc.getQueryData(queryKeys.expenses)
      qc.setQueryData(queryKeys.expenses, (old: any[] = []) =>
        old.filter((e) => e.Expense_ID !== expenseId)
      )
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Expense deleted offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.expenses })
        qc.invalidateQueries({ queryKey: queryKeys.sales })
        qc.invalidateQueries({ queryKey: queryKeys.settings })
      }
    },
    onError: (_err, _expenseId, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.expenses, context.previous)
      }
    },
  })
}

export function useAddCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (customerData: Record<string, unknown>) => {
      if (!navigator.onLine) {
        await enqueueMutation("add-customer", customerData)
        return { offline: true, data: customerData }
      }
      const result = await addCustomer(customerData)
      return { offline: false, data: result }
    },
    onMutate: async (customerData) => {
      await qc.cancelQueries({ queryKey: queryKeys.customers })
      const previous = qc.getQueryData(queryKeys.customers)
      const optimisticCustomer = {
        ...customerData,
        Customer_ID: `temp-${Date.now()}`,
        _pendingSync: true,
      }
      qc.setQueryData(queryKeys.customers, (old: any[] = []) => [...old, optimisticCustomer])
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Customer saved offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.customers })
        qc.invalidateQueries({ queryKey: queryKeys.sales })
        qc.invalidateQueries({ queryKey: queryKeys.settings })
      }
    },
    onError: (_err, _customerData, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.customers, context.previous)
      }
    },
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ customerId, updates }: { customerId: string; updates: Record<string, unknown> }) => {
      if (!navigator.onLine) {
        await enqueueMutation("update-customer", { Customer_ID: customerId, ...updates })
        return { offline: true }
      }
      await updateCustomer(customerId, updates)
      return { offline: false }
    },
    onMutate: async ({ customerId, updates }) => {
      await qc.cancelQueries({ queryKey: queryKeys.customers })
      const previous = qc.getQueryData(queryKeys.customers)
      qc.setQueryData(queryKeys.customers, (old: any[] = []) =>
        old.map((c) => (c.Customer_ID === customerId ? { ...c, ...updates, _pendingSync: true } : c))
      )
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Customer updated offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.customers })
        qc.invalidateQueries({ queryKey: queryKeys.sales })
        qc.invalidateQueries({ queryKey: queryKeys.settings })
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.customers, context.previous)
      }
    },
  })
}

export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (customerId: string) => {
      if (!navigator.onLine) {
        await enqueueMutation("delete-customer", { Customer_ID: customerId })
        return { offline: true }
      }
      await deleteCustomer(customerId)
      return { offline: false }
    },
    onMutate: async (customerId) => {
      await qc.cancelQueries({ queryKey: queryKeys.customers })
      const previous = qc.getQueryData(queryKeys.customers)
      qc.setQueryData(queryKeys.customers, (old: any[] = []) =>
        old.filter((c) => c.Customer_ID !== customerId)
      )
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Customer deleted offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.customers })
        qc.invalidateQueries({ queryKey: queryKeys.sales })
        qc.invalidateQueries({ queryKey: queryKeys.settings })
      }
    },
    onError: (_err, _customerId, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.customers, context.previous)
      }
    },
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (settingsData: Record<string, unknown>) => {
      if (!navigator.onLine) {
        await enqueueMutation("update-settings", settingsData)
        return { offline: true, data: settingsData }
      }
      const result = await updateSettings(settingsData)
      return { offline: false, data: result }
    },
    onMutate: async (settingsData) => {
      await qc.cancelQueries({ queryKey: queryKeys.settings })
      const previous = qc.getQueryData(queryKeys.settings)
      qc.setQueryData(queryKeys.settings, (old: any = {}) => ({ ...old, ...settingsData, _pendingSync: true }))
      return { previous }
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Settings saved offline. Will sync when online.")
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.settings })
        qc.invalidateQueries({ queryKey: queryKeys.sales })
        qc.invalidateQueries({ queryKey: queryKeys.products })
        qc.invalidateQueries({ queryKey: queryKeys.customers })
        qc.invalidateQueries({ queryKey: queryKeys.expenses })
      }
    },
    onError: (_err, _settingsData, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.settings, context.previous)
      }
    },
  })
}
