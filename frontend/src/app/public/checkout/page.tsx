"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Address } from "@/store/address";
import {
  ChevronRight,
  Truck,
  MapPin,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Info,
} from "lucide-react";

type CheckoutItem = {
  productId: number;
  productName: string;
  productSlug: string;
  variantId: number | null;
  size: string | null;
  quantity: number;
  price: number;
  imageUrl?: string | null;
};

type ShippingServiceOption = {
  name: string;
  code: string;
  service: string;
  description?: string;
  cost: number;
  etd?: string;
};

type CheckoutSummary = {
  address: Address;
  items: CheckoutItem[];
  totals: { subtotal: number; totalWeightGrams: number };
  shippingEstimate: ShippingServiceOption[] | null;
};

type CheckoutSummaryResponse = ApiResponse<CheckoutSummary>;
type OrderResponse = ApiResponse<{ id: number; orderNumber: string; totalAmount: number }>;

const COURIER_OPTIONS = [
  { code: "jne", label: "JNE" },
  { code: "tiki", label: "TIKI" },
  { code: "pos", label: "POS Indonesia" },
];

// ✅ helper: detect missing address error from backend message
function isMissingAddressMessage(msg: string) {
  const m = msg.toLowerCase();
  return (
    m.includes("alamat") &&
    (m.includes("utama") || m.includes("pengiriman") || m.includes("tambahkan"))
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated, clearAuth } = useAuthStore();

  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [selectedCourier, setSelectedCourier] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; totalAmount: number } | null>(null);

  // ✅ derived: do we need address gate?
  const needsAddressGate = useMemo(() => {
    if (!summary && summaryError) return isMissingAddressMessage(summaryError);
    return false;
  }, [summary, summaryError]);

  const shippingServices: ShippingServiceOption[] = summary?.shippingEstimate ?? [];
  const currentService = useMemo(
    () => shippingServices.find((s) => s.service === selectedService) ?? null,
    [shippingServices, selectedService]
  );

  const subtotal = summary?.totals.subtotal ?? 0;
  const shippingCost = currentService?.cost ?? 0;
  const totalAmount = subtotal + shippingCost;

  const fetchSummary = async (courier?: string) => {
    if (!token) return;

    try {
      setLoadingSummary(true);
      setSummaryError(null);
      setSummary(null);

      let path = "/checkout/summary";
      if (courier) {
        const qp = new URLSearchParams({ courier });
        path = `/checkout/summary?${qp.toString()}`;
      }

      const res = await api.get<CheckoutSummaryResponse>(path, token);
      setSummary(res.data);
    } catch (err: any) {
      const msg = err?.message || "Gagal memuat ringkasan checkout.";
      if (String(msg).toLowerCase().includes("expired")) {
        clearAuth();
        setSummaryError("Sesi login kamu sudah berakhir.");
      } else {
        setSummaryError(msg);
      }
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !token) return;
    void fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, isAuthenticated, token]);

  const handleChangeCourier = (code: string) => {
    setSelectedCourier(code);
    setSelectedService("");
    void fetchSummary(code);
  };

  const gotoShippingAddress = () => {
    // ✅ user langsung masuk tab shipping
    // (next bisa kamu pakai nanti kalau mau auto balik ke checkout)
    router.push("/account/profile?tab=shipping&next=/checkout");
  };

  const handleCreateOrderAndPay = async () => {
    if (!token) return;
    if (!selectedCourier || !selectedService) return;

    try {
      setCreatingOrder(true);
      setCreateError(null);

      // 1) create order
      const orderRes = await api.post<OrderResponse>(
        "/checkout/create-order",
        { courier: selectedCourier, courierService: selectedService },
        token
      );

      const orderNumber = orderRes.data.orderNumber;
      setOrderSuccess({ orderNumber, totalAmount: orderRes.data.totalAmount });

      // 2) get redirect_url
      const payRes = await api.post<ApiResponse<{ orderNumber: string; redirectUrl: string }>>(
        "/payments/midtrans/redirect-url",
        { orderNumber },
        token
      );

      // 3) redirect
      window.location.href = payRes.data.redirectUrl;
    } catch (err: any) {
      setCreateError(err?.message || "Gagal memproses pembayaran.");
    } finally {
      setCreatingOrder(false);
    }
  };

  if (!_hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center text-[10px] tracking-[0.3em] uppercase text-zinc-400">
        Authenticating Collection...
      </main>
    );
  }

  // (Optional) jika user tidak login, redirect / tampilkan pesan
  if (!isAuthenticated || !token) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm font-semibold">Kamu perlu login untuk checkout.</p>
          <p className="mt-1 text-xs text-zinc-500">Silakan login dulu, lalu kembali ke halaman checkout.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:py-12">
      {/* HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-4">Checkout Review</h1>
        <div className="flex items-center gap-3 text-[10px] cursor-default tracking-[0.2em] text-zinc-400 uppercase font-bold">
          <span>Cart</span> <ChevronRight size={12} />{" "}
          <span className="text-black underline underline-offset-4">Shipping</span>{" "}
          <ChevronRight size={12} /> <span>Payment</span>
        </div>
      </div>

      {/* ✅ Global loading */}
      {loadingSummary && (
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 text-xs text-zinc-500">
          Memuat ringkasan checkout...
        </div>
      )}

      {/* ✅ Address Gate UI (no blank page) */}
      {needsAddressGate && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-amber-600" size={18} />
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-wide text-amber-800">
                Alamat pengiriman diperlukan
              </p>
              <p className="mt-2 text-xs text-amber-800/80 leading-relaxed">
                Kamu belum memiliki <b>alamat utama</b>. Tambahkan alamat pengiriman lalu jadikan sebagai{" "}
                <b>Primary</b> supaya checkout bisa dilanjutkan.
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={gotoShippingAddress}
                  className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-white hover:bg-zinc-800"
                >
                  Tambah alamat sekarang
                  <ChevronRight size={14} className="ml-2" />
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Other errors (non-address) */}
      {!needsAddressGate && summaryError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-rose-600" size={18} />
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-wide text-rose-700">
                Gagal memuat checkout
              </p>
              <p className="mt-2 text-xs text-rose-700/80 leading-relaxed">{summaryError}</p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => fetchSummary(selectedCourier || undefined)}
                  className="rounded-full bg-black px-5 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-white hover:bg-zinc-800"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Normal checkout UI */}
      {summary && (
        <div className="grid gap-16 lg:grid-cols-[1fr,380px]">
          <div className="space-y-14">
            {/* ITEM REVIEW */}
            <section>
              <div className="flex items-center gap-2 mb-8 border-t border-zinc-100">
                <ShoppingBag size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest">
                  Shopping Bag ({summary.items.length})
                </h2>
              </div>
              <div className="grid gap-8">
                {summary.items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-6 items-center">
                    <div className="h-20 w-16 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black uppercase tracking-tight">{item.productName}</h4>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
                        Size: {item.size || "Universal"} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-black italic tracking-tighter">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ADDRESS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <h2 className="text-sm font-black uppercase tracking-widest">Alamat Pengiriman</h2>
                </div>
                <Link
                  href="/account/profile?tab=shipping"
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors border-b border-zinc-200"
                >
                  Ubah Alamat
                </Link>
              </div>

              <div className="bg-zinc-50/50 rounded-2xl p-6 border border-zinc-100 group hover:border-black transition-all duration-500">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Penerima</p>
                    <p className="text-sm font-black uppercase tracking-tight">{summary.address.recipientName}</p>
                    <p className="text-xs text-zinc-600">{summary.address.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Detail Lokasi</p>
                    <p className="text-xs leading-relaxed font-medium text-zinc-800">
                      {summary.address.addressLine}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-tighter font-medium mt-2">
                      {summary.address.subdistrictName || `Kec. ${summary.address.subdistrictId}`},{" "}
                      {summary.address.cityName || `Kota ${summary.address.cityId}`}
                      <br />
                      {summary.address.provinceName || `Prov. ${summary.address.provinceId}`} —{" "}
                      {summary.address.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SHIPPING */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Truck size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest">Metode Pengiriman</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                    Pilih Kurir <span className={selectedCourier ? "text-emerald-500" : "text-rose-500"}>*</span>
                  </label>

                  <div className="relative group">
                    <select
                      className={`w-full appearance-none bg-white border-2 p-4 pr-12 text-xs font-black uppercase tracking-[0.1em] rounded-xl transition-all outline-none cursor-pointer
                        ${selectedCourier ? "border-emerald-500 shadow-sm" : "border-zinc-100 hover:border-zinc-300 focus:border-black"}`}
                      value={selectedCourier}
                      onChange={(e) => handleChangeCourier(e.target.value)}
                    >
                      <option value="">-- Pilih Kurir --</option>
                      {COURIER_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-focus-within:text-black transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-end pb-1">
                  {!selectedCourier && (
                    <div className="flex items-start gap-2 text-zinc-400 italic p-4 bg-zinc-50 rounded-xl w-full border border-dashed border-zinc-200">
                      <Info size={14} className="mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] leading-relaxed">
                        Silakan pilih kurir terlebih dahulu untuk melihat paket layanan yang tersedia.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {shippingServices.length > 0 && (
                <div className="mt-8 space-y-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Layanan Tersedia <span className={selectedService ? "text-emerald-500" : "text-rose-500"}>*</span>
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {shippingServices.map((s) => (
                      <label
                        key={s.service}
                        className={`relative flex cursor-pointer flex-col p-5 border-2 rounded-2xl transition-all duration-300
                          ${selectedService === s.service
                            ? "border-emerald-500 bg-emerald-50/10 shadow-lg shadow-emerald-500/5"
                            : "border-zinc-100 hover:border-zinc-400 bg-white"}`}
                      >
                        <input
                          type="radio"
                          name="shipping-service"
                          value={s.service}
                          checked={selectedService === s.service}
                          onChange={() => setSelectedService(s.service)}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-xs font-black uppercase tracking-tighter ${
                              selectedService === s.service ? "text-emerald-600" : "text-black"
                            }`}
                          >
                            {s.service}
                          </span>
                          <span className="text-xs font-black italic tracking-tighter">
                            Rp {s.cost.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                          {s.etd ? `Estimasi tiba: ${s.etd} Hari` : s.description || "Reguler Service"}
                        </p>
                        {selectedService === s.service && (
                          <CheckCircle2 size={16} className="absolute -top-2 -right-2 text-emerald-500 bg-white rounded-full" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="relative">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-black text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-500 mb-8">
                    Billing Summary
                  </h3>

                  <div className="space-y-5 text-xs">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span className="font-bold uppercase tracking-widest text-[9px]">Merchandise</span>
                      <span className="text-white font-black">Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>

                    <div className="flex justify-between items-center text-zinc-400">
                      <span className="font-bold uppercase tracking-widest text-[9px]">Logistics Fee</span>
                      <span className="text-white font-black">
                        {currentService ? `Rp ${shippingCost.toLocaleString("id-ID")}` : "---"}
                      </span>
                    </div>

                    <div className="pt-8 mt-4 border-t border-zinc-800 space-y-1">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                          Total Payable
                        </span>
                        <span className="text-xl font-black tracking-tighter italic text-emerald-400">
                          Rp {totalAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {createError && (
                    <div className="mt-8 flex items-start gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{createError}</p>
                    </div>
                  )}

                  {orderSuccess && (
                    <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Order Created</span>
                      </div>
                      <p className="text-[10px] text-zinc-400">ID: {orderSuccess.orderNumber}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={creatingOrder || !summary || !selectedCourier || !selectedService}
                    onClick={handleCreateOrderAndPay}
                    className="mt-10 w-full group relative flex items-center justify-center gap-2 bg-white text-black font-bold py-5 rounded-full text-[11px] uppercase tracking-[0.3em] hover:bg-gray-300 transition-all duration-500 disabled:opacity-20"
                  >
                    {creatingOrder ? "Processing..." : "Continue to Payment"}
                    {!creatingOrder && <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                  </button>

                  {/* Small helper */}
                  {!selectedCourier || !selectedService ? (
                    <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                      Pilih kurir & layanan untuk lanjut.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
