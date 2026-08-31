import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as ordersApi from "../api/orders";

const STAGES = ["Placed", "Processing", "Ready for Delivery", "Out for Delivery", "Delivered"];
const STATUS_FILTER_OPTIONS = ["All", ...STAGES, "Cancelled"];

const STATUS_STYLES = {
  placed: "bg-blue-50 text-blue-700",
  processing: "bg-amber-50 text-amber-700",
  "ready-for-delivery": "bg-indigo-50 text-indigo-700",
  "out-for-delivery": "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateHeading(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function dayKey(iso) {
  if (!iso) return "unknown";
  return new Date(iso).toISOString().slice(0, 10);
}

function stageIndex(status) {
  if (!status) return 0;
  const idx = STAGES.findIndex((s) => s.toLowerCase() === String(status).toLowerCase());
  return idx === -1 ? 0 : idx;
}

function isCancelled(status) {
  return String(status || "").toLowerCase() === "cancelled";
}

function statusKey(status) {
  return (status || "placed").toLowerCase().replace(/\s+/g, "-");
}

function StatusBadge({ status }) {
  const key = statusKey(status);
  const style = STATUS_STYLES[key] || "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${style}`}>
      {status || "Placed"}
    </span>
  );
}

function StatusTracker({ status }) {
  if (isCancelled(status)) {
    return (
      <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
        This order was cancelled
      </div>
    );
  }

  const current = stageIndex(status);

  return (
    <div className="mb-5 flex items-start">
      {STAGES.map((stage, idx) => {
        const done = idx <= current;
        const isCurrent = idx === current;
        return (
          <div key={stage} className="relative flex flex-1 flex-col items-center text-center">
            <span
              className={`z-10 mb-1.5 h-3 w-3 rounded-full ${
                done ? "bg-navy" : "bg-stone-300"
              } ${isCurrent ? "ring-4 ring-navy/15" : ""}`}
            />
            <span
              className={`px-1 text-[11px] leading-tight ${
                done ? "font-semibold text-navy" : "text-stone-500"
              }`}
            >
              {stage}
            </span>
            {idx < STAGES.length - 1 && (
              <span
                className={`absolute left-1/2 top-1.5 h-0.5 w-full ${
                  done ? "bg-navy" : "bg-stone-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Track() {
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await ordersApi.getMyOrders();
        setOrders(data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Couldn't load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    return orders.filter((order) => {
      if (term && !order.orderNumber?.toLowerCase().includes(term)) return false;
      if (statusFilter !== "All") {
        const s = String(order.status || "Placed");
        if (s.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      if (order.createdAt) {
        const created = new Date(order.createdAt);
        if (from && created < from) return false;
        if (to && created > to) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  const groupedByDay = useMemo(() => {
    const groups = new Map();
    for (const order of filteredOrders) {
      const key = dayKey(order.createdAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(order);
    }
    return Array.from(groups.entries());
  }, [filteredOrders]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
  }

  const hasActiveFilters = search || statusFilter !== "All" || dateFrom || dateTo;
  const inputClass =
    "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";
  const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-600";

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg bg-parchment p-8 font-serif text-ink shadow-sm">
        <p>Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-parchment p-6 font-serif text-ink shadow-sm sm:p-8">
      <div className="mb-6 flex items-start justify-between border-b border-dashed border-stone-300 pb-5">
        <div>
          <h1 className="text-2xl font-bold">Track your orders</h1>
          <p className="mt-1 text-sm text-stone-600">
            See the status of everything you've ordered.
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
        >
          Sign out
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {!error && (
        <div className="mb-6 flex flex-wrap items-end gap-4 border-b border-dashed border-stone-300 pb-5">
          <div className="min-w-[180px] flex-1">
            <label htmlFor="orderSearch" className={labelClass}>
              Order number
            </label>
            <input
              id="orderSearch"
              placeholder="e.g. ORD-1042"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="min-w-[160px]">
            <label htmlFor="statusFilter" className={labelClass}>
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
            >
              {STATUS_FILTER_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div>
              <label htmlFor="dateFrom" className={labelClass}>
                From
              </label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="dateTo" className={labelClass}>
                To
              </label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="pb-2 text-sm text-amber-800 underline hover:text-amber-900"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {!error && orders.length === 0 && (
        <p className="text-sm text-stone-600">You haven't placed any orders yet.</p>
      )}

      {!error && orders.length > 0 && filteredOrders.length === 0 && (
        <p className="text-sm text-stone-600">No orders match your filters.</p>
      )}

      {groupedByDay.map(([key, dayOrders]) => (
        <div key={key} className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            {key === "unknown" ? "Date unknown" : formatDateHeading(dayOrders[0].createdAt)}
          </h3>

          <div className="space-y-3">
            {dayOrders.map((order) => {
              const isExpanded = expandedId === order._id;
              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-md border border-stone-300 bg-white/60"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(order._id)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-stone-50"
                  >
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <span className="ml-2 text-sm text-stone-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <StatusBadge status={order.status} />
                    <span className="font-semibold">{formatCurrency(order.grandTotal)}</span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-stone-200 px-4 py-4">
                      <StatusTracker status={order.status} />

                      {order.deliveryAssignedToName && (
                        <p className="mb-1 text-sm text-stone-600">
                          Delivery: {order.deliveryAssignedToName}
                        </p>
                      )}
                      {order.preferredDeliveryDate && (
                        <p className="mb-3 text-sm text-stone-600">
                          Preferred delivery: {formatDate(order.preferredDeliveryDate)}
                        </p>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-stone-300 text-left text-xs uppercase tracking-wide text-stone-500">
                              <th className="py-2 pr-2">Item</th>
                              <th className="py-2 pr-2">Qty</th>
                              <th className="py-2 pr-2">MRP</th>
                              <th className="py-2 pr-2">Price</th>
                              <th className="py-2">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.products || []).map((p, idx) => (
                              <tr key={idx} className="border-b border-stone-100 last:border-0">
                                <td className="flex items-center gap-2 py-2 pr-2">
                                  {p.image && (
                                    <img
                                      src={p.image}
                                      alt={p.productName}
                                      className="h-8 w-8 flex-shrink-0 rounded object-cover"
                                    />
                                  )}
                                  <span>{p.productName}</span>
                                </td>
                                <td className="py-2 pr-2 text-stone-600">
                                  {p.packQty ? `${p.packQty} pack` : ""}
                                  {p.packQty && p.looseQty ? " + " : ""}
                                  {p.looseQty ? `${p.looseQty} loose` : ""}
                                  {p.qtyPerPack ? ` (${p.qtyPerPack}/pack)` : ""}
                                </td>
                                <td className="py-2 pr-2 text-stone-600">
                                  {formatCurrency(p.mrp)}
                                </td>
                                <td className="py-2 pr-2 text-stone-600">
                                  {p.packQty ? formatCurrency(p.price) : ""}
                                  {p.packQty && p.looseQty ? " / " : ""}
                                  {p.looseQty ? `${formatCurrency(p.looseUnitPrice)} each` : ""}
                                </td>
                                <td className="py-2 font-medium">{formatCurrency(p.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {Array.isArray(order.backorderItems) && order.backorderItems.length > 0 && (
                        <p className="mt-3 text-sm font-medium text-amber-700">
                          {order.backorderItems.length} item(s) still pending
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="mt-6 text-sm">
        <Link to="/dashboard" className="text-navy underline hover:text-navy/80">
          Back to your details
        </Link>
      </p>
    </div>
  );
}