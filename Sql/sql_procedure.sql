-- ۱. پروسجر رزرو خودکار و بررسی ظرفیت مسابقه
CREATE OR REPLACE PROCEDURE reserve_ticket(
    p_user_id INT,
    p_ticket_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
v_remaining_capacity INT;
BEGIN
SELECT remaining_capacity INTO v_remaining_capacity
FROM tickets
WHERE ticket_id = p_ticket_id
    FOR UPDATE;

IF v_remaining_capacity <= 0 THEN
        RAISE EXCEPTION 'ظرفیت این مسابقه به اتمام رسیده است.';
END IF;

UPDATE tickets
SET remaining_capacity = remaining_capacity - 1
WHERE ticket_id = p_ticket_id;

INSERT INTO reservations (user_id, ticket_id, reservation_status, expires_at)
VALUES (p_user_id, p_ticket_id, 'temporary', CURRENT_TIMESTAMP + INTERVAL '10 minutes');

COMMIT;
END;
$$;


-- ۲. پروسجر لغو رزروهای منقضی شده و بازگرداندن صندلی به ظرفیت مسابقه
CREATE OR REPLACE PROCEDURE cancel_expired_reservations()
LANGUAGE plpgsql
AS $$
DECLARE
r_record RECORD;
BEGIN
FOR r_record IN
SELECT reservation_id, ticket_id
FROM reservations
WHERE reservation_status = 'temporary' AND expires_at < CURRENT_TIMESTAMP
    LOOP
UPDATE reservations
SET reservation_status = 'cancelled'
WHERE reservation_id = r_record.reservation_id;

UPDATE tickets
SET remaining_capacity = remaining_capacity + 1
WHERE ticket_id = r_record.ticket_id;
END LOOP;

COMMIT;
END;
$$;


-- ۳. پروسجر ثبت پرداخت و نهایی‌سازی خرید بلیط
CREATE OR REPLACE PROCEDURE finalize_purchase(
    p_user_id INT,
    p_reservation_id INT,
    p_amount DECIMAL(10,2),
    p_method VARCHAR(30)
)
LANGUAGE plpgsql
AS $$
BEGIN
UPDATE reservations
SET reservation_status = 'paid'
WHERE reservation_id = p_reservation_id AND user_id = p_user_id;

INSERT INTO payments (user_id, reservation_id, amount, payment_method, payment_status)
VALUES (p_user_id, p_reservation_id, p_amount, p_method, 'success');

COMMIT;
END;
$$;


-- ۴. پروسجر استرداد وجه و کنسل کردن اختیاری بلیط توسط کاربر
CREATE OR REPLACE PROCEDURE refund_and_cancel_ticket(
    p_user_id INT,
    p_reservation_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
v_ticket_id INT;
    v_amount DECIMAL(10,2);
BEGIN
SELECT ticket_id INTO v_ticket_id
FROM reservations
WHERE reservation_id = p_reservation_id AND user_id = p_user_id AND reservation_status = 'paid';

IF NOT FOUND THEN
        RAISE EXCEPTION 'بلیط خریداری شده معتبری برای این کاربر یافت نشد یا قبلاً لغو شده است.';
END IF;

UPDATE reservations
SET reservation_status = 'cancelled'
WHERE reservation_id = p_reservation_id;

UPDATE tickets
SET remaining_capacity = remaining_capacity + 1
WHERE ticket_id = v_ticket_id;

SELECT amount INTO v_amount
FROM payments
WHERE reservation_id = p_reservation_id AND payment_status = 'success'
    LIMIT 1;

INSERT INTO payments (user_id, reservation_id, amount, payment_method, payment_status)
VALUES (p_user_id, p_reservation_id, -v_amount, 'wallet_refund', 'refunded');

COMMIT;
END;
$$;


-- ۵. پروسجر مسدودسازی کاربر مخرب یا غیرفعال کردن کاربران متخلف
CREATE OR REPLACE PROCEDURE ban_or_deactivate_user(
    p_user_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
UPDATE users
SET status = 'inactive'
WHERE user_id = p_user_id;

UPDATE reservations
SET reservation_status = 'cancelled'
WHERE user_id = p_user_id AND reservation_status = 'temporary';

COMMIT;
END;
$$;


-- ۶. پروسجر تخصیص بلیت به جایگاه‌های ویژه (VIP) با قیمت‌گذاری پویا
CREATE OR REPLACE PROCEDURE assign_vip_seat_with_premium(
    p_ticket_id INT,
    p_price_increase_percentage DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
UPDATE tickets
SET base_price = base_price * (1 + p_price_increase_percentage / 100),
    seat_category = 'VIP'
WHERE ticket_id = p_ticket_id;

COMMIT;
END;
$$;


-- ۷. پروسجر تغییر وضعیت گزارش‌های پشتیبانی کاربران به وضعیت بررسی شده
CREATE OR REPLACE PROCEDURE resolve_user_report(
    p_report_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
UPDATE reports
SET status = 'resolved'
WHERE report_id = p_report_id;

COMMIT;
END;
$$;


-- ۸. پروسجر افزایش گروهی ظرفیت ورزشگاه‌ها برای مسابقات پرمخاطب شهر تهران
CREATE OR REPLACE PROCEDURE increase_tehran_venues_capacity(
    p_capacity_bonus INT
)
LANGUAGE plpgsql
AS $$
BEGIN
UPDATE venues
SET capacity = capacity + p_capacity_bonus
WHERE province = 'تهران';

UPDATE tickets
SET remaining_capacity = remaining_capacity + p_capacity_bonus
WHERE venue_id IN (SELECT venue_id FROM venues WHERE province = 'تهران');

COMMIT;
END;
$$;