from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connection
from django.contrib.auth.hashers import make_password
from .utils import send_html_otp_email
import random

@api_view(['POST'])
def signup(request):
    data = request.data
    email = data.get('email')
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT user_id FROM users WHERE email = %s OR username = %s;", [email, data.get('username')])
        if cursor.fetchone():
            return Response({'error': 'کاربری با این ایمیل یا نام کاربری از قبل وجود دارد.'}, status=400)
            
    password_hash = make_password(data.get('password'))
    
    user_payload = {
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        'username': data.get('username'),
        'phone_number': data.get('phone_number'),
        'password_hash': password_hash
    }
    
    # 4. تولید کد OTP و ذخیره در Redis به مدت 2 دقیقه (120 ثانیه)
    otp = str(random.randint(100000, 999999))
    cache.set(f'signup_data_{email}', user_payload, timeout=120)
    cache.set(f'otp_{email}', otp, timeout=120)
    
    try:
        send_html_otp_email(email, otp)
        return Response({'message': 'کد تایید به ایمیل شما ارسال شد. لطفا برای تکمیل ثبت‌نام آن را وارد کنید.'}, status=200)
    except Exception as e:
        return Response({'error': f'خطا در ارسال ایمیل: {str(e)}'}, status=500)