from django.contrib import admin
from .models import Post, Media


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'created_at', 'published_at']
    list_filter = ['status', 'created_at', 'author']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ['filename', 'media_type', 'uploaded_by', 'file_size', 'created_at']
    list_filter = ['media_type', 'created_at']
    search_fields = ['filename', 'alt_text']
    readonly_fields = ['file_size', 'created_at']
