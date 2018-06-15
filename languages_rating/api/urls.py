
from django.urls import path, include
from rest_framework import routers
from languages_rating.api import views

router = routers.DefaultRouter()
router.register('languages', views.LanguageDataViewSet, 'languages')
router.register('events', views.EventDataViewSet, 'events')

urlpatterns = [
    path('', include(router.urls))
]
