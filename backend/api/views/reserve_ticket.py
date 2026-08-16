from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from django.core.cache import cache
from api.utils import get_user_id_from_request
import jdatetime
import pytz
from datetime import datetime

tehran_tz = pytz.timezone('Asia/Tehran')
def convert_to_tehran_jalali(dt):
    if not dt:
        return None
        
    if isinstance(dt, str):
        return dt
        
    if hasattr(dt, 'togregorian') or (hasattr(dt, 'year') and dt.year < 1500):
        return dt.strftime('%Y/%m/%d %H:%M:%S')
        
    if dt.tzinfo is None:
        dt = pytz.utc.localize(dt)
        
    local_dt = dt.astimezone(tehran_tz)
    jalali_dt = jdatetime.datetime.fromgregorian(datetime=local_dt)
    
    return jalali_dt.strftime('%Y/%m/%d %H:%M:%S')

@api_view(['GET', 'POST'])
def reserve_ticket(request):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'احراز هویت الزامی است.'}, status=401)
        
    if request.method == 'POST':
        ticket_id = request.data.get('ticket_id')
        quantity = request.data.get('quantity', 1)
        seat_info = request.data.get('seat_info', '')
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT remaining_capacity FROM tickets WHERE ticket_id = %s FOR UPDATE;", [ticket_id])
            capacity_row = cursor.fetchone()
            
            if not capacity_row or capacity_row[0] < quantity:
                return Response({'error': 'ظرفیت کافی نیست.'}, status=400)
            
            cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity - %s WHERE ticket_id = %s;", [quantity, ticket_id])
                
            cursor.execute("""
                INSERT INTO reservations (user_id, ticket_id, quantity, seat_info, reservation_status, reserved_at)
                VALUES (%s, %s, %s, %s, 'pending', CURRENT_TIMESTAMP)
                RETURNING reservation_id, reserved_at;
            """, [user_id, ticket_id, quantity, seat_info])
            
            res_row = cursor.fetchone()
            
            reserved_at_formatted = convert_to_tehran_jalali(res_row[1])
            
            cache_key = f'user_bookings_{user_id}'
            cache.delete(cache_key)
            
            return Response({
                'message': 'رزرو موقت انجام شد. ۱۰ دقیقه برای پرداخت فرصت دارید.',
                'reservation_id': res_row[0],
                'reserved_at': reserved_at_formatted
            }, status=201)
            
    elif request.method == 'GET':
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT r.reservation_id, r.quantity, r.reservation_status, r.reserved_at, 
                       t.home_team, t.away_team, t.ticket_date_time, t.price, t.ticket_id
                FROM reservations r
                JOIN tickets t ON r.ticket_id = t.ticket_id
                WHERE r.user_id = %s
                ORDER BY r.reserved_at DESC;
            """, [user_id])
            
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            
            reservations = []
            for row in rows:
                item = dict(zip(columns, row))
                item['reserved_at'] = convert_to_tehran_jalali(item['reserved_at'])
                item['ticket_date_time'] = convert_to_tehran_jalali(item['ticket_date_time'])
                reservations.append(item)
            
            return Response(reservations, status=200)