import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

export function Checkbox({ checked, onChange, label, className, ...props }) {
  return (
    <label className={cn("flex items-center space-x-2 cursor-pointer", className)}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center",
            checked
              ? "bg-blue-600 border-blue-600"
              : "border-gray-300 bg-white hover:border-blue-400"
          )}
        >
          {checked && <Check size={14} className="text-white" />}
        </div>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}

