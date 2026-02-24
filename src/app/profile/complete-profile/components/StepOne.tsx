import React, { useRef } from 'react';
import Image from 'next/image';
import { FaCamera, FaTimes } from 'react-icons/fa';

interface Step1Props {
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void; // Call this to tell the parent to reset the state
}

const Step1Avatar: React.FC<Step1Props> = ({ previewUrl, handleFileChange, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Physically clear the input
    }
    onClear(); // Clear the state
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Add Your Profile Picture
        </h2>
        <p className="text-gray-600">This will be your public profile photo (Max 5MB)</p>
      </div>

      <div className="flex justify-center">
        <div className="relative group">
          <div className="flex overflow-hidden relative justify-center items-center w-32 h-32 bg-linear-to-r from-purple-100 to-blue-100 rounded-full border-4 border-white shadow-xl transition-all duration-300 hover:scale-105">
            {previewUrl ? (
              <Image 
                src={previewUrl} 
                alt="Profile Preview" 
                className="object-cover w-full h-full"
                fill
                sizes="128px"
              />
            ) : (
              <FaCamera className="w-8 h-8 text-purple-400" />
            )}
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 flex justify-center items-center w-8 h-8 text-white bg-red-500 rounded-full border-2 border-white shadow-md transition-all duration-200 cursor-pointer hover:bg-red-600 hover:scale-110 active:scale-90 z-10"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="text-center">
        <label 
          htmlFor="file-upload" 
          className="inline-flex gap-2 items-center px-6 py-3 font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105"
        >
          <FaCamera className="w-4 h-4" />
          {previewUrl ? 'Change Photo' : 'Choose Photo'}
        </label>
        <input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default Step1Avatar;