from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

# ================= LOAD ML MODEL =================

model = joblib.load("model/risk_model.pkl")


# ================= HOME =================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "RiskShield AI ML Service is running"
    })


# ================= PREDICT =================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        # ================= INPUT DATA =================

        amount = float(data.get("amount", 0))
        frequency = int(data.get("frequency", 0))

        device = data.get("device", "")
        location = data.get("location", "")

        # ================= FEATURE CONVERSION =================

        new_device = 1 if device.lower() == "new device" else 0

        unknown_location = (
            1
            if location.lower() in [
                "unknown",
                "unusual",
                "foreign",
                "unrecognized"
            ]
            else 0
        )

        # ================= ML FEATURES =================

        features = [[
            amount,
            frequency,
            new_device,
            unknown_location
        ]]

        # ================= ML PREDICTION =================

        prediction = model.predict(features)[0]

        probabilities = model.predict_proba(features)[0]

        risk_probability = probabilities[1]

        # ================= RISK SCORE =================

        risk_score = round(
            risk_probability * 100
        )

        # ================= RISK LEVEL =================

        if risk_score >= 70:

            risk_level = "High"
            action = "Blocked"

        elif risk_score >= 40:

            risk_level = "Medium"
            action = "Review"

        else:

            risk_level = "Low"
            action = "Allowed"

        # =================================================
        # ================= RISK REASONS ===================
        # =================================================

        risk_reasons = []

        # High amount
        if amount >= 50000:

            risk_reasons.append(
                "High transaction amount detected"
            )

        elif amount >= 20000:

            risk_reasons.append(
                "Above-average transaction amount"
            )

        # High frequency
        if frequency >= 10:

            risk_reasons.append(
                "Unusually high transaction frequency"
            )

        elif frequency >= 5:

            risk_reasons.append(
                "Multiple transactions detected within a short period"
            )

        # New device
        if new_device == 1:

            risk_reasons.append(
                "Transaction initiated from a new device"
            )

        # Unknown location
        if unknown_location == 1:

            risk_reasons.append(
                "Unrecognized transaction location"
            )

        # ML prediction
        if int(prediction) == 1:

            risk_reasons.append(
                "ML model detected suspicious transaction behavior"
            )

        # High risk probability
        if risk_score >= 70:

            risk_reasons.append(
                "High probability of fraudulent activity"
            )

        elif risk_score >= 40:

            risk_reasons.append(
                "Transaction requires additional verification"
            )

        # Low-risk fallback
        if len(risk_reasons) == 0:

            risk_reasons.append(
                "No significant risk factors detected"
            )

        # ================= RESPONSE =================

        return jsonify({

            "riskScore": risk_score,

            "riskLevel": risk_level,

            "action": action,

            "prediction": int(prediction),

            "riskReasons": risk_reasons

        })

    except Exception as error:

        print(
            "Prediction error:",
            str(error)
        )

        return jsonify({

            "message": "Prediction failed",

            "error": str(error)

        }), 500


# ================= RUN SERVER =================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )