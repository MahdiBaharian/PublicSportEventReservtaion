from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from django.core.cache import cache
from api.utils import get_user_id_from_request
import uuid

@api_view(['POST'])
def payment_for_ticket(request):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'احراز هویت الزامی است.'}, status=401)
        
    reservation_id = request.data.get('reservation_id')
    method = request.data.get('method', 'card')
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT r.quantity, t.price, r.reservation_status, r.ticket_id,
                   EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - r.reserved_at)) / 60 AS minutes_passed
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.ticket_id
            WHERE r.reservation_id = %s AND r.user_id = %s FOR UPDATE;
        """, [reservation_id, user_id])
        
        row = cursor.fetchone()
        
        if not row:
            return Response({'error': 'رزرو یافت نشد.'}, status=404)
            
        quantity, price, status, ticket_id, minutes_passed = row
        
        if status == 'paid':
            return Response({'error': 'این بلیت قبلاً پرداخت شده است.'}, status=400)
        if status == 'cancelled':
            return Response({'error': 'این بلیت لغو شده است.'}, status=400)
            
        if minutes_passed > 10:
            cursor.execute("UPDATE reservations SET reservation_status = 'cancelled' WHERE reservation_id = %s;", [reservation_id])
            cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity + %s WHERE ticket_id = %s;", [quantity, ticket_id])
            cache.delete(f'user_bookings_{user_id}')
            return Response({'error': 'زمان ۱۰ دقیقه‌ای پرداخت منقضی شده است.'}, status=400)
            
        total_amount = quantity * price
        tracking_code = str(uuid.uuid4())
        
        cursor.execute("""
            INSERT INTO payments (user_id, reservation_id, amount, method, transaction_status, tracking_code, paid_at)
            VALUES (%s, %s, %s, %s, 'success', %s, CURRENT_TIMESTAMP);
        """, [user_id, reservation_id, total_amount, method, tracking_code])
        
        cursor.execute("UPDATE reservations SET reservation_status = 'paid' WHERE reservation_id = %s;", [reservation_id])
        
    cache.delete(f'user_bookings_{user_id}')
    
    return Response({
        'message': 'پرداخت با موفقیت انجام شد و بلیت نهایی صادر گردید.',
        'tracking_code': tracking_code,
        'amount_paid': total_amount
    }, status=200)