from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.cache import cache
from django.db import connection
from .utils import send_html_otp_email
import random

@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email')
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT user_id FROM users WHERE email = %s;", [email])
        if not cursor.fetchone():
            return Response({'error': 'کاربری با این ایمیل یافت نشد. ابتدا ثبت‌نام کنید.'}, status=404)
            
    otp = str(random.randint(100000, 999999))
    cache.set(f'otp_{email}', otp, timeout=120)
    
    try:
        send_html_otp_email(email, otp)
        return Response({'message': 'کد تایید ورود به ایمیل شما ارسال شد.'}, status=200)
    except Exception as e:
        return Response({'error': f'خطا در ارسال ایمیل: {str(e)}'}, status=500)