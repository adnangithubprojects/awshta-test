import { memo, useMemo, useState } from "react";
import { Controller, useWatch, type Control } from "react-hook-form";

import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import TextInput from "../textInput";
import { cn } from "../../../../lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";

type TItemType = {
  label: string;
  value: string;
};

type TDropDownProps = {
  label?: string;
  placeholder: string;
  control: Control<any>;
  name: string;
  items: TItemType[];
  modalHeader?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  className?: string;
  inputClassName?: string;
};

const DropDown = memo(function DropDown({
  label,
  placeholder,
  control,
  name,
  items = [],
  modalHeader,
  searchPlaceholder = "Search...",
  searchable = true,
  className,
  inputClassName,
}: TDropDownProps) {
  const [open, setOpen] = useState(false);

  const selectedValue = useWatch({
    control,
    name,
  });

  const selectedLabel = useMemo(
    () => items?.find((item) => item.value === selectedValue)?.label || "",
    [selectedValue, items],
  );

  return (
    <div className={cn("w-full", className)}>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="w-full cursor-pointer">
                <TextInput
                  control={control}
                  name={name}
                  labelText={label}
                  placeholder={placeholder}
                  className={cn("text-start", inputClassName)}
                  value={selectedLabel}
                  readOnly
                />
              </div>
            </PopoverTrigger>

            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0 bg-white shadow-md border border-gray-200"
              align="start"
            >
              <Command className="rounded-lg">
                {searchable && (
                  <CommandInput
                    placeholder={searchPlaceholder}
                    className="h-10 border-none focus:ring-0"
                  />
                )}
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading={modalHeader}>
                    {items?.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        onSelect={() => {
                          onChange(item.value);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer py-2 px-3 hover:bg-gray-100"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            value === item.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  );
});

export default DropDown;
