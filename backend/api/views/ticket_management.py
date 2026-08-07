from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from api.utils import get_user_id_from_request
from api.es_utils import index_ticket, delete_ticket_es, create_index

@api_view(['POST', 'DELETE'])
def ticket_management(request):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'Unauthorized'}, status=401)

    with connection.cursor() as cursor:
        cursor.execute("SELECT role FROM users WHERE user_id = %s;", [user_id])
        role = cursor.fetchone()
        if not role or role[0] != 'admin':
            return Response({'error': 'Forbidden'}, status=403)

        create_index()

        # Ticket Creation Logic
        if request.method == 'POST':
            data = request.data
            cursor.execute("""
                INSERT INTO tickets (sport_type, home_team, away_team, ticket_date_time, venue_city, price, total_capacity, remaining_capacity, category)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING ticket_id, sport_type, home_team, away_team, venue_city, price, ticket_date_time;
            """, [
                data.get('sport_type'), data.get('home_team'), data.get('away_team'),
                data.get('ticket_date_time'), data.get('venue_city'), data.get('price'),
                data.get('total_capacity'), data.get('remaining_capacity'), data.get('category')
            ])
            row = cursor.fetchone()
            
            # Format datetime safely
            dt_val = row[6]
            formatted_dt = dt_val.isoformat() if dt_val else None

            ticket_data = {
                'ticket_id': row[0],
                'sport_type': row[1],
                'home_team': row[2],
                'away_team': row[3],
                'venue_city': row[4],
                'price': row[5],
                'ticket_date_time': formatted_dt
            }
            
            index_ticket(ticket_data)
            return Response(ticket_data, status=201)

        elif request.method == 'DELETE':
            ticket_id = request.data.get('ticket_id')
            cursor.execute("DELETE FROM tickets WHERE ticket_id = %s RETURNING ticket_id;", [ticket_id])
            if cursor.fetchone():
                delete_ticket_es(ticket_id)
                return Response({'message': 'Ticket deleted and Elasticsearch synced.'}, status=200)
                
            return Response({'error': 'Ticket not found.'}, status=404)