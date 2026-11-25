/* eslint-disable react/prop-types */
import { useCallback, useMemo, useState } from "react";
import { AppContext } from "./context";
import { API_URL } from "../utils/api";

function readStoredAuth() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return { token, user: null };
  }

  try {
    return { token, user: JSON.parse(storedUser) };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { token: null, user: null };
  }
}

async function readResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "An unexpected error occurred";
}

export function AppProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [loginLoading, setLoginLoading] = useState(false);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [dailyLogsLoading, setDailyLogsLoading] = useState(false);
  const [dailyLogsError, setDailyLogsError] = useState(null);
  const [logBooks, setLogBooks] = useState([]);
  const [logBooksLoading, setLogBooksLoading] = useState(false);
  const [logBooksError, setLogBooksError] = useState(null);
  const [adminLogs, setAdminLogs] = useState([]);
  const [adminLogsLoading, setAdminLogsLoading] = useState(false);
  const [adminLogsError, setAdminLogsError] = useState(null);

  const request = useCallback(
    async (path, options = {}) => {
      const headers = {
        ...options.headers,
      };

      if (auth.token && !headers.Authorization) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });

      return readResponse(response);
    },
    [auth.token]
  );

  const login = useCallback(
    async (credentials) => {
      setLoginLoading(true);
      try {
        const data = await request("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!data.token || !data.user) {
          throw new Error("The server returned an invalid login response.");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setAuth({ token: data.token, user: data.user });
        setDailyLogs([]);
        setLogBooks([]);
        setAdminLogs([]);
        return data.user;
      } finally {
        setLoginLoading(false);
      }
    },
    [request]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
    setDailyLogs([]);
    setLogBooks([]);
    setAdminLogs([]);
  }, []);

  const fetchDailyLogs = useCallback(
    async (studentId = auth.user?.id) => {
      if (!studentId) {
        throw new Error("A student ID is required to fetch daily logs.");
      }

      setDailyLogsLoading(true);
      setDailyLogsError(null);
      try {
        const result = await request(`/api/daily-logs/${studentId}`);
        if (!Array.isArray(result.data)) {
          throw new Error("The server returned an invalid daily logs response.");
        }
        setDailyLogs(result.data);
        return result.data;
      } catch (error) {
        setDailyLogsError(getErrorMessage(error));
        throw error;
      } finally {
        setDailyLogsLoading(false);
      }
    },
    [auth.user?.id, request]
  );

  const fetchLogBooks = useCallback(
    async (studentId = auth.user?.id) => {
      if (!studentId) {
        throw new Error("A student ID is required to fetch logbooks.");
      }

      setLogBooksLoading(true);
      setLogBooksError(null);
      try {
        const result = await request(`/api/logbooks/${studentId}`);
        if (!Array.isArray(result.data)) {
          throw new Error("The server returned an invalid logbooks response.");
        }
        setLogBooks(result.data);
        return result.data;
      } catch (error) {
        setLogBooksError(getErrorMessage(error));
        throw error;
      } finally {
        setLogBooksLoading(false);
      }
    },
    [auth.user?.id, request]
  );

  const fetchAdminLogBooks = useCallback(async () => {
    setAdminLogsLoading(true);
    setAdminLogsError(null);
    try {
      const result = await request("/api/logbooks/admin/logbooks");
      if (!Array.isArray(result.data)) {
        throw new Error("The server returned an invalid admin logbooks response.");
      }
      setAdminLogs(result.data);
      return result.data;
    } catch (error) {
      setAdminLogsError(getErrorMessage(error));
      throw error;
    } finally {
      setAdminLogsLoading(false);
    }
  }, [request]);

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      login,
      loginLoading,
      logout,
      dailyLogs,
      dailyLogsLoading,
      dailyLogsError,
      fetchDailyLogs,
      logBooks,
      logBooksLoading,
      logBooksError,
      fetchLogBooks,
      adminLogs,
      adminLogsLoading,
      adminLogsError,
      fetchAdminLogBooks,
    }),
    [
      auth,
      login,
      loginLoading,
      logout,
      dailyLogs,
      dailyLogsLoading,
      dailyLogsError,
      fetchDailyLogs,
      logBooks,
      logBooksLoading,
      logBooksError,
      fetchLogBooks,
      adminLogs,
      adminLogsLoading,
      adminLogsError,
      fetchAdminLogBooks,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

