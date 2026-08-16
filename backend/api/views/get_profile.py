from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from api.utils import get_user_id_from_request

@api_view(['GET'])
def get_profile(request):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'Unauthorized'}, status=401)

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT first_name, last_name, email, phone_number, city, COALESCE(wallet_balance, 0) as wallet_balance
            FROM users 
            WHERE user_id = %s;
        """, [user_id])
        row = cursor.fetchone()

        if not row:
            return Response({'error': 'User not found'}, status=404)

        columns = [col[0] for col in cursor.description]
        data = dict(zip(columns, row))
        
    return Response({'data': data}, status=200)