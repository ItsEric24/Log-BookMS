import { useNavigate } from "react-router";
import "./AllLogbooks.css";
import { useEffect } from "react";
import Loader from "../../components/Loader/Loader";
import { useAppContext } from "../../app/useAppContext";

function AllLogbooks() {
  const navigate = useNavigate();
  const { logBooks, logBooksLoading, logBooksError, fetchLogBooks } =
    useAppContext();

  useEffect(() => {
    fetchLogBooks().catch((error) => {
      console.error("Failed to fetch logbooks:", error);
    });
  }, [fetchLogBooks]);

  function handleNavigate(id) {
    navigate(`/dashboard/logbook/${id}`);
  }

  if (logBooksLoading) {
    return <Loader color="black" width="100" height="100" />;
  }

  return (
    <div className="manage-logbooks">
      <h1>Manage Logbooks</h1>
      <div className="logbook-list">
        {logBooksError ? (
          <p role="alert">{logBooksError}</p>
        ) : logBooks.length > 0 ? (
          logBooks.map((logbook) => (
            <div
              className="logbook-item"
              key={logbook.id}
              onClick={() => handleNavigate(logbook.id)}
            >
              <div className="logbook-details">
                <p>
                  <strong>Logbook ID:</strong> {logbook.id}
                </p>
                <p>
                  <strong>Week Number:</strong> {logbook.week_number}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(logbook.date).toDateString()}
                </p>
                <p>
                  <strong>Department:</strong> {logbook.department}
                </p>
                <p>
                  <strong>Approval:</strong>{" "}
                  {logbook.is_approved ? "Approved" : "Pending"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#ffffff", textAlign: "center" }}>
            No logbooks at the moment, you can create one at the &apos;submit
            logbook section&apos;
          </p>
        )}
      </div>
    </div>
  );
}

export default AllLogbooks;
