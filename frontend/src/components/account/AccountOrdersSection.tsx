"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth"
import { useOrdersStore, type OrderSummary } from "@/store/order"
import { Package, ArrowUpRight } from "lucide-react"

function formatTanggal(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase()
}

const orderStatusLabel: Record<string, { label: string; className: string }> = {
  AWAITING_PAYMENT: {
    label: "WAITING_PAYMENT",
    className: "bg-white text-orange-600 border-orange-600",
  },
  PROCESSING: {
    label: "PROCESSING",
    className: "bg-amber-500 text-white border-amber-500",
  },
  PACKED: {
    label: "PACKED",
    className: "bg-zinc-900 text-white border-zinc-900",
  },
  SHIPPED: {
    label: "SHIPPING",
    className: "bg-blue-600 text-white border-blue-600",
  },
  DELIVERED: {
    label: "DELIVERED",
    className: "bg-emerald-600 text-white border-emerald-600",
  },
  CANCELLED: {
    label: "CANCELLED",
    className: "bg-red-600 text-white border-red-600",
  },
}

const paymentStatusLabel: Record<string, { label: string; className: string }> = {
  PAID: { label: "PAID", className: "text-emerald-600 border-emerald-600" },
  PENDING: { label: "PENDING", className: "text-orange-600 border-orange-600" },
  FAILED: { label: "FAILED", className: "text-red-600 border-red-600" },
  EXPIRED: { label: "EXPIRED", className: "text-zinc-400 border-zinc-200" },
}

function OrderCard({ order }: { order: OrderSummary }) {
  const firstItem = order.items[0]
  const status = orderStatusLabel[order.orderStatus] || { label: order.orderStatus, className: "border-zinc-900" }
  const payment = paymentStatusLabel[order.paymentStatus] || { label: order.paymentStatus, className: "text-zinc-500" }
  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <div className="border-2 border-zinc-900 bg-white transition-all hover:bg-zinc-200 hover:shadow-lg shadow-black/90 mb-4 sm:mb-6">
      
      {/* HEADER: Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 border-b-2 border-zinc-900">
        {/* Kiri: Info Order */}
        <div className="p-3 sm:p-4 border-b-2 xs:border-b-0 xs:border-r-2 border-zinc-900 bg-zinc-50/50">
          <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Order_Ref</p>
          <p className="text-xs sm:text-sm font-mono font-black uppercase truncate">#{order.orderNumber.replace("#", "")}</p>
          <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 mt-1">{formatTanggal(order.createdAt)}</p>
        </div>
        
        {/* Kanan: Status Section */}
        <div className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="space-y-1 flex-1">
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none mb-1">Order Status</p>
            <span className={`inline-block border-[1.5px] sm:border-2 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[12px] font-black italic leading-none truncate max-w-full ${status.className}`}>
              {status.label}
            </span>
          </div>
          <div className="space-y-1 flex-1 border-l-[1.5px] sm:border-l-2 border-zinc-200 pl-2 sm:pl-4">
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none mb-1">Payment</p>
            <span className={`inline-block border-[1.5px] sm:border-2 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[12px] font-black italic leading-none truncate ${payment.className}`}>
              {payment.label}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT: Produk & Pricing */}
      <div className="p-3 sm:p-5 md:p-6 flex flex-col md:flex-row gap-4 sm:gap-6">
        <div className="flex flex-1 gap-3 sm:gap-5">
          {/* IMAGE: Responsive Scaling */}
          <div className="relative h-20 w-16 sm:h-28 sm:w-24 flex-shrink-0 border-2 border-zinc-900 bg-zinc-100 overflow-hidden">
            {firstItem?.imageUrl ? (
              <img 
                src={firstItem.imageUrl} 
                alt={firstItem.productName} 
                className="h-full w-full object-cover transition-transform hover:scale-110 duration-500" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[8px] sm:text-[9px] font-black text-zinc-400 italic uppercase">No_Asset</div>
            )}
            <div className="absolute top-0 right-0 bg-zinc-900 text-white px-1.5 py-0.5 text-[8px] sm:text-[10px] font-black">
              {totalItems}X
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <h4 className="text-xs sm:text-base font-black uppercase italic leading-tight mb-2 truncate tracking-tighter">
              {firstItem?.productName ?? "ARCHIVE_COLLECTION"}
            </h4>
            
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-1 max-w-xs text-[8px] sm:text-[10px]">
              <div className="space-y-0.5">
                <p className="font-black text-zinc-400 uppercase leading-none">Size_Spec</p>
                <p className="font-bold uppercase truncate">{firstItem?.size ?? "OS"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-black text-zinc-400 uppercase leading-none">Quantity</p>
                <p className="font-bold uppercase truncate">{totalItems} Item</p>
              </div>
            </div>

            {order.shippingTrackingNumber && (
              <div className="mt-2 sm:mt-4 inline-flex items-center gap-1.5 border-[1.5px] sm:border-2 border-zinc-900 px-2 py-0.5 sm:px-3 sm:py-1 bg-zinc-50 w-fit max-w-full">
                <span className="text-[7px] sm:text-xs font-black  uppercase">RESI :</span>
                <span className="text-[8px] sm:text-xs font-mono font-bold text-zinc-900 uppercase tracking-tighter sm:tracking-widest truncate">{order.shippingTrackingNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* PRICE & ACTION: Split logic for Mobile vs Desktop */}
        <div className="flex items-center justify-between md:flex-col md:justify-center md:items-end gap-3 sm:gap-5 border-t-[1.5px] sm:border-t-2 border-zinc-100 md:border-t-0 pt-3 sm:pt-5 md:pt-0">
          <div className="text-left md:text-right">
            <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 leading-none">Grand_Total</p>
            <p className="text-sm sm:text-xl font-black tracking-tighter text-zinc-900 italic leading-none">
              IDR {order.totalAmount.toLocaleString("id-ID")}
            </p>
          </div>
          
          <Link
            href={`/account/orders/${order.orderNumber.replace("#", "")}`}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2 sm:px-6 sm:py-3 text-[9px] sm:text-[11px] font-black uppercase italic tracking-tighter sm:tracking-widest hover:bg-white hover:text-zinc-900 border-2 border-zinc-900 transition-all shrink-0"
          >
            DETAILS
            <ArrowUpRight size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function AccountOrdersSection() {
  const { user, token, isAuthenticated, _hasHydrated, clearAuth } = useAuthStore()
  const { orders, loading, error, fetchOrders } = useOrdersStore()

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !token) return
    void fetchOrders(token)
  }, [_hasHydrated, isAuthenticated, token, fetchOrders])

  useEffect(() => {
    if (error?.toLowerCase().includes("expired")) clearAuth()
  }, [error, clearAuth])

  if (!_hasHydrated) return <div className="p-6 sm:p-10 font-black italic uppercase text-zinc-400 text-center tracking-widest animate-pulse text-xs sm:text-sm">Scanning_Archive...</div>

  return (
    <section className="space-y-6 sm:space-y-10 px-0">
      <div className="flex flex-col gap-2 sm:gap-3 ">
        <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none">Order_History</h2>
        <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] whitespace-nowrap">Operational_Ledger</span>
            <div className="h-px flex-1 bg-zinc-200"></div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 sm:space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 sm:h-40 bg-zinc-50 border-2 border-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-24 border-2 sm:border-4 border-dashed border-zinc-200 bg-zinc-50/30">
          <Package className="mb-4 sm:mb-6 h-10 w-10 sm:h-16 sm:w-16 text-zinc-300 stroke-[1.5]" />
          <h3 className="text-sm sm:text-lg font-black uppercase italic tracking-widest text-zinc-400">Database_Empty</h3>
          <p className="text-[8px] sm:text-[10px] font-bold text-zinc-400 uppercase mt-2">No records detected.</p>
          <Link href="/catalog" className="mt-6 sm:mt-8 border-2 border-zinc-900 px-8 py-2.5 sm:px-12 sm:py-3 text-[9px] sm:text-[11px] font-black uppercase italic tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            Go_Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {orders.map((order) => (
            <OrderCard key={order.orderNumber} order={order} />
          ))}
        </div>
      )}
    </section>
  )
}
// "use client"

// import { useEffect } from "react"
// import Link from "next/link"
// import { useAuthStore } from "@/store/auth"
// import { useOrdersStore, type OrderSummary } from "@/store/order"
// import { Package, ArrowUpRight, AlertCircle, CreditCard } from "lucide-react"

// function formatTanggal(dateStr: string) {
//   const d = new Date(dateStr)
//   return d.toLocaleDateString("id-ID", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   }).toUpperCase()
// }

// const orderStatusLabel: Record<string, { label: string; className: string }> = {
//   AWAITING_PAYMENT: {
//     label: "WAITING_PAYMENT",
//     className: "bg-white text-orange-600 border-orange-600",
//   },
//   PROCESSING: {
//     label: "PROCESSING",
//     className: "bg-amber-500 text-white border-amber-500",
//   },
//   PACKED: {
//     label: "PACKED",
//     className: "bg-zinc-900 text-white border-zinc-900",
//   },
//   SHIPPED: {
//     label: "SHIPPING",
//     className: "bg-blue-600 text-white border-blue-600",
//   },
//   DELIVERED: {
//     label: "DELIVERED",
//     className: "bg-emerald-600 text-white border-emerald-600",
//   },
//   CANCELLED: {
//     label: "CANCELLED",
//     className: "bg-red-600 text-white border-red-600",
//   },
// }

// const paymentStatusLabel: Record<string, { label: string; className: string }> = {
//   PAID: { label: "PAID", className: "text-emerald-600 border-emerald-600" },
//   PENDING: { label: "PENDING", className: "text-orange-600 border-orange-600" },
//   FAILED: { label: "FAILED", className: "text-red-600 border-red-600" },
//   EXPIRED: { label: "EXPIRED", className: "text-zinc-400 border-zinc-200" },
//   CANCELLED_BY_USER: { label: "CANCELLED", className: "text-zinc-400 border-zinc-200" },
// }

// function OrderCard({ order }: { order: OrderSummary }) {
//   const firstItem = order.items[0]
//   const status = orderStatusLabel[order.orderStatus] || { label: order.orderStatus, className: "border-zinc-900" }
//   const payment = paymentStatusLabel[order.paymentStatus] || { label: order.paymentStatus, className: "text-zinc-500" }
//   const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)

//   // ✅ Deteksi order PENDING (butuh payment)
//   const needsPayment = order.paymentStatus === "PENDING" && order.orderStatus === "AWAITING_PAYMENT"

//   return (
//     <div className={`border-2 border-zinc-900 bg-white transition-all hover:shadow-lg shadow-black/90 mb-4 sm:mb-6 ${needsPayment ? 'ring-2 ring-orange-500 ring-offset-2' : 'hover:bg-zinc-200'}`}>
      
//       {/* ✅ PAYMENT ALERT BANNER */}
//       {needsPayment && (
//         <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border-b-2 border-zinc-900">
//           <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 animate-pulse" strokeWidth={2.5} />
//           <div className="flex-1 min-w-0">
//             <p className="text-[10px] sm:text-xs font-black uppercase tracking-wide leading-tight">
//               ⚠️ Pembayaran Belum Selesai
//             </p>
//             <p className="text-[8px] sm:text-[10px] font-medium mt-0.5 opacity-90">
//               Selesaikan pembayaran untuk melanjutkan pesanan
//             </p>
//           </div>
//         </div>
//       )}

//       {/* HEADER: Responsive Grid */}
//       <div className="grid grid-cols-1 xs:grid-cols-2 border-b-2 border-zinc-900">
//         {/* Kiri: Info Order */}
//         <div className="p-3 sm:p-4 border-b-2 xs:border-b-0 xs:border-r-2 border-zinc-900 bg-zinc-50/50">
//           <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Order_Ref</p>
//           <p className="text-xs sm:text-sm font-mono font-black uppercase truncate">#{order.orderNumber.replace("#", "")}</p>
//           <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 mt-1">{formatTanggal(order.createdAt)}</p>
//         </div>
        
//         {/* Kanan: Status Section */}
//         <div className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
//           <div className="space-y-1 flex-1">
//             <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none mb-1">Order Status</p>
//             <span className={`inline-block border-[1.5px] sm:border-2 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[12px] font-black italic leading-none truncate max-w-full ${status.className}`}>
//               {status.label}
//             </span>
//           </div>
//           <div className="space-y-1 flex-1 border-l-[1.5px] sm:border-l-2 border-zinc-200 pl-2 sm:pl-4">
//             <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none mb-1">Payment</p>
//             <span className={`inline-block border-[1.5px] sm:border-2 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[12px] font-black italic leading-none truncate ${payment.className}`}>
//               {payment.label}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* CONTENT: Produk & Pricing */}
//       <div className="p-3 sm:p-5 md:p-6 flex flex-col md:flex-row gap-4 sm:gap-6">
//         <div className="flex flex-1 gap-3 sm:gap-5">
//           {/* IMAGE: Responsive Scaling */}
//           <div className="relative h-20 w-16 sm:h-28 sm:w-24 flex-shrink-0 border-2 border-zinc-900 bg-zinc-100 overflow-hidden">
//             {firstItem?.imageUrl ? (
//               <img 
//                 src={firstItem.imageUrl} 
//                 alt={firstItem.productName} 
//                 className="h-full w-full object-cover transition-transform hover:scale-110 duration-500" 
//               />
//             ) : (
//               <div className="flex h-full w-full items-center justify-center text-[8px] sm:text-[9px] font-black text-zinc-400 italic uppercase">No_Asset</div>
//             )}
//             <div className="absolute top-0 right-0 bg-zinc-900 text-white px-1.5 py-0.5 text-[8px] sm:text-[10px] font-black">
//               {totalItems}X
//             </div>
//           </div>

//           <div className="flex flex-col justify-center min-w-0">
//             <h4 className="text-xs sm:text-base font-black uppercase italic leading-tight mb-2 truncate tracking-tighter">
//               {firstItem?.productName ?? "ARCHIVE_COLLECTION"}
//             </h4>
            
//             <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-1 max-w-xs text-[8px] sm:text-[10px]">
//               <div className="space-y-0.5">
//                 <p className="font-black text-zinc-400 uppercase leading-none">Size_Spec</p>
//                 <p className="font-bold uppercase truncate">{firstItem?.size ?? "OS"}</p>
//               </div>
//               <div className="space-y-0.5">
//                 <p className="font-black text-zinc-400 uppercase leading-none">Quantity</p>
//                 <p className="font-bold uppercase truncate">{totalItems} Item</p>
//               </div>
//             </div>

//             {order.shippingTrackingNumber && (
//               <div className="mt-2 sm:mt-4 inline-flex items-center gap-1.5 border-[1.5px] sm:border-2 border-zinc-900 px-2 py-0.5 sm:px-3 sm:py-1 bg-zinc-50 w-fit max-w-full">
//                 <span className="text-[7px] sm:text-xs font-black  uppercase">RESI :</span>
//                 <span className="text-[8px] sm:text-xs font-mono font-bold text-zinc-900 uppercase tracking-tighter sm:tracking-widest truncate">{order.shippingTrackingNumber}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* PRICE & ACTION: Enhanced dengan conditional CTA */}
//         <div className="flex items-center justify-between md:flex-col md:justify-center md:items-end gap-3 sm:gap-5 border-t-[1.5px] sm:border-t-2 border-zinc-100 md:border-t-0 pt-3 sm:pt-5 md:pt-0">
//           <div className="text-left md:text-right">
//             <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 leading-none">Grand_Total</p>
//             <p className="text-sm sm:text-xl font-black tracking-tighter text-zinc-900 italic leading-none">
//               IDR {order.totalAmount.toLocaleString("id-ID")}
//             </p>
//           </div>
          
//           {/* ✅ CONDITIONAL CTA */}
//           {needsPayment ? (
//             <Link
//               href={`/account/orders/${order.orderNumber.replace("#", "")}`}
//               className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 sm:px-6 sm:py-3 text-[9px] sm:text-[11px] font-black uppercase italic tracking-tighter sm:tracking-widest hover:from-orange-600 hover:to-amber-600 border-2 border-orange-600 transition-all shrink-0 shadow-md hover:shadow-lg animate-pulse"
//             >
//               <CreditCard size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
//               PAY NOW
//             </Link>
//           ) : (
//             <Link
//               href={`/account/orders/${order.orderNumber.replace("#", "")}`}
//               className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2 sm:px-6 sm:py-3 text-[9px] sm:text-[11px] font-black uppercase italic tracking-tighter sm:tracking-widest hover:bg-white hover:text-zinc-900 border-2 border-zinc-900 transition-all shrink-0"
//             >
//               DETAILS
//               <ArrowUpRight size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
//             </Link>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export function AccountOrdersSection() {
//   const { user, token, isAuthenticated, _hasHydrated, clearAuth } = useAuthStore()
//   const { orders, loading, error, fetchOrders } = useOrdersStore()

//   useEffect(() => {
//     if (!_hasHydrated || !isAuthenticated || !token) return
//     void fetchOrders(token)
//   }, [_hasHydrated, isAuthenticated, token, fetchOrders])

//   useEffect(() => {
//     if (error?.toLowerCase().includes("expired")) clearAuth()
//   }, [error, clearAuth])

//   if (!_hasHydrated) return <div className="p-6 sm:p-10 font-black italic uppercase text-zinc-400 text-center tracking-widest animate-pulse text-xs sm:text-sm">Scanning_Archive...</div>

//   // ✅ Pisahkan pending orders untuk ditampilkan di atas
//   const pendingOrders = orders.filter(o => o.paymentStatus === "PENDING" && o.orderStatus === "AWAITING_PAYMENT")
//   const otherOrders = orders.filter(o => !(o.paymentStatus === "PENDING" && o.orderStatus === "AWAITING_PAYMENT"))

//   return (
//     <section className="space-y-6 sm:space-y-10 px-0">
//       <div className="flex flex-col gap-2 sm:gap-3 ">
//         <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none">Order_History</h2>
//         <div className="flex items-center gap-2 sm:gap-4">
//             <span className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] whitespace-nowrap">Operational_Ledger</span>
//             <div className="h-px flex-1 bg-zinc-200"></div>
//         </div>
//       </div>

//       {loading ? (
//         <div className="space-y-4 sm:space-y-6">
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="h-28 sm:h-40 bg-zinc-50 border-2 border-zinc-100 animate-pulse" />
//           ))}
//         </div>
//       ) : orders.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-12 sm:py-24 border-2 sm:border-4 border-dashed border-zinc-200 bg-zinc-50/30">
//           <Package className="mb-4 sm:mb-6 h-10 w-10 sm:h-16 sm:w-16 text-zinc-300 stroke-[1.5]" />
//           <h3 className="text-sm sm:text-lg font-black uppercase italic tracking-widest text-zinc-400">Database_Empty</h3>
//           <p className="text-[8px] sm:text-[10px] font-bold text-zinc-400 uppercase mt-2">No records detected.</p>
//           <Link href="/catalog" className="mt-6 sm:mt-8 border-2 border-zinc-900 px-8 py-2.5 sm:px-12 sm:py-3 text-[9px] sm:text-[11px] font-black uppercase italic tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
//             Go_Shopping
//           </Link>
//         </div>
//       ) : (
//         <div className="flex flex-col">
//           {/* ✅ PENDING ORDERS PRIORITIZED */}
//           {pendingOrders.length > 0 && (
//             <div className="mb-6 sm:mb-8">
//               <div className="flex items-center gap-3 mb-4">
//                 <AlertCircle className="h-5 w-5 text-orange-500" strokeWidth={2.5} />
//                 <h3 className="text-sm sm:text-base font-black uppercase italic tracking-wider text-orange-600">
//                   Pending Payment ({pendingOrders.length})
//                 </h3>
//               </div>
//               {pendingOrders.map((order) => (
//                 <OrderCard key={order.orderNumber} order={order} />
//               ))}
//             </div>
//           )}

//           {/* OTHER ORDERS */}
//           {otherOrders.length > 0 && (
//             <>
//               {pendingOrders.length > 0 && (
//                 <div className="flex items-center gap-3 mb-4">
//                   <h3 className="text-sm sm:text-base font-black uppercase italic tracking-wider text-zinc-600">
//                     All Orders
//                   </h3>
//                   <div className="h-px flex-1 bg-zinc-200"></div>
//                 </div>
//               )}
//               {otherOrders.map((order) => (
//                 <OrderCard key={order.orderNumber} order={order} />
//               ))}
//             </>
//           )}
//         </div>
//       )}
//     </section>
//   )
// }