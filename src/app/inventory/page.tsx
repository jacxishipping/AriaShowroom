"use client";

import React, { useMemo } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleFilters } from "@/components/VehicleFilters";
import { translations } from "@/lib/translations";
import { Car, SearchX } from "lucide-react";

export default function InventoryPage() {
  const { vehicles, filters, language } = useShowroomStore();
  const t = translations[language];

  // Client-side instant faceted filtering
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesQuery =
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.trim.toLowerCase().includes(query) ||
          v.vin.toLowerCase().includes(query) ||
          v.stockNumber.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Make
      if (filters.make !== "ALL" && v.make !== filters.make) return false;

      // Body Type
      if (filters.bodyType !== "ALL" && v.bodyType !== filters.bodyType) return false;

      // Fuel Type
      if (filters.fuelType !== "ALL" && v.fuelType !== filters.fuelType) return false;

      // Steering Side
      if (filters.steering !== "ALL" && v.steering !== filters.steering) return false;

      // Origin
      if (filters.originCountry !== "ALL" && v.originCountry !== filters.originCountry) return false;

      // Status
      if (filters.status !== "ALL" && v.status !== filters.status) return false;

      return true;
    });
  }, [vehicles, filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold dark:text-gold-light">
            Sadozai Motors Herat
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Available Vehicle Stock
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse authentic imported vehicles cleared at Herat / Islam Qala dry port
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:bg-navy-800 dark:text-slate-300">
          <Car className="h-4 w-4 text-gold" />
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredVehicles.length}</strong> of {vehicles.length} vehicles
          </span>
        </div>
      </div>

      {/* Multi-Criteria Faceted Filter Component */}
      <VehicleFilters />

      {/* Vehicle Grid or Empty State */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-navy-900">
          <SearchX className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            {t.noVehiclesFound}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search criteria or reset filters to browse the entire showroom catalog.
          </p>
        </div>
      )}
    </div>
  );
}
