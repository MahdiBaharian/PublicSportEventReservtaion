from django.urls import path
from .views.signup import signup
from .views.login import login
from .views.send_otp import send_otp
from .views.verify_otp import verify_otp
from .views.forget_password import forget_password
from .views.update_profile import update_profile
from .views.get_venues import get_locations
from .views.search_tickets import search_tickets
from .views.get_ticket_details import get_ticket_details
from .views.reserve_ticket import reserve_ticket
from .views.payment import payment_for_ticket
from .views.check_cancellation_penalty import check_cancellation_penalty

urlpatterns = [
    path('auth/signup/', signup),
    path('auth/login/', login),
    path('auth/send-otp/', send_otp),
    path('auth/verify-otp/', verify_otp),
    path('auth/forget-password/', forget_password),
    path('profile/update/', update_profile),
    path('locations/', get_locations),
    path('tickets/search/', search_tickets),
    path('tickets/<int:ticket_id>/', get_ticket_details),
    path('reservations/', reserve_ticket),
    path('payments/', payment_for_ticket),
    path('reservations/<int:reservation_id>/cancel-penalty/', check_cancellation_penalty),
]