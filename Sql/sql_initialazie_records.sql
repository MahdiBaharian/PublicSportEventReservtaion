-- ۱. درج داده‌های اولیه در جدول کاربران (Users) - تماشاگران و ادمین‌ها
INSERT INTO users (user_id, full_name, email, phone_number, password_hash, role, city, status) VALUES
                                                                                                   (1, 'علی رضایی', 'ali@example.com', '09121111111', 'hash1', 'spectator', 'تهران', 'active'),
                                                                                                   (2, 'محمد احمدی', 'mohammad@example.com', '09122222222', 'hash2', 'spectator', 'تهران', 'active'),
                                                                                                   (3, 'زهرا کریمی', 'zahra@example.com', '09353333333', 'hash3', 'spectator', 'اصفهان', 'active'),
                                                                                                   (4, 'رضا حسینی', 'reza@example.com', '09134444444', 'hash4', 'spectator', 'مشهد', 'active'),
                                                                                                   (5, 'مریم صادقی', 'maryam@example.com', '09145555555', 'hash5', 'spectator', 'تبریز', 'active'),
                                                                                                   (6, 'حسین موسوی', 'hossein@example.com', '09156666666', 'hash6', 'spectator', 'شیراز', 'active'),
                                                                                                   (7, 'سارا اکبری', 'sara@example.com', '09177777777', 'hash7', 'spectator', 'تهران', 'active'),
                                                                                                   (8, 'امیر محمدی', 'amir@example.com', '09188888888', 'hash8', 'spectator', 'کرج', 'inactive'),
                                                                                                   (9, 'پشتیبان سیستم ۱', 'admin1@tickets.com', '09199999999', 'adminhash1', 'admin', 'تهران', 'active'),
                                                                                                   (10, 'پشتیبان سیستم ۲', 'admin2@tickets.com', '09100000000', 'adminhash2', 'admin', 'اصفهان', 'active');


-- ۲. درج داده‌های اولیه در جدول ورزشگاه‌ها (Venues)
INSERT INTO venues (venue_id, venue_name, city, province, capacity) VALUES
                                                                        (1, 'ورزشگاه آزادی', 'تهران', 'تهران', 80000),
                                                                        (2, 'ورزشگاه نقش جهان', 'اصفهان', 'اصفهان', 45000),
                                                                        (3, 'ورزشگاه یادگار امام', 'تبریز', 'آذربایجان شرقی', 50000),
                                                                        (4, 'ورزشگاه امام رضا', 'مشهد', 'خراسان رضوی', 25000),
                                                                        (5, 'ورزشگاه غدیر', 'اهواز', 'خوزستان', 30000),
                                                                        (6, 'ورزشگاه شهید وطنی', 'قائم‌شهر', 'مازندران', 15000),
                                                                        (7, 'سالن ۱۲ هزار نفری آزادی', 'تهران', 'تهران', 12000),
                                                                        (8, 'سالن فدراسیون والیبال', 'تهران', 'تهران', 3000),
                                                                        (9, 'سالن ۲۵ آبان', 'اصفهان', 'اصفهان', 6000),
                                                                        (10, 'ورزشگاه تختی تهران', 'تهران', 'تهران', 30000);


-- ۳. درج داده‌های اولیه در جدول بلیط مسابقات (Tickets)
-- شامل انواع ورزش‌های فوتبال، والیبال، بسکتبال و تاریخ‌های جاری/آینده
INSERT INTO tickets (ticket_id, sport_type, home_team, away_team, match_date, venue_id, base_price, remaining_capacity, seat_category) VALUES
                                                                                                                                           (101, 'football', 'پرسپولیس', 'استقلال', CURRENT_TIMESTAMP + INTERVAL '2 days', 1, 150000.00, 500, 'Regular'),
                                                                                                                                           (102, 'football', 'پرسپولیس', 'استقلال', CURRENT_TIMESTAMP + INTERVAL '2 days', 1, 300000.00, 50, 'VIP'),
                                                                                                                                           (103, 'football', 'سپاهان', 'تراکتور', CURRENT_TIMESTAMP + INTERVAL '4 days', 2, 100000.00, 1200, 'Regular'),
                                                                                                                                           (104, 'volleyball', 'پیکان', 'شهداب یزد', CURRENT_TIMESTAMP + INTERVAL '1 day', 8, 80000.00, 150, 'Premium'),
                                                                                                                                           (105, 'basketball', 'شهرداری گرگان', 'ذوب آهن', CURRENT_TIMESTAMP + INTERVAL '5 days', 9, 70000.00, 0, 'Regular'), -- نمونه ظرفیت پر شده
                                                                                                                                           (106, 'football', 'استقلال', 'ملوان', CURRENT_TIMESTAMP + INTERVAL '6 days', 1, 120000.00, 800, 'Regular'),
                                                                                                                                           (107, 'volleyball', 'ایران', 'ایتالیا', CURRENT_TIMESTAMP + INTERVAL '7 days', 7, 250000.00, 2000, 'Premium'),
                                                                                                                                           (108, 'football', 'هوادار', 'شمس آذر', CURRENT_TIMESTAMP - INTERVAL '3 days', 10, 50000.00, 10, 'Regular'), -- مسابقه در گذشته
                                                                                                                                           (109, 'football', 'ذوب آهن', 'سپاهان', CURRENT_TIMESTAMP + INTERVAL '10 days', 2, 90000.00, 400, 'Regular'),
                                                                                                                                           (110, 'basketball', 'مهرام', 'طبیعت', CURRENT_TIMESTAMP + INTERVAL '12 days', 7, 60000.00, 300, 'Regular');


-- ۴. درج داده‌های اولیه در جدول جزئیات اختصاصی مسابقات (Sports_Details)
INSERT INTO sports_details (detail_id, ticket_id, tournament_name, gate_number, section_number, row_number, seat_number, special_amenities) VALUES
                                                                                                                                                (1, 101, 'لیگ برتر فوتبال ایران', 'گیت غرب ۵', 'بخش ۲۲', 'ردیف ۱۰', 'صندلی ۱۵', 'دسترسی به بوفه غرب'),
                                                                                                                                                (2, 102, 'لیگ برتر فوتبال ایران', 'گیت ویژه VIP', 'جایگاه ویژه A', 'ردیف ۱', 'صندلی ۵', 'پذیرایی ویژه، پارکینگ اختصاصی، صندلی چرمی مبله'),
                                                                                                                                                (3, 103, 'لیگ برتر فوتبال ایران', 'گیت شمال ۳', 'بخش ۷', 'ردیف ۵', 'صندلی ۱۲', 'بدون امکانات خاص'),
                                                                                                                                                (4, 104, 'لیگ برتر والیبال', 'ورودی اصلی', 'جایگاه روبه‌رو', 'ردیف ۳', 'صندلی ۸', 'سقف سرپوشیده، تهویه مطبوع'),
                                                                                                                                                (5, 105, 'لیگ برتر بسکتبال', 'ورودی سالن ۲۵ آبان', 'بخش پشت سبد', 'ردیف ۱۲', 'صندلی ۱', 'نزدیک به خروجی اضطراری'),
                                                                                                                                                (6, 106, 'لیگ برتر فوتبال ایران', 'گیت شرق ۲', 'بخش ۱4', 'ردیف ۱۸', 'صندلی ۴', 'دسترسی به سرویس بهداشتی شرق'),
                                                                                                                                                (7, 107, 'لیگ ملت‌های والیبال', 'گیت ۱ سالن ۱۲ هزار نفری', 'جایگاه ویژه B', 'ردیف ۲', 'صندلی ۲۰', 'پذیرایی میان‌وعده، اینترنت رایگان'),
                                                                                                                                                (8, 108, 'لیگ برتر فوتبال ایران', 'ورودی شماره ۱', 'بخش عمومی', 'ردیف ۳۰', 'صندلی ۴۵', 'بدون امکانات خاص'),
                                                                                                                                                (9, 109, 'لیگ برتر فوتبال ایران', 'گیت جنوب ۴', 'بخش ۹', 'ردیف ۲', 'صندلی ۱۱', 'دید عالی به نیمکت ذخیره‌ها'),
                                                                                                                                                (10, 110, 'سوپر لیگ بسکتبال', 'گیت ۳ سالن آزادی', 'بخش کناری', 'ردیف ۵', 'صندلی ۹', 'تهویه مناسب');


-- ۵. درج داده‌های اولیه در جدول رزروها (Reservations)
-- وضعیت‌ها شامل: temporary (موقت)، paid (پرداخت شده)، cancelled (لغو شده)
INSERT INTO reservations (reservation_id, user_id, ticket_id, reservation_status, reserved_at, expires_at) VALUES
                                                                                                               (1001, 1, 101, 'paid', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour 50 minutes'),
                                                                                                               (1002, 1, 104, 'paid', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '50 minutes'),
                                                                                                               (1003, 2, 101, 'temporary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '10 minutes'), -- رزرو فعلی و معتبر موقت
                                                                                                               (1004, 3, 103, 'paid', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '23 hours 50 minutes'),
                                                                                                               (1005, 4, 105, 'paid', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '2 hours 50 minutes'),
                                                                                                               (1006, 5, 102, 'cancelled', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours 50 minutes'),
                                                                                                               (1007, 6, 107, 'temporary', CURRENT_TIMESTAMP - INTERVAL '15 minutes', CURRENT_TIMESTAMP - INTERVAL '5 minutes'), -- رزرو منقضی شده (برای تست پروسجر لغو)
                                                                                                               (1008, 7, 101, 'paid', CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '20 minutes'),
                                                                                                               (1009, 2, 106, 'cancelled', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '23 hours 50 minutes'),
                                                                                                               (1010, 3, 107, 'paid', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours 50 minutes');


-- ۶. درج داده‌های اولیه در جدول تراکنش‌ها و پرداخت‌ها (Payments)
INSERT INTO payments (payment_id, user_id, reservation_id, amount, payment_method, payment_status, transaction_time) VALUES
                                                                                                                         (2001, 1, 1001, 150000.00, 'card', 'success', CURRENT_TIMESTAMP - INTERVAL '1 hour 55 minutes'),
                                                                                                                         (2002, 1, 1002, 80000.00, 'wallet', 'success', CURRENT_TIMESTAMP - INTERVAL '55 minutes'),
                                                                                                                         (2003, 3, 1004, 100000.00, 'card', 'success', CURRENT_TIMESTAMP - INTERVAL '23 hours 55 minutes'),
                                                                                                                         (2004, 4, 1005, 70000.00, 'card', 'success', CURRENT_TIMESTAMP - INTERVAL '2 hours 52 minutes'),
                                                                                                                         (2005, 5, 1006, 300000.00, 'card', 'failed', CURRENT_TIMESTAMP - INTERVAL '4 hours 58 minutes'), -- تراکنش ناموفق
                                                                                                                         (2006, 7, 1008, 150000.00, 'wallet', 'success', CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
                                                                                                                         (2007, 3, 1010, 250000.00, 'crypto', 'success', CURRENT_TIMESTAMP - INTERVAL '3 hours 52 minutes'),
                                                                                                                         (2008, 2, 1003, 150000.00, 'card', 'pending', CURRENT_TIMESTAMP),
                                                                                                                         (2009, 6, 1007, 250000.00, 'card', 'failed', CURRENT_TIMESTAMP - INTERVAL '12 minutes'),
                                                                                                                         (2010, 1, 1001, 150000.00, 'card', 'failed', CURRENT_TIMESTAMP - INTERVAL '2 hours');


-- ۷. درج داده‌های اولیه در جدول گزارش‌های کاربران (Reports)
INSERT INTO reports (report_id, user_id, ticket_id, reservation_id, category, report_text, status, created_at) VALUES
                                                                                                                   (501, 1, 101, 1001, 'seat_issue', 'شماره صندلی من با شخص دیگری تداخل دارد.', 'pending', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
                                                                                                                   (502, 5, 102, 1006, 'payment_issue', 'مبلغ از حساب من کم شد اما بلیت رزرو نشد.', 'pending', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
                                                                                                                   (503, 3, 103, 1004, 'venue_issue', 'آدرس دقیق پارکینگ ورزشگاه نقش جهان مشخص نیست.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '20 hours'),
                                                                                                                   (504, 4, 105, 1005, 'technical_issue', 'بارکد بلیت روی گوشی من لود نمی‌شود.', 'pending', CURRENT_TIMESTAMP - INTERVAL '2 days'),
                                                                                                                   (505, 6, 107, 1007, 'payment_issue', 'درگاه بانکی وسط تراکنش ارور داد.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '10 minutes'),
                                                                                                                   (506, 2, 101, NULL, 'technical_issue', 'منوی فیلتر بر اساس تاریخ مسابقات کار نمی‌کند.', 'pending', CURRENT_TIMESTAMP),
                                                                                                                   (507, 7, 101, 1008, 'seat_issue', 'دید جایگاه Regular توسط داربست‌ها کور شده است.', 'pending', CURRENT_TIMESTAMP - INTERVAL '15 minutes'),
                                                                                                                   (508, 1, 104, 1002, 'venue_issue', 'تهویه سالن فدراسیون والیبال قطع شده بود.', 'resolved', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
                                                                                                                   (509, 3, 107, 1010, 'technical_issue', 'پیامک تایید خرید برای من ارسال نشد.', 'pending', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
                                                                                                                   (510, 6, 107, NULL, 'technical_issue', 'سایت هنگام خرید بلیت والیبال ایران بسیار کند بود.', 'pending', CURRENT_TIMESTAMP - INTERVAL '5 minutes');