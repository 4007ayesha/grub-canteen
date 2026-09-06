import pandas as pd

# Load the processed dataset from Phase 14
df = pd.read_csv("ml/processed_dataset.csv")

print("Dataset loaded successfully!")
print("Rows:", len(df))
print("Columns:", list(df.columns))
# Features used by the ML models
FEATURES = [
    "menu_item_id",
    "day_of_week",
    "previous_day_sales",
    "7_day_avg",
    "is_holiday",
    "is_college_event",
]

# Target variable we want to predict
TARGET = "quantity_sold"

X = df[FEATURES]
y = df[TARGET]

print("\nFeatures:")
print(FEATURES)

print("Target:")
print(TARGET)

print("Feature data shape:", X.shape)
print("Target data shape:", y.shape)
from sklearn.model_selection import train_test_split

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\nTraining data shape:", X_train.shape)
print("Testing data shape:", X_test.shape)

from sklearn.linear_model import LinearRegression

# Create the Linear Regression model
lr = LinearRegression()

# Train the model using the training data
lr.fit(X_train, y_train)

print("\nLinear Regression model trained successfully!")
from sklearn.ensemble import RandomForestRegressor

# Create the Random Forest model
rf = RandomForestRegressor(
    n_estimators=100,
    max_depth=8,
    random_state=42
)

# Train the model using the training data
rf.fit(X_train, y_train)

print("\nRandom Forest model trained successfully!")
# Generate predictions on the unseen test data
lr_predictions = lr.predict(X_test)
rf_predictions = rf.predict(X_test)

print("\nPredictions generated successfully!")

print("Linear Regression predictions:", len(lr_predictions))
print("Random Forest predictions:", len(rf_predictions))
from sklearn.metrics import mean_absolute_error

# Calculate Mean Absolute Error (MAE)
lr_mae = mean_absolute_error(y_test, lr_predictions)
rf_mae = mean_absolute_error(y_test, rf_predictions)

print("\nMAE:")
print(f"Linear Regression: {lr_mae:.2f}")
print(f"Random Forest:     {rf_mae:.2f}")
from sklearn.metrics import mean_squared_error
import numpy as np

# Calculate Root Mean Squared Error (RMSE)
lr_rmse = np.sqrt(mean_squared_error(y_test, lr_predictions))
rf_rmse = np.sqrt(mean_squared_error(y_test, rf_predictions))

print("\nRMSE:")
print(f"Linear Regression: {lr_rmse:.2f}")
print(f"Random Forest:     {rf_rmse:.2f}")
from sklearn.metrics import r2_score

# Calculate R² score
lr_r2 = r2_score(y_test, lr_predictions)
rf_r2 = r2_score(y_test, rf_predictions)

print("\nR²:")
print(f"Linear Regression: {lr_r2:.3f}")
print(f"Random Forest:     {rf_r2:.3f}")
# Compare model performance
print("\n" + "=" * 45)
print("MODEL COMPARISON")
print("=" * 45)

print(f"{'Metric':<10} {'Linear Regression':<20} {'Random Forest'}")
print("-" * 45)

print(f"{'MAE':<10} {lr_mae:<20.2f} {rf_mae:.2f}")
print(f"{'RMSE':<10} {lr_rmse:<20.2f} {rf_rmse:.2f}")
print(f"{'R²':<10} {lr_r2:<20.3f} {rf_r2:.3f}")

print("\nSelected model: Random Forest")
# Check Random Forest feature importance
feature_importance = pd.DataFrame({
    "feature": FEATURES,
    "importance": rf.feature_importances_
})

feature_importance = feature_importance.sort_values(
    by="importance",
    ascending=False
)

print("\nRandom Forest Feature Importance:")
print(feature_importance.to_string(index=False))
# Manually inspect a few Random Forest predictions
comparison = pd.DataFrame({
    "Actual": y_test.values,
    "Predicted": rf_predictions
})

print("\nSample Predictions:")
print(comparison.head(5).to_string(index=False))
import joblib

# Save the trained Random Forest model
joblib.dump(rf, "ml/demand_model.pkl")

print("\nRandom Forest model saved successfully!")
print("Saved to: ml/demand_model.pkl")
# Test loading the saved model
loaded_model = joblib.load("ml/demand_model.pkl")

# Make one prediction using the loaded model
sample_prediction = loaded_model.predict(X_test.iloc[[0]])

print("\nSaved model loaded successfully!")
print(f"Test prediction from saved model: {sample_prediction[0]:.2f}")