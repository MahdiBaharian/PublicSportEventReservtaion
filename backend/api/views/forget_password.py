from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connection
from django.contrib.auth.hashers import make_password

@api_view(['POST'])
def forget_password(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')
    
    cached_otp = cache.get(f'otp_{email}')
    
    if cached_otp and cached_otp == otp:
        cache.delete(f'otp_{email}')
        password_hash = make_password(new_password)
        
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE users 
                SET password_hash = %s 
                WHERE email = %s
                RETURNING user_id;
            """, [password_hash, email])
            
            if cursor.fetchone():
                return Response({'message': 'رمز عبور با موفقیت بروزرسانی شد.'}, status=200)
                
        return Response({'error': 'کاربری یافت نشد.'}, status=404)
        
    return Response({'error': 'کد تایید نامعتبر است یا منقضی شده است.'}, status=400)