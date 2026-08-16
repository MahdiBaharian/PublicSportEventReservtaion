from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from django.contrib.auth.hashers import check_password
from api.utils import generate_tokens

@api_view(['POST'])
def login(request):
    identifier = request.data.get('identifier')
    password = request.data.get('password')
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT user_id, password_hash, role 
            FROM users 
            WHERE email = %s OR phone_number = %s;
        """, [identifier, identifier])
        row = cursor.fetchone()
        
        if row and check_password(password, row[1]):
            access, refresh = generate_tokens(row[0], row[2])
            return Response({'message': 'ورود موفقیت‌آمیز.', 'access': access, 'refresh': refresh}, status=200)
            
    return Response({'error': 'اطلاعات ورود اشتباه است یا کاربر وجود ندارد.'}, status=401)

@api_view(['POST'])
def admin_login(request):
    identifier = request.data.get('identifier')
    password = request.data.get('password')
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT user_id, password_hash, role 
            FROM users 
            WHERE email = %s OR phone_number = %s;
        """, [identifier, identifier])
        row = cursor.fetchone()
        
        if row and check_password(password, row[1]):
            if row[2] != 'admin':
                return Response({'error': 'شما دسترسی مدیریت به این پنل را ندارید.'}, status=403)
                
            access, refresh = generate_tokens(row[0], row[2])
            return Response({'message': 'ورود مدیریت موفقیت‌آمیز بود.', 'access': access, 'refresh': refresh}, status=200)
            
    return Response({'error': 'اطلاعات ورود اشتباه است یا کاربر وجود ندارد.'}, status=401)