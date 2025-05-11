import { Presentation as PresentationIcon, ClipboardList } from 'lucide-react';

interface IconProps {
  className?: string;
}

export function Presentation({ className }: IconProps) {
  return <PresentationIcon className={className} />;
}

export function Task({ className }: IconProps) {
  return <ClipboardList className={className} />;
} 