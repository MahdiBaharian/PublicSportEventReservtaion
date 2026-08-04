from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connection
import json
import hashlib

@api_view(['GET'])
def search_tickets(request):
    params = request.GET.dict()

    param_string = json.dumps(params, sort_keys=True)
    cache_key = 'tickets_search_' + hashlib.md5(param_string.encode('utf-8')).hexdigest()

    cached_results = cache.get(cache_key)
    if cached_results:
        return Response(cached_results, status=200)

    query = """
        SELECT t.ticket_id, t.sport_type, t.home_team, t.away_team,
               t.ticket_date_time, t.venue_city, t.price, t.category,
               t.remaining_capacity, md.venue_name, md.tournament_name
        FROM tickets t
        LEFT JOIN match_details md ON t.ticket_id = md.ticket_id
        WHERE 1=1
    """
    sql_params = []

    if 'sport_type' in params:
        query += " AND t.sport_type = %s"
        sql_params.append(params['sport_type'])
        
    if 'city' in params:
        query += " AND t.venue_city = %s"
        sql_params.append(params['city'])
        
    if 'category' in params:
        query += " AND t.category = %s"
        sql_params.append(params['category'])
        
    if 'team' in params:
        query += " AND (t.home_team ILIKE %s OR t.away_team ILIKE %s)"
        sql_params.extend([f"%{params['team']}%", f"%{params['team']}%"])
        
    if 'min_price' in params:
        query += " AND t.price >= %s"
        sql_params.append(params['min_price'])
        
    if 'max_price' in params:
        query += " AND t.price <= %s"
        sql_params.append(params['max_price'])

    query += " ORDER BY t.ticket_date_time ASC;"

    results = []
    with connection.cursor() as cursor:
        cursor.execute(query, sql_params)
        columns = [col[0] for col in cursor.description]
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))

    cache.set(cache_key, results, timeout=300)

    return Response(results, status=200)