import { FaTiktok, FaInstagram, FaYoutube, FaTwitch, FaTwitter } from 'react-icons/fa';

export const SOCIAL_PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, placeholder: 'https://tiktok.com/@username' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, placeholder: 'https://instagram.com/username' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, placeholder: 'https://youtube.com/@username' },
  { id: 'twitch', name: 'Twitch', icon: FaTwitch, placeholder: 'https://twitch.tv/username' },
  { id: 'twitter', name: 'Twitter', icon: FaTwitter, placeholder: 'https://twitter.com/username' },
] as const;