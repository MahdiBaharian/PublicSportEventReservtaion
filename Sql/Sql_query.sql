CREATE INDEX idx_tickets_match_date ON tickets(match_date);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_reservations_status ON reservations(reservation_status);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_reservations_user_ticket ON reservations(user_id, ticket_id);

SELECT * FROM users u
WHERE u.role = 'spectator'
  AND NOT EXISTS (
    SELECT 1 FROM reservations r WHERE r.user_id = u.user_id
);

SELECT DISTINCT u.* FROM users u
                             JOIN reservations r ON u.user_id = r.user_id
WHERE r.reservation_status = 'temporary'
  AND NOT EXISTS (
    SELECT 1 FROM payments p
    WHERE p.reservation_id = r.reservation_id
      AND p.payment_status = 'success'
);

SELECT
    p.user_id,
    EXTRACT(MONTH FROM p.transaction_time) AS payment_month,
    SUM(p.amount) AS total_paid
FROM payments p
WHERE p.payment_status = 'success'
  AND p.transaction_time >= DATE_TRUNC('year', CURRENT_TIMESTAMP)
GROUP BY p.user_id, EXTRACT(MONTH FROM p.transaction_time)
ORDER BY p.user_id, payment_month;

SELECT user_id, CAST(reserved_at AS DATE) AS res_date, COUNT(*) AS cancelled_count
FROM reservations
WHERE reservation_status = 'cancelled'
GROUP BY user_id, CAST(reserved_at AS DATE)
HAVING COUNT(*) > 3;

WITH RankedPurchases AS (
    SELECT t.*, r.reserved_at,
           ROW_NUMBER() OVER(PARTITION BY t.sport_type ORDER BY r.reserved_at DESC) as rn
    FROM tickets t
             JOIN reservations r ON t.ticket_id = r.ticket_id
    WHERE r.reservation_status = 'paid'
)
SELECT * FROM RankedPurchases WHERE rn = 1;

SELECT phone_number FROM users WHERE user_id IN (
    SELECT user_id FROM payments
    WHERE payment_status = 'success'
    GROUP BY user_id
    HAVING SUM(amount) > (SELECT AVG(amount) FROM payments WHERE payment_status = 'success')
);

SELECT t.sport_type, COUNT(r.reservation_id) AS total_sold
FROM tickets t
         JOIN reservations r ON t.ticket_id = r.ticket_id
WHERE r.reservation_status = 'paid'
GROUP BY t.sport_type;

SELECT p.user_id, u.full_name, SUM(p.amount) AS total_spent
FROM payments p
         JOIN users u ON p.user_id = u.user_id
WHERE p.payment_status = 'success'
  AND p.transaction_time >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY p.user_id, u.full_name
ORDER BY total_spent DESC
    LIMIT 3;

SELECT v.city, COUNT(t.ticket_id) AS match_count
FROM tickets t
         JOIN venues v ON t.venue_id = v.venue_id
WHERE v.province = 'تهران'
GROUP BY v.city;

SELECT DISTINCT v.city
FROM venues v
         JOIN tickets t ON v.venue_id = t.venue_id
         JOIN reservations r ON t.ticket_id = r.ticket_id
WHERE r.user_id = (SELECT user_id FROM users ORDER BY created_at ASC LIMIT 1)
  AND r.reservation_status = 'paid';

SELECT * FROM tickets WHERE remaining_capacity = 0;

SELECT user_id, CAST(transaction_time AS DATE) AS p_date, COUNT(*)
FROM payments
WHERE payment_status = 'success'
GROUP BY user_id, CAST(transaction_time AS DATE)
HAVING COUNT(*) > 2;

SELECT * FROM (
                  SELECT *, AVG(base_price) OVER(PARTITION BY sport_type) AS avg_sport_price
                  FROM tickets
              ) t WHERE base_price > avg_sport_price;

SELECT * FROM venues v
WHERE NOT EXISTS (SELECT 1 FROM tickets t WHERE t.venue_id = v.venue_id);

SELECT user_id FROM reservations r JOIN tickets t ON r.ticket_id = t.ticket_id WHERE t.sport_type = 'football' AND r.reservation_status = 'paid'
INTERSECT
SELECT user_id FROM reservations r JOIN tickets t ON r.ticket_id = t.ticket_id WHERE t.sport_type = 'volleyball' AND r.reservation_status = 'paid';

SELECT t.*, COUNT(r.reservation_id) AS sales_count
FROM tickets t
         JOIN reservations r ON t.ticket_id = r.ticket_id
WHERE r.reservation_status = 'paid'
GROUP BY t.ticket_id
ORDER BY sales_count DESC
    LIMIT 1 OFFSET 1;

SELECT
    (COUNT(CASE WHEN reservation_status = 'cancelled' THEN 1 END) * 100.0 / COUNT(*)) AS cancellation_rate
FROM reservations;

UPDATE users
SET full_name = 'ردینگتون'
WHERE user_id = (
    SELECT user_id FROM reservations
    WHERE reservation_status = 'cancelled'
    GROUP BY user_id
    ORDER BY COUNT(*) DESC LIMIT 1
    );

DELETE FROM reservations
WHERE reservation_status = 'cancelled'
  AND user_id = (SELECT user_id FROM users WHERE full_name = 'ردینگتون' LIMIT 1);

UPDATE payments
SET payment_method = 'wallet_refund', payment_status = 'pending_refund'
WHERE payment_status = 'failed';

SELECT u.full_name, r.report_text, r.created_at
FROM reports r
         JOIN users u ON r.user_id = u.user_id
WHERE r.status = 'pending';

SELECT t.ticket_id, t.home_team, t.away_team, COUNT(r.report_id) AS report_count
FROM tickets t
         JOIN reports r ON t.ticket_id = r.ticket_id
WHERE t.match_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '7 days'
GROUP BY t.ticket_id, t.home_team, t.away_team
ORDER BY report_count DESC;