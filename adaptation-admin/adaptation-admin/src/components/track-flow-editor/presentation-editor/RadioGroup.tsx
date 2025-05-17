import { cn } from '@/lib/utils';
import React from 'react';

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const RadioGroup = ({ 
  value, 
  onValueChange, 
  className, 
  children 
}: RadioGroupProps) => {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

interface RadioGroupItemProps {
  value: string;
  id: string;
}

export const RadioGroupItem = ({ 
  value, 
  id 
}: RadioGroupItemProps) => {
  return (
    <div className="flex items-center space-x-2">
      <input 
        type="radio" 
        id={id} 
        value={value} 
        className="h-4 w-4 text-primary border-muted-foreground focus:ring-primary" 
      />
    </div>
  );
}; 