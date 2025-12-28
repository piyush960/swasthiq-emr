import { useEffect, useState } from "react";
import { Search, Bell, Users, Calendar, DollarSign, Stethoscope } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import ActiveDoctors from "@/components/dashboard/ActiveDoctors";
// ... import other components (RevenueChart, etc. can remain mock for now if no data exists)
import { appointmentService } from "@/services/appointmentService";
import { format } from "date-fns";
import { Appointment } from "@/types";

const Dashboard = () => {
  const [todayData, setTodayData] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    count: 0,
    activeDoctors: 0,
    revenue: 0
  });

  const loadDashboard = async () => {
    const allData = await appointmentService.getAppointments();
    setAllAppointments(allData);
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todays = allData.filter(a => a.date === todayStr);
    setTodayData(todays);

    const uniqueDocs = new Set(todays.map(a => a.doctorName));
    const estimatedRev = todays.filter(a => a.status !== 'Cancelled').length * 500;

    setStats({
      count: todays.length,
      activeDoctors: uniqueDocs.size,
      revenue: estimatedRev
    });
  };

  useEffect(() => {

    loadDashboard();
  }, []);

  const statsData = [
    {
      title: "Total Patients (Demo)",
      value: "2,543",
      change: 12.5,
      icon: Users,
    },
    {
      title: "Appointments Today",
      value: stats.count.toString(),
      change: 8.2, // This would require historical data to calculate real change
      icon: Calendar,
      iconBgClass: "bg-status-success-bg",
      iconClass: "text-status-success",
    },
    {
      title: "Est. Revenue (Today)",
      value: `₹${stats.revenue}`,
      change: 5.0,
      icon: DollarSign,
      iconBgClass: "bg-status-warning-bg",
      iconClass: "text-status-warning",
    },
    {
      title: "Active Doctors Today",
      value: `${stats.activeDoctors}`,
      change: 0,
      icon: Stethoscope,
      iconBgClass: "bg-status-purple-bg",
      iconClass: "text-status-purple",
    },
  ];

  return (
      <div className="min-h-screen p-6 bg-background">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview for {format(new Date(), "MMM d, yyyy")}</p>
          </div>
          {/* ... Search bar and Bell icon code from original ... */}
        </header>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <QuickActions />
            {/* Pass fetched data to AppointmentsList */}
            <AppointmentsList appointments={allAppointments} onUpdate={loadDashboard} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            {/* Pass fetched data to ActiveDoctors */}
            <ActiveDoctors appointments={todayData} />
          </div>
        </div>
      </div>
  );
};

export default Dashboard;