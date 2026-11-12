"use client";

import { Input } from "antd";

interface ISearchInputProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function SearchInput({
  value,
  onSearch,
  placeholder,
  maxLength,
  className,
}: ISearchInputProps) {
  return (
    <Input.Search
      key={value}
      defaultValue={value}
      allowClear
      placeholder={placeholder}
      maxLength={maxLength}
      className={className}
      onSearch={(next) => onSearch(next.trim())}
    />
  );
}
