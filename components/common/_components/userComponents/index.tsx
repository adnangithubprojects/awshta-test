import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, User, Lock } from "lucide-react";
import TextInput from "../textInput";
import { useEffect } from "react";

// --- Validation Schemas ---

export const addressSchema = z.object({
  label: z.string().min(2, "Label is required (e.g., Home, Office)"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  country: z.string().min(2, "Country is required"),
  postal_code: z.string().min(5, "Valid postal code required"),
  is_default: z.boolean(),
});

export const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().min(10, "Valid phone number required"),
});

export const passwordSchema = z
  .object({
    current_password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    new_password: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "New password cannot be the same as the current password",
    path: ["new_password"],
  });

export type TAddressForm = z.infer<typeof addressSchema>;
export type TProfileForm = z.infer<typeof profileSchema>;
export type TPasswordForm = z.infer<typeof passwordSchema>;

// --- Address Form Component ---

export function AddressForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<TAddressForm>;
  onSubmit: (data: TAddressForm) => void;
  isPending: boolean;
}) {
  const { control, handleSubmit } = useForm<TAddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      street: "",
      city: "",
      state: "",
      country: "Pakistan",
      postal_code: "",
      is_default: false,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          name="label"
          control={control}
          label="Address Label"
          placeholder="Home / Office"
          icon={MapPin}
          disabled={isPending}
        />
        <TextInput
          name="street"
          control={control}
          label="Street Address"
          placeholder="123 Main St"
          icon={MapPin}
          disabled={isPending}
        />
        <TextInput
          name="city"
          control={control}
          label="City"
          placeholder="Islamabad"
          icon={MapPin}
          disabled={isPending}
        />
        <TextInput
          name="state"
          control={control}
          label="State / Province"
          placeholder="Punjab"
          icon={MapPin}
          disabled={isPending}
        />
        <TextInput
          name="postal_code"
          control={control}
          label="Postal Code"
          placeholder="44000"
          icon={MapPin}
          disabled={isPending}
        />
        <TextInput
          name="country"
          control={control}
          label="Country"
          placeholder="Pakistan"
          icon={MapPin}
          disabled={isPending}
        />
      </div>
      <Controller
        name="is_default"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              disabled={isPending}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-semibold text-slate-600">
              Set as default delivery address
            </span>
          </label>
        )}
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
      >
        {isPending ? "Saving..." : "Save Address"}
      </button>
    </form>
  );
}

// --- Profile Details Form ---

export function ProfileForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<TProfileForm>;
  onSubmit: (data: TProfileForm) => void;
  isPending: boolean;
}) {
  const { control, handleSubmit, reset } = useForm<TProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || "",
        phone: defaultValues.phone || "",
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <TextInput
        name="name"
        control={control}
        label="Full Name"
        placeholder="John Doe"
        icon={User}
        disabled={isPending}
      />
      <TextInput
        name="phone"
        control={control}
        label="Phone Number"
        placeholder="+92 300 1234567"
        icon={Phone}
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
      >
        {isPending ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
}

// --- Password Update Form ---

export function PasswordForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: TPasswordForm) => void;
  isPending: boolean;
}) {
  const { control, handleSubmit, reset } = useForm<TPasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const submitAndReset = (data: TPasswordForm) => {
    onSubmit(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(submitAndReset)}
      className="space-y-4 max-w-md"
    >
      <TextInput
        name="current_password"
        control={control}
        label="Current Password"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        disabled={isPending}
      />
      <TextInput
        name="new_password"
        control={control}
        label="New Password"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
      >
        {isPending ? "Changing Password..." : "Change Password"}
      </button>
    </form>
  );
}
