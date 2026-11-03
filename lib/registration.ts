import type { PartnerRole } from "@/lib/types";

export type RegistrationField = {
  key: string;
  label: string;
  type?: "text" | "tel" | "url" | "select";
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

// Each role gets its own form; the server only accepts these keys.
export const registrationForms: Record<PartnerRole, RegistrationField[]> = {
  sponsor: [
    { key: "organization", label: "Organization or company", required: true },
    { key: "phone", label: "Phone number", type: "tel", placeholder: "801 555 0123" },
    { key: "website", label: "Website or social media", placeholder: "instagram.com/yourbusiness" },
    {
      key: "interest",
      label: "Package you are interested in",
      type: "select",
      options: ["Athlete Spotlight", "Meet Night", "Team Package", "Not sure yet"],
    },
    { key: "goal", label: "What do you want to promote?", placeholder: "A new menu, a store opening..." },
  ],
  athlete: [
    {
      key: "event",
      label: "Main event",
      type: "select",
      options: ["All-Around", "Vault", "Uneven Bars", "Balance Beam", "Floor Exercise"],
      required: true,
    },
    {
      key: "year",
      label: "Class year",
      type: "select",
      options: ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
      required: true,
    },
    { key: "hometown", label: "Hometown" },
    { key: "instagram", label: "Instagram handle", placeholder: "@yourname" },
    { key: "tiktok", label: "TikTok handle", placeholder: "@yourname" },
    { key: "interests", label: "Brands or causes you care about", placeholder: "Coffee, mental health..." },
  ],
};

export function parseRegistration(value: unknown) {
  if (typeof value !== "object" || value === null) return null;
  const { role, name, profile } = value as Record<string, unknown>;
  if (role !== "sponsor" && role !== "athlete") return null;
  if (typeof name !== "string" || !name.trim()) return null;
  if (typeof profile !== "object" || profile === null) return null;
  const memberRole: PartnerRole = role;

  const clean: Record<string, string> = {};
  for (const field of registrationForms[memberRole]) {
    const raw = (profile as Record<string, unknown>)[field.key];
    const text = typeof raw === "string" ? raw.trim().slice(0, 200) : "";
    if (field.required && !text) return null;
    if (field.options && text && !field.options.includes(text)) return null;
    if (text) clean[field.key] = text;
  }
  return { role: memberRole, name: name.trim().slice(0, 120), profile: clean };
}
