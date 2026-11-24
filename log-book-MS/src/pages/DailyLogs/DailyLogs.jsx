import { useNavigate } from "react-router";
import { useState } from "react";
import "./DailyLogs.css";
import DailyModal from "../../components/DailyModal/DailyModal";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";
import { useAppContext } from "../../app/useAppContext";

function DailyLogs() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [weekNumber, setWeekNumber] = useState(1);
  const { dailyLogs, dailyLogsLoading, dailyLogsError, fetchDailyLogs, token } =
    useAppContext();

  useEffect(() => {
    fetchDailyLogs().catch((error) => {
      toast.error(error.message || "Failed to fetch daily logs.");
    });
  }, [fetchDailyLogs]);

  function handleClick(id) {
    navigate(`/dashboard/daily-log/${id}`);
  }

  async function handleSave(formData) {
    try {
      const response = await fetch("http://localhost:8000/api/daily-logs/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        return toast.error(data.message || "There was an error saving the log.");
      }

      toast.success(data.message);
      await fetchDailyLogs();
    } catch (error) {
      toast.error(error.message || "There was an error saving the log.");
    }
  }

  return (
    <div className="daily-logs-list-container">
      <div className="daily-logs-header">
        <h1>Daily Logs</h1>
        <div>
          <label id="dailyLogsFilter">Filter By:</label>
          <select
            id="weekNumber"
            value={weekNumber}
            onChange={(e) => setWeekNumber(Number(e.target.value))}
          >
            {[...Array(12).keys()].map((week) => (
              <option key={week + 1} value={week + 1}>
                Week {week + 1}
              </option>
            ))}
          </select>
        </div>
        <button className="daily-logs-btn" onClick={() => setIsOpen(true)}>
          Create Daily Log
        </button>
      </div>
      <div className="daily-logs-list">
        {dailyLogsLoading ? (
          <Loader color="black" width="100" height="100" />
        ) : dailyLogsError ? (
          <p role="alert">{dailyLogsError}</p>
        ) : dailyLogs.length > 0 ? (
          dailyLogs.filter((log) => Number(log.week_number) === weekNumber)
            .length > 0 ? (
            dailyLogs
              .filter((log) => Number(log.week_number) === weekNumber)
              .map((log) => (
                <div
                  className="daily-log-item"
                  key={log.id}
                  onClick={() => handleClick(log.id)}
                >
                  <p>
                    <strong>Week Number:</strong> {log.week_number}
                  </p>
                  <p>
                    <strong>Day:</strong> {log.day}
                  </p>
                  <p>
                    <strong>Log ID:</strong> {log.id}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(log.date).toDateString()}
                  </p>
                </div>
              ))
          ) : (
            <p style={{ color: "#ffffff", textAlign: "center" }}>
              No logs for this week
            </p>
          )
        ) : (
          <p style={{ color: "#ffffff", textAlign: "center" }}>
            No daily logs available, create one to get started.
          </p>
        )}
      </div>
      <DailyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
      />
      <ToastContainer />
    </div>
  );
}

export default DailyLogs;
