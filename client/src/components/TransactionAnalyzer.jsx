import { useState } from "react";
import { analyzeTransaction } from "../services/api";

function TransactionAnalyzer() {
  const [formData, setFormData] = useState({
    transactionId: "",
    userId: "",
    amount: "",
    frequency: "",
    device: "",
    location: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeTransaction({
        ...formData,
        amount: Number(formData.amount),
        frequency: Number(formData.frequency),
      });

      setResult(data.riskAnalysis);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to analyze transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Analyze Transaction</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="transactionId"
          placeholder="Transaction ID"
          value={formData.transactionId}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="userId"
          placeholder="User ID"
          value={formData.userId}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="frequency"
          placeholder="Transaction Frequency"
          value={formData.frequency}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="device"
          placeholder="Device"
          value={formData.device}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Transaction"}
        </button>
      </form>

      {error && <p>{error}</p>}

      {result && (
        <div>
          <h3>Risk Analysis</h3>

          <p>
            Risk Score: <strong>{result.score}</strong>
          </p>

          <p>
            Risk Level: <strong>{result.level}</strong>
          </p>

          <p>
            Action: <strong>{result.action}</strong>
          </p>

          <h4>Reasons</h4>

          <ul>
            {result.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TransactionAnalyzer;