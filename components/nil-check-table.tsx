import { worstStatus, type NilCheck, type NilStatus } from "@/lib/nil";
import { cn } from "@/lib/utils";

export const statusStyles: Record<NilStatus, { dot: string; label: string }> = {
  green: { dot: "bg-green-600", label: "Clear" },
  yellow: { dot: "bg-yellow-500", label: "Review" },
  red: { dot: "bg-red-700", label: "Blocked" },
};

export function NilCheckTable({ checks, className }: { checks: NilCheck[]; className?: string }) {
  return (
    <table className={cn("w-full text-sm", className)}>
      <caption className="mb-1 flex items-center gap-2 text-left font-semibold">
        NIL check: {statusStyles[worstStatus(checks)].label}
      </caption>
      <tbody>
        {checks.map((check) => (
          <tr key={check.label} className="border-t">
            <td className="py-1.5 pr-3 whitespace-nowrap">
              <span className="flex items-center gap-2">
                <span className={cn("size-2.5 rounded-full", statusStyles[check.status].dot)} />
                {statusStyles[check.status].label}
              </span>
            </td>
            <td className="py-1.5 pr-3 font-semibold">{check.label}</td>
            <td className="py-1.5 text-muted-foreground">{check.detail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
