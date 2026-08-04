import jwt
import datetime
import random
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

def generate_tokens(user_id, role):
    access_payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
        'iat': datetime.datetime.utcnow(),
        'type': 'access'
    }
    refresh_payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'type': 'refresh'
    }
    
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')
    
    return access_token, refresh_token

def send_html_otp_email(email, otp):
    subject = 'کد تایید سامانه رزرو بلیط مسابقات ورزشی'
    text_content = f'کاربر گرامی، کد تایید شما: {otp}'
    html_content = f"""
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f9;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #4299e1;">به سامانه رزرو بلیط خوش آمدید!</h2>
            <p style="font-size: 16px; color: #333;">کاربر گرامی، درخواست شما با موفقیت دریافت شد.</p>
            <p style="font-size: 16px; color: #333;">کد تایید شما برای ادامه مراحل:</p>
            <div style="font-size: 28px; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 15px; border-radius: 5px; margin: 20px 0; letter-spacing: 10px;">
                {otp}
            </div>
            <p style="font-size: 14px; color: #777;">این کد تنها تا ۲ دقیقه معتبر است.</p>
        </div>
    </div>
    """
    
    msg = EmailMultiAlternatives(subject, text_content, settings.EMAIL_HOST_USER, [email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()
    
def get_user_id_from_request(request):
    """
    Extracts and decodes the JWT token from the Authorization header 
    to return the user_id.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
        
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload.get('user_id')
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None