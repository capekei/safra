// Province selector component for Dominican Republic
import React from 'react';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DOMINICAN_PROVINCES } from '../../lib/constants';

interface ProvinceSelected {
  id: number;
  name: string;
}

interface ProvinceSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

export function ProvinceSelector({ value, onValueChange, placeholder = "Seleccionar provincia" }: ProvinceSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {DOMINICAN_PROVINCES.map((province, index) => (
          <SelectItem key={index} value={province}>
            {province}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ProvinceBadgeProps {
  province: ProvinceSelected;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function ProvinceBadge({ province, variant = "default" }: ProvinceBadgeProps) {
  return (
    <Badge variant={variant}>
      {province.name}
    </Badge>
  );
}