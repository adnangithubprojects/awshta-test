import { memo, useMemo, useState } from "react";
import { Controller, useWatch, type Control } from "react-hook-form";
import { useGetAllSports } from "../../../../api/sports/queries";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../ui/button";
import Loader from "../../../loader";

type TTextInputProps = {
  control: Control<any>;
  name: string;
  labelText?: string;
  placeholder?: string;
  value?: string;
  readOnly?: boolean;
  className?: string;
};

type TItem = {
  id: string;
  name: string;
  picture?: string;
  active?: boolean;
};
type TImageMultiSelectDropdownProps = {
  label?: string;
  placeholder: string;
  // items: TItem[];
  control: Control<any>;
  name: string;
  isMultiSelect?: boolean;
  searchable?: boolean;
  isLoading?: boolean;
  className?: string;
};

const ImageMultiSelectDropdown = memo(function ImageMultiSelectDropdown({
  label,
  placeholder,
  control,
  name,
  isMultiSelect = false,
  searchable = true,
  className,
}: TImageMultiSelectDropdownProps) {
  const { data: sports, isLoading } = useGetAllSports();
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    return (sports || []).map((it: TItem) => ({
      id: it.id,
      name: it.name,
      picture: it.picture,
      active: it.active,
    }));
  }, [sports]);

  const selectedValue = useWatch({
    name: name,
    control: control,
  });

  const filteredItems = items.filter((item: any) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const displayValue = useMemo(() => {
    if (!selectedValue) return "";
    if (isMultiSelect && Array.isArray(selectedValue)) {
      return selectedValue.map((item) => item.name).join(", ");
    }
    return selectedValue?.name || "";
  }, [selectedValue, isMultiSelect]);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={isMultiSelect ? [] : null}
      render={({ field: { value, onChange } }) => {
        const handleSelect = (item: any) => {
          if (isMultiSelect) {
            const isAlreadySelected = (value || []).some(
              (v: any) => v.id === item.id,
            );
            if (isAlreadySelected) {
              onChange(value.filter((v: any) => v.id !== item.id));
            } else {
              onChange([...(value || []), item]);
            }
          } else {
            onChange(item);
          }
        };

        return (
          <div className={cn("w-full", className)}>
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                  <TextInput
                    control={control}
                    name={name}
                    value={displayValue}
                    placeholder={placeholder}
                    labelText={label}
                    readOnly
                    className={className}
                  />
                </div>
              </PopoverTrigger>

              <PopoverContent className="w-[300px] max-h-[350px] overflow-auto p-2 bg-white shadow-lg border rounded-md">
                {searchable && (
                  <input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-lime-green text-black"
                  />
                )}

                <div className="flex flex-col gap-2">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader />
                    </div>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item: any) => {
                      const isSelected = isMultiSelect
                        ? value?.some((v: any) => v.id === item.id)
                        : value?.id === item.id;

                      return (
                        <Button
                          type="button" // Important to prevent form submission
                          key={item.id}
                          variant="ghost"
                          className={cn(
                            "flex items-center justify-start gap-2 w-full px-3 py-2 rounded-md transition-colors",
                            isSelected
                              ? "bg-black text-white hover:bg-black/90"
                              : "bg-white text-black hover:bg-gray-100 border border-gray-100",
                          )}
                          onClick={() => handleSelect(item)}
                        >
                          {item.picture && (
                            <img
                              src={item.picture}
                              alt={item.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="text-sm">{item.name}</span>
                        </Button>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      No items found
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      }}
    />
  );
});

const TextInput = memo(function TextInput({
  control,
  name,
  labelText,
  placeholder,
  value,
  readOnly,
  className,
}: TTextInputProps) {
  const baseClasses =
    "w-full h-[48px] mt-2 rounded-lg border-[2px] border-gray-500 text-black bg-transparent px-3 text-base focus:outline-none focus:border-lime-green transition-all";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("flex flex-col w-full", className)}>
          {labelText && (
            <label className="mb-1 text-sm font-medium text-gray-700">
              {labelText}
            </label>
          )}

          <input
            {...field}
            value={value !== undefined ? value : (field.value ?? "")}
            onChange={(e) => {
              if (!readOnly) field.onChange(e.target.value);
            }}
            placeholder={placeholder}
            readOnly={readOnly}
            className={cn(
              baseClasses,
              readOnly ? "cursor-pointer" : "",
              fieldState.error ? "border-red-500" : "",
            )}
          />

          {fieldState.error && (
            <p className="text-red-500 text-xs mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
});

export default ImageMultiSelectDropdown;
