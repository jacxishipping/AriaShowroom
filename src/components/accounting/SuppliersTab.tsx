"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  MenuItem,
} from "@/components/mui";
import {
  Building2,
  Plus,
  Search,
  X,
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
  onSelectSupplier?: (supplier: SupplierRecord) => void;
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

  const [standingFilter, setStandingFilter] = useState("all");

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName.toLowerCase().includes(search.toLowerCase()) ||
      Boolean(s.city && s.city.toLowerCase().includes(search.toLowerCase()));
    const matchesCountry = countryFilter === "all" || s.country.toLowerCase().includes(countryFilter.toLowerCase());
    const matchesStanding =
      standingFilter === "all"
        ? true
        : standingFilter === "owing"
        ? s.balanceUSD > 0
        : s.balanceUSD <= 0;
    return matchesSearch && matchesCountry && matchesStanding;
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
    <div className="space-y-4">
      {/* Top AP Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Payables (باقیداری)
            </span>
            <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <DollarSign className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            ${totalPayablesUSD.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 font-mono">
            ؋ {totalPayablesAFN.toLocaleString()} AFN
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Suppliers (همکاران)
            </span>
            <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <Building2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {suppliers.length}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Dubai, Japan, Iran & Overland
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Settlement
            </span>
            <span className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <Clock className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
            {activeOwingCount} Accounts
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Awaiting Hawala exchange
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200/90 dark:border-slate-800/90 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cleared Standing
            </span>
            <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            {settledCount} Accounts
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Zero outstanding balance
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Country Filter, Standing Filter, and Add Supplier */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search supplier, contact, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 sm:w-64 ps-7 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 h-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Origins</option>
            <option value="uae">UAE (Dubai)</option>
            <option value="japan">Japan</option>
            <option value="iran">Iran</option>
            <option value="afghanistan">Transit / Local</option>
          </select>

          <select
            value={standingFilter}
            onChange={(e) => setStandingFilter(e.target.value)}
            className="h-8 ps-2.5 pe-6 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Accounts</option>
            <option value="owing">Awaiting Hawala (Owing)</option>
            <option value="settled">Cleared Standing (0 Bal)</option>
          </select>

          {(search || countryFilter !== "all" || standingFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setCountryFilter("all");
                setStandingFilter("all");
              }}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline px-1 cursor-pointer"
            >
              Reset
            </button>
          )}

          <span className="text-[11px] font-mono text-slate-400">
            ({filteredSuppliers.length} suppliers)
          </span>
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

              <MuiTextField
                select
                label="Country & Hub"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <MenuItem value="UAE (Ras Al Khor, Dubai)">UAE (Ras Al Khor, Dubai)</MenuItem>
                <MenuItem value="Japan (Yokohama & Kobe Auctions)">Japan (Yokohama & Kobe Auctions)</MenuItem>
                <MenuItem value="Iran (Bandar Abbas / Tehran Transit)">Iran (Bandar Abbas / Tehran Transit)</MenuItem>
                <MenuItem value="Afghanistan (Islam Qala / Herat Freight)">Afghanistan (Islam Qala / Herat Freight)</MenuItem>
              </MuiTextField>

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
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111827] shadow-xs overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Supplier Accounts & Running Ledger (دفتر حسابات تامین‌کنندگان)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Review purchase bills, Hawala settlements, or issue a payment voucher.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {filteredSuppliers.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <MuiTable dense size="small" className="w-full">
            <MuiTableHead>
              <MuiTableRow hover={false}>
                <MuiTableCell header>Supplier / Company</MuiTableCell>
                <MuiTableCell header>Country & Port</MuiTableCell>
                <MuiTableCell header>Contact & Details</MuiTableCell>
                <MuiTableCell header>Settlement Safe</MuiTableCell>
                <MuiTableCell header align="right">Balance</MuiTableCell>
                <MuiTableCell header align="center">Action</MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {filteredSuppliers.map((sup) => (
                <MuiTableRow key={sup.id}>
                  <MuiTableCell>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {sup.companyName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Rep: {sup.contactName}
                    </div>
                  </MuiTableCell>

                  <MuiTableCell>
                    <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
                      <Globe className="h-3 w-3 text-slate-400" />
                      <span className="truncate max-w-[120px]">{sup.country}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      <span>{sup.city}</span>
                    </div>
                  </MuiTableCell>

                  <MuiTableCell>
                    <div className="flex items-center gap-1 font-mono text-xs text-slate-700 dark:text-slate-300">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{sup.phone || "—"}</span>
                    </div>
                    {sup.whatsapp && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                        <MessageCircle className="h-2.5 w-2.5" />
                        <span>{sup.whatsapp}</span>
                      </div>
                    )}
                  </MuiTableCell>

                  <MuiTableCell>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Landmark className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[160px]" title={sup.bankOrSarrafiAccount}>
                        {sup.bankOrSarrafiAccount || "Cash Safe"}
                      </span>
                    </div>
                  </MuiTableCell>

                  <MuiTableCell align="right">
                    <div
                      className={`font-mono font-bold text-xs ${
                        sup.balanceUSD > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      ${sup.balanceUSD.toLocaleString()} USD
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      ؋ {Math.round(sup.balanceUSD * exchangeRate).toLocaleString()} AFN
                    </div>
                  </MuiTableCell>

                  <MuiTableCell align="center">
                    <MuiButton
                      component={Link}
                      href={`/accounting/suppliers/${sup.id}`}
                      variant="outlined"
                      size="small"
                      color="primary"
                      sx={{ fontSize: "10px", py: "2px", px: "6px" }}
                      startIcon={<Eye className="h-3 w-3" />}
                    >
                      Statement
                    </MuiButton>
                  </MuiTableCell>
                </MuiTableRow>
              ))}
            </MuiTableBody>
          </MuiTable>
        </div>
      </div>
    </div>
  );
}
