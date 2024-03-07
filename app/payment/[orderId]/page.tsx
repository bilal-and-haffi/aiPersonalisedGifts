import { z } from "zod";
import { PRINTIFY_BASE_URL } from "@/app/consts";
import { PrintifyOrderResponse } from "@/interfaces/PrintifyTypes";
import { logWithTimestamp } from "@/functions/logWithTimeStamp";
import { ProductDetails } from "@/app/components/ProductDetails";
import { retrieveAProduct } from "@/functions/retrieveAProduct";
import { stripeServerClient } from "@/lib/stripe/client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function PaymentPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = params;

  if (!orderId) {
    console.error("Order ID is required", { params });
    console.error({ orderId });
    return <div>Order ID is required</div>;
  }

  const orderDetails = await getOrderDetails(orderId);
  logWithTimestamp({ orderDetails });
  const { total_price, total_shipping, total_tax } = orderDetails;
  logWithTimestamp({ total_price, total_shipping, total_tax });

  if ([total_price, total_shipping, total_tax].some((x) => x === undefined)) {
    console.error("Order Details are required", { orderDetails });
    console.error({ total_price, total_shipping, total_tax });
    return <div>Order Details are required</div>;
  }

  const retrievedProducts = await Promise.all(
    orderDetails.line_items.map(
      async (x) => await retrieveAProduct(x.product_id),
    ),
  );

  return (
    <>
      <h1 className="text-xl">Order Details</h1>
      <p>Total Price: {total_price}</p>
      <p>Total Shipping: {total_shipping}</p>
      <p>Total Tax: {total_tax}</p>
      <p>Total: {total_price + total_shipping + total_tax}</p>

      <form
        action={handleCheckout}
        className="mt-8 block w-1/5 rounded-md py-2 text-center text-sm font-semibold text-white ring-2 bg-blue-500 hover:bg-blue-800 hover:ring-0"
      >
        <input type="hidden" name="total_price" value={total_price} />
        <button type="submit">Proceed to checkout</button>
      </form>
      <h1 className="text-xl pt-8">Your Basket</h1>
      {retrievedProducts.map((retrievedProduct) => (
        <ProductDetails retrievedProduct={retrievedProduct} />
      ))}
    </>
  );
}

async function getOrderDetails(orderId: string) {
  const endpoint = `${PRINTIFY_BASE_URL}/v1/shops/${process.env.SHOP_ID}/orders/${orderId}.json`;
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
    },
  });
  const orderDetails = (await response.json()) as PrintifyOrderResponse;
  logWithTimestamp({ orderDetails });
  return orderDetails;
}

async function handleCheckout(formData: FormData) {
  "use server";
  const rawFormData = Object.fromEntries(formData.entries());
  const schema = z.object({
    total_price: z.string(),
  });
  const parsedFormData = schema.parse(rawFormData);
  const total_price = Number(parsedFormData.total_price); // will one hundo percent cause a bug
  const headersList = headers();
  const referer = headersList.get("referer") || "";
  const origin = headersList.get("origin") || "";

  const session = await stripeServerClient.checkout.sessions.create({
    customer_email: "test@example.com",
    shipping_options: [
      {
        shipping_rate_data: {
          // TODO: Figure out dynamically for other shipping options
          type: "fixed_amount",
          fixed_amount: {
            currency: "gbp",
            amount: total_price,
          },
          display_name: "Standard",
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 3,
            },
            maximum: {
              unit: "business_day",
              value: 5,
            },
          },
        },
      },
    ],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: "T-shirt", // TODO: Figure out dynamically
          },
          unit_amount_decimal: total_price.toString(),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/payment/success`,
    cancel_url: referer,
    automatic_tax: {
      enabled: true,
      liability: {
        type: "self",
      },
    },
  });
  redirect(session!.url!);
}
