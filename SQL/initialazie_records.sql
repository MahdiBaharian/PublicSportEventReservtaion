-- 1. Insert Users
-- Including an oldest user, a high-spender, users with no reservations, and admins.
INSERT INTO users (user_id, first_name, last_name, username, email, phone_number, password_hash, role, city, account_status, created_at) VALUES
(1, 'علی', 'قدیمی', 'ali_old', 'ali.old@example.com', '09110000000', 'hash1', 'spectator', 'تهران', 'active', CURRENT_TIMESTAMP - INTERVAL '5 years'), 
(2, 'محمد', 'خریدار', 'mohammad_vip', 'mohammad@example.com', '09122222222', 'hash2', 'spectator', 'تهران', 'active', CURRENT_TIMESTAMP - INTERVAL '1 year'), 
(3, 'زهرا', 'کنسلی', 'zahra_cancel', 'zahra@example.com', '09353333333', 'hash3', 'spectator', 'اصفهان', 'active', CURRENT_TIMESTAMP - INTERVAL '1 year'), 
(4, 'رضا', 'بدون‌خرید', 'reza_none', 'reza@example.com', '09134444444', 'hash4', 'spectator', 'مشهد', 'active', CURRENT_TIMESTAMP - INTERVAL '1 year'), 
(5, 'مریم', 'ادمین', 'admin1', 'admin1@tickets.com', '09199999999', 'adminhash1', 'admin', 'تهران', 'active', CURRENT_TIMESTAMP - INTERVAL '2 years'), 
(6, 'حسین', 'تک‌خرید', 'hossein_one', 'hossein@example.com', '09156666666', 'hash6', 'spectator', 'ری', 'active', CURRENT_TIMESTAMP - INTERVAL '1 year'),
(7, 'سارا', 'ورزشی', 'sara_sport', 'sara@example.com', '09177777777', 'hash7', 'spectator', 'تبریز', 'active', CURRENT_TIMESTAMP - INTERVAL '6 months'),
(8, 'امیر', 'تستی', 'amir_test', 'amir@example.com', '09188888888', 'hash8', 'spectator', 'کرج', 'inactive', CURRENT_TIMESTAMP - INTERVAL '3 months'),
(9, 'پشتیبان', 'دوم', 'admin2', 'admin2@tickets.com', '09100000000', 'adminhash2', 'admin', 'اصفهان', 'active', CURRENT_TIMESTAMP - INTERVAL '1 year'),
(10, 'نیما', 'جدید', 'nima_new', 'nima@example.com', '09200000000', 'hash10', 'spectator', 'شیراز', 'active', CURRENT_TIMESTAMP);


-- 2. Insert Tickets
-- Covering different sports and target venues (Azadi, Rey, etc.)
INSERT INTO tickets (ticket_id, sport_type, home_team, away_team, ticket_date_time, venue_city, price, total_capacity, remaining_capacity, category) VALUES
(1, 'football', 'پرسپولیس', 'استقلال', CURRENT_TIMESTAMP + INTERVAL '2 days', 'تهران', 150000.00, 80000, 500, 'VIP'), 
(2, 'volleyball', 'پیکان', 'شهداب یزد', CURRENT_TIMESTAMP + INTERVAL '1 day', 'تهران', 80000.00, 3000, 150, 'Premium'),
(3, 'basketball', 'شهرداری گرگان', 'ذوب آهن', CURRENT_TIMESTAMP + INTERVAL '5 days', 'اصفهان', 70000.00, 6000, 0, 'Regular'),
(4, 'football', 'سپاهان', 'تراکتور', CURRENT_TIMESTAMP + INTERVAL '4 days', 'اصفهان', 100000.00, 45000, 1200, 'Regular'),
(5, 'football', 'ملوان', 'نساجی', CURRENT_TIMESTAMP + INTERVAL '6 days', 'ری', 50000.00, 10000, 800, 'Regular'),
(6, 'basketball', 'مهرام', 'طبیعت', CURRENT_TIMESTAMP + INTERVAL '12 days', 'تهران', 60000.00, 12000, 300, 'Regular'),
(7, 'volleyball', 'شهرداری ارومیه', 'پاس گرگان', CURRENT_TIMESTAMP + INTERVAL '2 days', 'ارومیه', 60000.00, 4000, 100, 'Premium'),
(8, 'football', 'تراکتور', 'فولاد', CURRENT_TIMESTAMP + INTERVAL '8 days', 'تبریز', 80000.00, 50000, 2000, 'Regular'),
(9, 'basketball', 'پالایش نفت', 'مس کرمان', CURRENT_TIMESTAMP + INTERVAL '3 days', 'آبادان', 50000.00, 3000, 50, 'Regular'),
(10, 'football', 'فولاد خوزستان', 'هوادار', CURRENT_TIMESTAMP + INTERVAL '9 days', 'اهواز', 50000.00, 12000, 1000, 'Regular');


-- 3. Insert Match Details
INSERT INTO match_details (ticket_id, organizer, tournament_name, venue_name, facilities) VALUES
(1, 'سازمان لیگ', 'لیگ برتر فوتبال ایران', 'ورزشگاه آزادی', 'دسترسی به بوفه، پارکینگ VIP'), 
(2, 'فدراسیون والیبال', 'لیگ برتر والیبال', 'سالن ۱۲ هزار نفری', 'تهویه مطبوع'),
(3, 'فدراسیون بسکتبال', 'لیگ برتر بسکتبال', 'سالن ۲۵ آبان', 'نزدیک خروجی اضطراری'),
(4, 'هیئت فوتبال', 'لیگ برتر فوتبال ایران', 'ورزشگاه نقش جهان', 'پارکینگ عمومی'),
(5, 'هیئت فوتبال', 'جام حذفی', 'ورزشگاه شهرقدس', 'بدون امکانات خاص'),
(6, 'فدراسیون بسکتبال', 'سوپر لیگ بسکتبال', 'سالن آزادی', 'بوفه اختصاصی'),
(7, 'فدراسیون والیبال', 'لیگ برتر والیبال', 'سالن غدیر ارومیه', 'دسترسی ویلچر'),
(8, 'هیئت فوتبال', 'لیگ برتر فوتبال ایران', 'ورزشگاه یادگار امام', 'پارکینگ'),
(9, 'فدراسیون بسکتبال', 'لیگ برتر بسکتبال', 'سالن ۱۷ شهریور', 'تهویه مناسب'),
(10, 'سازمان لیگ', 'لیگ برتر فوتبال', 'ورزشگاه شهدای فولاد', 'دسترسی به اورژانس');


-- 4. Insert Reservations
-- Includes exactly 1 ticket in Rey, multiple cancellations for 'Reddington' target, and an Azadi reservation from yesterday.
INSERT INTO reservations (reservation_id, user_id, ticket_id, quantity, seat_info, reservation_status, reserved_at) VALUES
(1, 1, 1, 1, 'صندلی ۱', 'paid', CURRENT_TIMESTAMP - INTERVAL '3 days'), 
(2, 1, 3, 1, 'صندلی ۲', 'paid', CURRENT_TIMESTAMP - INTERVAL '2 days'), 
(3, 2, 1, 5, 'VIP 1', 'paid', CURRENT_TIMESTAMP), 
(4, 2, 2, 8, 'عادی', 'paid', CURRENT_TIMESTAMP - INTERVAL '1 day'), 
(5, 2, 3, 1, 'عادی', 'paid', CURRENT_TIMESTAMP - INTERVAL '2 days'), 
(6, 6, 5, 1, 'صندلی ۱۰', 'paid', CURRENT_TIMESTAMP - INTERVAL '4 days'), 
(7, 3, 1, 2, 'صندلی ۱۴', 'cancelled', CURRENT_TIMESTAMP - INTERVAL '5 days'), 
(8, 3, 2, 3, 'صندلی ۱۶', 'cancelled', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(9, 3, 3, 1, 'صندلی ۱۸', 'cancelled', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(10, 5, 4, 1, 'صندلی ۵', 'cancelled', CURRENT_TIMESTAMP - INTERVAL '6 days'), 
(11, 2, 1, 10, 'VIP 2', 'paid', CURRENT_DATE - INTERVAL '1 day'), 
(12, 7, 8, 2, 'عادی', 'paid', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(13, 8, 6, 1, 'ردیف ۱', 'paid', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(14, 10, 7, 2, 'ردیف ۵', 'paid', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(15, 10, 9, 3, 'عادی', 'reserved', CURRENT_TIMESTAMP);


-- 5. Insert Payments
-- Matches the 'paid' reservations precisely.
INSERT INTO payments (payment_id, user_id, reservation_id, amount, method, transaction_status, tracking_code, paid_at) VALUES
(1, 1, 1, 150000.00, 'card', 'success', 'TRX1001', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 1, 2, 70000.00, 'card', 'success', 'TRX1002', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(3, 2, 3, 750000.00, 'card', 'success', 'TRX1003', CURRENT_TIMESTAMP), 
(4, 2, 4, 640000.00, 'card', 'success', 'TRX1004', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(5, 2, 5, 70000.00, 'card', 'success', 'TRX1005', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(6, 6, 6, 50000.00, 'card', 'success', 'TRX1006', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(7, 2, 11, 1500000.00, 'wallet', 'success', 'TRX1007', CURRENT_DATE - INTERVAL '1 day'),
(8, 7, 12, 160000.00, 'card', 'success', 'TRX1008', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(9, 8, 13, 60000.00, 'crypto', 'success', 'TRX1009', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(10, 10, 14, 120000.00, 'card', 'success', 'TRX1010', CURRENT_TIMESTAMP - INTERVAL '10 days');


-- 6. Insert Reports
-- Makes Ticket 1 the most reported (for Q22) and targets 'seat_issue' for SP 8.
INSERT INTO reports (report_id, reservation_id, report_type, description, reply, report_status, reported_at) VALUES
(1, 1, 'seat_issue', 'صندلی خراب بود و تکیه‌گاه نداشت', NULL, 'pending', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 3, 'payment_issue', 'دوبار مبلغ از حسابم کم شد', 'در حال پیگیری هستیم', 'investigating', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
(3, 11, 'seat_issue', 'شماره صندلی با شخص دیگری تداخل داشت', NULL, 'pending', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(4, 1, 'seat_issue', 'علاوه بر خرابی، مسیر عبور مسدود بود', 'بررسی شد', 'resolved', CURRENT_TIMESTAMP - INTERVAL '1 day'), 
(5, 2, 'technical_issue', 'بارکد روی گوشی لود نمی‌شود', NULL, 'pending', CURRENT_TIMESTAMP - INTERVAL '1 day'), 
(6, 4, 'payment_issue', 'پیامک تایید پرداخت نیامد', NULL, 'pending', CURRENT_TIMESTAMP - INTERVAL '10 hours'),
(7, 5, 'venue_issue', 'پارکینگ سالن ۲۵ آبان بسته بود', 'اطلاع‌رسانی شد', 'resolved', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(8, 6, 'technical_issue', 'سایت هنگام فیلتر شهر ری کند بود', NULL, 'pending', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(9, 12, 'venue_issue', 'گیت ورود بسیار شلوغ بود', NULL, 'pending', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(10, 14, 'technical_issue', 'بلیت من در پنل کاربری نمایش داده نمیشد', 'برطرف گردید', 'resolved', CURRENT_TIMESTAMP - INTERVAL '9 days');