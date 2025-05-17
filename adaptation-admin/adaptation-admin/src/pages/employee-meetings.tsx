import { EmployeeMeetings } from "@/components/track-progress";
import { MobileLayout } from "@/components/mobile-layout";

export default function EmployeeMeetingsPage() {
  return (
    <MobileLayout title="Мои встречи">
      <div className="container py-4">
        <EmployeeMeetings />
      </div>
    </MobileLayout>
  );
} 