SELECT
    DATE(o.created_at) AS date,
    oi.menu_item_id,
    DAYOFWEEK(o.created_at) - 2 AS day_of_week,
    SUM(oi.quantity) AS quantity_sold
FROM orders o
JOIN order_items oi
    ON o.id = oi.order_id
WHERE o.status = 'collected'
GROUP BY
    DATE(o.created_at),
    oi.menu_item_id
ORDER BY
    date,
    oi.menu_item_id;