import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}

export function FormInput({
  label,
  value,
  onChange,
  id,
  placeholder,
  disabled,
  type = "text",
}: FormInputProps) {
  return (
    <div className="space-y-1">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}