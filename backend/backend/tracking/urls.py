from django.urls import path
from .views import track_visit

urlpatterns = [
    path('track-visit/', track_visit, name='track-visit'),
]
