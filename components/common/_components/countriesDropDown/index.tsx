// "use client";

// import { memo, useState } from "react";
// import { Controller, type Control } from "react-hook-form";
// import { Check, X } from "lucide-react";
// import { cn } from "../../../../lib/utils";
// import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
// import TextInput from "../textInput";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "../../../ui/command";
// import Loader from "../../../loader";
// import { useSearchCountry } from "../../../../api/common/queries";

// type Country = {
//   code: string;
//   name: string;
//   flag?: string;
//   picture?: string;
// };

// type Props = {
//   label?: string;
//   placeholder?: string;
//   control: Control<any>;
//   name: string;
//   className?: string;
//   fallback?: Country[];
//   searchPlaceholder?: string;
// };

// const MultiCountryDropdown = memo(function MultiCountryDropdown({
//   label,
//   placeholder = "Select countries",
//   control,
//   name,
//   className,
//   searchPlaceholder = "Search country...",
// }: Props) {
//   const [query, setQuery] = useState("");

//   const { data: countries, isLoading } = useSearchCountry(query);

//   return (
//     <div className={cn("w-full", className)}>
//       <Controller
//         name={name}
//         control={control}
//         render={({ field: { onChange, value = [] } }) => {
//           // toggle country selection
//           const toggleSelect = (country: Country) => {
//             const alreadySelected = value?.some(
//               (c: Country) => c.code === country.code,
//             );
//             if (alreadySelected) {
//               onChange(value?.filter((c: Country) => c.code !== country.code));
//             } else {
//               onChange([...value, country]);
//             }
//           };

//           const removeSelected = (code: string) => {
//             onChange(value.filter((c: Country) => c.code !== code));
//           };

//           return (
//             <Popover>
//               <PopoverTrigger className="w-full cursor-pointer relative flex flex-col">
//                 <TextInput
//                   control={control}
//                   name={name}
//                   labelText={label}
//                   placeholder={placeholder}
//                   readOnly
//                 />

//                 {/* Selected chips */}
//                 {value?.length > 0 && (
//                   <div className="absolute bg-jet-black top-[28px] left-2 flex overflow-x-scroll gap-2 w-[95%] py-1 scrollbar-hide">
//                     {value.map((c: Country) => (
//                       <span
//                         key={c.code}
//                         className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1 text-xs w-fit text-nowrap"
//                       >
//                         {c.name} ({c.code})
//                         <X
//                           size={10}
//                           className="cursor-pointer hover:text-red-500"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeSelected(c.code);
//                           }}
//                         />
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </PopoverTrigger>

//               <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white">
//                 <Command>
//                   <CommandInput
//                     placeholder={searchPlaceholder}
//                     className="h-9"
//                     value={query}
//                     onValueChange={setQuery}
//                   />
//                   <CommandEmpty>No results found.</CommandEmpty>

//                   <div className="max-h-[300px] overflow-auto">
//                     <CommandGroup>
//                       {isLoading ? (
//                         <div className="flex justify-center py-10">
//                           <Loader />
//                         </div>
//                       ) : (
//                         countries?.map((country: Country) => {
//                           const isSelected = value?.some(
//                             (c: Country) => c?.code === country?.code,
//                           );
//                           return (
//                             <CommandItem
//                               key={country?.code}
//                               value={country?.code}
//                               onSelect={() => toggleSelect(country)}
//                             >
//                               <span className="flex-1 text-sm">
//                                 {country?.name} ({country?.code})
//                               </span>
//                               <Check
//                                 className={cn(
//                                   "h-4 w-4 transition-opacity",
//                                   isSelected ? "opacity-100" : "opacity-0",
//                                 )}
//                               />
//                             </CommandItem>
//                           );
//                         })
//                       )}
//                     </CommandGroup>
//                   </div>
//                 </Command>
//               </PopoverContent>
//             </Popover>
//           );
//         }}
//       />
//     </div>
//   );
// });

// export default MultiCountryDropdown;

"use client";

import { memo, useState } from "react";
import { Controller, type Control } from "react-hook-form";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import TextInput from "../textInput";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import Loader from "../../../loader";
import { useSearchCountry } from "../../../../api/common/queries";

type Country = {
  code: string;
  name: string;
};

type Props = {
  label?: string;
  placeholder?: string;
  control: Control<any>;
  name: string;
  isMultiple?: boolean; // The toggle prop
  className?: string;
  searchPlaceholder?: string;
};

const CountryDropdown = memo(function CountryDropdown({
  label,
  placeholder,
  control,
  name,
  isMultiple = false,
  className,
  searchPlaceholder = "Search country...",
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: countries, isLoading } = useSearchCountry(query);

  return (
    <div className={cn("w-full", className)}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          const handleSelect = (country: Country) => {
            if (isMultiple) {
              const currentValues = Array.isArray(value) ? value : [];
              const isSelected = currentValues.some(
                (c) => c.code === country.code,
              );

              if (isSelected) {
                onChange(currentValues.filter((c) => c.code !== country.code));
              } else {
                onChange([...currentValues, country]);
              }
              // Keep open for multiple selections
            } else {
              // Single select logic
              onChange(value?.code === country.code ? null : country);
              setOpen(false);
            }
          };

          const removeSelected = (e: React.MouseEvent, code: string) => {
            e.stopPropagation();
            if (isMultiple) {
              onChange(value.filter((c: Country) => c.code !== code));
            }
          };

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div className="w-full cursor-pointer relative flex flex-col group">
                  <TextInput
                    control={control}
                    name={name}
                    labelText={label}
                    placeholder={
                      value
                        ? ""
                        : placeholder ||
                          (isMultiple ? "Select countries" : "Select country")
                    }
                    readOnly
                    className="cursor-pointer"
                  />

                  <div className="absolute top-4 left-2 flex items-center gap-1 w-[85%] overflow-hidden">
                    {isMultiple
                      ? Array.isArray(value) &&
                        value.map((c: Country) => (
                          <span
                            key={c.code}
                            className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md flex items-center gap-1 text-[10px] whitespace-nowrap"
                          >
                            {c.code}
                            <X
                              size={12}
                              className="hover:text-red-500 cursor-pointer"
                              onClick={(e) => removeSelected(e, c.code)}
                            />
                          </span>
                        ))
                      : value && (
                          <span className="text-sm font-medium text-slate-900 truncate ml-1">
                            {value.name}
                          </span>
                        )}
                  </div>

                  <ChevronDown className=" absolute right-3 top-4 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </PopoverTrigger>

              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-white shadow-xl"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    value={query}
                    onValueChange={setQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {isLoading ? (
                        <div className="py-6 flex justify-center">
                          <Loader />
                        </div>
                      ) : (
                        countries?.map((country: Country) => {
                          const isSelected = isMultiple
                            ? value?.some(
                                (c: Country) => c.code === country.code,
                              )
                            : value?.code === country.code;

                          return (
                            <CommandItem
                              key={country.code}
                              onSelect={() => handleSelect(country)}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">
                                {country.name} ({country.code})
                              </span>
                              <Check
                                className={cn(
                                  "h-4 w-4 text-primary",
                                  isSelected ? "opacity-100" : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          );
                        })
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          );
        }}
      />
    </div>
  );
});

export default CountryDropdown;
