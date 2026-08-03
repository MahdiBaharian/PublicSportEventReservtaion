-- Query 1
SELECT first_name, last_name
FROM users
WHERE user_id NOT IN (SELECT user_id FROM reservations);

-- Query 2
SELECT DISTINCT u.first_name, u.last_name
FROM users u
JOIN reservations r ON u.user_id = r.user_id
WHERE r.reservation_status = 'paid';

-- Query 3
SELECT u.first_name, u.last_name,
       EXTRACT(YEAR FROM p.paid_at) AS pay_year,
       EXTRACT(MONTH FROM p.paid_at) AS pay_month,
       SUM(p.amount) AS total_paid
FROM users u
JOIN payments p ON u.user_id = p.user_id
WHERE p.transaction_status = 'success'
GROUP BY u.first_name, u.last_name, EXTRACT(YEAR FROM p.paid_at), EXTRACT(MONTH FROM p.paid_at)
ORDER BY pay_year, pay_month, u.first_name, u.last_name;

-- Query 4
SELECT u.first_name, u.last_name, t.venue_city
FROM users u
JOIN reservations r ON u.user_id = r.user_id
JOIN tickets t ON r.ticket_id = t.ticket_id
WHERE r.reservation_status = 'paid'
GROUP BY u.user_id, u.first_name, u.last_name, t.venue_city
HAVING COUNT(r.reservation_id) = 1;

-- Query 5
SELECT u.*
FROM users u
JOIN payments p ON u.user_id = p.user_id
WHERE p.transaction_status = 'success'
ORDER BY p.paid_at DESC
LIMIT 1;

-- Query 6
SELECT u.phone_number, u.email
FROM users u
JOIN payments p ON u.user_id = p.user_id
WHERE p.transaction_status = 'success'
GROUP BY u.user_id, u.phone_number, u.email
HAVING SUM(p.amount) > (
    SELECT SUM(amount) / COUNT(DISTINCT user_id)
    FROM payments
    WHERE transaction_status = 'success'
);

-- Query 7
SELECT t.sport_type, SUM(r.quantity) AS total_sold
FROM tickets t
JOIN reservations r ON t.ticket_id = r.ticket_id
WHERE r.reservation_status = 'paid'
GROUP BY t.sport_type;

-- Query 8
SELECT u.first_name, u.last_name, SUM(r.quantity) AS total_tickets
FROM users u
JOIN reservations r ON u.user_id = r.user_id
WHERE r.reservation_status = 'paid'
  AND r.reserved_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY u.user_id, u.first_name, u.last_name
ORDER BY total_tickets DESC
LIMIT 3;

-- Query 9
SELECT t.venue_city, SUM(r.quantity) AS total_sold
FROM tickets t
JOIN reservations r ON t.ticket_id = r.ticket_id
WHERE r.reservation_status = 'paid' 
  AND t.venue_city IN ('تهران', 'ری', 'قدس', 'اسلام‌شهر', 'ملارد')
GROUP BY t.venue_city;

-- Query 10
SELECT DISTINCT t.venue_city
FROM tickets t
JOIN reservations r ON t.ticket_id = r.ticket_id
WHERE r.reservation_status = 'paid'
  AND r.user_id = (
      SELECT user_id
      FROM users
      ORDER BY created_at ASC
      LIMIT 1
  );

-- Query 11
SELECT first_name, last_name
FROM users
WHERE role = 'admin';

-- Query 12
SELECT u.first_name, u.last_name
FROM users u
JOIN reservations r ON u.user_id = r.user_id
WHERE r.reservation_status = 'paid'
GROUP BY u.user_id, u.first_name, u.last_name
HAVING SUM(r.quantity) >= 2;

-- Query 13
SELECT u.first_name, u.last_name
FROM users u
JOIN reservations r ON u.user_id = r.user_id
JOIN tickets t ON r.ticket_id = t.ticket_id
WHERE r.reservation_status = 'paid' 
  AND t.sport_type = 'football'
GROUP BY u.user_id, u.first_name, u.last_name
HAVING SUM(r.quantity) <= 2;

-- Query 14
SELECT u.email, u.phone_number
FROM users u
JOIN reservations r ON u.user_id = r.user_id
JOIN tickets t ON r.ticket_id = t.ticket_id
WHERE r.reservation_status = 'paid'
  AND t.sport_type IN ('football', 'volleyball', 'basketball')
GROUP BY u.user_id, u.email, u.phone_number
HAVING COUNT(DISTINCT t.sport_type) = 3;

-- Query 15
SELECT t.*, p.paid_at
FROM tickets t
JOIN reservations r ON t.ticket_id = r.ticket_id
JOIN payments p ON r.reservation_id = p.reservation_id
WHERE p.transaction_status = 'success'
  AND DATE(p.paid_at) = CURRENT_DATE
ORDER BY p.paid_at ASC;

-- Query 16
SELECT t.ticket_id, t.sport_type, t.home_team, t.away_team, SUM(r.quantity) AS total_sold
FROM tickets t
JOIN reservations r ON t.ticket_id = r.ticket_id
WHERE r.reservation_status = 'paid'
GROUP BY t.ticket_id
ORDER BY total_sold DESC
OFFSET 1 LIMIT 1;

-- Query 17
SELECT u.first_name, u.last_name, 
       COUNT(r.reservation_id) AS total_cancellations,
       ROUND((COUNT(r.reservation_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM reservations WHERE reservation_status = 'cancelled'), 0)), 2) AS cancellation_percentage
FROM users u
JOIN reservations r ON u.user_id = r.user_id 
WHERE u.role = 'admin' AND r.reservation_status = 'cancelled'
GROUP BY u.user_id, u.first_name, u.last_name
ORDER BY total_cancellations DESC
LIMIT 1;

-- Query 18
UPDATE users
SET last_name = 'ردینگتون'
WHERE user_id = (
    SELECT user_id
    FROM reservations
    WHERE reservation_status = 'cancelled'
    GROUP BY user_id
    ORDER BY COUNT(reservation_id) DESC
    LIMIT 1
);

-- Query 19
DELETE FROM reservations
WHERE reservation_status = 'cancelled'
  AND user_id IN (
      SELECT user_id
      FROM users
      WHERE last_name = 'ردینگتون'
  );

-- Query 20
DELETE FROM reservations
WHERE reservation_status = 'cancelled';

-- Query 21
UPDATE tickets
SET price = price * 0.90
WHERE ticket_id IN (
    SELECT r.ticket_id
    FROM reservations r
    JOIN match_details md ON r.ticket_id = md.ticket_id
    WHERE md.venue_name = 'ورزشگاه آزادی'
      AND DATE(r.reserved_at) = CURRENT_DATE - INTERVAL '1 day'
      AND r.reservation_status = 'paid'
);

-- Query 22
SELECT rep.report_type, COUNT(rep.report_id) AS report_count
FROM reports rep
JOIN reservations res ON rep.reservation_id = res.reservation_id
WHERE res.ticket_id = (
    SELECT r.ticket_id
    FROM reports rp
    JOIN reservations r ON rp.reservation_id = r.reservation_id
    GROUP BY r.ticket_id
    ORDER BY COUNT(rp.report_id) DESC
    LIMIT 1
)
GROUP BY rep.report_type;
