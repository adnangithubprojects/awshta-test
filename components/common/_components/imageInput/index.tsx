import { useEffect, useRef, useState } from "react";

type ImageFileInputProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  className?: string;
  label?: string;
};

const ImageFileInput = ({
  value,
  onChange,
  error,
  className,
  label,
}: ImageFileInputProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => fileRef.current?.click()}
        className={`h-[220px] border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer bg-gray-100 ${className}`}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="max-h-full object-contain"
          />
        ) : (
          <p className="text-gray-500">Click to select {label ?? "image"}</p>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        hidden
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ImageFileInput;
