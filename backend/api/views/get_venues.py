from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connection

@api_view(['GET'])
def get_locations(request):
    cached_locations = cache.get('cities_venues_list')
    if cached_locations:
        return Response(cached_locations, status=200)

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT DISTINCT t.venue_city, md.venue_name
            FROM tickets t
            LEFT JOIN match_details md ON t.ticket_id = md.ticket_id
            WHERE t.venue_city IS NOT NULL;
        """)
        rows = cursor.fetchall()

    locations = {}
    for city, venue in rows:
        if city not in locations:
            locations[city] = []
        if venue and venue not in locations[city]:
            locations[city].append(venue)

    cache.set('cities_venues_list', locations, timeout=86400)
    
    return Response(locations, status=200)