import DashboardLayout from '../DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardLayoutExample() {
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <h1 className="text-3xl font-medium">Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a sample dashboard content area.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
