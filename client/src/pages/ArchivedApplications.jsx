import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "./Applications.css";

function ArchivedApplications() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchArchivedApplications = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.get("/applications", {
        params: {
          archived: true,
          page: 1,
          limit: 50,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(response.data.applications);
    } catch (error) {
      console.error(
        "Failed to fetch archived applications:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedApplications();
  }, []);

  const handleRestore = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/applications/${id}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchArchivedApplications();
    } catch (error) {
      console.error(
        "Failed to restore application:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="applications-main">
        <div className="applications-header">
          <div>
            <p className="section-label">ARCHIVED APPLICATIONS</p>

            <h1>Archived Applications</h1>

            <p>
              Applications that have been archived can be restored when needed.
            </p>
          </div>
        </div>

        <section className="applications-table-card">
          <div className="table-header">
            <div>
              <h2>Archived Applications</h2>

              <p>
                {applications.length} archived application
                {applications.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Funding Round</th>
                  <th>Amount Requested</th>
                  <th>Status</th>
                  <th>Archived Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="table-message">
                      Loading archived applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-message">
                      No archived applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application._id}>
                      <td>
                        <div className="organization-cell">
                          <strong>
                            {application.applicantOrganizationName}
                          </strong>

                          <span>{application.contactEmail}</span>
                        </div>
                      </td>

                      <td>{application.fundingRound}</td>

                      <td className="amount-cell">
                        ₹
                        {Number(
                          application.amountRequested?.$numberDecimal ||
                            application.amountRequested
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${application.status.toLowerCase()}`}
                        >
                          {application.status.replace("_", " ")}
                        </span>
                      </td>

                      <td>
                        {application.archivedAt
                          ? new Date(
                              application.archivedAt
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td>
                        <button
                          className="restore-btn"
                          onClick={() => handleRestore(application._id)}
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ArchivedApplications;