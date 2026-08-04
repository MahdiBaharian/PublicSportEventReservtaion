from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connection
from api.utils import get_user_id_from_request

@api_view(['PUT', 'PATCH'])
def update_profile(request):
    user_id = get_user_id_from_request(request)
    if not user_id:
        return Response({'error': 'توکن نامعتبر است یا ارسال نشده است.'}, status=401)

    data = request.data
    
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE users
            SET first_name = COALESCE(%s, first_name),
                last_name = COALESCE(%s, last_name),
                phone_number = COALESCE(%s, phone_number),
                city = COALESCE(%s, city)
            WHERE user_id = %s
            RETURNING user_id, first_name, last_name, username, email, phone_number, city;
        """, [
            data.get('first_name'), 
            data.get('last_name'), 
            data.get('phone_number'), 
            data.get('city'), 
            user_id
        ])
        row = cursor.fetchone()

        if row:
            updated_data = {
                'user_id': row[0],
                'first_name': row[1],
                'last_name': row[2],
                'username': row[3],
                'email': row[4],
                'phone_number': row[5],
                'city': row[6]
            }
            
            cache.set(f'user_profile_{user_id}', updated_data, timeout=86400)
            
            return Response({
                'message': 'پروفایل با موفقیت بروزرسانی شد.', 
                'data': updated_data
            }, status=200)

    return Response({'error': 'خطا در بروزرسانی اطلاعات.'}, status=400)