from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
import jdatetime
import pytz
from datetime import datetime

tehran_tz = pytz.timezone('Asia/Tehran')
def convert_to_tehran_jalali(dt):
    if not dt:
        return None
        
    if isinstance(dt, str):
        return dt
        
    if hasattr(dt, 'togregorian') or (hasattr(dt, 'year') and dt.year < 1500):
        return dt.strftime('%Y/%m/%d %H:%M:%S')
        
    if dt.tzinfo is None:
        dt = pytz.utc.localize(dt)
        
    local_dt = dt.astimezone(tehran_tz)
    jalali_dt = jdatetime.datetime.fromgregorian(datetime=local_dt)
    
    return jalali_dt.strftime('%Y/%m/%d %H:%M:%S')

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
        
        # Convert match date time to Tehran Jalali format
        ticket_data['ticket_date_time'] = convert_to_tehran_jalali(ticket_data['ticket_date_time'])
        
        return Response(ticket_data, status=200)