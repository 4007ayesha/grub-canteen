import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)

menu_items = [1, 2, 3, 4, 5]

start_date = datetime(2026, 1, 1)
num_days = 120

rows = []

for item_id in menu_items:
    # Give each menu item a different popularity baseline
    base_demand = np.random.randint(20, 60)

    for day_offset in range(num_days):
        date = start_date + timedelta(days=day_offset)
        day_of_week = date.weekday()

        # Weekends usually have fewer students
        weekend_factor = 0.6 if day_of_week >= 5 else 1.0

        # Add some random holidays and college events
        is_holiday = np.random.rand() < 0.03
        is_event = np.random.rand() < 0.05

        if is_event:
            event_factor = 1.5
        elif is_holiday:
            event_factor = 0.3
        else:
            event_factor = 1.0

        # Add small random variation
        noise = np.random.normal(0, 5)

        quantity_sold = max(
            0,
            int(base_demand * weekend_factor * event_factor + noise)
        )

        rows.append({
            "date": date.strftime("%Y-%m-%d"),
            "menu_item_id": item_id,
            "day_of_week": day_of_week,
            "quantity_sold": quantity_sold,
            "is_holiday": is_holiday,
            "is_college_event": is_event,
        })

df = pd.DataFrame(rows)

df.to_csv("ml/synthetic_orders.csv", index=False)

print(
    f"Generated {len(df)} rows -> ml/synthetic_orders.csv"
)