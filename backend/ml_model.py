import os

import joblib
import pandas as pd


# Get the project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Path to the trained model from Phase 15
MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "demand_model.pkl",
)


# Load the model once when this module is imported
model = joblib.load(MODEL_PATH)


# IMPORTANT:
# This order must exactly match train_model.py
FEATURES = [
    "menu_item_id",
    "day_of_week",
    "previous_day_sales",
    "7_day_avg",
    "is_holiday",
    "is_college_event",
]


def predict_demand(
    menu_item_id,
    day_of_week,
    previous_day_sales,
    seven_day_avg,
    is_holiday,
    is_college_event,
):
    input_df = pd.DataFrame(
        [
            {
                "menu_item_id": menu_item_id,
                "day_of_week": day_of_week,
                "previous_day_sales": previous_day_sales,
                "7_day_avg": seven_day_avg,
                "is_holiday": is_holiday,
                "is_college_event": is_college_event,
            }
        ]
    )

    # Force the exact training feature order
    input_df = input_df[FEATURES]

    prediction = model.predict(input_df)[0]

    # Demand cannot be negative
    return max(0, round(prediction))