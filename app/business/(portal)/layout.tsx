import { BusinessSidebar } from "@/components/business/sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <BusinessSidebar />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
