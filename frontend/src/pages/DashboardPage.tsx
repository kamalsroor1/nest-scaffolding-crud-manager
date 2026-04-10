import { Rocket, Server, Database, Activity } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

/**
 * Placeholder dashboard page showing system status overview.
 */
const DashboardPage = () => {
  const stats = [
    { name: 'API Status', value: 'Online', icon: Server, color: 'text-green-500' },
    { name: 'Database', value: 'Connected', icon: Database, color: 'text-blue-500' },
    { name: 'Request ID', value: 'Trace Enabled', icon: Activity, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Overview of your project foundation and system status.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          <Rocket size={16} />
          <span>Launch Generator</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-card border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.name}</h3>
              <stat.icon className={stat.color} size={20} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="p-12 bg-card border rounded-lg shadow-sm flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-muted rounded-full">
          <LoadingSpinner size={48} />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Boilerplate Initialized</h2>
          <p className="text-muted-foreground max-w-md mx-auto mt-2">
            The foundation is ready for backend logic and frontend features. 
            Unit and E2E tests are ensuring stability in the baseline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
