import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "./MyReviews.css";

function MyReviews() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchMyAssignments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/assignments/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

setAssignments(response.data.assignments || response.data || []);    } catch (error) {
      console.error(
        "Failed to fetch assignments:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "REVIEWER") {
      fetchMyAssignments();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar user={user} onLogout={handleLogout} />

        <main className="my-reviews-main">
          <p>Loading reviews...</p>
        </main>
      </div>
    );
  }

  if (user?.role !== "REVIEWER") {
    return (
      <div className="dashboard-layout">
        <Sidebar user={user} onLogout={handleLogout} />

        <main className="my-reviews-main">
          <div className="empty-reviews">
            <h2>Access Restricted</h2>
            <p>Only reviewers can access My Reviews.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="my-reviews-main">
        <div className="my-reviews-header">
          <div>
            <p className="section-label">REVIEW WORKSPACE</p>

            <h1>My Reviews</h1>

            <p className="my-reviews-subtitle">
              Applications assigned to you for review.
            </p>
          </div>

          <div className="review-count-badge">
            {assignments.length}{" "}
            {assignments.length === 1 ? "Application" : "Applications"}
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="empty-reviews">
            <div className="empty-reviews-icon">✓</div>

            <h2>No reviews assigned</h2>

            <p>
              You currently don't have any applications assigned for review.
            </p>
          </div>
        ) : (
          <div className="review-list">
            {assignments.map((assignment) => {
              const application = assignment.application;

              if (!application) {
                return null;
              }

              return (
                <div className="review-card" key={assignment._id}>
                  <div className="review-card-top">
                    <div>
                      <p className="application-label">APPLICATION</p>

                      <h2>
                        {application.applicantOrganizationName ||
                          "Unnamed Application"}
                      </h2>

                      <p className="application-email">
                        {application.contactEmail || "No email available"}
                      </p>
                    </div>

                    <span
                      className={`status-badge ${
                        application.status?.toLowerCase() || ""
                      }`}
                    >
                      {application.status
                        ? application.status.replace("_", " ")
                        : "ASSIGNED"}
                    </span>
                  </div>

                  <div className="review-card-details">
                    <div>
                      <span>Funding Round</span>

                      <strong>
                        {application.fundingRound || "Not available"}
                      </strong>
                    </div>

                    <div>
                      <span>Amount Requested</span>

                      <strong>
                        ₹
                        {Number(
                          application.amountRequested?.$numberDecimal ||
                            application.amountRequested ||
                            0,
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span>Review Due Date</span>

                      <strong>
                        {assignment.dueDate
                          ? new Date(assignment.dueDate).toLocaleDateString(
                              "en-IN",
                            )
                          : "No due date"}
                      </strong>
                    </div>
                  </div>

                  <div className="review-card-footer">
                    <div className="assignment-info">
                      <span className="active-dot"></span>
                      <span>Assigned to you</span>
                    </div>

                    <button
                      className="review-application-btn"
                      onClick={() => navigate(`/reviews/${application._id}`)}
                    >
                      Review Application →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyReviews;
