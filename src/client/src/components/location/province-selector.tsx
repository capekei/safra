import { DR_PROVINCES } from '../../lib/constants';

interface ProvinceSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function ProvinceSelector({ value, onChange }: ProvinceSelectorProps) {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange?.(e.target.value)}
      className="border rounded px-3 py-2"
    >
      <option value="">Seleccionar provincia</option>
      {DR_PROVINCES.map((province) => (
        <option key={province} value={province}>
          {province}
        </option>
      ))}
    </select>
  );
}