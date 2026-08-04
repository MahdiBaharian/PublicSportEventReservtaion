from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from api.utils import get_user_id_from_request

@api_view(['POST'])
def report_ticket_issue(request, reservation_id):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'Unauthorized'}, status=401)

    report_type = request.data.get('report_type')
    description = request.data.get('description')

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 1 FROM reservations WHERE reservation_id = %s AND user_id = %s;
        """, [reservation_id, user_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Reservation not found.'}, status=404)

        cursor.execute("""
            INSERT INTO reports (reservation_id, report_type, description, report_status, reported_at)
            VALUES (%s, %s, %s, 'pending', CURRENT_TIMESTAMP)
            RETURNING report_id;
        """, [reservation_id, report_type, description])
        
        report_id = cursor.fetchone()[0]

    return Response({
        'message': 'Report submitted successfully.',
        'report_id': report_id
    }, status=201)