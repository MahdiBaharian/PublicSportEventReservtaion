from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection

@api_view(['GET'])
def get_ticket_details(request, ticket_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT t.ticket_id, t.sport_type, t.home_team, t.away_team, 
                   t.ticket_date_time, t.venue_city, t.price, t.remaining_capacity, 
                   t.category, md.organizer, md.tournament_name, md.venue_name, md.facilities
            FROM tickets t
            LEFT JOIN match_details md ON t.ticket_id = md.ticket_id
            WHERE t.ticket_id = %s;
        """, [ticket_id])
        
        row = cursor.fetchone()
        
        if not row:
            return Response({'error': 'بلیت یافت نشد.'}, status=404)
            
        columns = [col[0] for col in cursor.description]
        ticket_data = dict(zip(columns, row))
        
        return Response(ticket_data, status=200)