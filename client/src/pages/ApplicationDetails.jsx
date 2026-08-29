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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get(`/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setApplication(response.data);
        setFormData({
          applicantOrganizationName: response.data.applicantOrganizationName,
          contactEmail: response.data.contactEmail,
          fundingRound: response.data.fundingRound,
          amountRequested:
            response.data.amountRequested?.$numberDecimal ||
            response.data.amountRequested,
          submissionDate: response.data.submissionDate
            ? response.data.submissionDate.split("T")[0]
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

    fetchApplication();
  }, [id]);

  if (loading) {
    return <p>Loading application...</p>;
  }

  if (!application) {
    return <p>Application not found.</p>;
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateApplication = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await api.patch(`/applications/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplication(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error(
        "Failed to update application:",
        error.response?.data || error.message,
      );
    }
  };
  const handleArchive = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to archive this application?",
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

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
      console.error(
        "Failed to archive application:",
        error.response?.data || error.message,
      );
    }
  };
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

        <div className="details-header">
          <div>
            <p className="section-label">APPLICATION DETAILS</p>

            <h1>{application.applicantOrganizationName}</h1>

            <p>{application.contactEmail}</p>
          </div>

          <span className={`status-badge ${application.status.toLowerCase()}`}>
            {application.status.replace("_", " ")}
          </span>
        </div>

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
