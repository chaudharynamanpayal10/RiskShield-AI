import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==============================
# 1. Load Dataset
# ==============================

data = pd.read_csv("data/transactions.csv")

print("Dataset loaded successfully!")
print("Total records:", len(data))


# ==============================
# 2. Features and Target
# ==============================

X = data[
    [
        "amount",
        "frequency",
        "new_device",
        "unknown_location"
    ]
]

y = data["risk"]


# ==============================
# 3. Split Dataset
# ==============================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ==============================
# 4. Create ML Model
# ==============================

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


# ==============================
# 5. Train Model
# ==============================

model.fit(X_train, y_train)

print("Model training completed!")


# ==============================
# 6. Test Model
# ==============================

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\nModel Accuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# ==============================
# 7. Save Model
# ==============================

model_path = "model/risk_model.pkl"

joblib.dump(
    model,
    model_path
)

print("\nModel saved successfully!")
print("Location:", model_path)