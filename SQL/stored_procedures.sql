-- SP 1
CREATE OR REPLACE FUNCTION get_user_purchased_tickets(p_identifier VARCHAR)
RETURNS TABLE (
    ticket_id INTEGER,
    sport_type VARCHAR,
    home_team VARCHAR,
    away_team VARCHAR,
    ticket_date_time TIMESTAMP,
    venue_city VARCHAR,
    price DECIMAL(12, 2),
    category VARCHAR,
    paid_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.ticket_id, t.sport_type, t.home_team, t.away_team, t.ticket_date_time, t.venue_city, t.price, t.category, p.paid_at
    FROM users u
    JOIN reservations r ON u.user_id = r.user_id
    JOIN tickets t ON r.ticket_id = t.ticket_id
    JOIN payments p ON r.reservation_id = p.reservation_id
    WHERE (u.email = p_identifier OR u.phone_number = p_identifier)
      AND p.transaction_status = 'success'
    ORDER BY p.paid_at ASC;
END;
$$ LANGUAGE plpgsql;

-- SP 2
CREATE OR REPLACE FUNCTION get_cancelled_users_by_admin(p_admin_identifier VARCHAR)
RETURNS TABLE (
    first_name VARCHAR,
    last_name VARCHAR
) AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE (email = p_admin_identifier OR phone_number = p_admin_identifier) 
          AND role = 'admin'
    ) THEN
        RETURN QUERY
        SELECT DISTINCT u.first_name, u.last_name
        FROM users u
        JOIN reservations r ON u.user_id = r.user_id
        WHERE r.reservation_status = 'cancelled';
    ELSE
        RAISE EXCEPTION 'Unauthorized: Invalid admin identifier';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- SP 3
CREATE OR REPLACE FUNCTION get_purchased_tickets_by_city(p_city_name VARCHAR)
RETURNS TABLE (
    ticket_id INTEGER,
    sport_type VARCHAR,
    home_team VARCHAR,
    away_team VARCHAR,
    ticket_date_time TIMESTAMP,
    category VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.ticket_id, t.sport_type, t.home_team, t.away_team, t.ticket_date_time, t.category
    FROM tickets t
    JOIN reservations r ON t.ticket_id = r.ticket_id
    WHERE t.venue_city = p_city_name 
      AND r.reservation_status = 'paid';
END;
$$ LANGUAGE plpgsql;

-- SP 4
CREATE OR REPLACE FUNCTION search_tickets_by_term(p_search_term VARCHAR)
RETURNS TABLE (
    ticket_id INTEGER,
    sport_type VARCHAR,
    home_team VARCHAR,
    away_team VARCHAR,
    venue_name VARCHAR,
    category VARCHAR,
    spectator_first_name VARCHAR,
    spectator_last_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.ticket_id, t.sport_type, t.home_team, t.away_team, md.venue_name, t.category, u.first_name, u.last_name
    FROM tickets t
    JOIN match_details md ON t.ticket_id = md.ticket_id
    JOIN reservations r ON t.ticket_id = r.ticket_id
    JOIN users u ON r.user_id = u.user_id
    WHERE u.first_name ILIKE '%' || p_search_term || '%'
       OR u.last_name ILIKE '%' || p_search_term || '%'
       OR t.home_team ILIKE '%' || p_search_term || '%'
       OR t.away_team ILIKE '%' || p_search_term || '%'
       OR md.venue_name ILIKE '%' || p_search_term || '%'
       OR t.category ILIKE '%' || p_search_term || '%';
END;
$$ LANGUAGE plpgsql;

