import { useEffect, useState } from "react";
import StatusCard from "../../components/StatusCard/StatusCard";
import "./AdminHome.css";
import Loader from "../../components/Loader/Loader";
import { useAppContext } from "../../app/useAppContext";
import {
  FaCheckCircle,
  FaFileAlt,
  FaHourglassHalf,
} from "react-icons/fa";

function AdminHome() {
  const { token } = useAppContext();
  const [sumOfLogbooks, setSumOfLogbooks] = useState(0);
  const [sumOfUnapprovedLogs, setSumOfUnapprovedLogs] = useState(0);
  const [sumOfApprovedLogs, setSumOfApprovedLogs] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSumOfLogs = async () => {
      setLoading(true);
      try {

        //* Sum of all logbooks
        const response = await fetch(
          "http://localhost:8000/api/logbooks/admin/logbooks/total",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setSumOfLogbooks(data.data[0].count);

        //* Sum of all unapproved logbooks
        const response2 = await fetch(
          "http://localhost:8000/api/logbooks/admin/logbooks/unapproved",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data2 = await response2.json();
        setSumOfUnapprovedLogs(data2.data[0].count);

        //* Sum of all approved logbooks
        const response3 = await fetch(
          "http://localhost:8000/api/logbooks/admin/logbooks/approved",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data3 = await response3.json();
        setSumOfApprovedLogs(data3.data[0].count);
      } catch (error) {
        console.log(error);
      }finally{
        setLoading(false);
      }
    };
    fetchSumOfLogs();
  }, [token]);

  return (
    <div className="admin-main-content">
      <StatusCard title="Total Submissions" value={loading ? <Loader /> : sumOfLogbooks} icon={<FaFileAlt />} />
      <StatusCard title="Pending Reviews" value={loading ? <Loader /> : sumOfUnapprovedLogs} icon={<FaHourglassHalf />} />
      <StatusCard title="Approved Logs" value={loading ? <Loader /> : sumOfApprovedLogs} icon={<FaCheckCircle />} />
    </div>
  );
}

export default AdminHome;
