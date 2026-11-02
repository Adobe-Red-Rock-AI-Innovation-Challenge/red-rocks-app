import { RequireAccount } from "@/components/require-account";

export default function AthleteLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccount role="athlete">{children}</RequireAccount>;
}
