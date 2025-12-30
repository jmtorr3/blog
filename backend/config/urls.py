from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

urlpatterns = [
    path('blog/admin/', admin.site.urls),
    path('blog/api/auth/', include('authentication.urls')),
    path('blog/api/', include('posts.urls')),
    # Always serve media files
    re_path(r'^blog/media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]