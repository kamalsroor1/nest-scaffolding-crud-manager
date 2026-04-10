import { useState } from 'react';

/**
 * Mock toast hook (shadcn/ui toast wrapper).
 * In a real shadcn/ui setup, this would use the 'toast' function from @/components/ui/use-toast.
 */
export function useToast() {
  const [toasts, setToasts] = useState<any[]>([]);

  const toast = ({ title, description, variant = 'default' }: any) => {
    console.log(`TOAST [${variant}]: ${title} - ${description}`);
    // Real implementation would add to state and trigger UI
  };

  toast.success = (message: string) => toast({ title: 'Success', description: message, variant: 'success' });
  toast.error = (message: string) => toast({ title: 'Error', description: message, variant: 'destructive' });

  return { toast, toasts };
}
