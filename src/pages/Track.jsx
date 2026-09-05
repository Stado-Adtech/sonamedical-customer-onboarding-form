import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as ordersApi from "../api/orders";

const STAGES = [
  "Placed",
  "Processing",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
];

const STATUS_FILTER_OPTIONS = ["All", ...STAGES, "Cancelled"];

const STATUS_STYLES = {
  placed: "bg-blue-50 text-blue-700 border-blue-100",
  processing: "bg-amber-50 text-amber-700 border-amber-100",
  "ready-for-delivery":
    "bg-indigo-50 text-indigo-700 border-indigo-100",
  "out-for-delivery":
    "bg-purple-50 text-purple-700 border-purple-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
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

  const idx = STAGES.findIndex(
    (stage) =>
      stage.toLowerCase() === String(status).toLowerCase()
  );

  return idx === -1 ? 0 : idx;
}

function isCancelled(status) {
  return String(status || "").toLowerCase() === "cancelled";
}

function statusKey(status) {
  return (status || "placed")
    .toLowerCase()
    .replace(/\s+/g, "-");
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
        <Link
          to="/track"
          className="flex items-center gap-2.5"
        >
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
          &copy; {new Date().getFullYear()} Sona Medical.
          All rights reserved.
        </p>

        <p>
          Need help with an order?{" "}
          <a
            href="mailto:support@example.com"
            className="font-medium text-[#1F4438] hover:text-[#122E26]"
          >
            support@example.com
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

  const style =
    STATUS_STYLES[key] ||
    "bg-gray-50 text-gray-700 border-gray-200";

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
      {status || "Placed"}
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
                    ${
                      idx < current
                        ? "bg-[#1F4438]"
                        : "bg-[#D8E0D9]"
                    }
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
                  ${
                    isCurrent
                      ? "ring-4 ring-[#1F4438]/10"
                      : ""
                  }
                `}
              />

              <span
                className={`
                  px-2
                  text-[11px]
                  leading-tight
                  ${
                    done
                      ? "font-semibold text-[#1F4438]"
                      : "text-[#89968F]"
                  }
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
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  function toggleExpand(id) {
    setExpandedId((prev) =>
      prev === id ? null : id
    );
  }

  /* ----------------------------------
     FILTER
  ---------------------------------- */

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    const from = dateFrom
      ? new Date(dateFrom)
      : null;

    const to = dateTo
      ? new Date(dateTo)
      : null;

    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    return orders.filter((order) => {
      if (
        term &&
        !order.orderNumber
          ?.toLowerCase()
          .includes(term)
      ) {
        return false;
      }

      if (statusFilter !== "All") {
        const currentStatus = String(
          order.status || "Placed"
        );

        if (
          currentStatus.toLowerCase() !==
          statusFilter.toLowerCase()
        ) {
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
  }, [
    orders,
    search,
    statusFilter,
    dateFrom,
    dateTo,
  ]);

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

  const hasActiveFilters =
    search ||
    statusFilter !== "All" ||
    dateFrom ||
    dateTo;

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
                See the latest status and delivery
                progress of everything you've ordered.
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
                  <label
                    htmlFor="orderSearch"
                    className={labelClass}
                  >
                    Order number
                  </label>

                  <input
                    id="orderSearch"
                    type="text"
                    placeholder="e.g. ORD-1042"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label
                    htmlFor="statusFilter"
                    className={labelClass}
                  >
                    Status
                  </label>

                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className={inputClass}
                  >
                    {STATUS_FILTER_OPTIONS.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* FROM DATE */}

                <div>
                  <label
                    htmlFor="dateFrom"
                    className={labelClass}
                  >
                    From
                  </label>

                  <input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) =>
                      setDateFrom(e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {/* TO DATE */}

                <div>
                  <label
                    htmlFor="dateTo"
                    className={labelClass}
                  >
                    To
                  </label>

                  <input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) =>
                      setDateTo(e.target.value)
                    }
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

          {!error &&
            orders.length > 0 &&
            filteredOrders.length === 0 && (
              <EmptyState
                title="No matching orders"
                description="Try changing or clearing your filters."
              />
            )}

          {/* ORDER GROUPS */}

          <div className="space-y-8">
            {groupedByDay.map(
              ([key, dayOrders]) => (
                <section key={key}>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8FAE9E]">
                      {key === "unknown"
                        ? "Date unknown"
                        : formatDateHeading(
                            dayOrders[0].createdAt
                          )}
                    </h3>

                    <div className="h-px flex-1 bg-[#D8E0D9]" />
                  </div>

                  <div className="space-y-3">
                    {dayOrders.map((order) => {
                      const isExpanded =
                        expandedId === order._id;

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
                          {/* ORDER HEADER */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleExpand(order._id)
                            }
                            className="
                              grid
                              w-full
                              grid-cols-[1fr_auto]
                              items-center
                              gap-3
                              px-4
                              py-4
                              text-left
                              transition
                              hover:bg-[#FAFAF7]
                              sm:grid-cols-[1fr_auto_auto_auto]
                              sm:px-5
                            "
                          >
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#152420]">
                                {order.orderNumber}
                              </p>

                              <p className="mt-1 text-xs text-[#89968F]">
                                {formatDate(
                                  order.createdAt
                                )}
                              </p>
                            </div>

                            <div className="hidden sm:block">
                              <StatusBadge
                                status={order.status}
                              />
                            </div>

                            <p className="whitespace-nowrap font-semibold text-[#152420]">
                              {formatCurrency(
                                order.grandTotal
                              )}
                            </p>

                            <svg
                              className={`
                                hidden
                                h-5
                                w-5
                                text-[#89968F]
                                transition-transform
                                sm:block
                                ${
                                  isExpanded
                                    ? "rotate-180"
                                    : ""
                                }
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

                            <div className="col-span-2 sm:hidden">
                              <StatusBadge
                                status={order.status}
                              />
                            </div>
                          </button>

                          {/* EXPANDED */}

                          {isExpanded && (
                            <div className="border-t border-[#E5EAE7] px-4 py-5 sm:px-5">
                              <StatusTracker
                                status={order.status}
                              />

                              {/* DELIVERY INFORMATION */}

                              {(order.deliveryAssignedToName ||
                                order.preferredDeliveryDate) && (
                                <div className="mb-5 rounded-lg bg-[#F7F8F5] px-4 py-3">
                                  {order.deliveryAssignedToName && (
                                    <p className="text-sm text-[#4C5C55]">
                                      <span className="font-medium text-[#152420]">
                                        Delivery:
                                      </span>{" "}
                                      {
                                        order.deliveryAssignedToName
                                      }
                                    </p>
                                  )}

                                  {order.preferredDeliveryDate && (
                                    <p className="mt-1 text-sm text-[#4C5C55]">
                                      <span className="font-medium text-[#152420]">
                                        Preferred delivery:
                                      </span>{" "}
                                      {formatDate(
                                        order.preferredDeliveryDate
                                      )}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* PRODUCTS TABLE */}

                              <div className="overflow-x-auto">
                                <table className="min-w-[700px] w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-[#D8E0D9] text-left text-[11px] uppercase tracking-[0.08em] text-[#89968F]">
                                      <th className="pb-3 pr-4 font-semibold">
                                        Item
                                      </th>

                                      <th className="pb-3 pr-4 font-semibold">
                                        Qty
                                      </th>

                                      <th className="pb-3 pr-4 font-semibold">
                                        MRP
                                      </th>

                                      <th className="pb-3 pr-4 font-semibold">
                                        Price
                                      </th>

                                      <th className="pb-3 text-right font-semibold">
                                        Amount
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {(order.products || []).map(
                                      (product, idx) => (
                                        <tr
                                          key={idx}
                                          className="border-b border-[#EDF0EE] last:border-0"
                                        >
                                          <td className="py-3 pr-4">
                                            <div className="flex items-center gap-3">
                                              {product.image && (
                                                <img
                                                  src={
                                                    product.image
                                                  }
                                                  alt={
                                                    product.productName ||
                                                    "Product"
                                                  }
                                                  className="h-10 w-10 flex-shrink-0 rounded-lg border border-[#E5EAE7] object-cover"
                                                />
                                              )}

                                              <span className="font-medium text-[#152420]">
                                                {
                                                  product.productName
                                                }
                                              </span>
                                            </div>
                                          </td>

                                          <td className="py-3 pr-4 text-[#6B7B73]">
                                            {product.packQty
                                              ? `${product.packQty} pack`
                                              : ""}

                                            {product.packQty &&
                                            product.looseQty
                                              ? " + "
                                              : ""}

                                            {product.looseQty
                                              ? `${product.looseQty} loose`
                                              : ""}

                                            {product.qtyPerPack
                                              ? ` (${product.qtyPerPack}/pack)`
                                              : ""}
                                          </td>

                                          <td className="py-3 pr-4 text-[#6B7B73]">
                                            {formatCurrency(
                                              product.mrp
                                            )}
                                          </td>

                                          <td className="py-3 pr-4 text-[#6B7B73]">
                                            {product.packQty
                                              ? formatCurrency(
                                                  product.price
                                                )
                                              : ""}

                                            {product.packQty &&
                                            product.looseQty
                                              ? " / "
                                              : ""}

                                            {product.looseQty
                                              ? `${formatCurrency(
                                                  product.looseUnitPrice
                                                )} each`
                                              : ""}
                                          </td>

                                          <td className="py-3 text-right font-semibold text-[#152420]">
                                            {formatCurrency(
                                              product.subtotal
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* BACKORDER */}

                              {Array.isArray(
                                order.backorderItems
                              ) &&
                                order.backorderItems
                                  .length > 0 && (
                                  <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                                    {
                                      order.backorderItems
                                        .length
                                    }{" "}
                                    item(s) still pending
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )
            )}
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

      <SiteFooter />
    </div>
  );
}

/* ----------------------------------
   EMPTY STATE
---------------------------------- */

function EmptyState({
  title,
  description,
}) {
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

          <path
            d="M14 2v6h6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M9 13h6M9 17h4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="font-semibold text-[#152420]">
        {title}
      </h3>

      <p className="mt-1 text-sm text-[#6B7B73]">
        {description}
      </p>
    </div>
  );
}
