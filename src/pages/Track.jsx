import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as ordersApi from "../api/orders";

const STAGES = [
  "Placed",
  "Confirmed",
  "Processing",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
];

const STATUS_FILTER_OPTIONS = ["All", ...STAGES, "Cancelled"];

const STATUS_STYLES = {
  placed: "bg-blue-50 text-blue-700 border-blue-100",
  confirmed: "bg-teal-50 text-teal-700 border-teal-100",
  processing: "bg-amber-50 text-amber-700 border-amber-100",
  "ready-for-delivery": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "out-for-delivery": "bg-purple-50 text-purple-700 border-purple-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
};

// Payment styles. Backend field names assumed (rename to match your API):
//   order.invoiceNumber, order.invoiceDate, order.invoiceAmount (falls back to grandTotal),
//   order.paymentMethod, order.paymentStatus, order.amountPaid
const PAYMENT_STYLES = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
  partial: "bg-amber-50 text-amber-700 border-amber-100",
  pending: "bg-red-50 text-red-700 border-red-100",
};

// The admin/salesperson panel doesn't always write the exact stage label
// (e.g. it saves "Processed" while the tracker's stage is "Processing").
// This maps every status string we might receive from the backend onto
// the canonical stage it belongs to, so the tracker and badge always
// agree with each other.
const STATUS_ALIASES = {
  placed: "Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  processed: "Processing",
  "partially processed": "Processing",
  "ready for delivery": "Ready for Delivery",
  "ready-for-delivery": "Ready for Delivery",
  "out for delivery": "Out for Delivery",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  canceled: "Cancelled",
};

function canonicalStatus(status) {
  const raw = String(status || "Placed").trim().toLowerCase();
  return STATUS_ALIASES[raw] || status || "Placed";
}

function formatDate(iso) {
  if (!iso) return "—";

  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// "Saturday, 26" — built manually so the order is the same in every locale
function formatDayHeading(iso) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("en-IN", { weekday: "long" });
  return `${weekday}, ${d.getDate()}`;
}

// "September 2026"
function formatMonthYear(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function dayKey(iso) {
  if (!iso) return "unknown";

  return new Date(iso).toISOString().slice(0, 10);
}

function stageIndex(status) {
  const canonical = canonicalStatus(status);

  const idx = STAGES.findIndex(
    (stage) => stage.toLowerCase() === canonical.toLowerCase()
  );

  return idx === -1 ? 0 : idx;
}

function isCancelled(status) {
  return canonicalStatus(status).toLowerCase() === "cancelled";
}

function isPlaced(status) {
  return canonicalStatus(status).toLowerCase() === "placed";
}

function shouldShowDeliveryOtp(order) {
  const status = String(order?.status || "").trim().toLowerCase();
  const otp = String(order?.deliveryOtp || "").trim();

  if (!otp) return false;

  return status === "ready for delivery" || status === "out for delivery";
}

function statusKey(status) {
  return canonicalStatus(status).toLowerCase().replace(/\s+/g, "-");
}

// Invoice amount, falling back to the order's grand total
function invoiceAmountOf(order) {
  return order.invoiceAmount != null ? order.invoiceAmount : order.grandTotal;
}

// Balance still due, or null when we don't know how much was paid
function balanceDueOf(order) {
  if (order.amountPaid == null) return null;

  return Math.max(
    Number(invoiceAmountOf(order) || 0) - Number(order.amountPaid || 0),
    0
  );
}

/* ----------------------------------
   HEADER
---------------------------------- */

function SiteHeader({ onLogout }) {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-[#D8E0D9]
        bg-[#F7F5EF]/95
        backdrop-blur
        supports-[backdrop-filter]:bg-[#F7F5EF]/80
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-5xl
          items-center
          justify-between
          gap-4
          px-4
          py-3
          sm:px-6
        "
      >
        <Link to="/track" className="flex items-center gap-2.5">
          <span
            className="
              flex
              h-9
              w-9
              flex-shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-[#D8E0D9]
              bg-white
              p-1.5
              shadow-sm
            "
          >
            <img
              src="/inventory.png"
              alt="Sona Medical"
              className="max-h-full max-w-full object-contain"
            />
          </span>

          <span className="hidden text-sm font-semibold tracking-tight text-[#152420] sm:inline">
            Sona Medical
          </span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="
            inline-flex
            items-center
            justify-center
            rounded-lg
            border
            border-[#D8E0D9]
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            text-[#4C5C55]
            transition
            hover:border-[#1F4438]
            hover:text-[#1F4438]
          "
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

/* ----------------------------------
   FOOTER
---------------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-[#D8E0D9] bg-[#F7F5EF]">
      <div
        className="
          mx-auto
          flex
          max-w-5xl
          flex-col
          gap-3
          px-4
          py-6
          text-xs
          text-[#89968F]
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <p>
          &copy; {new Date().getFullYear()} Sona Medical. All rights reserved.
        </p>

        <p>
          Need help with an order?{" "}
          <a
            href="mailto:medicare@sonaind.in"
            className="font-medium text-[#1F4438] hover:text-[#122E26]"
          >
            medicare@sonaind.in
          </a>
        </p>
      </div>
    </footer>
  );
}

/* ----------------------------------
   STATUS BADGE
---------------------------------- */

function StatusBadge({ status }) {
  const key = statusKey(status);

  const style = STATUS_STYLES[key] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span
      className={`
        inline-flex
        items-center
        whitespace-nowrap
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${style}
      `}
    >
      {canonicalStatus(status)}
    </span>
  );
}

/* ----------------------------------
   PAYMENT BADGE
---------------------------------- */

function PaymentBadge({ status }) {
  const label = status || "Pending";

  const style =
    PAYMENT_STYLES[String(label).toLowerCase()] ||
    "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

/* ----------------------------------
   STATUS TRACKER
---------------------------------- */

function StatusTracker({ status }) {
  if (isCancelled(status)) {
    return (
      <div
        className="
          mb-5
          flex
          items-center
          gap-2
          rounded-lg
          border
          border-red-100
          bg-red-50
          px-4
          py-3
          text-sm
          font-medium
          text-red-700
        "
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs">
          ×
        </span>

        This order was cancelled
      </div>
    );
  }

  const current = stageIndex(status);

  return (
    <div className="mb-7 overflow-x-auto pb-1">
      <div className="flex min-w-[600px] items-start">
        {STAGES.map((stage, idx) => {
          const done = idx <= current;
          const isCurrent = idx === current;

          return (
            <div
              key={stage}
              className="relative flex flex-1 flex-col items-center text-center"
            >
              {/* connecting line */}
              {idx < STAGES.length - 1 && (
                <span
                  className={`
                    absolute
                    left-1/2
                    top-[7px]
                    h-[2px]
                    w-full
                    ${idx < current ? "bg-[#1F4438]" : "bg-[#D8E0D9]"}
                  `}
                />
              )}

              {/* circle */}
              <span
                className={`
                  relative
                  z-10
                  mb-2
                  h-3.5
                  w-3.5
                  rounded-full
                  border-2
                  ${
                    done
                      ? "border-[#1F4438] bg-[#1F4438]"
                      : "border-[#C9D2CD] bg-[#F7F5EF]"
                  }
                  ${isCurrent ? "ring-4 ring-[#1F4438]/10" : ""}
                `}
              />

              <span
                className={`
                  px-2
                  text-[11px]
                  leading-tight
                  ${done ? "font-semibold text-[#1F4438]" : "text-[#89968F]"}
                `}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------
   MAIN PAGE
---------------------------------- */

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

  // Confirm-order UI state
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmErrors, setConfirmErrors] = useState({});

  // Product image preview modal: { src, name } or null
  const [previewImage, setPreviewImage] = useState(null);

  /* ----------------------------------
     LOAD ORDERS
  ---------------------------------- */

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await ordersApi.getMyOrders();

        setOrders(data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Couldn't load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  // Close the image modal with Escape and lock page scroll while it's open
  useEffect(() => {
    if (!previewImage) return;

    function onKeyDown(e) {
      if (e.key === "Escape") setPreviewImage(null);
    }

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [previewImage]);

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  /* ----------------------------------
     CONFIRM ORDER
  ---------------------------------- */

  async function handleConfirm(orderId) {
    setConfirmingId(orderId);
    setConfirmErrors((prev) => ({ ...prev, [orderId]: "" }));

    try {
      const { order: updatedOrder } = await ordersApi.confirmOrder(orderId);

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...updatedOrder } : o))
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Couldn't confirm this order. Please try again.";

      setConfirmErrors((prev) => ({ ...prev, [orderId]: message }));
    } finally {
      setConfirmingId(null);
    }
  }

  /* ----------------------------------
     FILTER
  ---------------------------------- */

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    const from = dateFrom ? new Date(dateFrom) : null;

    const to = dateTo ? new Date(dateTo) : null;

    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    return orders.filter((order) => {
      if (term) {
        const orderNo = String(order.orderNumber || "").toLowerCase();
        const invoiceNo = String(order.invoiceNumber || "").toLowerCase();

        if (!orderNo.includes(term) && !invoiceNo.includes(term)) {
          return false;
        }
      }

      if (statusFilter !== "All") {
        const currentStatus = canonicalStatus(order.status);

        if (currentStatus.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      if (order.createdAt) {
        const created = new Date(order.createdAt);

        if (from && created < from) {
          return false;
        }

        if (to && created > to) {
          return false;
        }
      }

      return true;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  /* ----------------------------------
     GROUP ORDERS BY DATE
  ---------------------------------- */

  const groupedByDay = useMemo(() => {
    const groups = new Map();

    for (const order of filteredOrders) {
      const key = dayKey(order.createdAt);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

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

  const inputClass = `
    w-full
    rounded-lg
    border
    border-[#D8E0D9]
    bg-white
    px-3
    py-2.5
    text-sm
    text-[#152420]
    outline-none
    transition
    placeholder:text-[#9AA9A2]
    focus:border-[#1F4438]
    focus:ring-2
    focus:ring-[#1F4438]/10
  `;

  const labelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7B73]";

  const miniLabelClass =
    "mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#89968F]";

  /* ----------------------------------
     LOADING
  ---------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F5EF]">
        <SiteHeader onLogout={logout} />

        <div className="flex flex-1 items-center justify-center px-5">
          <div className="flex items-center gap-3 text-sm text-[#4C5C55]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1F4438]/20 border-t-[#1F4438]" />

            Loading your orders…
          </div>
        </div>

        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F5EF]">
      <SiteHeader onLogout={logout} />

      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          {/* HEADER */}

          <div
            className="
              mb-6
              flex
              flex-col
              gap-4
              border-b
              border-[#D8E0D9]
              pb-6
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8FAE9E]">
                My Orders
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-[#152420] sm:text-3xl">
                Track your orders
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#6B7B73]">
                See the latest status and delivery progress of everything
                you've ordered.
              </p>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="
                mb-6
                border-l-[3px]
                border-[#B5502E]
                bg-[#F3E3DC]
                px-4
                py-3
                text-sm
                text-[#B5502E]
              "
            >
              {error}
            </div>
          )}

          {/* FILTERS */}

          {!error && (
            <div
              className="
                mb-7
                rounded-xl
                border
                border-[#D8E0D9]
                bg-white/70
                p-4
                shadow-sm
                sm:p-5
              "
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >
                {/* SEARCH */}

                <div>
                  <label htmlFor="orderSearch" className={labelClass}>
                    Order / invoice number
                  </label>

                  <input
                    id="orderSearch"
                    type="text"
                    placeholder="e.g. ORD-1042"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label htmlFor="statusFilter" className={labelClass}>
                    Status
                  </label>

                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={inputClass}
                  >
                    {STATUS_FILTER_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* FROM DATE */}

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

                {/* TO DATE */}

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
                <div className="mt-4 border-t border-[#E5EAE7] pt-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-[#B5502E] transition hover:text-[#8D3B23]"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NO ORDERS */}

          {!error && orders.length === 0 && (
            <EmptyState
              title="No orders yet"
              description="You haven't placed any orders yet."
            />
          )}

          {/* NO FILTER RESULTS */}

          {!error && orders.length > 0 && filteredOrders.length === 0 && (
            <EmptyState
              title="No matching orders"
              description="Try changing or clearing your filters."
            />
          )}

          {/* ORDER GROUPS */}

          <div className="space-y-8">
            {groupedByDay.map(([key, dayOrders]) => (
              <section key={key}>
                {/* DATE HEADING: order numbers | day | month & year */}
                <div className="mb-3 grid grid-cols-3 items-center gap-3 border-b border-[#D8E0D9] pb-2">
                  {/* LEFT: Order No. */}
                  <p className="truncate text-left text-xs font-semibold uppercase tracking-[0.1em] text-[#8FAE9E]">
                    {dayOrders.map((o) => o.orderNumber).join(", ")}
                  </p>

                  {/* MIDDLE: Day */}
                  <h3 className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-[#152420]">
                    {key === "unknown"
                      ? "Date unknown"
                      : formatDayHeading(dayOrders[0].createdAt)}
                  </h3>

                  {/* RIGHT: Month and year */}
                  <p className="text-right text-xs font-semibold uppercase tracking-[0.1em] text-[#8FAE9E]">
                    {key === "unknown"
                      ? ""
                      : formatMonthYear(dayOrders[0].createdAt)}
                  </p>
                </div>

                <div className="space-y-3">
                  {dayOrders.map((order) => {
                    const isExpanded = expandedId === order._id;

                    const needsConfirmation = isPlaced(order.status);

                    const invoiceAmount = invoiceAmountOf(order);
                    const due = balanceDueOf(order);

                    const approxTotal = (order.products || []).reduce(
                      (sum, p) => sum + Number(p.subtotal || 0),
                      0
                    );

                    return (
                      <div
                        key={order._id}
                        className="
                          overflow-hidden
                          rounded-xl
                          border
                          border-[#D8E0D9]
                          bg-white
                          shadow-[0_1px_3px_rgba(21,36,32,0.04)]
                          transition
                          hover:border-[#B8C6BE]
                        "
                      >
                        {/* ORDER HEADER: order, invoice no./date, invoice amount, payment, status */}

                        <button
                          type="button"
                          onClick={() => toggleExpand(order._id)}
                          className="
                            grid
                            w-full
                            grid-cols-2
                            items-start
                            gap-x-4
                            gap-y-4
                            px-4
                            py-4
                            text-left
                            transition
                            hover:bg-[#FAFAF7]
                            sm:px-5
                            lg:grid-cols-[1.1fr_1.1fr_0.9fr_1.1fr_auto_20px]
                            lg:items-center
                          "
                        >
                          {/* ORDER */}
                          <div className="min-w-0">
                            <span className={miniLabelClass}>Order</span>

                            <p className="truncate font-semibold text-[#152420]">
                              {order.orderNumber}
                            </p>

                            <p className="mt-1 text-xs text-[#89968F]">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          {/* INVOICE NO. + INVOICE DATE */}
                          <div className="min-w-0">
                            <span className={miniLabelClass}>Invoice no.</span>

                            <p className="truncate font-semibold text-[#152420]">
                              {order.invoiceNumber || "—"}
                            </p>

                            <p className="mt-1 text-xs text-[#89968F]">
                              {formatDate(order.invoiceDate)}
                            </p>
                          </div>

                          {/* INVOICE AMOUNT */}
                          <div>
                            <span className={miniLabelClass}>
                              Invoice amount
                            </span>

                            <p className="whitespace-nowrap font-semibold text-[#152420]">
                              {formatCurrency(invoiceAmount)}
                            </p>
                          </div>

                          {/* PAYMENT DETAILS */}
                          <div>
                            <span className={miniLabelClass}>Payment</span>

                            <div className="flex flex-col items-start gap-1">
                              <PaymentBadge status={order.paymentStatus} />

                              <span className="text-xs text-[#89968F]">
                                {order.paymentMethod || "—"}
                                {due > 0 && ` · Due ${formatCurrency(due)}`}
                              </span>
                            </div>
                          </div>

                          {/* ORDER STATUS */}
                          <div>
                            <span className={miniLabelClass}>Status</span>

                            <StatusBadge status={order.status} />
                          </div>

                          <svg
                            className={`
                              hidden
                              h-5
                              w-5
                              text-[#89968F]
                              transition-transform
                              lg:block
                              ${isExpanded ? "rotate-180" : ""}
                            `}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="m6 9 6 6 6-6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        {/* EXPANDED */}

                        {isExpanded && (
                          <div className="border-t border-[#E5EAE7] px-4 py-5 sm:px-5">
                            <StatusTracker status={order.status} />

                            {/* CUSTOMER-VISIBLE DELIVERY OTP */}
                            {shouldShowDeliveryOtp(order) && (
                              <div className="mb-5 rounded-xl border border-[#B8D3C5] bg-[#EFF7F2] px-5 py-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7B73]">
                                  Delivery Verification
                                </p>

                                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm text-[#4C5C55]">
                                      Give this OTP to the delivery person only
                                      when you receive your order.
                                    </p>
                                    <p className="mt-1 text-xs text-[#89968F]">
                                      Do not share it before receiving the
                                      order.
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-[#1F4438]/20 bg-white px-6 py-3 text-center shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#89968F]">
                                      Delivery OTP
                                    </p>
                                    <p className="mt-1 font-mono text-3xl font-bold tracking-[0.25em] text-[#1F4438]">
                                      {order.deliveryOtp}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* INVOICE & PAYMENT DETAILS */}
                            <div className="mb-5 rounded-lg bg-[#F7F8F5] px-4 py-4">
                              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#8FAE9E]">
                                Invoice &amp; payment details
                              </p>

                              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
                                <div>
                                  <dt className={miniLabelClass}>Invoice no.</dt>
                                  <dd className="font-medium text-[#152420]">
                                    {order.invoiceNumber || "—"}
                                  </dd>
                                </div>

                                <div>
                                  <dt className={miniLabelClass}>
                                    Invoice date
                                  </dt>
                                  <dd className="font-medium text-[#152420]">
                                    {formatDate(order.invoiceDate)}
                                  </dd>
                                </div>

                                <div>
                                  <dt className={miniLabelClass}>
                                    Invoice amount
                                  </dt>
                                  <dd className="font-medium text-[#152420]">
                                    {formatCurrency(invoiceAmount)}
                                  </dd>
                                </div>

                                <div>
                                  <dt className={miniLabelClass}>
                                    Payment method
                                  </dt>
                                  <dd className="font-medium text-[#152420]">
                                    {order.paymentMethod || "—"}
                                  </dd>
                                </div>

                                <div>
                                  <dt className={miniLabelClass}>
                                    Payment status
                                  </dt>
                                  <dd>
                                    <PaymentBadge status={order.paymentStatus} />
                                  </dd>
                                </div>

                                {order.amountPaid != null && (
                                  <div>
                                    <dt className={miniLabelClass}>
                                      Paid / Due
                                    </dt>
                                    <dd className="font-medium text-[#152420]">
                                      {formatCurrency(order.amountPaid)}
                                      {due > 0 && (
                                        <span className="text-red-600">
                                          {" "}
                                          / {formatCurrency(due)}
                                        </span>
                                      )}
                                    </dd>
                                  </div>
                                )}
                              </dl>
                            </div>

                            {/* DELIVERY INFORMATION */}

                            {order.preferredDeliveryDate && (
                              <div className="mb-5 rounded-lg bg-[#F7F8F5] px-4 py-3">
                                <p className="text-sm text-[#4C5C55]">
                                  <span className="font-medium text-[#152420]">
                                    Preferred delivery:
                                  </span>{" "}
                                  {formatDate(order.preferredDeliveryDate)}
                                </p>
                              </div>
                            )}

                            {/* PRODUCTS TABLE (grid table on md+, stacked cards on mobile) */}

                            <table className="w-full border-collapse text-sm">
                              <thead className="hidden md:table-header-group">
                                <tr className="bg-[#E0E0E0] text-left text-[#152420]">
                                  <th className="border border-[#C9D2CD] px-3 py-2.5 font-medium">
                                    S No.
                                  </th>
                                  <th className="border border-[#C9D2CD] px-3 py-2.5 font-medium">
                                    Image
                                  </th>
                                  <th className="border border-[#C9D2CD] px-3 py-2.5 font-medium">
                                    Product Name
                                  </th>
                                  <th className="border border-[#C9D2CD] px-3 py-2.5 font-medium">
                                    Pack Qty
                                  </th>
                                  <th className="border border-[#C9D2CD] px-3 py-2.5 font-medium">
                                    Loose Qty
                                  </th>
                                  <th className="border border-[#C9D2CD] px-3 py-2.5 font-medium">
                                    MRP
                                  </th>
                                  <th className="border border-[#C9D2CD] px-3 py-2.5 font-medium">
                                    Net Amount
                                  </th>
                                </tr>
                              </thead>

                              <tbody className="block space-y-3 md:table-row-group md:space-y-0">
                                {(order.products || []).map((product, idx) => {
                                  const cell =
                                    "flex items-center justify-between gap-4 py-1.5 text-[#4C5C55] " +
                                    "md:table-cell md:border md:border-[#C9D2CD] md:px-3 md:py-2.5 " +
                                    "before:text-[10px] before:font-semibold before:uppercase before:tracking-[0.08em] " +
                                    "before:text-[#89968F] before:content-[attr(data-label)] md:before:hidden";

                                  return (
                                    <tr
                                      key={idx}
                                      className="block rounded-lg border border-[#E5EAE7] px-3 py-2 md:table-row md:rounded-none md:border-0 md:p-0"
                                    >
                                      <td data-label="S No." className={cell}>
                                        <span>{idx + 1}</span>
                                      </td>

                                      <td data-label="Image" className={cell}>
                                        {product.image ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setPreviewImage({
                                                src: product.image,
                                                name: product.productName,
                                              })
                                            }
                                            aria-label={`View image of ${
                                              product.productName || "product"
                                            }`}
                                            className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4438]/40"
                                          >
                                            <img
                                              src={product.image}
                                              alt={
                                                product.productName || "Product"
                                              }
                                              className="h-10 w-10 cursor-zoom-in rounded-lg border border-[#E5EAE7] object-cover transition hover:opacity-80"
                                            />
                                          </button>
                                        ) : (
                                          <span>—</span>
                                        )}
                                      </td>

                                      <td
                                        data-label="Product Name"
                                        className={`${cell} font-medium text-[#152420]`}
                                      >
                                        <span className="text-right md:text-left">
                                          {product.productName}
                                        </span>
                                      </td>

                                      <td data-label="Pack Qty" className={cell}>
                                        <span>{product.packQty || 0}</span>
                                      </td>

                                      <td data-label="Loose Qty" className={cell}>
                                        <span>{product.looseQty || 0}</span>
                                      </td>

                                      <td data-label="MRP" className={cell}>
                                        <span>{formatMoney(product.mrp)}</span>
                                      </td>

                                      <td data-label="Net Amount" className={cell}>
                                        <span>{formatMoney(product.subtotal)}</span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>

                            {/* APPROX TOTAL + CONFIRM ORDER */}

                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="order-2 sm:order-1">
                                {needsConfirmation && (
                                  <div className="flex flex-col items-start gap-1.5">
                                    <button
                                      type="button"
                                      disabled={confirmingId === order._id}
                                      onClick={() => handleConfirm(order._id)}
                                      className="
                                        inline-flex
                                        w-full
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-[#1F4438]
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-[#173229]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                        sm:w-auto
                                      "
                                    >
                                      {confirmingId === order._id
                                        ? "Confirming…"
                                        : "Confirm Order"}
                                    </button>

                                    {confirmErrors[order._id] && (
                                      <p className="text-sm text-red-600">
                                        {confirmErrors[order._id]}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <p className="order-1 text-right text-sm font-medium text-[#152420] sm:order-2">
                                Approx Total: {formatMoney(approxTotal)}
                              </p>
                            </div>

                            {/* BACKORDER */}

                            {Array.isArray(order.backorderItems) &&
                              order.backorderItems.length > 0 && (
                                <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                                  {order.backorderItems.length} item(s) still
                                  pending
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* BACK TO DETAILS LINK */}

          <div className="mt-8 border-t border-[#D8E0D9] pt-5">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F4438] transition hover:text-[#122E26]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="m15 18-6-6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Back to your details
            </Link>
          </div>
        </div>
      </div>

      {/* PRODUCT IMAGE MODAL */}

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={previewImage.name || "Product image"}
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg leading-none text-[#152420] shadow transition hover:bg-white"
            >
              ×
            </button>

            <img
              src={previewImage.src}
              alt={previewImage.name || "Product"}
              className="max-h-[70vh] w-full bg-[#F7F5EF] object-contain"
            />

            {previewImage.name && (
              <p className="border-t border-[#E5EAE7] px-4 py-3 text-sm font-medium text-[#152420]">
                {previewImage.name}
              </p>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

/* ----------------------------------
   EMPTY STATE
---------------------------------- */

function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-[#C9D2CD] bg-white/50 px-5 py-12 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF0EC] text-[#1F4438]">
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M6 2h9l5 5v15H6z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />

          <path d="M9 13h6M9 17h4" strokeLinecap="round" />
        </svg>
      </div>

      <h3 className="font-semibold text-[#152420]">{title}</h3>

      <p className="mt-1 text-sm text-[#6B7B73]">{description}</p>
    </div>
  );
}
