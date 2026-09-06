import pandas as pd

# Load synthetic data
df = pd.read_csv("ml/synthetic_orders.csv")

# Make sure data is sorted correctly
df["date"] = pd.to_datetime(df["date"])

df = df.sort_values(
    ["menu_item_id", "date"]
).reset_index(drop=True)

# Previous day's sales for the same menu item
df["previous_day_sales"] = (
    df.groupby("menu_item_id")["quantity_sold"]
    .shift(1)
)

# 7-day rolling average using only previous days
df["7_day_avg"] = (
    df.groupby("menu_item_id")["quantity_sold"]
    .shift(1)
    .rolling(7)
    .mean()
    .reset_index(level=0, drop=True)
)

# Remove rows where previous-day / 7-day history is not available
df = df.dropna(
    subset=["previous_day_sales", "7_day_avg"]
)

# Convert values to appropriate types
df["previous_day_sales"] = df["previous_day_sales"].astype(int)
df["7_day_avg"] = df["7_day_avg"].round(2)

# Keep the final ML dataset columns
df = df[
    [
        "date",
        "menu_item_id",
        "day_of_week",
        "quantity_sold",
        "previous_day_sales",
        "7_day_avg",
        "is_holiday",
        "is_college_event",
    ]
]

# Convert date back to YYYY-MM-DD
df["date"] = df["date"].dt.strftime("%Y-%m-%d")

# Save processed dataset
df.to_csv(
    "ml/processed_dataset.csv",
    index=False
)

print(
    f"Processed dataset created: {len(df)} rows"
)
print("Saved to: ml/processed_dataset.csv")