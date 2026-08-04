from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connection
from api.utils import generate_tokens

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    action = request.data.get('action') 
    
    cached_otp = cache.get(f'otp_{email}')
    
    if not cached_otp or cached_otp != otp:
        return Response({'error': 'کد تایید نامعتبر است یا منقضی شده است.'}, status=400)
        
    cache.delete(f'otp_{email}')
    
    if action == 'signup':
        user_data = cache.get(f'signup_data_{email}')
        if not user_data:
            return Response({'error': 'زمان ثبت‌نام منقضی شده است، لطفا دوباره تلاش کنید.'}, status=400)
            
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO users (first_name, last_name, username, email, phone_number, password_hash, role, account_status)
                VALUES (%s, %s, %s, %s, %s, %s, 'spectator', 'active')
                RETURNING user_id, role;
            """, [
                user_data['first_name'], user_data['last_name'], user_data['username'],
                email, user_data['phone_number'], user_data['password_hash']
            ])
            row = cursor.fetchone()
            
        cache.delete(f'signup_data_{email}')
        access, refresh = generate_tokens(row[0], row[1])
        return Response({'message': 'ثبت‌نام با موفقیت انجام شد.', 'access': access, 'refresh': refresh}, status=201)
        
    elif action == 'login':
        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id, role FROM users WHERE email = %s;", [email])
            row = cursor.fetchone()
            
            if row:
                access, refresh = generate_tokens(row[0], row[1])
                return Response({'message': 'ورود موفقیت‌آمیز.', 'access': access, 'refresh': refresh}, status=200)
            else:
                return Response({'error': 'کاربری با این ایمیل یافت نشد. ابتدا ثبت‌نام کنید.'}, status=404)
                
    return Response({'error': 'نوع عملیات (action) نامشخص است.'}, status=400)