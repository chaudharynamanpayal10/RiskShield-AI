import { useEffect, useState } from "react";
import "./App.css";

import {
  analyzeTransaction,
  getTransactions,
} from "./services/api";

import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  // ================= AUTHENTICATION =================

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [showSignup, setShowSignup] = useState(false);

  // ================= ACTIVE PAGE =================

  const [activePage, setActivePage] = useState("Dashboard");

  // ================= ANALYZE FORM =================

  const [formData, setFormData] = useState({
    amount: "",
    frequency: "",
    device: "Known Device",
    location: "",
  });

  // ================= RISK RESULT =================

  const [riskResult, setRiskResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= TRANSACTIONS =================

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // ================= FETCH TRANSACTIONS =================

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);

      const data = await getTransactions();

      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (Array.isArray(data?.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);

      // If token is invalid/expired
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // ================= FETCH AFTER LOGIN =================

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // ================= LIVE STATISTICS =================

  const totalTransactions = transactions.length;

  const highRisk = transactions.filter(
    (txn) => txn.riskLevel === "High"
  ).length;

  const mediumRisk = transactions.filter(
    (txn) => txn.riskLevel === "Medium"
  ).length;

  const lowRisk = transactions.filter(
    (txn) => txn.riskLevel === "Low"
  ).length;

  const blockedTransactions = transactions.filter(
    (txn) => txn.action === "Blocked"
  ).length;

  // ================= RISK PERCENTAGES =================

  const lowPercentage =
    totalTransactions > 0
      ? ((lowRisk / totalTransactions) * 100).toFixed(1)
      : "0.0";

  const mediumPercentage =
    totalTransactions > 0
      ? ((mediumRisk / totalTransactions) * 100).toFixed(1)
      : "0.0";

  const highPercentage =
    totalTransactions > 0
      ? ((highRisk / totalTransactions) * 100).toFixed(1)
      : "0.0";

  // ================= STATS =================

  const stats = [
    {
      title: "Total Transactions",
      value: totalTransactions.toLocaleString(),
      change: "Live",
    },
    {
      title: "High Risk",
      value: highRisk.toLocaleString(),
      change: "Live",
    },
    {
      title: "Medium Risk",
      value: mediumRisk.toLocaleString(),
      change: "Live",
    },
    {
      title: "Low Risk",
      value: lowRisk.toLocaleString(),
      change: "Live",
    },
    {
      title: "Blocked Transactions",
      value: blockedTransactions.toLocaleString(),
      change: "Live",
    },
  ];

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // ================= ANALYZE TRANSACTION =================

  const handleAnalyze = async () => {
    setError("");
    setRiskResult(null);

    // Validation
    if (!formData.amount) {
      setError("Please enter transaction amount.");
      return;
    }

    if (!formData.frequency) {
      setError("Please enter transaction frequency.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter transaction location.");
      return;
    }

    setLoading(true);

    try {
      // Unique transaction ID
      const transactionId = `TXN-${Date.now()}`;

      // Logged-in user ID
      const userId =
        user?._id ||
        user?.id ||
        user?.email;

      if (!userId) {
        setError("User information not found. Please login again.");
        return;
      }

      const transactionData = {
        transactionId,
        userId,
        amount: Number(formData.amount),
        frequency: Number(formData.frequency),
        device: formData.device,
        location: formData.location.trim(),
      };

      console.log(
        "Sending transaction:",
        transactionData
      );

      // Backend + ML analysis
      const data = await analyzeTransaction(
        transactionData
      );

      console.log(
        "Analysis response:",
        data
      );

      // Show risk result
      if (data?.riskAnalysis) {
        setRiskResult(data.riskAnalysis);
      } else {
        setError("Invalid response from server.");
      }

      // Refresh transactions
      await fetchTransactions();

    } catch (err) {
      console.error(
        "Transaction analysis error:",
        err
      );

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        handleLogout();
        return;
      }

      setError(
        err.response?.data?.message ||
        "Failed to analyze transaction. Please check that Backend and ML server are running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIN =================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setShowSignup(false);
    setActivePage("Dashboard");
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setActivePage("Dashboard");
    setTransactions([]);
    setRiskResult(null);
    setError("");
  };

  // ================= LOGIN / SIGNUP =================

  if (!user) {
    if (showSignup) {
      return (
        <Signup
          onSwitchToLogin={() =>
            setShowSignup(false)
          }
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToSignup={() =>
          setShowSignup(true)
        }
      />
    );
  }

  // =====================================================
  // ================= MAIN APPLICATION ==================
  // =====================================================

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        {/* LOGO */}

        <div className="logo">

          <div className="logo-icon">
            R
          </div>

          <div>
            <h2>RiskShield</h2>
            <span>AI Risk Engine</span>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav>

          {/* DASHBOARD */}

          <button
            className={
              activePage === "Dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setActivePage("Dashboard");
              fetchTransactions();
            }}
          >
            <span>▦</span>
            Dashboard
          </button>

          {/* ANALYZE */}

          <button
            className={
              activePage === "Analyze"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setActivePage("Analyze");
              setError("");
            }}
          >
            <span>⌁</span>
            Analyze Transaction
          </button>

          {/* ALERTS */}

          <button
            className={
              activePage === "Alerts"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setActivePage("Alerts");
              fetchTransactions();
            }}
          >
            <span>⚠</span>
            Risk Alerts
          </button>

          {/* HISTORY */}

          <button
            className={
              activePage === "History"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setActivePage("History");
              fetchTransactions();
            }}
          >
            <span>◷</span>
            Transaction History
          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="system-status">
            <span className="status-dot"></span>
            AI Engine Online
          </div>

          <div className="profile">

            <div className="avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "U"}
            </div>

            <div>
              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                Risk Analyst
              </span>
            </div>

            <button
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">

        {/* ================= TOPBAR ================= */}

        <header className="topbar">

          <div>

            <h1>{activePage}</h1>

            <p>
              Monitor and analyze transaction risk in real time.
            </p>

          </div>

          <div className="top-actions">

            <button className="notification">
              🔔
            </button>

            <div className="date">
              August 2026
            </div>

          </div>

        </header>

        {/* ================================================= */}
        {/* ================= DASHBOARD ===================== */}
        {/* ================================================= */}

        {activePage === "Dashboard" && (
          <>

            {/* STATS */}

            <section className="stats-grid">

              {stats.map((stat) => (
                <div
                  className="stat-card"
                  key={stat.title}
                >

                  <div className="stat-top">

                    <span>
                      {stat.title}
                    </span>

                    <div className="mini-icon">
                      ◈
                    </div>

                  </div>

                  <h2>
                    {stat.value}
                  </h2>

                  <div className="stat-change">

                    <span>
                      {stat.change}
                    </span>

                    <small>
                      current data
                    </small>

                  </div>

                </div>
              ))}

            </section>

            {/* RISK OVERVIEW */}

            <section className="content-grid">

              <div className="panel chart-panel">

                <div className="panel-header">

                  <div>
                    <h3>
                      Risk Overview
                    </h3>

                    <p>
                      Transaction risk distribution
                    </p>
                  </div>

                  <select>
                    <option>
                      Current Data
                    </option>

                    <option>
                      Last 7 days
                    </option>

                    <option>
                      Last 30 days
                    </option>
                  </select>

                </div>

                <div className="chart">

                  <div className="bar-container">

                    <div
                      className="bar low"
                      style={{
                        height:
                          lowRisk > 0
                            ? `${Math.max(
                                20,
                                Math.min(
                                  100,
                                  Number(lowPercentage)
                                )
                              )}%`
                            : "10%",
                      }}
                    ></div>

                    <span>
                      Low
                    </span>

                  </div>

                  <div className="bar-container">

                    <div
                      className="bar medium"
                      style={{
                        height:
                          mediumRisk > 0
                            ? `${Math.max(
                                20,
                                Math.min(
                                  100,
                                  Number(mediumPercentage)
                                )
                              )}%`
                            : "10%",
                      }}
                    ></div>

                    <span>
                      Medium
                    </span>

                  </div>

                  <div className="bar-container">

                    <div
                      className="bar high"
                      style={{
                        height:
                          highRisk > 0
                            ? `${Math.max(
                                20,
                                Math.min(
                                  100,
                                  Number(highPercentage)
                                )
                              )}%`
                            : "10%",
                      }}
                    ></div>

                    <span>
                      High
                    </span>

                  </div>

                </div>

                <div className="legend">

                  <span>
                    <i className="dot low-dot"></i>
                    Low Risk
                  </span>

                  <span>
                    <i className="dot medium-dot"></i>
                    Medium Risk
                  </span>

                  <span>
                    <i className="dot high-dot"></i>
                    High Risk
                  </span>

                </div>

              </div>

              {/* RISK DISTRIBUTION */}

              <div className="panel distribution">

                <div className="panel-header">

                  <div>
                    <h3>
                      Risk Distribution
                    </h3>

                    <p>
                      Based on current transactions
                    </p>
                  </div>

                </div>

                <div className="risk-circle">

                  <div>

                    <strong>
                      {totalTransactions}
                    </strong>

                    <span>
                      Transactions
                    </span>

                  </div>

                </div>

                <div className="distribution-list">

                  <div>
                    <span className="risk-label">
                      <i className="dot low-dot"></i>
                      Low Risk
                    </span>

                    <strong>
                      {lowPercentage}%
                    </strong>
                  </div>

                  <div>
                    <span className="risk-label">
                      <i className="dot medium-dot"></i>
                      Medium Risk
                    </span>

                    <strong>
                      {mediumPercentage}%
                    </strong>
                  </div>

                  <div>
                    <span className="risk-label">
                      <i className="dot high-dot"></i>
                      High Risk
                    </span>

                    <strong>
                      {highPercentage}%
                    </strong>
                  </div>

                </div>

              </div>

            </section>

            {/* RECENT TRANSACTIONS */}

            <section className="panel transactions">

              <div className="panel-header">

                <div>
                  <h3>
                    Recent Transactions
                  </h3>

                  <p>
                    Latest analyzed transactions
                  </p>
                </div>

                <button
                  className="view-btn"
                  onClick={fetchTransactions}
                >
                  Refresh ↻
                </button>

              </div>

              <TransactionTable
                transactions={transactions}
                loading={transactionsLoading}
                limit={10}
              />

            </section>

          </>
        )}

        {/* ================================================= */}
        {/* ================= ANALYZE ======================= */}
        {/* ================================================= */}

        {activePage === "Analyze" && (

          <section className="analyze-page">

            {/* FORM */}

            <div className="panel analyze-form">

              <h3>
                Analyze Transaction
              </h3>

              <p>
                Enter transaction details to calculate AI risk.
              </p>

              <div className="form-grid">

                {/* AMOUNT */}

                <div className="input-group">

                  <label>
                    Transaction Amount
                  </label>

                  <input
                    type="number"
                    name="amount"
                    min="1"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={handleChange}
                  />

                </div>

                {/* FREQUENCY */}

                <div className="input-group">

                  <label>
                    Transaction Frequency
                  </label>

                  <input
                    type="number"
                    name="frequency"
                    min="1"
                    placeholder="Transactions in 5 min"
                    value={formData.frequency}
                    onChange={handleChange}
                  />

                </div>

                {/* DEVICE */}

                <div className="input-group">

                  <label>
                    Device
                  </label>

                  <select
                    name="device"
                    value={formData.device}
                    onChange={handleChange}
                  >

                    <option>
                      Known Device
                    </option>

                    <option>
                      New Device
                    </option>

                  </select>

                </div>

                {/* LOCATION */}

                <div className="input-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <p
                  style={{
                    color: "#dc2626",
                    marginTop: "15px",
                  }}
                >
                  {error}
                </p>
              )}

              {/* BUTTON */}

              <button
                className="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading}
              >

                {loading
                  ? "Analyzing..."
                  : "Analyze Risk →"}

              </button>

            </div>

            {/* RESULT */}

            <div className="panel demo-result">

              {/* WAITING */}

              {!riskResult && !loading && (
                <>

                  <span className="result-label">
                    AI RISK SCORE
                  </span>

                  <div className="big-score">
                    --
                    <span>
                      /100
                    </span>
                  </div>

                  <div className="high-risk">
                    WAITING FOR ANALYSIS
                  </div>

                  <h4>
                    Risk Factors
                  </h4>

                  <ul>
                    <li>
                      Enter transaction details
                    </li>

                    <li>
                      Click Analyze Risk
                    </li>

                    <li>
                      AI engine will evaluate the transaction
                    </li>
                  </ul>

                  <div className="recommendation">

                    <span>
                      Recommended Action
                    </span>

                    <strong>
                      ANALYZE TRANSACTION
                    </strong>

                  </div>

                </>
              )}

              {/* LOADING */}

              {loading && (
                <div>

                  <span className="result-label">
                    AI RISK SCORE
                  </span>

                  <div className="big-score">
                    ...
                  </div>

                  <div className="high-risk">
                    ANALYZING
                  </div>

                  <h4>
                    Risk Factors
                  </h4>

                  <ul>
                    <li>
                      Sending transaction to AI engine
                    </li>

                    <li>
                      Calculating risk probability
                    </li>
                  </ul>

                </div>
              )}

              {/* RESULT */}

              {riskResult && !loading && (
                <>

                  <span className="result-label">
                    AI RISK SCORE
                  </span>

                  <div className="big-score">

                    {riskResult.score}

                    <span>
                      /100
                    </span>

                  </div>

                  <div
                    className={
                      riskResult.level === "High"
                        ? "high-risk"
                        : riskResult.level === "Medium"
                        ? "medium-risk"
                        : "low-risk"
                    }
                  >
                    {riskResult.level?.toUpperCase()} RISK
                  </div>

                  <h4>
                    Risk Factors
                  </h4>

                  <ul>

                    {riskResult.reasons &&
                    riskResult.reasons.length > 0 ? (
                      riskResult.reasons.map(
                        (reason, index) => (
                          <li key={index}>
                            {reason}
                          </li>
                        )
                      )
                    ) : (
                      <li>
                        No specific risk factors returned by AI model.
                      </li>
                    )}

                  </ul>

                  <div className="recommendation">

                    <span>
                      Recommended Action
                    </span>

                    <strong>

                      {riskResult.action === "Blocked"
                        ? "🚫 BLOCK TRANSACTION"
                        : riskResult.action === "Review"
                        ? "⚠ REVIEW TRANSACTION"
                        : "✓ ALLOW TRANSACTION"}

                    </strong>

                  </div>

                </>
              )}

            </div>

          </section>
        )}

        {/* ================================================= */}
        {/* ================= ALERTS ======================== */}
        {/* ================================================= */}

        {activePage === "Alerts" && (

          <section className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  Risk Alerts
                </h3>

                <p>
                  High-risk transactions and security alerts.
                </p>

              </div>

              <button
                className="view-btn"
                onClick={fetchTransactions}
              >
                Refresh ↻
              </button>

            </div>

            {transactionsLoading ? (
              <p style={{ marginTop: "20px" }}>
                Loading alerts...
              </p>
            ) : (
              <>
                {transactions
                  .filter(
                    (txn) =>
                      txn.riskLevel === "High" ||
                      txn.action === "Blocked"
                  )
                  .slice()
                  .reverse()
                  .map((txn) => (

                    <div
                      key={
                        txn._id ||
                        txn.transactionId
                      }
                      style={{
                        padding: "15px",
                        marginTop: "15px",
                        borderRadius: "10px",
                        border:
                          "1px solid #e5e7eb",
                      }}
                    >

                      <strong>
                        {txn.transactionId}
                      </strong>

                      <p>
                        ₹
                        {Number(
                          txn.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}

                        {" "}• Risk Score:{" "}
                        {txn.riskScore}
                      </p>

                      <span>
                        {txn.action}
                      </span>

                    </div>

                  ))}

                {transactions.filter(
                  (txn) =>
                    txn.riskLevel === "High" ||
                    txn.action === "Blocked"
                ).length === 0 && (

                  <p style={{ marginTop: "20px" }}>
                    No high-risk alerts currently.
                  </p>

                )}

              </>
            )}

          </section>
        )}

        {/* ================================================= */}
        {/* ================= HISTORY ======================= */}
        {/* ================================================= */}

        {activePage === "History" && (

          <section className="panel">

            <div className="panel-header">

              <div>

                <h3>
                  Transaction History
                </h3>

                <p>
                  Complete transaction analysis history.
                </p>

              </div>

              <button
                className="view-btn"
                onClick={fetchTransactions}
              >
                Refresh ↻
              </button>

            </div>

            <TransactionTable
              transactions={transactions}
              loading={transactionsLoading}
            />

          </section>
        )}

      </main>

    </div>
  );
}

// =====================================================
// ================= TRANSACTION TABLE =================
// =====================================================

function TransactionTable({
  transactions,
  loading,
  limit,
}) {
  const displayedTransactions = transactions
    .slice()
    .reverse();

  const finalTransactions = limit
    ? displayedTransactions.slice(0, limit)
    : displayedTransactions;

  return (
    <div className="table-wrapper">

      <table>

        <thead>

          <tr>

            <th>
              Transaction
            </th>

            <th>
              User
            </th>

            <th>
              Amount
            </th>

            <th>
              Risk
            </th>

            <th>
              Score
            </th>

            <th>
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {loading ? (

            <tr>

              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "30px",
                }}
              >
                Loading transactions...
              </td>

            </tr>

          ) : finalTransactions.length === 0 ? (

            <tr>

              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "30px",
                }}
              >
                No transactions found.
              </td>

            </tr>

          ) : (

            finalTransactions.map((txn) => (

              <tr
                key={
                  txn._id ||
                  txn.transactionId
                }
              >

                <td>

                  <strong>
                    {txn.transactionId}
                  </strong>

                </td>

                <td>
                  {txn.userId}
                </td>

                <td>

                  ₹
                  {Number(
                    txn.amount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}

                </td>

                <td>

                  <span
                    className={`risk-badge ${
                      txn.riskLevel
                        ?.toLowerCase() || ""
                    }`}
                  >
                    {txn.riskLevel ||
                      "Unknown"}
                  </span>

                </td>

                <td>

                  <div className="score">

                    <div className="score-bar">

                      <span
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              Number(
                                txn.riskScore ||
                                0
                              )
                            )
                          )}%`,
                        }}
                      ></span>

                    </div>

                    {txn.riskScore || 0}

                  </div>

                </td>

                <td>

                  <span
                    className={`action ${
                      txn.action
                        ?.toLowerCase() || ""
                    }`}
                  >
                    {txn.action ||
                      "Unknown"}
                  </span>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default App;