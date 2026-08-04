from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
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
            SELECT r.quantity, t.price, r.reservation_status, r.ticket_id
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.ticket_id
            WHERE r.reservation_id = %s AND r.user_id = %s
              AND r.reserved_at >= CURRENT_TIMESTAMP - INTERVAL '10 minutes';
        """, [reservation_id, user_id])
        
        row = cursor.fetchone()
        
        if not row:
            cursor.execute("UPDATE reservations SET reservation_status = 'cancelled' WHERE reservation_id = %s AND reservation_status = 'reserved';", [reservation_id])
            return Response({'error': 'رزرو یافت نشد یا زمان ۱۰ دقیقه‌ای پرداخت منقضی شده است.'}, status=400)
            
        if row[2] != 'reserved':
            return Response({'error': 'این رزرو قبلاً پرداخت یا لغو شده است.'}, status=400)
            
        quantity, price, _, ticket_id = row
        total_amount = quantity * price
        tracking_code = str(uuid.uuid4())
        
        cursor.execute("""
            INSERT INTO payments (user_id, reservation_id, amount, method, transaction_status, tracking_code, paid_at)
            VALUES (%s, %s, %s, %s, 'success', %s, CURRENT_TIMESTAMP);
        """, [user_id, reservation_id, total_amount, method, tracking_code])
        
        cursor.execute("UPDATE reservations SET reservation_status = 'paid' WHERE reservation_id = %s;", [reservation_id])
        
        cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity - %s WHERE ticket_id = %s;", [quantity, ticket_id])
        
        return Response({
            'message': 'پرداخت با موفقیت انجام شد و بلیت نهایی صادر گردید.',
            'tracking_code': tracking_code,
            'amount_paid': total_amount
        }, status=200)