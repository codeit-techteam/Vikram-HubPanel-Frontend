import { redirect } from "next/navigation";

/** Customer orders are created from Vikram ADMIN (Customer Executive), not Hub Panel. */
export default function CreateOrderRedirectPage() {
  redirect("/orders");
}
