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

