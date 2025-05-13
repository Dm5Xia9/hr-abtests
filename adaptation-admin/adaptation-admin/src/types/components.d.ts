import { Employee } from ".";

declare module '@/components/mentees-table' {
  export interface MenteesTableProps {
    mentees: Employee[];
    onSelect: (employeeId: string) => void;
  }
  
  export function MenteesTable(props: MenteesTableProps): JSX.Element;
}

declare module '@/components/mentee-details' {
  export interface MenteeDetailsProps {
    employee: Employee;
  }
  
  export function MenteeDetails(props: MenteeDetailsProps): JSX.Element;
}

declare module '@/components/ui/alert' {
  export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive';
  }
  
  export const Alert: React.ForwardRefExoticComponent<AlertProps>;
  export const AlertTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement>>;
  export const AlertDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement>>;
} 