from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from api.utils import get_user_id_from_request

@api_view(['GET', 'POST'])
def check_cancellation_penalty(request, reservation_id):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'احراز هویت الزامی است.'}, status=401)
        
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT t.ticket_date_time, p.amount, r.reservation_status, r.ticket_id, r.quantity,
                   EXTRACT(EPOCH FROM (t.ticket_date_time - CURRENT_TIMESTAMP))/3600 AS hours_left
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.ticket_id
            JOIN payments p ON r.reservation_id = p.reservation_id
            WHERE r.reservation_id = %s AND r.user_id = %s AND p.transaction_status = 'success';
        """, [reservation_id, user_id])
        
        row = cursor.fetchone()
        
        if not row or row[2] != 'paid':
            return Response({'error': 'بلیت معتبری برای لغو یافت نشد.'}, status=400)
            
        ticket_date, paid_amount, status, ticket_id, quantity, hours_left = row
        
        if hours_left <= 0:
            return Response({'error': 'مسابقه برگزار شده یا در حال برگزاری است و امکان لغو وجود ندارد.'}, status=400)
            
        penalty_percentage = 10 if hours_left > 24 else 50
        penalty_amount = float(paid_amount) * (penalty_percentage / 100)
        refund_amount = float(paid_amount) - penalty_amount
        
        if request.method == 'GET':
            return Response({
                'hours_left_to_match': round(hours_left, 1),
                'penalty_percentage': penalty_percentage,
                'penalty_amount': penalty_amount,
                'refund_amount': refund_amount
            }, status=200)
            
        elif request.method == 'POST':
            cursor.execute("UPDATE reservations SET reservation_status = 'cancelled' WHERE reservation_id = %s;", [reservation_id])
            cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity + %s WHERE ticket_id = %s;", [quantity, ticket_id])
            
            return Response({
                'message': 'بلیت با موفقیت لغو شد و مبلغ به کیف پول مسترد گردید.',
                'refunded_amount': refund_amount
            }, status=200)