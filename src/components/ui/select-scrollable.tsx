import * as React from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectScrollableProps = {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  children: React.ReactNode;
};

export function SelectScrollable({
  value,
  onValueChange,
  disabled = false,
  placeholder = "",
  className = "",
  children,
}: SelectScrollableProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        {children}
      </SelectContent>
    </Select>
  );
}
