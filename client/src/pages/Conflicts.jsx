import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  CalendarDays,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "./Conflicts.css";

function Conflicts() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/conflicts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setConflicts(response.data.conflicts || []);
      } catch (error) {
        console.error(
          "Failed to fetch conflicts:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load conflicts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConflicts();
  }, [token]);

  if (user?.role !== "REVIEWER") {
    return (
      <div className="dashboard-layout">
        <Sidebar user={user} onLogout={handleLogout} />

        <main className="conflicts-main">
          <div className="conflicts-empty">
            <div className="conflicts-empty-icon">
              <ShieldAlert size={26} />
            </div>

            <h2>Access restricted</h2>

            <p>
              Conflict declarations are available only to reviewers.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="conflicts-main">
        <header className="conflicts-header">
          <div>
            <p className="section-label">CONFLICTS</p>

            <h1>Conflicts of Interest</h1>

            <p className="conflicts-subtitle">
              Review the applications where you have declared a
              conflict of interest.
            </p>
          </div>

          <div className="conflicts-count">
            <ShieldAlert size={17} />
            <span>
              {conflicts.length}{" "}
              {conflicts.length === 1 ? "Conflict" : "Conflicts"}
            </span>
          </div>
        </header>

        {loading ? (
          <div className="conflicts-empty">
            <div className="conflicts-empty-icon loading-icon">
              <ShieldAlert size={25} />
            </div>

            <h2>Loading conflicts...</h2>

            <p>Fetching your declared conflicts.</p>
          </div>
        ) : error ? (
          <div className="conflicts-empty">
            <div className="conflicts-empty-icon error-icon">
              <ShieldAlert size={25} />
            </div>

            <h2>Unable to load conflicts</h2>

            <p>{error}</p>
          </div>
        ) : conflicts.length === 0 ? (
          <div className="conflicts-empty">
            <div className="conflicts-empty-icon success-icon">
              <CheckCircle2 size={26} />
            </div>

            <h2>No conflicts declared</h2>

            <p>
              You currently have no declared conflicts of interest.
            </p>
          </div>
        ) : (
          <section className="conflicts-section">
            <div className="conflicts-section-header">
              <div>
                <p className="section-label">DECLARED CONFLICTS</p>
                <h2>Your Conflicts</h2>
              </div>

              <span className="conflicts-total">
                {conflicts.length}
              </span>
            </div>

            <div className="conflicts-list">
              {conflicts.map((conflict) => {
                const application = conflict.application;

                return (
                  <article
                    className="conflict-card"
                    key={conflict._id}
                  >
                    <div className="conflict-card-icon">
                      <ShieldAlert size={22} />
                    </div>

                    <div className="conflict-card-content">
                      <div className="conflict-card-top">
                        <div>
                          <p className="conflict-label">
                            APPLICATION
                          </p>

                          <h3>
                            {application?.applicantOrganizationName ||
                              "Application unavailable"}
                          </h3>

                          {application?.contactEmail && (
                            <p className="conflict-email">
                              {application.contactEmail}
                            </p>
                          )}
                        </div>

                        <span className="conflict-status">
                          Declared
                        </span>
                      </div>

                      <div className="conflict-meta">
                        <div className="conflict-meta-item">
                          <FileText size={15} />

                          <div>
                            <span>Funding Round</span>
                            <strong>
                              {application?.fundingRound || "—"}
                            </strong>
                          </div>
                        </div>

                        <div className="conflict-meta-item">
                          <CalendarDays size={15} />

                          <div>
                            <span>Declared On</span>
                            <strong>
                              {conflict.createdAt
                                ? new Date(
                                    conflict.createdAt
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="conflict-reason">
                        <span>Reason for conflict</span>

                        <p>{conflict.reason}</p>
                      </div>

                      {application?._id && (
                        <button
                          className="conflict-view-btn"
                          onClick={() =>
                            navigate(
                              `/applications/${application._id}`
                            )
                          }
                        >
                          View Application
                          <ArrowRight size={15} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Conflicts;
