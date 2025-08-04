import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem 
} from "@/components/ui/command";
import { MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Province {
  id: number;
  name: string;
  code: string;
}

interface ProvinceSelectorProps {
  value?: number;
  onChange: (provinceId: number | undefined) => void;
  placeholder?: string;
}

export function ProvinceSelector({ 
  value, 
  onChange, 
  placeholder = "Todas las provincias" 
}: ProvinceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [userProvince, setUserProvince] = useState<number | null>(null);

  // Fetch provinces from API
  const { data: provinces = [] } = useQuery<Province[]>({
    queryKey: ["/api/provinces"],
  });

  // Auto-detect user's province based on IP location (future enhancement)
  useEffect(() => {
    const savedProvince = localStorage.getItem("userProvince");
    if (savedProvince) {
      setUserProvince(parseInt(savedProvince));
    }
  }, []);

  const selectedProvince = provinces.find(p => p.id === value);

  const handleSelect = (provinceId: number | undefined) => {
    onChange(provinceId);
    setOpen(false);
    
    // Save user preference
    if (provinceId) {
      localStorage.setItem("userProvince", provinceId.toString());
    } else {
      localStorage.removeItem("userProvince");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="glass"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            {selectedProvince ? selectedProvince.name : placeholder}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar provincia..." />
          <CommandEmpty>No se encontró la provincia.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => handleSelect(undefined)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === undefined ? "opacity-100" : "opacity-0"
                )}
              />
              Todas las provincias
            </CommandItem>
            {userProvince && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  Tu ubicación
                </div>
                {provinces
                  .filter(province => province.id === userProvince)
                  .map((province) => (
                    <CommandItem
                      key={province.id}
                      onSelect={() => handleSelect(province.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === province.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {province.name}
                    </CommandItem>
                  ))}
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  Otras provincias
                </div>
              </>
            )}
            {provinces
              .filter(province => province.id !== userProvince)
              .map((province) => (
                <CommandItem
                  key={province.id}
                  onSelect={() => handleSelect(province.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === province.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {province.name}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Province badges for display
export function ProvinceBadge({ provinceId }: { provinceId: number }) {
  const { data: provinces = [] } = useQuery<Province[]>({
    queryKey: ["/api/provinces"],
  });

  const province = provinces.find(p => p.id === provinceId);
  
  if (!province) return null;

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
      <MapPin className="w-3 h-3 mr-1" />
      {province.name}
    </span>
  );
}