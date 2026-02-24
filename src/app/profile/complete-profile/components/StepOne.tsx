import React from 'react';
import Image from 'next/image';
import { FaCamera } from 'react-icons/fa';

interface Step1Props {
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Step1Avatar: React.FC<Step1Props> = ({ previewUrl, handleFileChange }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Add Your Profile Picture
        </h2>
        <p className="text-gray-600">This will be your public profile photo (Max 5MB)</p>
      </div>

      <div className="flex justify-center">
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
      </div>

      <div className="text-center">
        <label 
          htmlFor="file-upload" 
          className="inline-flex gap-2 items-center px-6 py-3 font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105"
        >
          <FaCamera className="w-4 h-4" />
          Choose Photo
        </label>
        <input
          id="file-upload"
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