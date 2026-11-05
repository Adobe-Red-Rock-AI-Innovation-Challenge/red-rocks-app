import { RedeemForm } from "@/components/redeem-form";

// What a cashier opens at the counter on a phone or tablet. Results carries the same box.
export default function RedeemPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-4xl sm:text-5xl">Redeem</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        For your counter staff. Enter the code on the fan&apos;s VIP Pass.
      </p>
      <RedeemForm />
    </div>
  );
}
