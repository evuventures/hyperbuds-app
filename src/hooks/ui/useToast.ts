// src/hooks/ui/useToast.ts
import { toast as sonnerToast } from "sonner";

// Custom type for what we want to support in our app
export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive"; // add more if you want
  duration?: number;
}

export const useToast = () => {
  const toast = (options: ToastOptions) => {
    return sonnerToast(options.title, {
      description: options.description,
      duration: options.duration,
      // you can map `variant` to styling if needed
    });
  };

  return { toast };
};
