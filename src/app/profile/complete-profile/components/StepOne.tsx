import React, { useRef } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';

interface Step1Props {
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

const Step1Avatar: React.FC<Step1Props> = ({ previewUrl, handleFileChange, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  return (
    <div className="space-y-7 text-center">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Add Your Profile Picture
        </h2>
        <p className="mt-2.5 text-base text-gray-500">
          Choose a clean photo so creators recognize you at a glance.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative group">
          <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-purple-50 to-indigo-100 shadow-lg ring-1 ring-purple-100 transition-transform duration-300 group-hover:scale-[1.02]">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile Preview"
                className="h-full w-full object-cover"
                fill
                sizes="144px"
              />
            ) : (
              <Camera className="h-10 w-10 text-purple-500" />
            )}
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove profile photo"
              className="absolute -right-1 -top-1 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-rose-500 text-white shadow-md transition hover:scale-105 hover:bg-rose-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="file-upload"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-6 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
        >
          <Camera className="h-4 w-4" />
          <span>{previewUrl ? 'Change Photo' : 'Choose Photo'}</span>
        </label>
        <input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="mt-2 text-xs text-gray-400">PNG, JPG up to 5MB</p>
      </div>
    </div>
  );
};

export default Step1Avatar;
