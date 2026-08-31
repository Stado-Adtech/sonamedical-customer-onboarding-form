import client from "./client";

// Fetch the logged-in customer's own orders, sorted newest first.
export async function getMyOrders() {
  const { data } = await client.get("/viewOrders");
  return data.orders;
}