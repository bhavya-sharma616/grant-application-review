import Sidebar from "../components/Sidebar";
import {
  FileText,
  Clock3,
  CircleCheck,
  IndianRupee,
  BarChart3,
} from "lucide-react";
import "./Dashboard.css";
import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setDashboard(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  const stats = [
    {
      title: "Open Applications",
      value: "12",
      description: "Currently active applications",
      icon: FileText,
    },
    {
      title: "Overdue Reviews",
      value: "3",
      description: "Reviews past their due date",
      icon: Clock3,
    },
    {
      title: "Ready for Decision",
      value: "2",
      description: "Applications with 3+ reviews",
      icon: CircleCheck,
    },
    {
      title: "Amount Requested",
      value: "₹8.4L",
      description: "Submitted this month",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">OVERVIEW</p>
            <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your grant applications.
            </p>
          </div>

          <div className="header-date">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>

        <section className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="stat-card" key={stat.title}>
                <div className="stat-card-top">
                  <span>{stat.title}</span>

                  <div className="stat-icon">
                    <Icon size={21} />
                  </div>
                </div>

                <h2>{stat.value}</h2>
                <p>{stat.description}</p>
              </div>
            );
          })}
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="section-label">APPLICATIONS</p>
              <h2>Applications by Status</h2>
            </div>
          </div>

          <div className="status-grid">
            {["SUBMITTED", "ASSIGNED", "UNDER_REVIEW", "DECIDED"].map(
              (status) => {
                const item = dashboard.byStatus.find(
                  (entry) => entry._id === status,
                );

                const labels = {
                  SUBMITTED: "Submitted",
                  ASSIGNED: "Assigned",
                  UNDER_REVIEW: "Under Review",
                  DECIDED: "Decided",
                };

                return (
                  <div className="status-item" key={status}>
                    <span
                      className={`status-dot ${status.toLowerCase()}`}
                    ></span>

                    <div>
                      <strong>{labels[status]}</strong>
                      <p>{item?.count || 0} applications</p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>

        <section className="dashboard-lower-grid">
          {/* Funding Rounds */}
          <div className="dashboard-section">
            <div className="section-heading">
              <div>
                <p className="section-label">FUNDING ROUNDS</p>
                <h2>Applications by Funding Round</h2>
              </div>
            </div>

            <div className="round-list">
              {dashboard.byFundingRound.map((round) => {
                const maxCount = Math.max(
                  ...dashboard.byFundingRound.map((item) => item.count),
                );

                const percentage = (round.count / maxCount) * 100;

                return (
                  <div className="round-item" key={round._id}>
                    <div className="round-info">
                      <span>{round._id}</span>
                      <strong>{round.count} applications</strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decisions Chart */}
          <div className="dashboard-section">
            <div className="section-heading">
              <div>
                <p className="section-label">ACTIVITY</p>
                <h2>Decisions per Week</h2>
              </div>

              <BarChart3 size={20} className="chart-heading-icon" />
            </div>

            <div className="chart-placeholder">
              <div className="bar-chart">
                <div className="chart-bar-group">
                  <div className="chart-bar" style={{ height: "25%" }}></div>
                  <span>W1</span>
                </div>

                <div className="chart-bar-group">
                  <div className="chart-bar" style={{ height: "45%" }}></div>
                  <span>W2</span>
                </div>

                <div className="chart-bar-group">
                  <div className="chart-bar" style={{ height: "30%" }}></div>
                  <span>W3</span>
                </div>

                <div className="chart-bar-group">
                  <div className="chart-bar" style={{ height: "70%" }}></div>
                  <span>W4</span>
                </div>

                <div className="chart-bar-group">
                  <div className="chart-bar" style={{ height: "55%" }}></div>
                  <span>W5</span>
                </div>

                <div className="chart-bar-group">
                  <div className="chart-bar" style={{ height: "85%" }}></div>
                  <span>W6</span>
                </div>

                <div className="chart-bar-group">
                  <div className="chart-bar" style={{ height: "40%" }}></div>
                  <span>W7</span>
                </div>

                <div className="chart-bar-group">
                  <div className="chart-bar" style={{ height: "65%" }}></div>
                  <span>W8</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
