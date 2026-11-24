import "./AdminLogbooks.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "../../app/useAppContext";

function AdminLogbooks() {
  const { adminLogs, adminLogsError, fetchAdminLogBooks, user } =
    useAppContext();
  const navigate = useNavigate();

  // State for filters
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    fetchAdminLogBooks().catch((error) => {
      console.error("Failed to fetch admin logbooks:", error);
    });
  }, [fetchAdminLogBooks]);

  const handleNaviagte = (id) => {
    navigate(`/admin/logbook/${id}`);
  };

  // Filter logbooks based on selected department and week
  const filteredLogs = adminLogs
    .filter((logbook) => logbook.school === user.school)
    .filter((logbook) => logbook.department === user.department)
    .filter((logbook) => {
      return !selectedWeek || logbook.week_number === selectedWeek;
    });

  return (
    <div className="approve-logbooks-container">
      <h1>Manage and Approve Logbooks</h1>

      {/* Filter Selectors */}
      <div className="filters">
        <label className="filter-label">
          Week:
          <select
            className="filter-select"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            <option value="">All Weeks</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Logbook List */}
      <div className="logbook-list">
        {adminLogsError ? (
          <p role="alert">{adminLogsError}</p>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((logbook) => (
            <div
              className="logbook-card"
              key={logbook.id}
              onClick={() => handleNaviagte(logbook.id)}
            >
              <div className="admin-logbook-details">
                <p>
                  <strong>Logbook ID:</strong> {logbook.id}
                </p>
                <p>
                  <strong>Student Name:</strong> {logbook.student_name}
                </p>
                <p>
                  <strong>Week:</strong> {logbook.week_number}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(logbook.date).toDateString()}
                </p>
                <p>
                  <strong>Is Signed:</strong>{" "}
                  {logbook.is_approved ? "Signed" : "Not Signed"}
                </p>
                <p>
                  <strong>School:</strong> {logbook.school}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#ffffff", textAlign: "center" }}>
            No logbooks at the moment
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminLogbooks;
