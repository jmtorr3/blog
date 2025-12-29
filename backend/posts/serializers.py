from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Media


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class MediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = Media
        fields = ['id', 'url', 'media_type', 'filename', 'file_size', 'alt_text', 'created_at']
        read_only_fields = ['id', 'url', 'file_size', 'created_at']
    
    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class MediaUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['file', 'alt_text']
    
    def create(self, validated_data):
        file = validated_data['file']
        filename = file.name.lower()
        
        if filename.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            media_type = Media.MediaType.IMAGE
        elif filename.endswith(('.mp4', '.webm', '.mov')):
            media_type = Media.MediaType.VIDEO
        else:
            raise serializers.ValidationError("Unsupported file type")
        
        return Media.objects.create(
            file=file,
            filename=file.name,
            file_size=file.size,
            media_type=media_type,
            alt_text=validated_data.get('alt_text', ''),
            uploaded_by=self.context['request'].user
        )


class PostListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    cover_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'description', 'cover_image_url',
            'author', 'status', 'created_at', 'updated_at', 'published_at'
        ]
    
    def get_cover_image_url(self, obj):
        request = self.context.get('request')
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return None


class PostDetailSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    cover_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'description', 'cover_image', 'cover_image_url',
            'blocks', 'author', 'status', 'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'slug', 'author', 'created_at', 'updated_at']
    
    def get_cover_image_url(self, obj):
        request = self.context.get('request')
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return None


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['title', 'description', 'cover_image', 'blocks', 'status']
    
    def validate_blocks(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Blocks must be a list")
        
        valid_types = ['text', 'image', 'video', 'code', 'heading']
        
        for block in value:
            if not isinstance(block, dict):
                raise serializers.ValidationError("Each block must be an object")
            if 'id' not in block:
                raise serializers.ValidationError("Each block must have an id")
            if 'type' not in block:
                raise serializers.ValidationError("Each block must have a type")
            if block['type'] not in valid_types:
                raise serializers.ValidationError(f"Invalid block type: {block['type']}")
        
        return value
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
