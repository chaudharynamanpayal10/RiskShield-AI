import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions`);

      // Backend response ke according data handle karna
      const data = response.data;

      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const blocked = transactions.filter(
    (txn) => txn.action === "Blocked"
  ).length;

  const getRiskClass = (level) => {
    if (level === "High") return "high";
    if (level === "Medium") return "medium";
    return "low";
  };

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>RiskShield AI</h1>
          <p>AI-Powered Transaction Risk Dashboard</p>
        </div>

        <button onClick={fetchTransactions}>
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="stat-number">
            {totalTransactions}
          </div>
        </div>

        <div className="stat-card high-card">
          <h3>High Risk</h3>
          <div className="stat-number">
            {highRisk}
          </div>
        </div>

        <div className="stat-card medium-card">
          <h3>Medium Risk</h3>
          <div className="stat-number">
            {mediumRisk}
          </div>
        </div>

        <div className="stat-card low-card">
          <h3>Low Risk</h3>
          <div className="stat-number">
            {lowRisk}
          </div>
        </div>

        <div className="stat-card blocked-card">
          <h3>Blocked</h3>
          <div className="stat-number">
            {blocked}
          </div>
        </div>

      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">

        <div className="section-header">
          <h2>Recent Transactions</h2>
          <span>{totalTransactions} transactions</span>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            No transactions found.
          </div>
        ) : (
          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {transactions.map((txn) => (
                  <tr key={txn._id || txn.transactionId}>

                    <td>
                      {txn.transactionId}
                    </td>

                    <td>
                      {txn.userId}
                    </td>

                    <td>
                      ₹{Number(txn.amount || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <strong>
                        {txn.riskScore ?? 0}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`risk-badge ${getRiskClass(
                          txn.riskLevel
                        )}`}
                      >
                        {txn.riskLevel || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`action-badge ${
                          txn.action === "Blocked"
                            ? "blocked"
                            : txn.action === "Review"
                            ? "review"
                            : "allowed"
                        }`}
                      >
                        {txn.action || "Unknown"}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;