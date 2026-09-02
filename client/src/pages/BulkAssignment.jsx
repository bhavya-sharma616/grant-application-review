import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "./BulkAssignment.css";

function BulkAssignment() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [fundingRound, setFundingRound] = useState("");
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [dueDate, setDueDate] = useState("");

  const [loadingReviewers, setLoadingReviewers] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  const fundingRounds = [
    "Spring 2026",
    "Summer 2026",
    "Fall 2026",
  ];

  useEffect(() => {
    if (user?.role !== "PROGRAM_OFFICER") {
      navigate("/dashboard");
      return;
    }

    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    try {
      setLoadingReviewers(true);

      const response = await api.get("/assignments/reviewers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviewers(response.data.reviewers || response.data || []);
    } catch (error) {
      showNotification(
        "error",
        error.response?.data?.message || "Failed to fetch reviewers.",
      );
    } finally {
      setLoadingReviewers(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });

    setTimeout(() => {
      setNotification({ type: "", message: "" });
    }, 3500);
  };

  const handleReviewerChange = (reviewerId) => {
    setSelectedReviewers((current) => {
      if (current.includes(reviewerId)) {
        return current.filter((id) => id !== reviewerId);
      }

      return [...current, reviewerId];
    });
  };

  const handleSelectAll = () => {
    if (selectedReviewers.length === reviewers.length) {
      setSelectedReviewers([]);
    } else {
      setSelectedReviewers(reviewers.map((reviewer) => reviewer._id));
    }
  };

  const handleBulkAssign = async (e) => {
    e.preventDefault();

    if (!fundingRound || selectedReviewers.length === 0 || !dueDate) {
      showNotification(
        "error",
        "Please select a funding round, at least one reviewer, and a due date.",
      );
      return;
    }

    try {
      setAssignmentLoading(true);
      setResults([]);
      setSummary(null);

      const response = await api.post(
        "/assignments/bulk",
        {
          fundingRound,
          reviewerIds: selectedReviewers,
          dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setResults(response.data.results || []);

      const assignmentResults = response.data.results || [];

      const succeeded = assignmentResults.filter(
        (item) => item.status === "SUCCEEDED",
      ).length;

      const refused = assignmentResults.filter(
        (item) => item.status === "REFUSED",
      ).length;

      setSummary({
        applications: response.data.totalApplications || 0,
        attempted: response.data.totalAssignmentsAttempted || 0,
        succeeded,
        refused,
      });

      showNotification(
        "success",
        "Bulk reviewer assignment completed.",
      );
    } catch (error) {
      showNotification(
        "error",
        error.response?.data?.message ||
          "Failed to bulk assign reviewers.",
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!fundingRound) {
      showNotification(
        "error",
        "Please select a funding round before exporting.",
      );
      return;
    }

    try {
      setExportLoading(true);

      const response = await api.get(
        `/reviews/export/${encodeURIComponent(fundingRound)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${fundingRound
        .toLowerCase()
        .replace(/\s+/g, "-")}-completed-reviews.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      showNotification(
        "success",
        "Completed reviews exported successfully.",
      );
    } catch (error) {
      showNotification(
        "error",
        "Failed to export completed reviews.",
      );
    } finally {
      setExportLoading(false);
    }
  };

  const getReviewerName = (reviewerId) => {
    const reviewer = reviewers.find(
      (item) => item._id === reviewerId,
    );

    return reviewer?.name || reviewerId;
  };

  const getApplicationName = (applicationId) => {
    return applicationId || "Unknown Application";
  };

  if (user?.role !== "PROGRAM_OFFICER") {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }} />

      <main className="bulk-assignment-main">
        {notification.message && (
          <div className={`bulk-notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <button
          className="bulk-back-button"
          onClick={() => navigate("/applications")}
        >
          ← Back to Applications
        </button>

        <div className="bulk-header">
          <div>
            <p className="section-label">REVIEW MANAGEMENT</p>
            <h1>Bulk Reviewer Assignment</h1>
            <p>
              Assign selected reviewers to every application in a
              funding round.
            </p>
          </div>
        </div>

        <section className="bulk-card">
          <div className="bulk-card-header">
            <div>
              <p className="section-label">BULK ASSIGNMENT</p>
              <h2>Assign Reviewers</h2>
            </div>
          </div>

          <form onSubmit={handleBulkAssign}>
            <div className="bulk-form-group">
              <label>Funding Round</label>

              <select
                value={fundingRound}
                onChange={(e) => setFundingRound(e.target.value)}
                required
              >
                <option value="">Select funding round</option>

                {fundingRounds.map((round) => (
                  <option key={round} value={round}>
                    {round}
                  </option>
                ))}
              </select>
            </div>

            <div className="bulk-form-group">
              <div className="reviewer-selection-header">
                <label>Reviewers</label>

                {reviewers.length > 0 && (
                  <button
                    type="button"
                    className="select-all-button"
                    onClick={handleSelectAll}
                  >
                    {selectedReviewers.length === reviewers.length
                      ? "Clear All"
                      : "Select All"}
                  </button>
                )}
              </div>

              {loadingReviewers ? (
                <p className="bulk-empty">
                  Loading reviewers...
                </p>
              ) : reviewers.length === 0 ? (
                <p className="bulk-empty">
                  No reviewers available.
                </p>
              ) : (
                <div className="reviewer-checkbox-list">
                  {reviewers.map((reviewer) => (
                    <label
                      className="reviewer-checkbox"
                      key={reviewer._id}
                    >
                      <input
                        type="checkbox"
                        checked={selectedReviewers.includes(
                          reviewer._id,
                        )}
                        onChange={() =>
                          handleReviewerChange(reviewer._id)
                        }
                      />

                      <span>
                        <strong>{reviewer.name}</strong>
                        <small>{reviewer.email}</small>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <span className="selection-count">
                {selectedReviewers.length} reviewer
                {selectedReviewers.length === 1 ? "" : "s"} selected
              </span>
            </div>

            <div className="bulk-form-group">
              <label>Review Due Date</label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="bulk-actions">
              <button
                type="button"
                className="bulk-cancel-button"
                onClick={() => navigate("/applications")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bulk-submit-button"
                disabled={assignmentLoading}
              >
                {assignmentLoading
                  ? "Assigning..."
                  : "Assign Reviewers"}
              </button>
            </div>
          </form>
        </section>

        <section className="bulk-card export-card">
          <div>
            <p className="section-label">REPORTING</p>
            <h2>Export Completed Reviews</h2>

            <p>
              Export every completed review for the selected funding
              round as a CSV file.
            </p>
          </div>

          <button
            type="button"
            className="export-csv-button"
            onClick={handleExportCSV}
            disabled={!fundingRound || exportLoading}
          >
            {exportLoading
              ? "Exporting..."
              : "Export Completed Reviews CSV"}
          </button>
        </section>

        {summary && (
          <section className="bulk-card results-card">
            <div className="bulk-card-header">
              <div>
                <p className="section-label">ASSIGNMENT RESULTS</p>
                <h2>Bulk Assignment Report</h2>
              </div>
            </div>

            <div className="result-summary">
              <div>
                <span>Applications</span>
                <strong>{summary.applications}</strong>
              </div>

              <div>
                <span>Attempted</span>
                <strong>{summary.attempted}</strong>
              </div>

              <div>
                <span>Succeeded</span>
                <strong>{summary.succeeded}</strong>
              </div>

              <div>
                <span>Refused</span>
                <strong>{summary.refused}</strong>
              </div>
            </div>

            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Reviewer</th>
                    <th>Result</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.assignmentId || `${result.applicationId}-${result.reviewerId}-${index}`}>
                      <td>
                        {getApplicationName(result.applicationId)}
                      </td>

                      <td>
                        {getReviewerName(result.reviewerId)}
                      </td>

                      <td>
                        <span
                          className={`result-badge ${
                            result.status === "SUCCEEDED"
                              ? "succeeded"
                              : "refused"
                          }`}
                        >
                          {result.status}
                        </span>
                      </td>

                      <td>
                        {result.reason || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default BulkAssignment;