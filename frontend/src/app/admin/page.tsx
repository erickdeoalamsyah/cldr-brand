"use client";

export default function AdminDashboardPage() {
  // TODO: nanti bisa fetch data nyata dari backend /admin/stats
  const stats = {
    todayOrders: 0,
    monthRevenue: 0,
    totalProducts: 0,
    waitingShipment: 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">
        Dashboard
      </h1>

      {/* cards statistik */}
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
          <p className="text-slate-400">Pesanan Hari Ini</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            {stats.todayOrders}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
          <p className="text-slate-400">Pendapatan Bulan Ini</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            Rp {stats.monthRevenue.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
          <p className="text-slate-400">Total Produk</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            {stats.totalProducts}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
          <p className="text-slate-400">Menunggu Dikirim</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            {stats.waitingShipment}
          </p>
        </div>
      </div>

      {/* section activity recent order dsb bisa ditambah nanti */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-400">
        <p>Belum ada data pesanan. Nanti di sini bisa ditampilkan recent orders.</p>
      </div>
    </div>
  );
}
