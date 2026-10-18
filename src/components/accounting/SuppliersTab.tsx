"use client";

import React, { useState } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { SupplierRecord } from "@/lib/mock-data";
import {
  MuiCard,
  MuiButton,
  MuiChip,
  MuiTable,
  MuiTableHead,
  MuiTableBody,
  MuiTableRow,
  MuiTableCell,
  MuiTextField,
} from "@/components/mui";
import {
  Building2,
  Plus,
  Search,
  Eye,
  DollarSign,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Landmark,
} from "lucide-react";

interface SuppliersTabProps {
  onSelectSupplier: (supplier: SupplierRecord) => void;
}

export function SuppliersTab({ onSelectSupplier }: SuppliersTabProps) {
  const { suppliers, exchangeRate, addSupplier } = useShowroomStore();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [isCreating, setIsCreating] = useState(false);

  // New Supplier Form State
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [country, setCountry] = useState("UAE (Ras Al Khor, Dubai)");
  const [city, setCity] = useState("Dubai");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [bankOrSarrafiAccount, setBankOrSarrafiAccount] = useState("Sarrafi Khorasan Market Holding Safe");
  const [notes, setNotes] = useState("");

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName.toLowerCase().includes(search.toLowerCase()) ||
      Boolean(s.city && s.city.toLowerCase().includes(search.toLowerCase()));
    const matchesCountry = countryFilter === "all" || s.country.toLowerCase().includes(countryFilter.toLowerCase());
    return matchesSearch && matchesCountry;
  });

  const totalPayablesUSD = suppliers.reduce((acc, s) => acc + s.balanceUSD, 0);
  const totalPayablesAFN = Math.round(totalPayablesUSD * exchangeRate);
  const settledCount = suppliers.filter((s) => s.balanceUSD <= 0).length;
  const activeOwingCount = suppliers.filter((s) => s.balanceUSD > 0).length;

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    addSupplier({
      companyName,
      contactName: contactName || "Account Representative",
      country,
      city,
      phone,
      whatsapp,
      email,
      bankOrSarrafiAccount,
      notes,
    });

    // Reset Form
    setCompanyName("");
    setContactName("");
    setPhone("");
    setWhatsapp("");
    setEmail("");
    setNotes("");
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Top AP Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Payables (باقیداری تامین‌کنندگان)
            </span>
            <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 p-1.5 text-rose-600 dark:text-rose-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            ${totalPayablesUSD.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            ؋ {totalPayablesAFN.toLocaleString()} AFN (@ {exchangeRate})
          </p>
        </MuiCard>

        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Suppliers (همکاران تجاری)
            </span>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 p-1.5 text-blue-600 dark:text-blue-400">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {suppliers.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dubai, Japan, Iran & Overland transit routes
          </p>
        </MuiCard>

        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Balances Pending Settlement
            </span>
            <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 p-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {activeOwingCount} Accounts
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Awaiting Hawala exchange clearance
          </p>
        </MuiCard>

        <MuiCard elevation={1} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cleared / In Good Standing
            </span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 p-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {settledCount} Accounts
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Zero outstanding balance
          </p>
        </MuiCard>
      </div>

      {/* Control Bar: Search, Country Filter, and Add Supplier */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search supplier, contact, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-[#1976D2] dark:border-slate-700 dark:bg-[#121824] dark:text-white"
            />
          </div>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1976D2] dark:border-slate-700 dark:bg-[#121824] dark:text-white"
          >
            <option value="all">All Origins</option>
            <option value="uae">UAE (Dubai)</option>
            <option value="japan">Japan</option>
            <option value="iran">Iran</option>
            <option value="afghanistan">Transit / Local</option>
          </select>
        </div>

        <MuiButton
          variant={isCreating ? "outlined" : "contained"}
          color="primary"
          size="small"
          onClick={() => setIsCreating(!isCreating)}
          startIcon={isCreating ? undefined : <Plus className="h-4 w-4" />}
        >
          {isCreating ? "Cancel" : "Add Vehicle Supplier"}
        </MuiButton>
      </div>

      {/* Expandable Add Supplier Card */}
      {isCreating && (
        <MuiCard elevation={2} className="p-6 border border-blue-200 dark:border-blue-900/50 bg-blue-50/20 dark:bg-[#121b2d]">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-[#1976D2]" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Register New Vehicle Supplier / Exporter (ثبت شرکت صادرکننده)
            </h3>
          </div>

          <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <MuiTextField
                label="Company / Exporter Name"
                required
                placeholder="e.g. Al-Baraka Global Motors FZE"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />

              <MuiTextField
                label="Contact Person (نام نماینده)"
                placeholder="e.g. Tariq Al-Hashimi"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Country & Hub
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-[#121824] dark:text-white outline-none focus:border-[#1976D2]"
                >
                  <option value="UAE (Ras Al Khor, Dubai)">UAE (Ras Al Khor, Dubai)</option>
                  <option value="Japan (Yokohama & Kobe Auctions)">Japan (Yokohama & Kobe Auctions)</option>
                  <option value="Iran (Bandar Abbas / Tehran Transit)">Iran (Bandar Abbas / Tehran Transit)</option>
                  <option value="Afghanistan (Islam Qala / Herat Freight)">Afghanistan (Islam Qala / Herat Freight)</option>
                </select>
              </div>

              <MuiTextField
                label="City / Port"
                placeholder="e.g. Dubai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <MuiTextField
                label="Phone Number"
                placeholder="+971 4 333 4455"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <MuiTextField
                label="WhatsApp (ارتباط سریع)"
                placeholder="+971 50 123 4567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />

              <MuiTextField
                label="Email"
                type="email"
                placeholder="sales@supplier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="sm:col-span-2">
                <MuiTextField
                  label="Sarrafi / Bank Settlement Safe (حساب صرافی و تسویه)"
                  placeholder="e.g. Sarrafi Haji Qayoum - Khorasan Market Herat / Al Ansari Exchange Dubai"
                  value={bankOrSarrafiAccount}
                  onChange={(e) => setBankOrSarrafiAccount(e.target.value)}
                />
              </div>
            </div>

            <MuiTextField
              label="Supplier Notes & Import Terms"
              placeholder="e.g. Specializes in GCC-spec Land Cruisers and Lexus LX600; 30% advance via Hawala."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <MuiButton
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </MuiButton>
              <MuiButton
                type="submit"
                variant="contained"
                color="primary"
                size="small"
              >
                Save Supplier to Registry
              </MuiButton>
            </div>
          </form>
        </MuiCard>
      )}

      {/* Suppliers Table */}
      <MuiCard elevation={1} className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Supplier Accounts & Running Ledger (دفتر حسابات تامین‌کنندگان)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;View Statement&quot; to review purchase bills, Hawala settlements, or issue a payment voucher.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredSuppliers.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <MuiTable dense>
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header>Supplier / Company</MuiTableCell>
                <MuiTableCell header>Country & Port</MuiTableCell>
                <MuiTableCell header>Contact & Communication</MuiTableCell>
                <MuiTableCell header>Settlement Safe / Sarrafi</MuiTableCell>
                <MuiTableCell header align="right">Outstanding Balance</MuiTableCell>
                <MuiTableCell header align="center">Actions</MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {filteredSuppliers.map((sup) => (
                <MuiTableRow key={sup.id}>
                  <MuiTableCell>
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {sup.companyName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Representative: {sup.contactName}
                    </div>
                  </MuiTableCell>

                  <MuiTableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <Globe className="h-3 w-3 text-slate-400" />
                      <span>{sup.country}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      <span>{sup.city}</span>
                    </div>
                  </MuiTableCell>

                  <MuiTableCell>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{sup.phone || "—"}</span>
                    </div>
                    {sup.whatsapp && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                        <MessageCircle className="h-2.5 w-2.5" />
                        <span>{sup.whatsapp}</span>
                      </div>
                    )}
                  </MuiTableCell>

                  <MuiTableCell>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Landmark className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]" title={sup.bankOrSarrafiAccount}>
                        {sup.bankOrSarrafiAccount || "Cash Safe"}
                      </span>
                    </div>
                  </MuiTableCell>

                  <MuiTableCell align="right">
                    <div
                      className={`font-mono font-bold text-sm ${
                        sup.balanceUSD > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      ${sup.balanceUSD.toLocaleString()} USD
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      ؋ {Math.round(sup.balanceUSD * exchangeRate).toLocaleString()} AFN
                    </div>
                  </MuiTableCell>

                  <MuiTableCell align="center">
                    <div className="flex items-center justify-center gap-2">
                      <MuiButton
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => onSelectSupplier(sup)}
                        startIcon={<Eye className="h-3 w-3" />}
                      >
                        Ledger Statement
                      </MuiButton>
                    </div>
                  </MuiTableCell>
                </MuiTableRow>
              ))}
            </MuiTableBody>
          </MuiTable>
        </div>
      </MuiCard>
    </div>
  );
}
