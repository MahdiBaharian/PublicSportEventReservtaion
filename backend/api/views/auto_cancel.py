from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def auto_cancel_expired_reservations(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT r.reservation_id, r.ticket_id, r.quantity 
            FROM reservations r
            WHERE r.reservation_status IN ('pending', 'reserved') 
            AND r.reserved_at < CURRENT_TIMESTAMP - INTERVAL '10 minutes';
        """)
        expired = cursor.fetchall()
        
        for row in expired:
            res_id, t_id, qty = row
            cursor.execute("UPDATE reservations SET reservation_status = 'cancelled' WHERE reservation_id = %s;", [res_id])
            cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity + %s WHERE ticket_id = %s;", [qty, t_id])
            
    return Response({'message': f'{len(expired)} expired reservations cancelled.'}, status=200)