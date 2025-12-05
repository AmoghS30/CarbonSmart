# backend/api/urls.py
from django.urls import path
from .views import log_activity, get_user_activities, get_blockchain_credits, blockchain_status

urlpatterns = [
    path('log/', log_activity, name='log_activity'),
    path('activities/<str:username>/', get_user_activities, name='get_user_activities'),
    path('credits/<str:wallet_address>/', get_blockchain_credits, name='get_blockchain_credits'),
    path('blockchain/status/', blockchain_status, name='blockchain_status'),
]