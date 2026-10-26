"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  VehicleItem,
  CustomerRecord,
  SaleRecord,
  InvoiceRecord,
} from "@/lib/mock-data";
import { FloatingBatchToolbar } from "@/components/FloatingBatchToolbar";
import {
  exportInventoryToCSV,
  exportSalesLedgerToCSV,
  exportCustomersToCSV,
} from "@/lib/export-utils";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  MuiTabs,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiTextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from "@/components/mui";
import {
  Car,
  Users,
  BadgeDollarSign,
  Plus,
  Search,
  X,
  Trash2,
  Edit,
  Eye,
  Phone,
  FileText,
  DollarSign,
  FileSpreadsheet,
  Landmark,
  Banknote,
  Kanban,
  Table as TableIcon,
  Send,
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
} from "lucide-react";
import { downloadCommercialInvoicePDF } from "@/lib/invoice-pdf";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const {
    vehicles,
    customers,
    sales,
    invoices,
    exchangeRate,
    language,
    currentRole,
    clientPresentationMode,
    branding,
    deleteVehicle,
    setInspectedVehicleId,
    batchUpdateVehicleStatus,
    batchAdjustVehiclePrice,
    addCustomer,
    updateCustomerStage,
    batchUpdateCustomerStage,
    addSale,
    addInvoice,
    addPaymentVoucher,
    updateVehicle,
    updateCustomer,
    deleteCustomer,
    updateSale,
    deleteSale,
    addToast,
  } = useShowroomStore();

  const t = translations[language];
  const hideFinancialMargins = clientPresentationMode || currentRole === "SalesAgent";
  const activeAgentName = session?.user?.name || branding?.authorizedSignatory || "Sales Desk";
  const dealershipTitle =
    language === "ps"
      ? branding?.dealershipNamePs || branding?.dealershipName || "Aria Motors"
      : language === "fa"
      ? branding?.dealershipNameFa || branding?.dealershipName || "آریا موتورز"
      : branding?.dealershipName || "Aria Motors";
  const brandSlug = (branding?.dealershipShortCode || "aria")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

  // Active Commercial Workspace Tab — focused strictly on CRM, Sales Desk & Lot Lookup
  const [activeTab, setActiveTab] = useState<"crm" | "sales" | "inventory">("crm");
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleItem | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRecord | null>(null);
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);
  const [deletingSale, setDeletingSale] = useState<SaleRecord | null>(null);
  const [revertVehicleOnVoid, setRevertVehicleOnVoid] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);

  // CRM Kanban vs Table view mode
  const [crmViewMode, setCrmViewMode] = useState<"kanban" | "table">("table");
  const [crmSearchQuery, setCrmSearchQuery] = useState("");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedAdminVehicleIds, setSelectedAdminVehicleIds] = useState<string[]>([]);
  const [downloadingSaleInvoiceId, setDownloadingSaleInvoiceId] = useState<string | null>(null);

  const handleDownloadSaleInvoicePDF = async (sale: SaleRecord) => {
    setDownloadingSaleInvoiceId(sale.id);
    addToast(`Generating commercial invoice PDF for contract ${sale.contractNumber}...`, "info");
    try {
      const existing = invoices.find(
        (inv) => inv.saleId === sale.id || inv.vehicleStock === sale.stockNumber
      );
      const invoiceData: InvoiceRecord = existing || {
        id: `inv-${sale.id}`,
        invoiceNumber: `INV-${sale.contractNumber.replace(/[^a-zA-Z0-9-]/g, "")}`,
        saleId: sale.id,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        customerTazkira: sale.customerTazkira,
        vehicleStock: sale.stockNumber,
        vehicleDesc: sale.vehicleName,
        items: [
          {
            description: `${sale.vehicleName} (${sale.stockNumber}) Final Bill of Sale`,
            descriptionDari: "فاکتور قطعی و سند تجارتی موتر معامله‌شده",
            amountUSD: sale.salePriceUSD,
          },
        ],
        subtotalUSD: sale.salePriceUSD,
        customsFeeUSD: 0,
        registrationFeeUSD: 0,
        discountUSD: 0,
        totalUSD: sale.salePriceUSD,
        totalAFN: Math.round(sale.salePriceUSD * (sale.exchangeRate || exchangeRate)),
        exchangeRate: sale.exchangeRate || exchangeRate,
        status: "Paid",
        paymentMethod: sale.paymentType,
        issueDate: sale.saleDate,
      };

      await downloadCommercialInvoicePDF(invoiceData);
      addToast(`Commercial invoice for ${sale.contractNumber} downloaded`, "success");
    } catch (err) {
      console.error("PDF download error:", err);
      addToast("Failed to download PDF invoice. Please try again.", "error");
    } finally {
      setDownloadingSaleInvoiceId(null);
    }
  };

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    tazkiraNumber: "",
    city: "Herat",
    address: "",
    budget: 0,
    interestedInVehicleId: vehicles[0]?.id || "",
    tradeInRecord: "",
    notes: "",
    leadStage: "New Inquiry" as CustomerRecord["leadStage"],
  });

  const KANBAN_STAGES: Array<{
    id: CustomerRecord["leadStage"];
    label: string;
    sublabel: string;
    color: string;
    badgeBg: string;
    borderColor: string;
    headerBg: string;
  }> = [
    {
      id: "New Inquiry",
      label: "New Inquiries",
      sublabel: "استعلام جدید",
      color: "text-blue-700 dark:text-blue-300",
      badgeBg: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      borderColor: "border-blue-200 dark:border-blue-900",
      headerBg: "bg-blue-50/70 dark:bg-blue-950/30",
    },
    {
      id: "Follow-Up",
      label: "Follow-Up & Contact",
      sublabel: "پیگیری و تماس",
      color: "text-indigo-700 dark:text-indigo-300",
      badgeBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
      borderColor: "border-indigo-200 dark:border-indigo-900",
      headerBg: "bg-indigo-50/70 dark:bg-indigo-950/30",
    },
    {
      id: "Test Drive",
      label: "Inspection & Test Drive",
      sublabel: "معاینه و تست درایو",
      color: "text-amber-700 dark:text-amber-300",
      badgeBg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      borderColor: "border-amber-200 dark:border-amber-900",
      headerBg: "bg-amber-50/70 dark:bg-amber-950/30",
    },
    {
      id: "Negotiation",
      label: "Negotiation & Sarrafi",
      sublabel: "مذاکره قیمت و صرافی",
      color: "text-purple-700 dark:text-purple-300",
      badgeBg: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      borderColor: "border-purple-200 dark:border-purple-900",
      headerBg: "bg-purple-50/70 dark:bg-purple-950/30",
    },
    {
      id: "Closed/Won",
      label: "Contract Executed",
      sublabel: "معامله تکمیل شد",
      color: "text-emerald-700 dark:text-emerald-300",
      badgeBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      borderColor: "border-emerald-200 dark:border-emerald-900",
      headerBg: "bg-emerald-50/70 dark:bg-emerald-950/30",
    },
    {
      id: "Lost",
      label: "Lost / Passed",
      sublabel: "عدم توافق",
      color: "text-rose-700 dark:text-rose-300",
      badgeBg: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
      borderColor: "border-rose-200 dark:border-rose-900",
      headerBg: "bg-rose-50/70 dark:bg-rose-950/30",
    },
  ];

  const getNextStage = (
    current: CustomerRecord["leadStage"]
  ): CustomerRecord["leadStage"] | null => {
    const order: CustomerRecord["leadStage"][] = [
      "New Inquiry",
      "Follow-Up",
      "Test Drive",
      "Negotiation",
      "Closed/Won",
    ];
    const idx = order.indexOf(current);
    if (idx !== -1 && idx < order.length - 1) return order[idx + 1];
    return null;
  };

  const getPrevStage = (
    current: CustomerRecord["leadStage"]
  ): CustomerRecord["leadStage"] | null => {
    const order: CustomerRecord["leadStage"][] = [
      "New Inquiry",
      "Follow-Up",
      "Test Drive",
      "Negotiation",
      "Closed/Won",
    ];
    const idx = order.indexOf(current);
    if (idx > 0) return order[idx - 1];
    return null;
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.fullName.trim() || !newCustomerForm.phone.trim()) return;
    try {
      await addCustomer({
        fullName: newCustomerForm.fullName,
        phone: newCustomerForm.phone,
        whatsapp: newCustomerForm.whatsapp || newCustomerForm.phone,
        tazkiraNumber: newCustomerForm.tazkiraNumber,
        city: newCustomerForm.city,
        address: newCustomerForm.address,
        budget: Number(newCustomerForm.budget),
        interestedInVehicleId: newCustomerForm.interestedInVehicleId,
        tradeInRecord: newCustomerForm.tradeInRecord || undefined,
        notes: newCustomerForm.notes,
        leadStage: newCustomerForm.leadStage,
      });
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to save customer", "error");
      return;
    }
    setIsAddCustomerModalOpen(false);
    addToast(`Added new customer lead: ${newCustomerForm.fullName}`, "success");
    setNewCustomerForm({
      fullName: "",
      phone: "",
      whatsapp: "",
      tazkiraNumber: "",
      city: "Herat",
      address: "",
      budget: 35000,
      interestedInVehicleId: vehicles[0]?.id || "",
      tradeInRecord: "",
      notes: "",
      leadStage: "New Inquiry",
    });
  };

  // Search & filters in inventory and sales
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryStatus, setInventoryStatus] = useState("ALL");
  const [salesSearch, setSalesSearch] = useState("");

  // Sale transaction creation state
  const [saleForm, setSaleForm] = useState({
    stockNumber: vehicles[0]?.stockNumber || "",
    customerName: "",
    customerPhone: "",
    customerTazkira: "",
    salesAgent: activeAgentName,
    salePriceUSD: vehicles[0]?.sellingPrice || 0,
    paymentType: "Full Cash" as "Full Cash" | "Installment Plan" | "Hawala / Bank Transfer",
    downPaymentUSD: vehicles[0]?.sellingPrice || 0,
    installmentsRemaining: 0,
    notes: "",
  });

  useEffect(() => {
    if (session?.user?.name) {
      setSaleForm((prev) =>
        prev.salesAgent === "Sales Desk" || !prev.salesAgent
          ? { ...prev, salesAgent: session.user!.name! }
          : prev
      );
    }
  }, [session?.user?.name]);

  // Filtered vehicles for inventory tab
  const filteredInventory = vehicles.filter((v) => {
    if (inventoryStatus !== "ALL" && v.status !== inventoryStatus) return false;
    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      return (
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.stockNumber.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered CRM customers
  const filteredCustomers = customers.filter((c) => {
    if (!crmSearchQuery.trim()) return true;
    const q = crmSearchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.tazkiraNumber.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  // CRM Batch Selection Handlers
  const handleToggleCustomerSelect = (customerId: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    if (
      filteredCustomers.length > 0 &&
      filteredCustomers.every((c) => selectedCustomerIds.includes(c.id))
    ) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredCustomers.map((c) => c.id));
    }
  };

  const handleBatchCustomerStage = async (stage: string) => {
    if (selectedCustomerIds.length === 0) return;
    await batchUpdateCustomerStage(
      selectedCustomerIds,
      stage as CustomerRecord["leadStage"]
    );
    setSelectedCustomerIds([]);
  };

  const handleBatchCustomerExportCSV = () => {
    const selected = customers.filter((c) => selectedCustomerIds.includes(c.id));
    if (selected.length === 0) return;
    exportCustomersToCSV(
      selected,
      vehicles,
      `${brandSlug}_crm_leads_batch_${selected.length}.csv`
    );
    addToast(`Exported ${selected.length} selected CRM lead(s) to CSV`, "success");
  };

  // Admin Inventory Batch Selection Handlers
  const handleToggleAdminVehicleSelect = (vehicleId: string) => {
    setSelectedAdminVehicleIds((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleSelectAllAdminVehicles = () => {
    if (
      filteredInventory.length > 0 &&
      filteredInventory.every((v) => selectedAdminVehicleIds.includes(v.id))
    ) {
      setSelectedAdminVehicleIds([]);
    } else {
      setSelectedAdminVehicleIds(filteredInventory.map((v) => v.id));
    }
  };

  const handleBatchAdminVehicleStatus = async (status: string) => {
    if (selectedAdminVehicleIds.length === 0) return;
    await batchUpdateVehicleStatus(
      selectedAdminVehicleIds,
      status as VehicleItem["status"]
    );
    setSelectedAdminVehicleIds([]);
  };

  const handleBatchAdminVehiclePrice = async (percentDelta: number) => {
    if (selectedAdminVehicleIds.length === 0 || currentRole !== "SuperAdmin") return;
    await batchAdjustVehiclePrice(selectedAdminVehicleIds, percentDelta);
  };

  const handleBatchAdminVehicleExportCSV = () => {
    const selected = vehicles.filter((v) => selectedAdminVehicleIds.includes(v.id));
    if (selected.length === 0) return;
    exportInventoryToCSV(selected, `${brandSlug}_lot_batch_${selected.length}.csv`);
    addToast(`Exported ${selected.length} selected vehicle(s) to CSV`, "success");
  };

  // Filtered sales records
  const filteredSales = sales.filter((s) => {
    if (!salesSearch.trim()) return true;
    const q = salesSearch.toLowerCase();
    return (
      s.contractNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.vehicleName.toLowerCase().includes(q) ||
      s.customerTazkira.toLowerCase().includes(q)
    );
  });

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      await updateCustomer(editingCustomer.id, {
        fullName: editingCustomer.fullName,
        phone: editingCustomer.phone,
        whatsapp: editingCustomer.whatsapp || "",
        tazkiraNumber: editingCustomer.tazkiraNumber,
        city: editingCustomer.city,
        address: editingCustomer.address || "",
        budget: Number(editingCustomer.budget),
        leadStage: editingCustomer.leadStage,
        notes: editingCustomer.notes || "",
        interestedInVehicleId: editingCustomer.interestedInVehicleId || undefined,
      });
      addToast("Customer lead updated successfully", "success");
      setEditingCustomer(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update customer", "error");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    try {
      await deleteCustomer(deletingCustomer.id);
      addToast("Customer lead deleted successfully", "success");
      setDeletingCustomer(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete customer", "error");
    }
  };

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;
    try {
      const salePriceUSD = Number(editingSale.salePriceUSD);
      await updateSale(editingSale.id, {
        salePriceUSD,
        paymentType: editingSale.paymentType,
        downPaymentUSD: Number(editingSale.downPaymentUSD || 0),
        installmentsRemaining: Number(editingSale.installmentsRemaining || 0),
        status: editingSale.status,
      });
      addToast("Sale contract updated successfully", "success");
      setEditingSale(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update sale", "error");
    }
  };

  const handleDeleteSale = async () => {
    if (!deletingSale || currentRole !== "SuperAdmin") return;
    try {
      await deleteSale(deletingSale.id, revertVehicleOnVoid);
      addToast(
        `Sale contract ${deletingSale.contractNumber} voided${revertVehicleOnVoid ? " and vehicle marked Available on Lot" : ""}`,
        "success"
      );
      setDeletingSale(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to void sale", "error");
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    try {
      const updates: Partial<VehicleItem> = {
        status: editingVehicle.status,
        yardLocation: editingVehicle.yardLocation,
        mileage: Number(editingVehicle.mileage),
        color: editingVehicle.color,
        customsClearance: editingVehicle.customsClearance,
      };
      if (currentRole === "SuperAdmin") {
        updates.sellingPrice = Number(editingVehicle.sellingPrice);
        updates.minTargetPrice = Number(
          editingVehicle.minTargetPrice || editingVehicle.sellingPrice
        );
      }
      await updateVehicle(editingVehicle.id, updates);
      addToast(`Vehicle ${editingVehicle.stockNumber} updated successfully`, "success");
      setEditingVehicle(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update vehicle", "error");
    }
  };

  // 1-Click Pre-fill Deal from CRM Lead
  const handleInitiateDealFromLead = (cust: CustomerRecord) => {
    const matchedVeh =
      vehicles.find((v) => v.id === cust.interestedInVehicleId && v.status !== "Sold") ||
      vehicles.find((v) => v.status !== "Sold") ||
      vehicles[0];

    setSaleForm({
      stockNumber: matchedVeh?.stockNumber || "",
      customerName: cust.fullName,
      customerPhone: cust.phone,
      customerTazkira: cust.tazkiraNumber || "",
      salesAgent: activeAgentName,
      salePriceUSD: matchedVeh?.sellingPrice || cust.budget || 35000,
      paymentType: "Hawala / Bank Transfer",
      downPaymentUSD: matchedVeh?.sellingPrice || cust.budget || 35000,
      installmentsRemaining: 0,
      notes: `Closed from CRM Lead (${cust.city}).`,
    });
    setActiveTab("sales");
    addToast(
      `Loaded ${cust.fullName} into Sales Desk for contract & Sarrafi execution`,
      "info"
    );
  };

  // Collect Installment (Qist) Payment & Persist Updated Sale Balance
  const handleCollectInstallment = async (sale: (typeof sales)[0]) => {
    const remainingUSD = Math.max(0, sale.salePriceUSD - (sale.downPaymentUSD || 0));
    if (remainingUSD <= 0) {
      addToast(`Contract ${sale.contractNumber} is already settled in full.`, "info");
      return;
    }
    const qistCount = Math.max(1, sale.installmentsRemaining || 1);
    const installmentAmountUSD = Math.min(
      remainingUSD,
      Math.max(1, Math.round(remainingUSD / qistCount))
    );
    const newPaid = Math.min(
      sale.salePriceUSD,
      (sale.downPaymentUSD || 0) + installmentAmountUSD
    );
    const newRemaining =
      newPaid >= sale.salePriceUSD ? 0 : Math.max(0, (sale.installmentsRemaining || 1) - 1);
    const nextStatus: SaleRecord["status"] =
      newPaid >= sale.salePriceUSD ? "Completed" : "Pending Installments";

    try {
      await addPaymentVoucher({
        voucherType: "CUSTOMER_PAYMENT",
        date: new Date().toISOString().split("T")[0],
        partyName: sale.customerName,
        partyPhone: sale.customerPhone,
        partyTazkira: sale.customerTazkira,
        amountUSD: installmentAmountUSD,
        amountAFN: Math.round(installmentAmountUSD * exchangeRate),
        exchangeRate,
        paymentMethod: "Sarrafi Hawala (حواله صرافی)",
        sarrafiAccount: "",
        referenceNumber: `QIST-${sale.contractNumber}-${Date.now().toString().slice(-4)}`,
        vehicleStock: sale.stockNumber,
        purpose: `Installment (Qist) collection for ${sale.vehicleName} (${sale.contractNumber})`,
        recordedBy: activeAgentName,
      });

      await updateSale(sale.id, {
        downPaymentUSD: newPaid,
        installmentsRemaining: newRemaining,
        status: nextStatus,
      });

      addToast(
        `Collected $${installmentAmountUSD.toLocaleString()} USD Qist for ${sale.customerName} (${
          nextStatus === "Completed"
            ? "Contract Settled!"
            : `$${(sale.salePriceUSD - newPaid).toLocaleString()} USD remaining`
        })`,
        "success"
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Unable to record installment voucher",
        "error"
      );
    }
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleObj = vehicles.find((v) => v.stockNumber === saleForm.stockNumber);
    if (!vehicleObj) return;

    const priceUSD = Number(saleForm.salePriceUSD);
    const downUSD =
      saleForm.paymentType === "Installment Plan"
        ? Number(saleForm.downPaymentUSD)
        : priceUSD;
    const isInstallment =
      saleForm.paymentType === "Installment Plan" && downUSD < priceUSD;

    try {
      await addSale({
        stockNumber: saleForm.stockNumber,
        vehicleName: `${vehicleObj.year} ${vehicleObj.make} ${vehicleObj.model}`,
        customerName: saleForm.customerName,
        customerPhone: saleForm.customerPhone,
        customerTazkira: saleForm.customerTazkira,
        salesAgent: saleForm.salesAgent || activeAgentName,
        salePriceUSD: priceUSD,
        exchangeRate: exchangeRate,
        paymentType: saleForm.paymentType,
        downPaymentUSD: downUSD,
        installmentsRemaining: isInstallment
          ? Math.max(1, Number(saleForm.installmentsRemaining) || 6)
          : 0,
        status: isInstallment ? "Pending Installments" : "Completed",
      });

      // Automatically issue Official Commercial Invoice
      await addInvoice({
        customerName: saleForm.customerName,
        customerPhone: saleForm.customerPhone,
        customerTazkira: saleForm.customerTazkira,
        customerAddress: branding?.address || "Herat, Afghanistan",
        vehicleStock: vehicleObj.stockNumber,
        vehicleDesc: `${vehicleObj.year} ${vehicleObj.make} ${vehicleObj.model} (${vehicleObj.trim})`,
        vin: vehicleObj.vin,
        items: [
          {
            description: `${vehicleObj.year} ${vehicleObj.make} ${vehicleObj.model} - VIN ${vehicleObj.vin}`,
            descriptionDari: `فروش قطعی موتر ${vehicleObj.year} ${vehicleObj.make} ${vehicleObj.model}`,
            amountUSD: priceUSD,
          },
        ],
        subtotalUSD: priceUSD,
        customsFeeUSD: 0,
        registrationFeeUSD: 0,
        discountUSD: 0,
        totalUSD: priceUSD,
        totalAFN: Math.round(priceUSD * exchangeRate),
        exchangeRate,
        status: isInstallment ? "Partially Paid" : "Paid",
        paymentMethod: saleForm.paymentType,
        issueDate: new Date().toISOString().split("T")[0],
        notes: saleForm.notes,
      });

      // Automatically record Down Payment / Full Settlement Voucher in Sarrafi Ledger
      if (downUSD > 0) {
        await addPaymentVoucher({
          voucherType: "CUSTOMER_PAYMENT",
          date: new Date().toISOString().split("T")[0],
          partyName: saleForm.customerName,
          partyPhone: saleForm.customerPhone,
          partyTazkira: saleForm.customerTazkira,
          amountUSD: downUSD,
          amountAFN: Math.round(downUSD * exchangeRate),
          exchangeRate,
          paymentMethod:
            saleForm.paymentType === "Full Cash"
              ? "Cash (صندوق)"
              : "Sarrafi Hawala (حواله صرافی)",
          sarrafiAccount: "",
          referenceNumber: `HAW-${Date.now().toString().slice(-5)}`,
          vehicleStock: vehicleObj.stockNumber,
          purpose: `${isInstallment ? "Down payment" : "Full settlement"} for ${vehicleObj.year} ${vehicleObj.make} ${vehicleObj.model}`,
          recordedBy: saleForm.salesAgent || activeAgentName,
        });
      }

      // If matched CRM customer exists, mark Closed/Won
      const matchedCust = customers.find(
        (c) =>
          c.fullName.toLowerCase() === saleForm.customerName.toLowerCase().trim() ||
          (saleForm.customerPhone && c.phone === saleForm.customerPhone)
      );
      if (matchedCust && matchedCust.leadStage !== "Closed/Won") {
        await updateCustomerStage(matchedCust.id, "Closed/Won");
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to record sale", "error");
      return;
    }

    addToast(
      "Deal executed! Generated Sale Contract, Commercial Invoice, and Sarrafi Payment Voucher.",
      "success"
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Enterprise Console CRM & Sales Desk Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#E2E8F0] dark:border-[#262F40]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#475569] dark:text-[#94A3B8]">
            <span>{dealershipTitle}</span>
            <span>/</span>
            <span className="text-[#1A73E8] dark:text-[#8AB4F8]">
              {language === "ps"
                ? "د پلور او پیرودونکو میز"
                : language === "fa"
                ? "پایپ‌لاین مشتریان و میز فروش"
                : "CRM Pipeline & Dealership Sales Desk"}
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] mt-1">
            {language === "ps"
              ? "د پیرودونکو مدیریت، مذاکره او د قراردادونو ثبت"
              : language === "fa"
              ? "مدیریت مشتریان، مذاکرات قیمت و عقد قرارداد فروش"
              : "Customer Leads, Negotiations & Contract Execution"}
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            {language === "ps"
              ? "د مراجعینو، ټسټ ډرایو، صرافۍ مذاکراتو او رسمي پلور قراردادونو بشپړ بهیر"
              : language === "fa"
              ? "پیگیری مراجعین حضوری، تست درایو، مذاکرات صرافی و صدور آنی قرارداد و بل فروش"
              : "Track walk-in buyers, test drives, Sarrafi price negotiations, and execute bilingual sales contracts"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {(currentRole === "SuperAdmin" || currentRole === "Accountant") && (
            <MuiButton
              component={Link}
              href="/accounting"
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Landmark className="h-4 w-4 text-[#1A73E8] dark:text-[#8AB4F8]" />}
            >
              {language === "ps"
                ? "مالي او صرافي مرکز"
                : language === "fa"
                ? "مرکز محاسبات و صرافی"
                : "Accounting & Sarrafi Hub"}
            </MuiButton>
          )}
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              setActiveTab("crm");
              setIsAddCustomerModalOpen(true);
            }}
            startIcon={<Plus className="h-4 w-4" />}
          >
            {language === "ps" ? "نوی پیرودونکی" : language === "fa" ? "ثبت لید جدید" : "New Walk-In Lead"}
          </MuiButton>
        </div>
      </div>

      {/* Navigation Tabs & Exports Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 gap-3">
        <MuiTabs
          value={activeTab}
          onChange={(val) => setActiveTab(val as "crm" | "sales" | "inventory")}
          color="primary"
          tabs={[
            {
              value: "crm",
              label:
                language === "ps"
                  ? "پیرودونکي (CRM)"
                  : language === "fa"
                  ? "مشتریان و لیدها"
                  : "CRM & Leads",
              icon: <Users className="h-4 w-4" />,
              badge: customers.length,
            },
            {
              value: "sales",
              label:
                language === "ps"
                  ? "د پلور میز او قراردادونه"
                  : language === "fa"
                  ? "میز فروش و قراردادها"
                  : "Sales Desk & Contracts",
              icon: <BadgeDollarSign className="h-4 w-4" />,
              badge: sales.length,
            },
            {
              value: "inventory",
              label:
                language === "ps"
                  ? "د موټرو چټک لټون"
                  : language === "fa"
                  ? "جستجوی سریع موجودی"
                  : "Quick Lot Lookup",
              icon: <Car className="h-4 w-4" />,
              badge: vehicles.length,
            },
          ]}
        />

        {/* Quick CSV / Excel Ledger Exports */}
        <div className="flex items-center gap-2 pb-2 sm:pb-0 shrink-0">
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => {
              exportCustomersToCSV(customers, vehicles, `${brandSlug}_crm_leads.csv`);
              addToast(`Exported ${customers.length} CRM leads to CSV`, "success");
            }}
            startIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-[#1A73E8]" />}
          >
            CRM CSV
          </MuiButton>

          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => {
              exportInventoryToCSV(vehicles, `${brandSlug}_inventory.csv`);
              addToast(`Exported ${vehicles.length} vehicles to CSV`, "success");
            }}
            startIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />}
          >
            Lot CSV
          </MuiButton>

          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => {
              exportSalesLedgerToCSV(sales, `${brandSlug}_sales_ledger.csv`);
              addToast(`Exported ${sales.length} sales records to CSV`, "success");
            }}
            startIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-[#D97706]" />}
          >
            Sales CSV
          </MuiButton>
        </div>
      </div>

      {/* TAB 1: QUICK LOT INVENTORY LOOKUP */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  aria-label="Search vehicles"
                  placeholder="Search stock #, VIN, make..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-52 sm:w-60 ps-7 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 h-8"
                />
                {inventorySearch && (
                  <button
                    onClick={() => setInventorySearch("")}
                    aria-label="Clear search"
                    className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <select
                aria-label="Filter vehicle status"
                value={inventoryStatus}
                onChange={(e) => setInventoryStatus(e.target.value)}
                className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Available on Lot">Available on Lot</option>
                <option value="In Transit">In Transit</option>
                <option value="Reserved/Deposit Paid">Reserved / Deposit</option>
                <option value="Under Prep/Maintenance">Under Prep / Maintenance</option>
                <option value="Sold">Sold</option>
              </select>

              {(inventorySearch || inventoryStatus !== "ALL") && (
                <button
                  onClick={() => {
                    setInventorySearch("");
                    setInventoryStatus("ALL");
                  }}
                  className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline px-1 cursor-pointer"
                >
                  Reset
                </button>
              )}

              <span className="text-[11px] font-mono tabular-nums text-slate-400">
                ({filteredInventory.length} units)
              </span>
            </div>

            {currentRole === "SuperAdmin" && (
              <MuiButton
                component={Link}
                href="/intake"
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Plus className="h-4 w-4" />}
              >
                <span>{t.addNewVehicle}</span>
              </MuiButton>
            )}
          </div>

          <MuiCard elevation={1}>
            <div className="overflow-x-auto">
              <MuiTable dense size="small" className="w-full">
                <MuiTableHead>
                  <MuiTableRow hover={false}>
                    <MuiTableCell header className="w-8 !px-2.5 text-center">
                      <input
                        type="checkbox"
                        aria-label="Select all filtered vehicles"
                        checked={
                          filteredInventory.length > 0 &&
                          filteredInventory.every((v) =>
                            selectedAdminVehicleIds.includes(v.id)
                          )
                        }
                        onChange={handleSelectAllAdminVehicles}
                        className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1A73E8] cursor-pointer"
                      />
                    </MuiTableCell>
                    <MuiTableCell header>Stock ID, Vehicle & VIN</MuiTableCell>
                    <MuiTableCell header>Status</MuiTableCell>
                    <MuiTableCell header>Gomrok Customs</MuiTableCell>
                    {!hideFinancialMargins && (
                      <MuiTableCell header align="right">Landed Cost</MuiTableCell>
                    )}
                    <MuiTableCell header align="right">Selling Price</MuiTableCell>
                    <MuiTableCell header align="right" className="!pe-3">
                      Actions
                    </MuiTableCell>
                  </MuiTableRow>
                </MuiTableHead>
                <MuiTableBody>
                  {filteredInventory.map((veh) => {
                    const isSelected = selectedAdminVehicleIds.includes(veh.id);
                    return (
                      <MuiTableRow
                        key={veh.id}
                        className={
                          isSelected
                            ? "bg-[#1A73E8]/[0.06] dark:bg-[#8AB4F8]/[0.08]"
                            : undefined
                        }
                      >
                        <MuiTableCell className="w-8 !px-2.5 text-center py-1.5">
                          <input
                            type="checkbox"
                            aria-label={`Select ${veh.year} ${veh.make} ${veh.model}`}
                            checked={isSelected}
                            onChange={() => handleToggleAdminVehicleSelect(veh.id)}
                            className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1A73E8] cursor-pointer"
                          />
                        </MuiTableCell>
                        <MuiTableCell className="py-1.5">
                          <Link
                            href={`/vehicles/${veh.id}`}
                            className="font-bold text-xs text-slate-900 dark:text-white hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] leading-tight"
                          >
                            {veh.year} {veh.make} {veh.model}
                          </Link>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.2 rounded border border-blue-200/50 dark:border-blue-900/50 tabular-nums">
                              {veh.stockNumber}
                            </span>
                            <span className="select-all text-slate-500 font-mono tracking-tight">{veh.vin}</span>
                            <span>•</span>
                            <span>{veh.originCountry}</span>
                          </div>
                        </MuiTableCell>
                        <MuiTableCell className="py-1.5 whitespace-nowrap">
                          <MuiChip
                            label={veh.status}
                            color={veh.status === "Available on Lot" ? "success" : "default"}
                            size="small"
                          />
                        </MuiTableCell>
                        <MuiTableCell className="py-1.5 text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
                          {veh.customsClearance.split("-")[0].trim()}
                        </MuiTableCell>
                        {!hideFinancialMargins && (
                          <MuiTableCell align="right" className="py-1.5 font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            ${veh.landedCost.toLocaleString()} USD
                          </MuiTableCell>
                        )}
                        <MuiTableCell align="right" className="py-1.5 font-mono tabular-nums font-bold text-xs text-slate-900 dark:text-white whitespace-nowrap">
                          ${veh.sellingPrice.toLocaleString()} USD
                        </MuiTableCell>
                        <MuiTableCell align="right" className="py-1.5 whitespace-nowrap !pe-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setInspectedVehicleId(veh.id)}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold border border-[#E2E8F0] dark:border-[#262F40] text-[#1A73E8] dark:text-[#8AB4F8] hover:bg-[#1A73E8]/10 transition-colors cursor-pointer"
                              title="Open Slide-Over Inspector"
                            >
                              Inspect
                            </button>
                            <IconButton
                              component={Link}
                              size="small"
                              color="primary"
                              href={`/vehicles/${veh.id}`}
                              sx={{ padding: "4px" }}
                              title="View Photo Gallery & Specs"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </IconButton>
                            <IconButton
                              component={Link}
                              href={`/vehicles/${veh.id}/deed`}
                              size="small"
                              color="primary"
                              sx={{ padding: "4px" }}
                              title="Print Legal Deed"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </IconButton>
                            {currentRole !== "Accountant" && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => setEditingVehicle({ ...veh })}
                                sx={{ padding: "4px" }}
                                title={
                                  currentRole === "SuperAdmin"
                                    ? "Edit Vehicle Details & Pricing"
                                    : "Update Operational Status & Bay"
                                }
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </IconButton>
                            )}
                            {currentRole === "SuperAdmin" && (
                              <IconButton
                                size="small"
                                color="error"
                                sx={{ padding: "4px" }}
                                onClick={() => setVehicleToDelete(veh)}
                                title="Delete vehicle"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </IconButton>
                            )}
                          </div>
                        </MuiTableCell>
                      </MuiTableRow>
                    );
                  })}
                </MuiTableBody>
              </MuiTable>
            </div>
          </MuiCard>
        </div>
      )}

      {/* TAB 2: CRM & LEADS PIPELINE */}
      {activeTab === "crm" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {dealershipTitle} — Customer & CRM Pipeline (مدیریت مشتریان و لیدها)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Funnel progression across walk-ins, phone inquiries, and test drive inspections.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setCrmViewMode("kanban")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    crmViewMode === "kanban"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Kanban className="h-3.5 w-3.5" />
                  <span>Kanban Board</span>
                </button>
                <button
                  onClick={() => setCrmViewMode("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    crmViewMode === "table"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  <span>Data Table</span>
                </button>
              </div>

              <MuiButton
                onClick={() => setIsAddCustomerModalOpen(true)}
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Plus className="h-4 w-4" />}
              >
                New Lead
              </MuiButton>
            </div>
          </div>

          {/* Quick Metrics & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                aria-label="Search CRM leads"
                placeholder="Search leads by name, phone, city, tazkira..."
                value={crmSearchQuery}
                onChange={(e) => setCrmSearchQuery(e.target.value)}
                className="w-full ps-8 pe-6 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500"
              />
              {crmSearchQuery && (
                <button
                  onClick={() => setCrmSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
              <span className="text-slate-500">
                Total Leads: <strong className="text-slate-900 dark:text-white">{customers.length}</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-500">
                Pipeline Value:{" "}
                <strong className="text-emerald-600 font-bold">
                  ${customers.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()} USD
                </strong>
              </span>
            </div>
          </div>

          {/* VIEW MODE 1: KANBAN BOARD */}
          {crmViewMode === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
              {KANBAN_STAGES.map((stage) => {
                const stageCustomers = customers
                  .filter((c) => c.leadStage === stage.id)
                  .filter((c) => {
                    if (!crmSearchQuery.trim()) return true;
                    const q = crmSearchQuery.toLowerCase();
                    return (
                      c.fullName.toLowerCase().includes(q) ||
                      c.phone.includes(q) ||
                      c.tazkiraNumber.toLowerCase().includes(q) ||
                      c.city.toLowerCase().includes(q)
                    );
                  });

                const stageTotalBudget = stageCustomers.reduce(
                  (acc, curr) => acc + (curr.budget || 0),
                  0
                );

                return (
                  <div
                    key={stage.id}
                    className={`rounded-2xl border ${stage.borderColor} bg-slate-50/70 dark:bg-[#111827]/70 flex flex-col min-h-[480px] shadow-2xs`}
                  >
                    <div className={`p-3 rounded-t-2xl border-b ${stage.borderColor} ${stage.headerBg}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold tracking-tight ${stage.color}`}>
                          {stage.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums font-bold ${stage.badgeBg}`}>
                          {stageCustomers.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        <span>{stage.sublabel}</span>
                        <span className="font-mono tabular-nums font-semibold">
                          ${stageTotalBudget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[65vh]">
                      {stageCustomers.length === 0 ? (
                        <div className="py-8 text-center text-[11px] text-slate-400 italic">
                          No leads in this stage
                        </div>
                      ) : (
                        stageCustomers.map((cust) => {
                          const matchedVehicle = vehicles.find(
                            (v) => v.id === cust.interestedInVehicleId
                          );
                          const nextStage = getNextStage(cust.leadStage);
                          const prevStage = getPrevStage(cust.leadStage);

                          const whatsappUrl = `https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Salam ${cust.fullName}! Regarding your inquiry at ${branding?.dealershipName || "Aria Motors"}...`
                          )}`;

                          return (
                            <div
                              key={cust.id}
                              className={`rounded-xl border p-3 shadow-xs hover:shadow-md transition-all space-y-2.5 ${
                                selectedCustomerIds.includes(cust.id)
                                  ? "border-[#1A73E8] bg-[#1A73E8]/[0.05] dark:bg-[#8AB4F8]/[0.08]"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D2A]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-start gap-2 min-w-0">
                                  <input
                                    type="checkbox"
                                    aria-label={`Select ${cust.fullName}`}
                                    checked={selectedCustomerIds.includes(cust.id)}
                                    onChange={() => handleToggleCustomerSelect(cust.id)}
                                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 accent-[#1A73E8] cursor-pointer shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white block leading-tight truncate">
                                      {cust.fullName}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {cust.city} • {cust.tazkiraNumber}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-mono tabular-nums text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                                  ${cust.budget.toLocaleString()}
                                </span>
                              </div>

                              {matchedVehicle ? (
                                <div className="text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">
                                    Interested Unit:
                                  </span>
                                  <Link
                                    href={`/vehicles/${matchedVehicle.id}`}
                                    className="font-semibold block truncate hover:text-[#1A73E8] dark:hover:text-[#8AB4F8]"
                                  >
                                    {matchedVehicle.year} {matchedVehicle.make} {matchedVehicle.model}
                                  </Link>
                                  <span className="text-[10px] font-mono tabular-nums text-slate-400">
                                    Stock #{matchedVehicle.stockNumber} (${matchedVehicle.sellingPrice.toLocaleString()})
                                  </span>
                                </div>
                              ) : cust.tradeInRecord ? (
                                <div className="text-[11px] p-1.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                                  <span className="text-[9px] uppercase tracking-wider text-amber-500 block font-bold">
                                    Trade-In Record:
                                  </span>
                                  <span className="text-[10px] block truncate">
                                    {cust.tradeInRecord}
                                  </span>
                                </div>
                              ) : null}

                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1">
                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                    title="WhatsApp Message"
                                  >
                                    <Send className="h-3 w-3" />
                                  </a>
                                  <a
                                    href={`tel:${cust.phone}`}
                                    className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Call Phone"
                                  >
                                    <Phone className="h-3 w-3" />
                                  </a>
                                  <button
                                    onClick={() => setEditingCustomer({ ...cust })}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                    title="Edit Lead Details"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  {currentRole === "SuperAdmin" && (
                                    <button
                                      onClick={() => setDeletingCustomer(cust)}
                                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                      title="Delete Lead"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  {prevStage && (
                                    <button
                                      onClick={() =>
                                        void updateCustomerStage(cust.id, prevStage).catch((error) =>
                                          addToast(error.message, "error")
                                        )
                                      }
                                      className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                                      title={`Move back to ${prevStage}`}
                                    >
                                      <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
                                    </button>
                                  )}
                                  {cust.leadStage !== "Closed/Won" && (
                                    <button
                                      onClick={() => handleInitiateDealFromLead(cust)}
                                      className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                      title="Execute Sale Contract, Invoice & Sarrafi Settlement"
                                    >
                                      Close Deal
                                    </button>
                                  )}
                                  {nextStage && (
                                    <button
                                      onClick={() =>
                                        void updateCustomerStage(cust.id, nextStage).catch((error) =>
                                          addToast(error.message, "error")
                                        )
                                      }
                                      className="flex items-center gap-0.5 px-2 py-1 rounded bg-[#1A73E8] hover:bg-[#1557B0] text-white font-mono text-[10px] font-bold cursor-pointer"
                                      title={`Advance to ${nextStage}`}
                                    >
                                      <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: DATA TABLE */}
          {crmViewMode === "table" && (
            <MuiCard elevation={1}>
              <div className="overflow-x-auto">
                <MuiTable dense size="small" className="w-full">
                  <MuiTableHead>
                    <MuiTableRow hover={false}>
                      <MuiTableCell header className="w-8 !px-2.5 text-center">
                        <input
                          type="checkbox"
                          aria-label="Select all CRM leads"
                          checked={
                            filteredCustomers.length > 0 &&
                            filteredCustomers.every((c) =>
                              selectedCustomerIds.includes(c.id)
                            )
                          }
                          onChange={handleSelectAllCustomers}
                          className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1A73E8] cursor-pointer"
                        />
                      </MuiTableCell>
                      <MuiTableCell header>Customer & Tazkira</MuiTableCell>
                      <MuiTableCell header>Contact & Location</MuiTableCell>
                      <MuiTableCell header>Vehicle of Interest</MuiTableCell>
                      <MuiTableCell header align="right">Budget (USD)</MuiTableCell>
                      <MuiTableCell header align="right">Budget (AFN)</MuiTableCell>
                      <MuiTableCell header>Funnel Stage</MuiTableCell>
                      <MuiTableCell header align="right" className="!pe-3">Actions</MuiTableCell>
                    </MuiTableRow>
                  </MuiTableHead>
                  <MuiTableBody>
                    {filteredCustomers.map((cust) => {
                      const isSelected = selectedCustomerIds.includes(cust.id);
                      const matchedVehicle = vehicles.find(
                        (v) => v.id === cust.interestedInVehicleId
                      );
                      const whatsappUrl = `https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Salam ${cust.fullName}! Regarding your inquiry at ${branding?.dealershipName || "Aria Motors"}...`
                      )}`;

                      return (
                        <MuiTableRow
                          key={cust.id}
                          className={
                            isSelected
                              ? "bg-[#1A73E8]/[0.06] dark:bg-[#8AB4F8]/[0.08]"
                              : undefined
                          }
                        >
                          <MuiTableCell className="w-8 !px-2.5 text-center py-2">
                            <input
                              type="checkbox"
                              aria-label={`Select ${cust.fullName}`}
                              checked={isSelected}
                              onChange={() => handleToggleCustomerSelect(cust.id)}
                              className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1A73E8] cursor-pointer"
                            />
                          </MuiTableCell>
                          <MuiTableCell className="py-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {cust.fullName}
                            </span>
                            <span className="text-[10px] font-mono tabular-nums text-slate-500">
                              Tazkira: {cust.tazkiraNumber}
                            </span>
                          </MuiTableCell>
                          <MuiTableCell className="py-2 text-xs">
                            <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200 block">
                              {cust.phone}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {cust.city}
                            </span>
                          </MuiTableCell>
                          <MuiTableCell className="py-2 text-xs">
                            {matchedVehicle ? (
                              <div>
                                <Link
                                  href={`/vehicles/${matchedVehicle.id}`}
                                  className="font-semibold text-slate-900 dark:text-white hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] block"
                                >
                                  {matchedVehicle.year} {matchedVehicle.make} {matchedVehicle.model}
                                </Link>
                                <span className="text-[10px] font-mono tabular-nums text-blue-600 dark:text-blue-400">
                                  Stock #{matchedVehicle.stockNumber}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">General Inquiry</span>
                            )}
                          </MuiTableCell>
                          <MuiTableCell align="right" className="py-2 font-mono tabular-nums font-bold text-xs text-slate-900 dark:text-white">
                            ${cust.budget.toLocaleString()}
                          </MuiTableCell>
                          <MuiTableCell align="right" className="py-2 font-mono tabular-nums text-xs text-slate-500">
                            ؋ {(cust.budget * exchangeRate).toLocaleString()}
                          </MuiTableCell>
                          <MuiTableCell className="py-2">
                            <select
                              aria-label={`Stage for ${cust.fullName}`}
                              value={cust.leadStage}
                              onChange={(e) =>
                                void updateCustomerStage(
                                  cust.id,
                                  e.target.value as CustomerRecord["leadStage"]
                                ).catch((error) => addToast(error.message, "error"))
                              }
                              className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 outline-none cursor-pointer"
                            >
                              <option value="New Inquiry">New Inquiry</option>
                              <option value="Follow-Up">Follow-Up</option>
                              <option value="Test Drive">Test Drive</option>
                              <option value="Negotiation">Negotiation</option>
                              <option value="Closed/Won">Closed/Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </MuiTableCell>
                          <MuiTableCell align="right" className="py-2 !pe-3">
                            <div className="flex items-center justify-end gap-1">
                              {cust.leadStage !== "Closed/Won" && (
                                <button
                                  type="button"
                                  onClick={() => handleInitiateDealFromLead(cust)}
                                  className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                  title="Load into Sales Desk"
                                >
                                  Close Deal
                                </button>
                              )}
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="WhatsApp Message"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </a>
                              <a
                                href={`tel:${cust.phone}`}
                                className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Call Phone"
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => setEditingCustomer({ ...cust })}
                                title="Edit Lead Details"
                                sx={{ p: "3px" }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </IconButton>
                              {currentRole === "SuperAdmin" && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeletingCustomer(cust)}
                                  title="Delete Lead"
                                  sx={{ p: "3px" }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </IconButton>
                              )}
                            </div>
                          </MuiTableCell>
                        </MuiTableRow>
                      );
                    })}
                  </MuiTableBody>
                </MuiTable>
              </div>
            </MuiCard>
          )}

          {/* Add New Customer Lead Dialog */}
          <Dialog
            open={isAddCustomerModalOpen}
            onClose={() => setIsAddCustomerModalOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Add New Customer Lead (ثبت مشتری و لید جدید)
                </span>
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogTitle>

            <form onSubmit={handleAddCustomer}>
              <DialogContent className="p-4 sm:p-6 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MuiTextField
                    label="Customer Full Name (نام و تخلص)"
                    required
                    size="small"
                    value={newCustomerForm.fullName}
                    onChange={(e) =>
                      setNewCustomerForm({
                        ...newCustomerForm,
                        fullName: e.target.value,
                      })
                    }
                  />

                  <MuiTextField
                    label="Phone Number (شماره تماس)"
                    required
                    size="small"
                    placeholder="0799123456"
                    value={newCustomerForm.phone}
                    onChange={(e) =>
                      setNewCustomerForm({
                        ...newCustomerForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MuiTextField
                    label="Tazkira Number (نمبر تذکره)"
                    size="small"
                    placeholder="1402-0401-55210"
                    value={newCustomerForm.tazkiraNumber}
                    onChange={(e) =>
                      setNewCustomerForm({
                        ...newCustomerForm,
                        tazkiraNumber: e.target.value,
                      })
                    }
                  />

                  <MuiTextField
                    label="City / Province (ولایت)"
                    size="small"
                    value={newCustomerForm.city}
                    onChange={(e) =>
                      setNewCustomerForm({
                        ...newCustomerForm,
                        city: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MuiTextField
                    label="Budget USD (بودجه خرید دالر)"
                    type="number"
                    size="small"
                    value={newCustomerForm.budget}
                    onChange={(e) =>
                      setNewCustomerForm({
                        ...newCustomerForm,
                        budget: Number(e.target.value),
                      })
                    }
                  />

                  <MuiTextField
                    select
                    label="Interested Vehicle"
                    size="small"
                    value={newCustomerForm.interestedInVehicleId}
                    onChange={(e) =>
                      setNewCustomerForm({
                        ...newCustomerForm,
                        interestedInVehicleId: e.target.value,
                      })
                    }
                  >
                    {vehicles.map((v) => (
                      <MenuItem key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} (${v.sellingPrice.toLocaleString()})
                      </MenuItem>
                    ))}
                  </MuiTextField>
                </div>

                <MuiTextField
                  label="Trade-In Vehicle Details (موتر معاوضه - اختیاری)"
                  size="small"
                  placeholder="e.g. 2012 Toyota Corolla LE White (Plate Herat -3)"
                  value={newCustomerForm.tradeInRecord}
                  onChange={(e) =>
                    setNewCustomerForm({
                      ...newCustomerForm,
                      tradeInRecord: e.target.value,
                    })
                  }
                  fullWidth
                />

                <MuiTextField
                  label="Inquiry Notes & Preferences"
                  size="small"
                  multiline
                  rows={2}
                  value={newCustomerForm.notes}
                  onChange={(e) =>
                    setNewCustomerForm({
                      ...newCustomerForm,
                      notes: e.target.value,
                    })
                  }
                  fullWidth
                />
              </DialogContent>

              <DialogActions className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <MuiButton
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  variant="outlined"
                  color="inherit"
                  size="small"
                >
                  Cancel
                </MuiButton>
                <MuiButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Save Lead
                </MuiButton>
              </DialogActions>
            </form>
          </Dialog>
        </div>
      )}

      {/* TAB 3: SALES TRANSACTION ENGINE & DEED CONTRACTS */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sale Initiation Form */}
          <MuiCard elevation={1} className="lg:col-span-5 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <BadgeDollarSign className="h-4 w-4 text-primary" />
              Execute Showroom Sale & Issue Contract
            </h3>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <MuiTextField
                select
                label="Select Stock Vehicle"
                value={saleForm.stockNumber}
                onChange={(e) => {
                  const sel = vehicles.find((v) => v.stockNumber === e.target.value);
                  setSaleForm({
                    ...saleForm,
                    stockNumber: e.target.value,
                    salePriceUSD: sel?.sellingPrice || 35000,
                    downPaymentUSD: sel?.sellingPrice || 35000,
                  });
                }}
              >
                {vehicles
                  .filter((v) => v.status !== "Sold")
                  .map((v) => (
                    <MenuItem key={v.id} value={v.stockNumber}>
                      {v.stockNumber} - {v.year} {v.make} {v.model} (${v.sellingPrice.toLocaleString()})
                    </MenuItem>
                  ))}
              </MuiTextField>

              <MuiTextField
                label="Buyer Full Name (نام خریدار)"
                required
                placeholder="e.g. Haji Abdul Qadir Alokozai"
                value={saleForm.customerName}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, customerName: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <MuiTextField
                  label="Phone (شماره تماس)"
                  required
                  placeholder="+93 79 912 3456"
                  value={saleForm.customerPhone}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, customerPhone: e.target.value })
                  }
                />
                <MuiTextField
                  label="Tazkira ID (تذکره)"
                  required
                  placeholder="1400-0402-88912"
                  value={saleForm.customerTazkira}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, customerTazkira: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MuiTextField
                  label="Agreed Price (USD)"
                  type="number"
                  value={saleForm.salePriceUSD}
                  onChange={(e) =>
                    setSaleForm({
                      ...saleForm,
                      salePriceUSD: Number(e.target.value),
                    })
                  }
                  startAdornment={<DollarSign className="h-3.5 w-3.5 text-slate-400" />}
                />

                <MuiTextField
                  select
                  label="Payment Structure"
                  value={saleForm.paymentType}
                  onChange={(e) =>
                    setSaleForm({
                      ...saleForm,
                      paymentType: e.target.value as SaleRecord["paymentType"],
                      downPaymentUSD:
                        e.target.value === "Installment Plan"
                          ? Math.round(Number(saleForm.salePriceUSD) * 0.2)
                          : Number(saleForm.salePriceUSD),
                    })
                  }
                >
                  <MenuItem value="Full Cash">Full Cash</MenuItem>
                  <MenuItem value="Installment Plan">Installment Plan</MenuItem>
                  <MenuItem value="Hawala / Bank Transfer">Hawala / Sarrafi</MenuItem>
                </MuiTextField>
              </div>

              {saleForm.paymentType === "Installment Plan" && (
                <div className="grid grid-cols-2 gap-3">
                  <MuiTextField
                    label="Down Payment (USD)"
                    type="number"
                    value={saleForm.downPaymentUSD}
                    onChange={(e) =>
                      setSaleForm({
                        ...saleForm,
                        downPaymentUSD: Math.min(
                          Math.max(Number(e.target.value) || 0, 0),
                          Number(saleForm.salePriceUSD)
                        ),
                      })
                    }
                  />
                  <MuiTextField
                    label="Qist Installments (Months)"
                    type="number"
                    value={saleForm.installmentsRemaining || 6}
                    onChange={(e) =>
                      setSaleForm({
                        ...saleForm,
                        installmentsRemaining: Math.max(1, Number(e.target.value) || 6),
                      })
                    }
                  />
                </div>
              )}

              <div className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#262F40] bg-[#F8FAFC] dark:bg-[#121722] text-[11px] font-mono text-slate-600 dark:text-slate-400">
                1-Click Atomic Execution: Marks chassis <strong>SOLD</strong>, issues{" "}
                <strong>Commercial Invoice</strong>, and posts{" "}
                <strong>Sarrafi Receipt Voucher</strong> at 1 USD = {exchangeRate} AFN.
              </div>

              <MuiButton
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="medium"
              >
                Execute Contract, Invoice & Sarrafi Voucher
              </MuiButton>
            </form>
          </MuiCard>

          {/* Right 7 Cols: Completed Contracts + Installment (Qist) Collections Schedule */}
          <div className="lg:col-span-7 space-y-5">
            <MuiCard elevation={1}>
              <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#262F40] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8FAFC] dark:bg-[#121722]">
                <h3 className="font-mono font-bold text-[#0F172A] dark:text-white text-xs uppercase tracking-wider">
                  EXECUTED SHOWROOM CONTRACTS ({filteredSales.length})
                </h3>
                <div className="relative">
                  <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    aria-label="Filter contracts"
                    placeholder="Filter contract, buyer, vehicle..."
                    value={salesSearch}
                    onChange={(e) => setSalesSearch(e.target.value)}
                    className="w-48 sm:w-56 ps-7 pe-6 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B26] text-[#0F172A] dark:text-white placeholder-slate-400 outline-none focus:border-[#1A73E8] h-7"
                  />
                  {salesSearch && (
                    <button
                      onClick={() => setSalesSearch("")}
                      aria-label="Clear filter"
                      className="absolute end-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <MuiTable dense size="small" className="w-full">
                  <MuiTableHead>
                    <MuiTableRow hover={false}>
                      <MuiTableCell header>Contract #</MuiTableCell>
                      <MuiTableCell header>Vehicle</MuiTableCell>
                      <MuiTableCell header>Buyer & Tazkira</MuiTableCell>
                      <MuiTableCell header align="right">Contract Price</MuiTableCell>
                      <MuiTableCell header>Settlement</MuiTableCell>
                      <MuiTableCell header align="right">Commercial Invoice</MuiTableCell>
                    </MuiTableRow>
                  </MuiTableHead>
                  <MuiTableBody>
                    {filteredSales.map((s) => {
                      const matchedInv = invoices.find(
                        (inv) => inv.saleId === s.id || inv.vehicleStock === s.stockNumber
                      );
                      const isDownloadingThis = downloadingSaleInvoiceId === s.id;
                      const matchedVehicleObj = vehicles.find(
                        (v) => v.stockNumber === s.stockNumber
                      );

                      return (
                        <MuiTableRow key={s.id}>
                          <MuiTableCell className="py-1.5 font-mono tabular-nums font-bold text-[#1A73E8] dark:text-[#8AB4F8] text-xs">
                            {s.contractNumber}
                          </MuiTableCell>
                          <MuiTableCell className="py-1.5">
                            <div className="font-semibold text-xs text-[#0F172A] dark:text-white leading-tight">
                              {s.vehicleName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                              {s.stockNumber}
                            </div>
                          </MuiTableCell>
                          <MuiTableCell className="py-1.5">
                            <div className="text-xs font-medium text-[#0F172A] dark:text-white">
                              {s.customerName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                              {s.customerTazkira}
                            </div>
                          </MuiTableCell>
                          <MuiTableCell align="right" className="py-1.5 font-mono tabular-nums font-bold text-xs text-[#0F172A] dark:text-white whitespace-nowrap">
                            ${s.salePriceUSD.toLocaleString()}
                          </MuiTableCell>
                          <MuiTableCell className="py-1.5 whitespace-nowrap">
                            <MuiChip
                              label={s.status === "Completed" ? "Completed" : s.paymentType}
                              color={
                                s.status === "Completed" || s.paymentType === "Full Cash"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                          </MuiTableCell>
                          <MuiTableCell align="right" className="py-1.5 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <IconButton
                                size="small"
                                color="primary"
                                title={t.buttonDownloadInvoice}
                                onClick={() => handleDownloadSaleInvoicePDF(s)}
                                disabled={isDownloadingThis}
                                sx={{ p: "3px" }}
                              >
                                {isDownloadingThis ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                              </IconButton>
                              {(matchedInv || matchedVehicleObj) && (
                                <IconButton
                                  component={Link}
                                  href={
                                    matchedInv
                                      ? `/accounting/invoices/${matchedInv.id}`
                                      : `/vehicles/${matchedVehicleObj!.id}/deed`
                                  }
                                  size="small"
                                  color="inherit"
                                  title="View Official Commercial Invoice / Deed"
                                  sx={{ p: "3px" }}
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                                </IconButton>
                              )}
                              <IconButton
                                size="small"
                                color="primary"
                                title="Edit Sale Contract"
                                onClick={() => setEditingSale({ ...s })}
                                sx={{ p: "3px" }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </IconButton>
                              {currentRole === "SuperAdmin" && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  title="Void / Cancel Sale Contract"
                                  onClick={() => {
                                    setRevertVehicleOnVoid(true);
                                    setDeletingSale(s);
                                  }}
                                  sx={{ p: "3px" }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </IconButton>
                              )}
                            </div>
                          </MuiTableCell>
                        </MuiTableRow>
                      );
                    })}
                  </MuiTableBody>
                </MuiTable>
              </div>
            </MuiCard>

            {/* Installment (Qist) Amortization & Due-Date Collections Schedule */}
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#262F40] bg-white dark:bg-[#161B26] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#262F40] bg-[#F8FAFC] dark:bg-[#121722] flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0F172A] dark:text-white block">
                    INSTALLMENT (QIST) RECEIVABLES & COLLECTIONS SCHEDULE
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Active buyer installment plans, remaining USD/AFN balances & 1-click Hawala collection
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded font-mono tabular-nums text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {
                    sales.filter(
                      (s) =>
                        s.status === "Pending Installments" &&
                        (s.downPaymentUSD || 0) < s.salePriceUSD
                    ).length
                  }{" "}
                  ACTIVE QIST ACCOUNTS
                </span>
              </div>

              <div className="divide-y divide-[#E2E8F0] dark:divide-[#262F40]">
                {sales
                  .filter(
                    (s) =>
                      (s.paymentType === "Installment Plan" ||
                        s.status === "Pending Installments") &&
                      (s.downPaymentUSD || 0) < s.salePriceUSD
                  )
                  .map((s) => {
                    const balanceUSD = Math.max(0, s.salePriceUSD - (s.downPaymentUSD || 0));
                    const months = Math.max(1, s.installmentsRemaining || 1);
                    const monthlyQistUSD = Math.min(
                      balanceUSD,
                      Math.max(1, Math.round(balanceUSD / months))
                    );
                    const targetPhone = (
                      s.customerPhone ||
                      branding?.whatsapp ||
                      ""
                    ).replace(/[^0-9]/g, "");
                    const reminderWhatsapp = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
                      `Salam ${s.customerName}, friendly reminder from ${branding?.dealershipName || "Aria Motors"} regarding your vehicle installment (${s.vehicleName}, Contract #${s.contractNumber}). Next Qist due: $${monthlyQistUSD.toLocaleString()} USD (؋ ${(monthlyQistUSD * exchangeRate).toLocaleString()} AFN).`
                    )}`;

                    return (
                      <div
                        key={s.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#1C2331] transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#0F172A] dark:text-white">
                              {s.customerName}
                            </span>
                            <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {s.contractNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                            {s.vehicleName} · Paid:{" "}
                            <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                              ${(s.downPaymentUSD || 0).toLocaleString()}
                            </strong>{" "}
                            · Remaining:{" "}
                            <strong className="font-mono text-amber-700 dark:text-amber-400">
                              ${balanceUSD.toLocaleString()} USD
                            </strong>{" "}
                            ({months} Qists @ ${monthlyQistUSD.toLocaleString()}/mo)
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={reminderWhatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 hover:border-emerald-600 transition-colors"
                          >
                            <Send className="h-3 w-3" />
                            <span>WhatsApp Reminder</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => void handleCollectInstallment(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white text-[11px] font-mono tabular-nums font-bold cursor-pointer transition-colors"
                          >
                            <Banknote className="h-3 w-3" />
                            <span>Collect Qist (${monthlyQistUSD.toLocaleString()})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Vehicle Confirmation Dialog */}
      <Dialog
        open={Boolean(vehicleToDelete)}
        onClose={() => setVehicleToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900 dark:text-white">
          Confirm Vehicle Removal
        </DialogTitle>
        <DialogContent>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            Are you sure you want to permanently remove{" "}
            <strong className="text-slate-900 dark:text-white">
              {vehicleToDelete?.year} {vehicleToDelete?.make} {vehicleToDelete?.model}
            </strong>{" "}
            (Stock <span className="font-mono font-semibold">{vehicleToDelete?.stockNumber}</span>) from the showroom registry?
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <MuiButton
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => setVehicleToDelete(null)}
          >
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              if (!vehicleToDelete) return;
              const target = vehicleToDelete;
              setVehicleToDelete(null);
              try {
                await deleteVehicle(target.id);
                addToast(`Removed vehicle ${target.stockNumber}`, "info");
              } catch (error) {
                addToast(
                  error instanceof Error ? error.message : "Unable to delete vehicle",
                  "error"
                );
              }
            }}
          >
            Delete Permanently
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog
        open={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Edit Customer Lead (ویرایش معلومات مشتری و لید)
        </DialogTitle>
        {editingCustomer && (
          <form onSubmit={handleUpdateCustomer}>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="Full Name (نام و تخلص)"
                  value={editingCustomer.fullName}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, fullName: e.target.value })}
                  required
                />
                <MuiTextField
                  label="Tazkira / Passport (نمبر تذکره)"
                  value={editingCustomer.tazkiraNumber}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, tazkiraNumber: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="Phone Number"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  required
                />
                <MuiTextField
                  label="WhatsApp"
                  value={editingCustomer.whatsapp || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, whatsapp: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="City (شهر)"
                  value={editingCustomer.city}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                  required
                />
                <MuiTextField
                  label="Street Address / Location"
                  value={editingCustomer.address || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="Budget (USD $)"
                  type="number"
                  value={editingCustomer.budget}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, budget: Number(e.target.value) })}
                  required
                />
                <MuiTextField
                  select
                  label="Funnel Stage"
                  value={editingCustomer.leadStage}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      leadStage: e.target.value as CustomerRecord["leadStage"],
                    })
                  }
                  required
                >
                  <MenuItem value="New Inquiry">New Inquiry (استعلام جدید)</MenuItem>
                  <MenuItem value="Follow-Up">Follow-Up (پیگیری)</MenuItem>
                  <MenuItem value="Test Drive">Test Drive (تست درایو)</MenuItem>
                  <MenuItem value="Negotiation">Negotiation (مذاکره قیمت)</MenuItem>
                  <MenuItem value="Closed/Won">Closed/Won (معامله موفق)</MenuItem>
                  <MenuItem value="Lost">Lost (منصرف شده)</MenuItem>
                </MuiTextField>
              </div>

              <MuiTextField
                select
                label="Interested Vehicle (موتر مورد علاقه)"
                value={editingCustomer.interestedInVehicleId || ""}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, interestedInVehicleId: e.target.value })}
              >
                <MenuItem value="">General Inquiry (No Specific Vehicle)</MenuItem>
                {vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model} — Stock #{v.stockNumber} (${v.sellingPrice.toLocaleString()})
                  </MenuItem>
                ))}
              </MuiTextField>

              <MuiTextField
                label="Lead Notes & Preferences"
                value={editingCustomer.notes || ""}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                multiline
                rows={2}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <MuiButton variant="outlined" color="inherit" onClick={() => setEditingCustomer(null)}>
                Cancel
              </MuiButton>
              <MuiButton type="submit" variant="contained" color="primary">
                Save Changes
              </MuiButton>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog
        open={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Delete Customer Lead
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete lead record for{" "}
            <strong className="text-slate-900 dark:text-white">
              {deletingCustomer?.fullName}
            </strong>{" "}
            ({deletingCustomer?.phone})? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MuiButton variant="outlined" color="inherit" onClick={() => setDeletingCustomer(null)}>
            Cancel
          </MuiButton>
          <MuiButton variant="contained" color="error" onClick={handleDeleteCustomer}>
            Delete Lead
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog
        open={Boolean(editingSale)}
        onClose={() => setEditingSale(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Edit Sale Contract ({editingSale?.contractNumber})
        </DialogTitle>
        {editingSale && (
          <form onSubmit={handleUpdateSale}>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-semibold block text-slate-900 dark:text-white">
                  {editingSale.vehicleName} (Stock #{editingSale.stockNumber})
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Buyer: {editingSale.customerName} • Tazkira: {editingSale.customerTazkira}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  label="Contract Price (USD $)"
                  type="number"
                  value={editingSale.salePriceUSD}
                  disabled={currentRole !== "SuperAdmin"}
                  onChange={(e) => setEditingSale({ ...editingSale, salePriceUSD: Number(e.target.value) })}
                  required
                />
                <MuiTextField
                  select
                  label="Payment Method"
                  value={editingSale.paymentType}
                  onChange={(e) =>
                    setEditingSale({
                      ...editingSale,
                      paymentType: e.target.value as SaleRecord["paymentType"],
                    })
                  }
                  required
                >
                  <MenuItem value="Full Cash">Full Cash (نقد کامل)</MenuItem>
                  <MenuItem value="Installment Plan">Installment Plan (اقساطی)</MenuItem>
                  <MenuItem value="Hawala / Bank Transfer">Hawala / Bank Transfer (حواله صرافی یا بانک)</MenuItem>
                </MuiTextField>
              </div>

              {editingSale.paymentType === "Installment Plan" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MuiTextField
                    label="Down Payment ($)"
                    type="number"
                    value={editingSale.downPaymentUSD || 0}
                    onChange={(e) => setEditingSale({ ...editingSale, downPaymentUSD: Number(e.target.value) })}
                  />
                  <MuiTextField
                    label="Remaining Installments (Months)"
                    type="number"
                    value={editingSale.installmentsRemaining || 0}
                    onChange={(e) => setEditingSale({ ...editingSale, installmentsRemaining: Number(e.target.value) })}
                  />
                </div>
              )}

              <MuiTextField
                select
                label="Contract Status"
                value={editingSale.status}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    status: e.target.value as SaleRecord["status"],
                  })
                }
                required
              >
                <MenuItem value="Completed">Completed (تکمیل شده)</MenuItem>
                <MenuItem value="Pending Installments">Pending Installments (در حال پرداخت اقساط)</MenuItem>
              </MuiTextField>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <MuiButton variant="outlined" color="inherit" onClick={() => setEditingSale(null)}>
                Cancel
              </MuiButton>
              <MuiButton type="submit" variant="contained" color="primary">
                Save Changes
              </MuiButton>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Delete / Void Sale Dialog */}
      <Dialog
        open={Boolean(deletingSale)}
        onClose={() => setDeletingSale(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Void Sale Contract ({deletingSale?.contractNumber})
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            Are you sure you want to void and delete sale contract{" "}
            <strong className="text-slate-900 dark:text-white">
              {deletingSale?.contractNumber}
            </strong>{" "}
            for vehicle{" "}
            <strong className="text-slate-900 dark:text-white">
              {deletingSale?.vehicleName}
            </strong>{" "}
            (${deletingSale?.salePriceUSD?.toLocaleString()} USD)?
          </p>
          <FormControlLabel
            control={
              <Checkbox
                checked={revertVehicleOnVoid}
                onChange={(e) => setRevertVehicleOnVoid(e.target.checked)}
                color="primary"
              />
            }
            label={
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Revert vehicle chassis back to <strong>&apos;Available on Lot&apos;</strong>
              </span>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MuiButton variant="outlined" color="inherit" onClick={() => setDeletingSale(null)}>
            Cancel
          </MuiButton>
          <MuiButton variant="contained" color="error" onClick={handleDeleteSale}>
            Void Contract
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog
        open={Boolean(editingVehicle)}
        onClose={() => setEditingVehicle(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          {currentRole === "SuperAdmin"
            ? `Edit Vehicle Details & Pricing (${editingVehicle?.stockNumber})`
            : `Update Operational Status & Bay (${editingVehicle?.stockNumber})`}
        </DialogTitle>
        {editingVehicle && (
          <form onSubmit={handleUpdateVehicle}>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-semibold block text-slate-900 dark:text-white">
                  {editingVehicle.year} {editingVehicle.make} {editingVehicle.model} ({editingVehicle.trim})
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  VIN: {editingVehicle.vin} • Origin: {editingVehicle.originCountry}
                </span>
              </div>

              {currentRole === "SuperAdmin" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MuiTextField
                    label="Selling Price (USD $)"
                    type="number"
                    value={editingVehicle.sellingPrice}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        sellingPrice: Number(e.target.value),
                      })
                    }
                    required
                  />
                  <MuiTextField
                    label="Minimum Target / Floor ($)"
                    type="number"
                    value={editingVehicle.minTargetPrice || editingVehicle.sellingPrice}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        minTargetPrice: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MuiTextField
                  select
                  label="Vehicle Status"
                  value={editingVehicle.status}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      status: e.target.value as VehicleItem["status"],
                    })
                  }
                  required
                >
                  <MenuItem value="Available on Lot">Available on Lot (موجود در نمایشگاه)</MenuItem>
                  <MenuItem value="In Transit">In Transit (در حال انتقال/گمرک)</MenuItem>
                  <MenuItem value="Reserved/Deposit Paid">Reserved / Deposit Paid (رزرو شده / بیعانه)</MenuItem>
                  <MenuItem value="Under Prep/Maintenance">Under Prep / Maintenance (در حال شستشو یا سرویس)</MenuItem>
                  <MenuItem value="Sold">Sold (فروخته شده)</MenuItem>
                </MuiTextField>
                <MuiTextField
                  label="Yard Location (موقعیت در محوطه)"
                  value={editingVehicle.yardLocation || "Main Showroom - Herat"}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, yardLocation: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MuiTextField
                  label="Mileage (km)"
                  type="number"
                  value={editingVehicle.mileage}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, mileage: Number(e.target.value) })}
                  required
                />
                <MuiTextField
                  label="Exterior Color"
                  value={editingVehicle.color}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, color: e.target.value })}
                  required
                />
                <MuiTextField
                  label="Customs Clearance"
                  value={editingVehicle.customsClearance}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, customsClearance: e.target.value })}
                  required
                />
              </div>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <MuiButton variant="outlined" color="inherit" onClick={() => setEditingVehicle(null)}>
                Cancel
              </MuiButton>
              <MuiButton type="submit" variant="contained" color="primary">
                Save Changes
              </MuiButton>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Floating Batch Action Toolbar for CRM Leads */}
      {activeTab === "crm" && (
        <FloatingBatchToolbar
          selectedCount={selectedCustomerIds.length}
          entityLabel={t.crmLeads}
          statusLabel={t.crmMoveStage}
          statusOptions={[
            { label: t.crmNewInquiry, value: "New Inquiry" },
            { label: t.crmFollowUp, value: "Follow-Up" },
            { label: t.crmTestDrive, value: "Test Drive" },
            { label: t.crmNegotiation, value: "Negotiation" },
            { label: t.crmClosedWon, value: "Closed/Won" },
            { label: t.crmLost, value: "Lost" },
          ]}
          onApplyStatus={(stage) => void handleBatchCustomerStage(stage)}
          onExportCSV={handleBatchCustomerExportCSV}
          onClearSelection={() => setSelectedCustomerIds([])}
        />
      )}

      {/* Floating Batch Action Toolbar for Quick Lot Inventory */}
      {activeTab === "inventory" && (
        <FloatingBatchToolbar
          selectedCount={selectedAdminVehicleIds.length}
          entityLabel={t.inventoryResources}
          statusLabel={t.inventorySetStatus}
          statusOptions={[
            { label: t.inventoryOnLot, value: "Available on Lot" },
            { label: t.inventoryInTransit, value: "In Transit" },
            { label: t.inventoryReserved, value: "Reserved/Deposit Paid" },
            { label: t.inventoryPrep, value: "Under Prep/Maintenance" },
            { label: t.inventorySold, value: "Sold" },
          ]}
          onApplyStatus={(status) => void handleBatchAdminVehicleStatus(status)}
          onAdjustPrice={
            currentRole === "SuperAdmin" ? handleBatchAdminVehiclePrice : undefined
          }
          onExportCSV={handleBatchAdminVehicleExportCSV}
          onClearSelection={() => setSelectedAdminVehicleIds([])}
        />
      )}
    </div>
  );
}
