import { FormDropdown } from "@/components/form-dropdown";
import { IconMapPin } from "@/components/icons";
import { RADIUS_OPTIONS } from "@/lib/constants";

export function RadiusSelect({ defaultValue }: { defaultValue?: number }) {
  return (
    <FormDropdown
      name="radius"
      defaultValue={defaultValue}
      options={RADIUS_OPTIONS.map(({ value, label }) => ({ value, label }))}
      icon={<IconMapPin className="h-4 w-4 shrink-0 text-muted" />}
      className="relative flex items-center gap-1.5 border-t border-border px-4 py-3 sm:border-t-0"
    />
  );
}
