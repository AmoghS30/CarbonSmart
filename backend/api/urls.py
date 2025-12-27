# backend/api/urls.py
from django.urls import path
from .views import log_activity, get_user_activities, get_blockchain_credits, blockchain_status
from .marketplace_views import (
    get_marketplace_listings,
    get_user_nft_credits,
    create_listing,
    buy_listing,
    check_approval_status,
    get_marketplace_contract_address,
    get_marketplace_history,
)

urlpatterns = [
    path('log/', log_activity, name='log_activity'),
    path('activities/<str:username>/', get_user_activities, name='get_user_activities'),
    path('credits/<str:wallet_address>/', get_blockchain_credits, name='get_blockchain_credits'),
    path('blockchain/status/', blockchain_status, name='blockchain_status'),

    # Marketplace endpoints
    path('marketplace/listings/', get_marketplace_listings, name='get_marketplace_listings'),
    path('marketplace/user-credits/<str:wallet_address>/', get_user_nft_credits, name='get_user_nft_credits'),
    path('marketplace/create/', create_listing, name='create_listing'),
    path('marketplace/buy/<str:listing_id>/', buy_listing, name='buy_listing'),
    path('marketplace/check-approval/<str:token_id>/<str:owner_address>/', check_approval_status, name='check_approval_status'),
    path('marketplace/contract-address/', get_marketplace_contract_address, name='get_marketplace_contract_address'),
    path('marketplace/history/<str:wallet_address>/', get_marketplace_history, name='get_marketplace_history'),
]