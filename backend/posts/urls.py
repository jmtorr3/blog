from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, MediaViewSet, UserPostsView

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'media', MediaViewSet, basename='media')

urlpatterns = [
    path('', include(router.urls)),
    path('users/<str:username>/posts/', UserPostsView.as_view(), name='user-posts'),
    path('users/<str:username>/posts/<str:slug>/', UserPostsView.as_view(), name='user-post-detail'),
]