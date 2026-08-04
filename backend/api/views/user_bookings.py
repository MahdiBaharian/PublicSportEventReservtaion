from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connection
from api.utils import get_user_id_from_request

@api_view(['GET'])
def get_user_bookings(request):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'Unauthorized'}, status=401)

    cache_key = f'user_bookings_{user_id}'
    cached_bookings = cache.get(cache_key)
    if cached_bookings:
        return Response(cached_bookings, status=200)

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT r.reservation_id, r.quantity, r.reservation_status, r.reserved_at,
                   t.sport_type, t.home_team, t.away_team, t.ticket_date_time, t.venue_city
            FROM reservations r
            JOIN tickets t ON r.ticket_id = t.ticket_id
            WHERE r.user_id = %s
            ORDER BY t.ticket_date_time DESC;
        """, [user_id])
        
        columns = [col[0] for col in cursor.description]
        bookings = [dict(zip(columns, row)) for row in cursor.fetchall()]

    cache.set(cache_key, bookings, timeout=1800)
    return Response(bookings, status=200)