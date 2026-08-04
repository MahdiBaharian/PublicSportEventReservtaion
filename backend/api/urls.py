from django.urls import path
from .views.signup import signup
from .views.login import login
from .views.send_otp import send_otp
from .views.verify_otp import verify_otp
from .views.forget_password import forget_password

urlpatterns = [
    path('auth/signup/', signup),
    path('auth/login/', login),
    path('auth/send-otp/', send_otp),
    path('auth/verify-otp/', verify_otp),
    path('auth/forget-password/', forget_password),
]