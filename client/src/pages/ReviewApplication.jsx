import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "./ReviewApplication.css";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

function ReviewApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [application, setApplication] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });
  const [formData, setFormData] = useState({
    impactScore: "",
    feasibilityScore: "",
    budgetJustificationScore: "",
    comments: "",
  });
  const [conflictReason, setConflictReason] = useState("");
  const [conflictDeclared, setConflictDeclared] = useState(false);
  const [declaringConflict, setDeclaringConflict] = useState(false);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/applications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplication(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch application:",
        error.response?.data || error.message,
      );
    }
  };

  const fetchExistingReview = async () => {
    try {
      const response = await api.get(`/reviews/application/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      /*
       * Backend currently returns only COMPLETED reviews.
       * So this will populate the form if this reviewer
       * already has a completed review.
       */
      const reviews = response.data || [];

      const myReview = reviews.find(
        (item) =>
          item.reviewer?._id === user?._id || item.reviewer === user?._id,
      );

      if (myReview) {
        setReview(myReview);

        setFormData({
          impactScore: myReview.impactScore || "",
          feasibilityScore: myReview.feasibilityScore || "",
          budgetJustificationScore: myReview.budgetJustificationScore || "",
          comments: myReview.comments || "",
        });
      }
    } catch (error) {
      console.error(
        "Failed to fetch review:",
        error.response?.data || error.message,
      );
    }
  };
  const showNotification = (type, message) => {
    setNotification({ type, message });

    setTimeout(() => {
      setNotification({ type: "", message: "" });
    }, 3500);
  };
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchApplication(), fetchExistingReview()]);

      setLoading(false);
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.impactScore ||
      !formData.feasibilityScore ||
      !formData.budgetJustificationScore
    ) {
      showNotification("warning", "Please provide all scores.");
      return false;
    }

    if (!formData.comments.trim()) {
      showNotification("warning", "Please provide comments.");
      return false;
    }

    return true;
  };

  const handleDeclareConflict = async () => {
    if (!conflictReason.trim()) {
      showNotification("warning", "Please provide a reason for the conflict.");
      return;
    }

    try {
      setDeclaringConflict(true);

      const response = await api.post(
        `/conflicts/${id}`,
        {
          reason: conflictReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setConflictDeclared(true);
      setConflictReason("");

      showNotification(
        "success",
        response.data.message || "Conflict declared successfully.",
      );
    } catch (error) {
      showNotification(
        "error",
        error.response?.data?.message || "Failed to declare conflict.",
      );
    } finally {
      setDeclaringConflict(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);

      let response;

      if (review?._id) {
        response = await api.patch(`/reviews/${review._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await api.post(`/reviews/application/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setReview(response.data.review);

      showNotification("success", "Review draft saved successfully.");
    } catch (error) {
      showNotification(
        "error",
        error.response?.data?.message || "Failed to save review draft.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteReview = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      let reviewId = review?._id;

      // Create/update draft first
      if (!reviewId) {
        const response = await api.post(
          `/reviews/application/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        reviewId = response.data.review._id;
        setReview(response.data.review);
      } else {
        await api.patch(`/reviews/${reviewId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Complete review
      const response = await api.patch(
        `/reviews/${reviewId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReview(response.data.review);

      showNotification("success", "Review submitted successfully.");

      setTimeout(() => {
        navigate("/reviews");
      }, 1000);
    } catch (error) {
      showNotification(
        "error",
        error.response?.data?.message || "Failed to submit review.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading review...</p>;
  }

  if (!application) {
    return <p>Application not found.</p>;
  }

  if (user?.role !== "REVIEWER") {
    return <p>You are not authorized to review applications.</p>;
  }

  const isCompleted = review?.status === "COMPLETED" || conflictDeclared;

  return (
    <div className="dashboard-layout">
      {notification.message && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === "success" && <CheckCircle size={20} />}
            {notification.type === "error" && <XCircle size={20} />}
            {notification.type === "warning" && <AlertTriangle size={20} />}
          </div>

          <div className="notification-content">
            <strong>
              {notification.type === "success"
                ? "Success"
                : notification.type === "error"
                  ? "Something went wrong"
                  : "Attention"}
            </strong>

            <span>{notification.message}</span>
          </div>

          <button
            className="notification-close"
            onClick={() => setNotification({ type: "", message: "" })}
          >
            ×
          </button>
        </div>
      )}
      <Sidebar
        user={user}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }}
      />

      <main className="review-application-main">
        <button className="back-button" onClick={() => navigate("/reviews")}>
          ← Back to My Reviews
        </button>

        <div className="review-page-header">
          <div>
            <p className="section-label">APPLICATION REVIEW</p>

            <h1>{application.applicantOrganizationName}</h1>

            <p>{application.contactEmail}</p>
          </div>

          <span className={`status-badge ${application.status.toLowerCase()}`}>
            {application.status.replace("_", " ")}
          </span>
        </div>

        {/* Application Summary */}

        <section className="details-card">
          <h2>Application Information</h2>

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
              <span>Status</span>
              <strong>{application.status.replace("_", " ")}</strong>
            </div>
          </div>
        </section>

        {/* Conflict of Interest */}

        <section className="review-conflict-card">
  <div className="review-conflict-header">
    <div className="review-conflict-heading">
      <p className="review-conflict-label">CONFLICT OF INTEREST</p>

      <h2>Declare a Conflict</h2>

      <p>
        If you have a personal, professional, or financial conflict with this
        application, declare it before submitting your review.
      </p>
    </div>

    <div className="review-conflict-icon">
      <AlertTriangle size={21} />
    </div>
  </div>

  {conflictDeclared ? (
    <div className="review-conflict-declared">
      <CheckCircle size={20} />

      <div>
        <strong>Conflict declared</strong>

        <span>
          You have declared a conflict for this application. You can no longer
          submit a review for it.
        </span>
      </div>
    </div>
  ) : (
    <div className="review-conflict-body">
      <div className="review-conflict-field">
        <label htmlFor="conflictReason">Reason for conflict</label>

        <textarea
          id="conflictReason"
          value={conflictReason}
          onChange={(e) => setConflictReason(e.target.value)}
          placeholder="Explain why you have a conflict of interest..."
          rows={4}
        />
      </div>

      <div className="review-conflict-actions">
        <button
          type="button"
          className="review-declare-conflict-btn"
          onClick={handleDeclareConflict}
          disabled={declaringConflict}
        >
          {declaringConflict ? "Declaring..." : "Declare Conflict"}
        </button>
      </div>
    </div>
  )}
</section>

        {/* Review Form */}

        <section className="details-card review-form-card">
          <div className="review-form-header">
            <div>
              <p className="section-label">REVIEW</p>
              <h2>Reviewer Assessment</h2>
            </div>

            {review?.status && (
              <span className={`review-status ${review.status.toLowerCase()}`}>
                {review.status}
              </span>
            )}
          </div>

          <div className="score-grid">
            <div className="score-field">
              <label>Impact</label>

              <select
                name="impactScore"
                value={formData.impactScore}
                onChange={handleChange}
                disabled={isCompleted}
              >
                <option value="">Select score</option>
                <option value="1">1 — Poor</option>
                <option value="2">2 — Below Average</option>
                <option value="3">3 — Average</option>
                <option value="4">4 — Good</option>
                <option value="5">5 — Excellent</option>
              </select>
            </div>

            <div className="score-field">
              <label>Feasibility</label>

              <select
                name="feasibilityScore"
                value={formData.feasibilityScore}
                onChange={handleChange}
                disabled={isCompleted}
              >
                <option value="">Select score</option>
                <option value="1">1 — Poor</option>
                <option value="2">2 — Below Average</option>
                <option value="3">3 — Average</option>
                <option value="4">4 — Good</option>
                <option value="5">5 — Excellent</option>
              </select>
            </div>

            <div className="score-field">
              <label>Budget Justification</label>

              <select
                name="budgetJustificationScore"
                value={formData.budgetJustificationScore}
                onChange={handleChange}
                disabled={isCompleted}
              >
                <option value="">Select score</option>
                <option value="1">1 — Poor</option>
                <option value="2">2 — Below Average</option>
                <option value="3">3 — Average</option>
                <option value="4">4 — Good</option>
                <option value="5">5 — Excellent</option>
              </select>
            </div>
          </div>

          <div className="comments-field">
            <label>Comments</label>

            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              disabled={isCompleted}
              placeholder="Provide your assessment and recommendations..."
              rows="7"
            />
          </div>

          {!isCompleted && (
            <div className="review-actions">
              <button
                type="button"
                className="save-draft-btn"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                className="complete-review-btn"
                onClick={handleCompleteReview}
                disabled={saving}
              >
                {saving ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {isCompleted && (
            <div className="completed-message">
              ✓ This review has been submitted and can no longer be edited.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ReviewApplication;
