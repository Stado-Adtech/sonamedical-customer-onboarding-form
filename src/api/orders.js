import client from "./client";

// Fetch the logged-in customer's own orders, sorted newest first.
export async function getMyOrders() {
  const { data } = await client.get("/viewOrders");
  return data.orders;
}

export async function confirmOrder(orderId) {
  const { data } = await client.put(`/confirmOrder/${orderId}`);
  return data;
}