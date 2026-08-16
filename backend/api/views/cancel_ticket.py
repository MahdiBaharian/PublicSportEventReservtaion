from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connection
from api.utils import get_user_id_from_request

@api_view(['POST'])
def cancel_ticket_and_refund(request, reservation_id):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'Unauthorized'}, status=401)

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT r.reservation_status, r.ticket_id, r.quantity, t.price, p.amount
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.ticket_id
            LEFT JOIN payments p ON r.reservation_id = p.reservation_id
            WHERE r.reservation_id = %s AND r.user_id = %s FOR UPDATE;
        """, [reservation_id, user_id])
        row = cursor.fetchone()

        if not row or row[0] == 'cancelled':
            return Response({'error': 'Invalid or already cancelled reservation.'}, status=400)

        status, ticket_id, quantity, price, amount = row
        
        cursor.execute("UPDATE reservations SET reservation_status = 'cancelled' WHERE reservation_id = %s;", [reservation_id])
        cursor.execute("UPDATE tickets SET remaining_capacity = remaining_capacity + %s WHERE ticket_id = %s;", [quantity, ticket_id])

        if status == 'paid':
            refund_amount = amount if amount else (quantity * price)
            cursor.execute("UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + %s WHERE user_id = %s;", [refund_amount, user_id])

    cache_key = f'user_bookings_{user_id}'
    cache.delete(cache_key)

    return Response({'message': 'Ticket cancelled successfully and refund initiated.'}, status=200)