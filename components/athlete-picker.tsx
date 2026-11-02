"use client";

import { useDemo } from "@/components/demo-provider";
import { Field, Select } from "@/components/ui/input";
import { athletes } from "@/lib/data";
import { setDemoState } from "@/lib/demo-store";

export function AthletePicker() {
  const { state } = useDemo();

  return (
    <Field label="Viewing as" className="max-w-xs">
      <Select
        value={state.activeAthleteId}
        onChange={(event) => {
          const activeAthleteId = event.target.value;
          setDemoState((current) => ({ ...current, activeAthleteId }));
        }}
      >
        {athletes.map((athlete) => (
          <option key={athlete.id} value={athlete.id}>
            {athlete.name}
          </option>
        ))}
      </Select>
    </Field>
  );
}
