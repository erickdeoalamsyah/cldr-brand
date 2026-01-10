"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useAddressStore } from "@/store/address";
import { 
  Plus, Trash2, Edit3, X, Globe, 
  Navigation, ShieldCheck, Loader2, ChevronDown 
} from "lucide-react";

// ==========================================
// 1. HELPER COMPONENTS (Responsive Optimized)
// ==========================================

interface FormInputProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

function FormInput({ label, value, onChange, placeholder, required }: FormInputProps) {
  return (
    <div className="space-y-1 w-full">
      <label className="ml-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</label>
      <input
        required={required}
        type="text"
        className="w-full rounded-xl md:rounded-2xl border-2 border-zinc-200 bg-zinc-50/50 px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold outline-none transition-all focus:border-black focus:bg-white text-black"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  value: number | string | undefined;
  options: Array<{ id: number | string; name: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function FormSelect({ label, value, options, onChange, disabled }: FormSelectProps) {
  return (
    <div className="space-y-1 w-full text-black">
      <label className="ml-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</label>
      <div className="relative">
        <select
          disabled={disabled}
          className="w-full cursor-pointer appearance-none rounded-xl md:rounded-2xl border-2 border-zinc-200 bg-zinc-50/50 px-4 py-3 md:px-6 md:py-4 text-[11px] md:text-xs font-black uppercase outline-none transition-all focus:border-black focus:bg-white disabled:opacity-30"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Pilih {label}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
      </div>
    </div>
  );
}

// ==========================================
// 2. SUB-COMPONENT: ADDRESS FORM MODAL (Mobile Bottom Sheet Style)
// ==========================================

function AddressFormModal() {
  const token = useAuthStore((s) => s.token);
  const {
    modalOpen, editingAddress, formState, formError,
    submitting, provinces, cities, subdistricts,
    loadingLocation, updateFormField, closeModal, submitForm,
  } = useAddressStore();

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      {/* Modal Container: Di HP nempel bawah (Drawer style), di Desktop di tengah */}
      <div className="flex flex-col max-h-[92vh] md:max-h-[85vh] w-full max-w-xl overflow-hidden rounded-t-[2rem] md:rounded-[2.5rem] border-t-4 md:border-4 border-black bg-white shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-zinc-100 bg-white p-5 md:p-8">
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-black leading-none">
              {editingAddress ? "Modify_Address" : "New_Address"}
            </h2>
            <p className="mt-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400">Logistics Archive Update</p>
          </div>
          <button onClick={closeModal} className="rounded-full bg-zinc-100 p-2 md:p-3 hover:bg-black hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form Body: Scrollable */}
        <form 
          onSubmit={(e) => { e.preventDefault(); if(token) submitForm(token); }} 
          className="flex-1 overflow-y-auto p-5 md:p-8 space-y-4 md:space-y-6"
        >
          {formError && (
            <div className="rounded-xl border-2 border-red-500 bg-red-50 p-3 text-[9px] font-black uppercase text-red-600 tracking-tight">
              Error_Report: {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Label_Hub" placeholder="Ex: Home / Office" value={formState.label} onChange={(v) => updateFormField("label", v)} />
            <FormInput label="Recipient" placeholder="Receiver Name" value={formState.recipientName} onChange={(v) => updateFormField("recipientName", v)} required />
          </div>

          <FormInput label="Contact_Number" placeholder="08xxxxxxxx" value={formState.phone} onChange={(v) => updateFormField("phone", v)} required />

          <div className="space-y-1">
            <label className="ml-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Street_Address</label>
            <textarea
              required
              className="min-h-[80px] w-full rounded-xl md:rounded-2xl border-2 border-zinc-200 bg-zinc-50/50 p-4 text-xs md:text-sm font-bold outline-none focus:border-black focus:bg-white text-black"
              value={formState.addressLine}
              onChange={(e) => updateFormField("addressLine", e.target.value)}
              placeholder="Street name, building number..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect label="Province" value={formState.provinceId} options={provinces} onChange={(v) => updateFormField("provinceId", v ? Number(v) : "")} />
            <FormSelect label="City" value={formState.cityId} options={cities} onChange={(v) => updateFormField("cityId", v ? Number(v) : "")} disabled={!formState.provinceId} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="District" value={formState.subdistrictId} options={subdistricts} onChange={(v) => updateFormField("subdistrictId", v ? Number(v) : "")} disabled={!formState.cityId} />
            <FormInput label="Zip_Code" placeholder="Postal" value={formState.postalCode} onChange={(v) => updateFormField("postalCode", v)} />
          </div>

          {loadingLocation && (
            <div className="flex items-center gap-2 py-2 text-[8px] font-black uppercase text-zinc-400 tracking-widest">
              <Loader2 size={10} className="animate-spin" /> Fetching_Data...
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="grid grid-cols-3 gap-3 bg-zinc-50 p-5 md:p-8 border-t-2 border-zinc-100">
          <button 
            type="button" 
            onClick={closeModal} 
            className="col-span-1 rounded-xl border-2 border-red-600 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            onClick={(e) => { e.preventDefault(); if(token) submitForm(token); }}
            className="col-span-2 rounded-xl bg-black py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_black] active:scale-95 disabled:opacity-50 transition-all"
          >
            {submitting ? "Syncing..." : editingAddress ? "Update Address" : "Create Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN SECTION
// ==========================================

export function AccountAddressesSection() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const {
    addresses, loading, actionMessage,
    loadAddresses, openAddModal, openEditModal,
    deleteAddress, setPrimaryAddress,
  } = useAddressStore();

  useEffect(() => {
    if (hasHydrated && isAuthenticated && token) loadAddresses(token);
  }, [hasHydrated, isAuthenticated, token, loadAddresses]);

  if (!hasHydrated) return <SkeletonLoader />;
  if (!isAuthenticated || !token) return <AuthWarning />;

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Header Section: Flex Col di HP agar Judul dan Button punya ruang */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div className="space-y-1.5 md:space-y-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <Globe size={22} className="md:w-[27px]" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Shipping Location</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-black leading-none">
            Address_<span className="text-zinc-400">Hubs</span>
          </h2>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl md:rounded-2xl bg-black px-6 py-4 md:px-8 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={3} /> Add New Address
        </button>
      </div>

      {actionMessage && (
        <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 text-[9px] font-black uppercase text-emerald-600 tracking-widest italic animate-in fade-in zoom-in-95">
          System_Update: {actionMessage}
        </div>
      )}

      {/* Address List */}
      <div className="grid gap-4 md:gap-6">
        {loading && addresses.length === 0 ? (
          <SkeletonLoader />
        ) : addresses.length === 0 ? (
          <EmptyState />
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`group relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border-2 p-5 md:p-10 transition-all
                ${addr.isPrimary 
                  ? "border-black bg-white" 
                  : "border-zinc-200 bg-zinc-50/30 hover:border-zinc-400"}`}
            >
              {addr.isPrimary && (
                <div className="absolute right-0 top-0 flex items-center gap-2 bg-black px-4 md:px-6 py-1.5 md:py-2.5 rounded-bl-xl md:rounded-bl-2xl">
                  <ShieldCheck size={10} className="text-white" />
                  <span className="text-[7px] md:text-[9px] font-black uppercase text-white tracking-widest whitespace-nowrap">Primary_Hub</span>
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-start gap-4 md:gap-6">
                  {/* Ikon: Tetap di pojok kiri atas */}
                  <div className={`flex h-10 w-10 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-lg md:rounded-2xl transition-colors
                    ${addr.isPrimary ? "bg-black text-white" : "bg-white border-2 border-zinc-200 text-zinc-300"}`}>
                    <Globe size={18} className="md:w-7 md:h-7" />
                  </div>
                  
                  <div className="space-y-2 flex-1 min-w-0">
                    <div>
                      <h4 className="text-base md:text-xl font-black uppercase italic tracking-tighter text-black truncate">{addr.label || "Hub"}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[8px] md:text-[10px] font-bold uppercase text-zinc-500">
                        <span className="text-black">{addr.recipientName}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-300" />
                        <span>{addr.phone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[11px] md:text-sm font-bold leading-relaxed text-zinc-800 italic">"{addr.addressLine}"</p>
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-wider text-zinc-400 leading-tight">
                        {addr.subdistrictName}, {addr.cityName}, {addr.provinceName} • {addr.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions: Horizontal di HP, tetap rapi */}
                <div className="flex flex-row items-center gap-2 border-t-2 border-zinc-300 pt-4 lg:border-none lg:pt-0 lg:ml-auto">
                  {!addr.isPrimary && (
                    <button
                      onClick={() => setPrimaryAddress(addr.id, token!)}
                      className="flex-1 lg:flex-none rounded-lg border-2 border-black bg-white px-3 py-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all active:scale-95"
                    >
                      Set_Main
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(addr)}
                    className="flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-lg bg-white border-2 border-zinc-200 text-zinc-400 hover:border-black hover:text-black transition-all"
                  >
                    <Edit3 size={14} className="md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={() => { if(confirm('Delete Hub Archive?')) deleteAddress(addr.id, token!) }}
                    className="flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-lg bg-red-50 text-red-400 border-2 border-transparent hover:border-red-500 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} className="md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddressFormModal />
    </div>
  );
}

// ... Sisanya (SkeletonLoader, EmptyState, AuthWarning) disesuaikan tipografinya
function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="h-32 w-full animate-pulse rounded-[1.5rem] bg-zinc-100/50 border-2 border-zinc-100" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[1.5rem] border-4 border-dashed border-zinc-100 py-16 text-center">
      <Globe size={32} className="mx-auto mb-4 text-zinc-200" />
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 italic">No_Logistic_Coordinate_Found</p>
    </div>
  );
}

function AuthWarning() {
  return (
    <div className="rounded-[1.5rem] border-2 border-black p-8 text-center bg-zinc-50">
      <ShieldCheck size={28} className="mx-auto mb-3 text-black" />
      <p className="text-[9px] font-black uppercase tracking-widest text-black italic">Unauthorized: ID_Verification_Required</p>
    </div>
  );
}