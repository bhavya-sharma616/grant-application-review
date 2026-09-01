import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  UserCheck,
  Clock3,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "./Alerts.css";

function Alerts() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);

        const response = await api.get("/alerts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistory(response.data.alerts || []);
      } catch (error) {
        console.error(
          "Failed to fetch alerts:",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [token]);

  const getAlertIcon = () => {
    return <AlertCircle size={20} />;
  };

  const getAlertTitle = () => {
    return "Assignment overdue";
  };

  const getAlertDescription = (item) => {
    const applicationName =
      item.assignment?.application?.applicantOrganizationName || "Application";

    const reviewerName = item.assignment?.reviewer?.name || "Assigned reviewer";

    return `The review assigned to ${reviewerName} for ${applicationName} is overdue.`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="alerts-main">
        <div className="alerts-header">
          <div>
            <p className="section-label">NOTIFICATIONS</p>

            <h1>Alerts</h1>

            <p className="alerts-subtitle">
              Stay updated with the latest application activity.
            </p>
          </div>

          <div className="alerts-count">
            <Bell size={17} />
            <span>{history.length} Updates</span>
          </div>
        </div>

        {loading ? (
          <div className="alerts-empty">
            <div className="alerts-empty-icon">
              <Clock3 size={25} />
            </div>

            <h2>Loading alerts...</h2>

            <p>Fetching your latest application activity.</p>
          </div>
        ) : history.length === 0 ? (
          <div className="alerts-empty">
            <div className="alerts-empty-icon">
              <CheckCircle2 size={26} />
            </div>

            <h2>You're all caught up</h2>

            <p>There are no new application updates to show right now.</p>
          </div>
        ) : (
          <div className="alerts-list">
            {history.map((item) => (
              <div className="alert-card" key={item._id}>
                <div className="alert-icon">{getAlertIcon(item.action)}</div>

                <div className="alert-content">
                  <div className="alert-top-row">
                    <div>
                      <h3>{getAlertTitle(item)}</h3>

                      <p>{getAlertDescription(item)}</p>
                    </div>

                    <span className="alert-time">
                      {item.assignment?.dueDate
                        ? `Due ${new Date(
                            item.assignment.dueDate,
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`
                        : ""}
                    </span>
                  </div>

                  {item.assignment?.application?._id && (
                    <button
                      className="alert-view-btn"
                      onClick={() =>
                        navigate(
                          `/applications/${item.assignment.application._id}`,
                        )
                      }
                    >
                      View Application
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Alerts;
