import { RequireAccount } from "@/components/require-account";

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccount role="sponsor">{children}</RequireAccount>;
}
