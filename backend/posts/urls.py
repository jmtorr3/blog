from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, MediaViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'media', MediaViewSet, basename='media')

urlpatterns = [
    path('', include(router.urls)),
]
