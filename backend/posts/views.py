from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import Post, Media
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    PostCreateUpdateSerializer,
    MediaSerializer,
    MediaUploadSerializer
)


class UserPostsView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, username, slug=None):
        user = get_object_or_404(User, username=username)
        
        if slug:
            post = get_object_or_404(
                Post, 
                author=user, 
                slug=slug, 
                status=Post.Status.PUBLISHED
            )
            serializer = PostDetailSerializer(post, context={'request': request})
        else:
            posts = Post.objects.filter(author=user, status=Post.Status.PUBLISHED)
            serializer = PostListSerializer(posts, many=True, context={'request': request})
        
        return Response(serializer.data)


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    
    def get_queryset(self):
        if self.action == 'drafts':
            return Post.objects.filter(author=self.request.user, status=Post.Status.DRAFT)
       
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'publish', 'unpublish']:
            if self.request.user.is_authenticated:
                return Post.objects.filter(author=self.request.user) | Post.objects.filter(status=Post.Status.PUBLISHED)
            return Post.objects.filter(status=Post.Status.PUBLISHED)
        
        return Post.objects.filter(status=Post.Status.PUBLISHED)
    
    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'drafts':
            return PostListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return PostCreateUpdateSerializer
        return PostDetailSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def drafts(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAuthorOrReadOnly])
    def publish(self, request, slug=None):
        post = self.get_object()
        
        if post.status == Post.Status.PUBLISHED:
            return Response({'detail': 'Post is already published'}, status=status.HTTP_400_BAD_REQUEST)
        
        post.status = Post.Status.PUBLISHED
        post.published_at = timezone.now()
        post.save()
        
        serializer = PostDetailSerializer(post, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAuthorOrReadOnly])
    def unpublish(self, request, slug=None):
        post = self.get_object()
        
        if post.status == Post.Status.DRAFT:
            return Response({'detail': 'Post is already a draft'}, status=status.HTTP_400_BAD_REQUEST)
        
        post.status = Post.Status.DRAFT
        post.save()
        
        serializer = PostDetailSerializer(post, context={'request': request})
        return Response(serializer.data)


class MediaViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Media.objects.filter(uploaded_by=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MediaUploadSerializer
        return MediaSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = MediaUploadSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        media = serializer.save()
        response_serializer = MediaSerializer(media, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_destroy(self, instance):
        instance.file.delete(save=False)
        instance.delete()