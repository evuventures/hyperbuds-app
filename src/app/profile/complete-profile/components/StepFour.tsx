import React from 'react';
import { SOCIAL_PLATFORMS } from '@/constants/socials';

interface Step4Props {
  socialLinks: Record<string, string>;
  onUpdateSocials: (platformId: string, value: string) => void;
}

const Step4Socials: React.FC<Step4Props> = ({ socialLinks, onUpdateSocials }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">
          Connect Your Socials
        </h2>
        <p className="text-gray-600">Link your profiles to showcase your work</p>
      </div>

      <div className="space-y-4">
        {SOCIAL_PLATFORMS.map((platform) => (
          <div key={platform.id}>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              {platform.name}
            </label>
            <div className="flex overflow-hidden rounded-xl shadow-sm">
              <span className="inline-flex items-center px-4 text-gray-500 bg-gray-50 border-2 border-r-0 border-gray-200">
                <platform.icon className="w-5 h-5" />
              </span>
              <input
                type="url"
                value={socialLinks[platform.id] || ''}
                onChange={(e) => onUpdateSocials(platform.id, e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder={platform.placeholder}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step4Socials;