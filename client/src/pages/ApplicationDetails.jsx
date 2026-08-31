import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "./ApplicationDetails.css";

function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    applicantOrganizationName: "",
    contactEmail: "",
    fundingRound: "",
    amountRequested: "",
    submissionDate: "",
  });

  const [statusLoading, setStatusLoading] = useState(false);

  const [reviewers, setReviewers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [history, setHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(true);
  const [reviewerId, setReviewerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [reviewerLoading, setReviewerLoading] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState("");
  const [completedReviews, setCompletedReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fetch application
  const fetchApplication = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/applications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setApplication(data);

      setFormData({
        applicantOrganizationName: data.applicantOrganizationName || "",
        contactEmail: data.contactEmail || "",
        fundingRound: data.fundingRound || "",
        amountRequested:
          data.amountRequested?.$numberDecimal || data.amountRequested || "",
        submissionDate: data.submissionDate
          ? data.submissionDate.split("T")[0]
          : "",
      });
    } catch (error) {
      console.error(
        "Failed to fetch application:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/assignments/application/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error(
        "Failed to fetch assignments:",
        error.response?.data || error.message,
      );
    }
  };

const fetchApplicationHistory = async () => {
  try {
    setHistoryLoading(true);

    const response = await api.get(`/history/application/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setHistory(response.data || []);
  } catch (error) {
    console.error(
      "Failed to fetch application history:",
      error.response?.data || error.message
    );
  } finally {
    setHistoryLoading(false);
  }
};

  // Fetch reviewers
  const fetchReviewers = async () => {
    if (user?.role !== "PROGRAM_OFFICER") return;

    try {
      setReviewerLoading(true);

      const response = await api.get("/assignments/reviewers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviewers(response.data.reviewers || response.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch reviewers:",
        error.response?.data || error.message,
      );
    } finally {
      setReviewerLoading(false);
    }
  };

  const fetchCompletedReviews = async () => {
    try {
      setReviewsLoading(true);

      const response = await api.get(`/reviews/application/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCompletedReviews(response.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch completed reviews:",
        error.response?.data || error.message,
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
    fetchReviewers();
    fetchAssignments();
    fetchCompletedReviews();
    fetchApplicationHistory();
  }, [id]);

  // Update application status
  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);

      const response = await api.patch(
        `/applications/${id}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setApplication(response.data.application);
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to update application status.",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // Form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Update application
  const handleUpdateApplication = async (e) => {
    e.preventDefault();

    try {
      const response = await api.patch(`/applications/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplication(response.data);
      setIsEditing(false);

      alert("Application updated successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update application.");
    }
  };

  // Archive application
  const handleArchive = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to archive this application?",
    );

    if (!confirmed) return;

    try {
      await api.patch(
        `/applications/${id}/archive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/applications");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to archive application.");
    }
  };

  // Assign reviewer
  const handleAssignReviewer = async (e) => {
    e.preventDefault();

    if (!reviewerId || !dueDate) {
      alert("Please select a reviewer and due date.");
      return;
    }

    try {
      setAssignmentLoading(true);

      await api.post(
        `/assignments/application/${id}`,
        {
          reviewerId,
          dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAssignmentSuccess("Reviewer assigned successfully.");
      setReviewerId("");
      setDueDate("");

      await fetchApplication();
      await fetchAssignments();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to assign reviewer.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  if (loading) {
    return <p>Loading application...</p>;
  }

  if (!application) {
    return <p>Application not found.</p>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="application-details-main">
        <button
          className="back-button"
          onClick={() => navigate("/applications")}
        >
          ← Back to Applications
        </button>

        {/* Header */}
        <div className="details-header">
          <div>
            <p className="section-label">APPLICATION DETAILS</p>

            <h1>{application.applicantOrganizationName}</h1>

            <p>{application.contactEmail}</p>
          </div>

          <div className="header-actions">
            <span
              className={`status-badge ${application.status.toLowerCase()}`}
            >
              {application.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Application Information */}
        <section className="details-card">
          <div className="card-title-row">
            <div className="card-title-left">
              <h2>Application Information</h2>

              {user?.role === "PROGRAM_OFFICER" && (
                <button
                  className="edit-text-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit →
                </button>
              )}
            </div>

            {user?.role === "PROGRAM_OFFICER" && (
              <button className="archive-text-btn" onClick={handleArchive}>
                Archive
              </button>
            )}
            {user?.role === "REVIEWER" && (
              <button
                className="review-application-btn"
                onClick={() => navigate(`/reviews/${id}`)}
              >
                Review Application →
              </button>
            )}
          </div>

          <div className="details-grid">
            <div>
              <span>Funding Round</span>
              <strong>{application.fundingRound}</strong>
            </div>

            <div>
              <span>Amount Requested</span>
              <strong>
                ₹
                {Number(
                  application.amountRequested?.$numberDecimal ||
                    application.amountRequested,
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Submission Date</span>
              <strong>
                {new Date(application.submissionDate).toLocaleDateString(
                  "en-IN",
                )}
              </strong>
            </div>

            <div>
              <span>Current Status</span>
              <strong>{application.status.replace("_", " ")}</strong>
            </div>
          </div>
        </section>

        {/* Ownership */}
        <section className="details-card">
          <h2>Ownership</h2>

          <div className="details-grid">
            <div>
              <span>Program Officer</span>
              <strong>{application.owner?.name || "Not available"}</strong>
            </div>

            <div>
              <span>Officer Email</span>
              <strong>{application.owner?.email || "Not available"}</strong>
            </div>
          </div>
        </section>

        {/* Reviewer Assignment */}

        {user?.role === "PROGRAM_OFFICER" &&
          application.status === "SUBMITTED" &&
          assignments.length === 0 && (
            <section className="details-card review-management-card">
              <div className="review-card-header">
                <div>
                  <p className="section-label">REVIEW MANAGEMENT</p>
                  <h2>Assign Reviewer</h2>
                </div>
              </div>
              {assignmentSuccess && (
                <div className="assignment-success">✓ {assignmentSuccess}</div>
              )}
              <form className="review-form" onSubmit={handleAssignReviewer}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Reviewer</label>

                    <select
                      value={reviewerId}
                      onChange={(e) => setReviewerId(e.target.value)}
                      required
                    >
                      <option value="">Select a reviewer</option>

                      {reviewers.map((reviewer) => (
                        <option key={reviewer._id} value={reviewer._id}>
                          {reviewer.name} — {reviewer.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Review Due Date</label>

                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="assign-button-wrapper">
                  <button
                    type="submit"
                    className="assign-reviewer-btn"
                    disabled={assignmentLoading}
                  >
                    {assignmentLoading ? "Assigning..." : "Assign Reviewer"}
                  </button>
                </div>
              </form>
            </section>
          )}

        {/* Reviewers & Completed Reviews - Program Officer only */}

        {user?.role === "PROGRAM_OFFICER" && (
          <>
            {/* Active Reviewers */}
            {assignments.length > 0 && (
              <section className="details-card assignments-card">
                <div className="review-card-header">
                  <div>
                    <p className="section-label">REVIEWERS</p>
                    <h2>Assigned Reviewers</h2>
                  </div>

                  <span className="reviewer-count">{assignments.length}</span>
                </div>

                <div className="assignments-list">
                  {assignments.map((assignment) => (
                    <div className="assignment-item" key={assignment._id}>
                      <div className="assignment-reviewer">
                        <strong>
                          {assignment.reviewer?.name || "Unknown Reviewer"}
                        </strong>

                        <span>
                          {assignment.reviewer?.email || "No email available"}
                        </span>
                      </div>

                      <div className="assignment-due-date">
                        <span>Due date</span>

                        <strong>
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "No due date"}
                        </strong>
                      </div>

                      <span className="assignment-status active">Active</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Reviews */}
            {completedReviews.length > 0 && (
              <section className="details-card completed-reviews-card">
                <div className="review-card-header">
                  <div>
                    <p className="section-label">REVIEW RESULTS</p>
                    <h2>Completed Reviews</h2>
                  </div>

                  <span className="reviewer-count">
                    {completedReviews.length}
                  </span>
                </div>

                <div className="completed-reviews-list">
                  {completedReviews.map((review) => (
                    <div className="completed-review-item" key={review._id}>
                      <div className="completed-review-header">
                        <div>
                          <strong>
                            {review.reviewer?.name || "Unknown Reviewer"}
                          </strong>

                          <span>Completed Review</span>
                        </div>

                        <span className="review-completed-badge">
                          Completed
                        </span>
                      </div>

                      <div className="review-scores">
                        <div>
                          <span>Impact</span>
                          <strong>{review.impactScore}/5</strong>
                        </div>

                        <div>
                          <span>Feasibility</span>
                          <strong>{review.feasibilityScore}/5</strong>
                        </div>

                        <div>
                          <span>Budget Justification</span>
                          <strong>{review.budgetJustificationScore}/5</strong>
                        </div>
                      </div>

                      <div className="review-comments">
                        <span>Comments</span>
                        <p>{review.comments}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

{/* Application History */}
{user?.role === "PROGRAM_OFFICER" && (
  <section className="details-card application-history-card">
    <div className="review-card-header">
      <div>
        <p className="section-label">AUDIT TRAIL</p>
        <h2>Application History</h2>
      </div>
    </div>

    {historyLoading ? (
      <p className="history-empty">Loading history...</p>
    ) : history.length === 0 ? (
      <p className="history-empty">No history available.</p>
    ) : (
      <div className="history-list">
        {history.map((item) => (
          <div className="history-item" key={item._id}>
            <div className="history-icon">
              ✓
            </div>

            <div className="history-content">
              <strong>
                {item.action
                  ?.replaceAll("_", " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </strong>

              <p>
                {item.performedBy?.name || "System"}
                {item.reviewer?.name &&
                  item.action === "REVIEWER_ASSIGNED" &&
                  ` assigned ${item.reviewer.name}`}
              </p>

              {item.comment && (
                <span className="history-comment">
                  {item.comment}
                </span>
              )}
            </div>

            <div className="history-time">
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Date unavailable"}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)}

{/* Edit Modal */}

        {/* Edit Modal */}
        {isEditing && (
          <div className="modal-overlay">
            <div className="application-modal">
              <div className="modal-header">
                <div>
                  <p className="section-label">EDIT APPLICATION</p>

                  <h2>Update Application</h2>
                </div>

                <button
                  className="close-modal-btn"
                  onClick={() => setIsEditing(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateApplication}>
                <div className="form-group">
                  <label>Organization Name</label>

                  <input
                    type="text"
                    name="applicantOrganizationName"
                    value={formData.applicantOrganizationName}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>

                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Funding Round</label>

                    <input
                      type="text"
                      name="fundingRound"
                      value={formData.fundingRound}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Amount Requested</label>

                    <input
                      type="number"
                      name="amountRequested"
                      value={formData.amountRequested}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Submission Date</label>

                  <input
                    type="date"
                    name="submissionDate"
                    value={formData.submissionDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="submit-application-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ApplicationDetails;
