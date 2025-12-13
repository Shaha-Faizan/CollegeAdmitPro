import StatsCard from '../StatsCard';
import { Users } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard title="Total Applications" value="1,234" icon={Users} />
      <StatsCard title="Pending" value="45" icon={Users} description="+12% from last month" />
      <StatsCard title="Approved" value="892" icon={Users} />
      <StatsCard title="Rejected" value="297" icon={Users} />
    </div>
  );
}
