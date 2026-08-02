CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    city VARCHAR(100),
    account_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    sport_type VARCHAR(100),
    home_team VARCHAR(100),
    away_team VARCHAR(100),
    ticket_date_time TIMESTAMP,
    venue_city VARCHAR(100),
    price DECIMAL(12, 2),
    total_capacity INTEGER,
    remaining_capacity INTEGER,
    category VARCHAR(50)
);

CREATE TABLE match_details (
    ticket_id INTEGER PRIMARY KEY REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    organizer VARCHAR(150),
    tournament_name VARCHAR(150),
    venue_name VARCHAR(150),
    facilities TEXT
);

CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    ticket_id INTEGER REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    seat_info VARCHAR(255),
    reservation_status VARCHAR(50),
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    reservation_id INTEGER REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    method VARCHAR(50),
    transaction_status VARCHAR(50),
    tracking_code VARCHAR(255) UNIQUE,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    report_type VARCHAR(100),
    description TEXT,
    reply TEXT,
    report_status VARCHAR(50),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
