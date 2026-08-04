from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from api.utils import get_user_id_from_request

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
            cursor.execute("SELECT remaining_capacity FROM tickets WHERE ticket_id = %s;", [ticket_id])
            capacity_row = cursor.fetchone()
            
            if not capacity_row or capacity_row[0] < quantity:
                return Response({'error': 'ظرفیت کافی نیست.'}, status=400)
                
            cursor.execute("""
                INSERT INTO reservations (user_id, ticket_id, quantity, seat_info, reservation_status, reserved_at)
                VALUES (%s, %s, %s, %s, 'reserved', CURRENT_TIMESTAMP)
                RETURNING reservation_id, reserved_at;
            """, [user_id, ticket_id, quantity, seat_info])
            
            res_row = cursor.fetchone()
            
            return Response({
                'message': 'رزرو موقت انجام شد. ۱۰ دقیقه برای پرداخت فرصت دارید.',
                'reservation_id': res_row[0],
                'reserved_at': res_row[1]
            }, status=201)
            
    elif request.method == 'GET':
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT r.reservation_id, r.quantity, r.reservation_status, r.reserved_at, 
                       t.home_team, t.away_team, t.ticket_date_time, t.price
                FROM reservations r
                JOIN tickets t ON r.ticket_id = t.ticket_id
                WHERE r.user_id = %s
                ORDER BY r.reserved_at DESC;
            """, [user_id])
            
            columns = [col[0] for col in cursor.description]
            reservations = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            return Response(reservations, status=200)