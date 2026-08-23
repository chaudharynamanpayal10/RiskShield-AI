const calculateRisk = ({
  amount,
  frequency,
  device,
  location,
}) => {
  let score = 0;
  const reasons = [];

  // 1. Transaction amount
  if (amount >= 50000) {
    score += 30;
    reasons.push("Very high transaction amount");
  } else if (amount >= 25000) {
    score += 20;
    reasons.push("Unusually high transaction amount");
  } else if (amount >= 10000) {
    score += 10;
    reasons.push("Above-normal transaction amount");
  }

  // 2. Transaction frequency
  if (frequency >= 10) {
    score += 25;
    reasons.push("Extremely high transaction frequency");
  } else if (frequency >= 5) {
    score += 20;
    reasons.push("High transaction frequency");
  } else if (frequency >= 3) {
    score += 10;
    reasons.push("Multiple transactions in a short period");
  }

  // 3. Device
  if (device && device.toLowerCase().includes("new")) {
    score += 20;
    reasons.push("New device detected");
  }

  // 4. Location
  if (
    location &&
    ["unknown", "international", "unusual"].some((item) =>
      location.toLowerCase().includes(item)
    )
  ) {
    score += 15;
    reasons.push("Unusual location pattern");
  }

  // Maximum score = 100
  score = Math.min(score, 100);

  // Risk level
  let riskLevel;

  if (score <= 30) {
    riskLevel = "Low";
  } else if (score <= 70) {
    riskLevel = "Medium";
  } else {
    riskLevel = "High";
  }

  // Action
  let action;

  if (score <= 30) {
    action = "Allowed";
  } else if (score <= 70) {
    action = "Review";
  } else {
    action = "Blocked";
  }

  return {
    riskScore: score,
    riskLevel,
    action,
    riskReasons: reasons,
  };
};

module.exports = calculateRisk;