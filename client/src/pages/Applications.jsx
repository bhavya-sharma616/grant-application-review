import Sidebar from "../components/Sidebar";
import "./Applications.css";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Applications() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [fundingRound, setFundingRound] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("submissionDate");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    applicantOrganizationName: "",
    contactEmail: "",
    fundingRound: "",
    amountRequested: "",
    submissionDate: "",
  });

  const [owner, setOwner] = useState("");
  const [programOfficers, setProgramOfficers] = useState([]);
  const [overdue, setOverdue] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.get("/applications", {
        params: {
          search,
          fundingRound,
          status,
          owner,
          overdue: overdue ? "true" : "false",
          sortBy,
          order,
          page,
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(response.data.applications);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(
        "Failed to fetch applications:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramOfficers = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/users/program-officers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setProgramOfficers(
      Array.isArray(response.data) ? response.data : []
    );
  } catch (error) {
    console.error(
      "Failed to fetch program officers:",
      error.response?.data || error.message,
    );

    setProgramOfficers([]);
  }
};

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await api.post("/applications", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowCreateModal(false);

      setFormData({
        applicantOrganizationName: "",
        contactEmail: "",
        fundingRound: "",
        amountRequested: "",
        submissionDate: "",
      });

      fetchApplications();
    } catch (error) {
      console.error(
        "Failed to create application:",
        error.response?.data || error.message,
      );
    }
  };

  const handleSearch = () => {
    setPage(1);
  };

useEffect(() => {
  fetchApplications();
}, [fundingRound, status, owner, overdue, sortBy, order, page]);

useEffect(() => {
  if (user?.role === "PROGRAM_OFFICER") {
    fetchProgramOfficers();
  }
}, []);
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="applications-main">
        <div className="applications-header">
          <div>
            <p className="section-label">APPLICATION MANAGEMENT</p>
            <h1>Applications</h1>
            <p>View and manage grant applications.</p>
          </div>

          {user?.role === "PROGRAM_OFFICER" && (
            <div className="header-actions">
              <button
                className="bulk-assignment-btn"
                onClick={() => navigate("/bulk-assignment")}
              >
                Bulk Assign Reviewers
              </button>

              <button
                className="create-application-btn"
                onClick={() => setShowCreateModal(true)}
              >
                + New Application
              </button>
            </div>
          )}
        </div>

        <>
          <section className="applications-toolbar">
            <div className="search-box">
              🔍
              <input
                type="text"
                placeholder="Search organization or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <select
              value={fundingRound}
              onChange={(e) => {
                setFundingRound(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Funding Rounds</option>
              <option value="Spring 2026">Spring 2026</option>
              <option value="Summer 2026">Summer 2026</option>
              <option value="Fall 2026">Fall 2026</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DECIDED">Decided</option>
            </select>

            {user?.role === "PROGRAM_OFFICER" && (
              <select
                value={owner}
                onChange={(e) => {
                  setOwner(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Program Officers</option>

                {programOfficers.map((officer) => (
                  <option key={officer._id} value={officer._id}>
                    {officer.name}
                  </option>
                ))}
              </select>
            )}

            <label className="overdue-filter">
              <input
                type="checkbox"
                checked={overdue}
                onChange={(e) => setOverdue(e.target.checked)}
              />

              <span>Overdue Reviews</span>
            </label>

            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSortBy, newOrder] = e.target.value.split("-");
                setSortBy(newSortBy);
                setOrder(newOrder);
                setPage(1);
              }}
            >
              <option value="submissionDate-desc">Newest Submission</option>
              <option value="submissionDate-asc">Oldest Submission</option>
              <option value="amountRequested-desc">Highest Amount</option>
              <option value="amountRequested-asc">Lowest Amount</option>
              <option value="status-asc">Status A-Z</option>
              <option value="status-desc">Status Z-A</option>
            </select>
          </section>

          <section className="applications-table-card">
            <div className="table-top">
              <div>
                <h2>All Applications</h2>
                <p>{total} applications found</p>{" "}
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
                    <th>Submission Date</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="table-message">
                        Loading applications...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-message">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr key={application._id}>
                        <td>
                          <div className="organization-cell">
                            <strong
                              className="application-link"
                              onClick={() =>
                                navigate(`/applications/${application._id}`)
                              }
                            >
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
                              application.amountRequested,
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
                          {new Date(
                            application.submissionDate,
                          ).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>
                Page {page} of {totalPages || 1}
              </span>

              <div>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>

                <button className="page-active">{page}</button>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
          {showCreateModal && (
            <div className="modal-overlay">
              <div className="application-modal">
                <div className="modal-header">
                  <div>
                    <p className="section-label">NEW APPLICATION</p>
                    <h2>Create Application</h2>
                  </div>

                  <button
                    className="close-modal-btn"
                    onClick={() => setShowCreateModal(false)}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreateApplication}>
                  <div className="form-group">
                    <label>Organization Name</label>
                    <input
                      type="text"
                      name="applicantOrganizationName"
                      value={formData.applicantOrganizationName}
                      onChange={handleFormChange}
                      placeholder="Enter organization name"
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
                      placeholder="organization@example.com"
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
                        placeholder="e.g. Spring 2026"
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
                        placeholder="25000"
                        min="0"
                        step="0.01"
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
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>

                    <button type="submit" className="submit-application-btn">
                      Create Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      </main>
    </div>
  );
}

export default Applications;
