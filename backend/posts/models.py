import uuid
import os
import shutil
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.conf import settings


def post_media_path(instance, filename):
    """Upload media to media/posts/{post_slug}/{filename}"""
    if instance.post:
        return f'posts/{instance.post.slug}/{filename}'
    return f'uploads/{filename}'


class Post(models.Model):
    """
    Blog post with flexible block-based content.
    """
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField(blank=True, help_text="Short description for previews")
    cover_image = models.ImageField(upload_to='covers/', blank=True, null=True)
    custom_css = models.TextField(blank=True, help_text="Custom CSS for this post")
    blocks = models.JSONField(default=list)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title) or 'untitled'
            original_slug = self.slug
            counter = 1
            while Post.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1

        super().save(*args, **kwargs)
        self.organize_media()

    def organize_media(self):
        """Move uploaded images to post folder based on URLs in blocks"""
        post_folder = os.path.join(settings.MEDIA_ROOT, 'posts', self.slug)
        os.makedirs(post_folder, exist_ok=True)

        updated = False
        for block in self.blocks:
            if block.get('type') == 'image' and block.get('src'):
                if self._move_media_file(block, 'src', post_folder):
                    updated = True
            elif block.get('type') == 'image-row' and block.get('images'):
                for image in block['images']:
                    if image.get('src'):
                        if self._move_media_file(image, 'src', post_folder):
                            updated = True

        # Save updated URLs to database without triggering organize_media again
        if updated:
            Post.objects.filter(pk=self.pk).update(blocks=self.blocks)

    def _move_media_file(self, block_data, key, post_folder):
        """Move a single media file to the post folder and update the URL"""
        import re

        url = block_data.get(key, '')
        if not url:
            return False

        # Match both /media/uploads/ and /blog/media/uploads/
        match = re.search(r'/(?:blog/)?media/uploads/([^/]+)$', url)
        if not match:
            return False

        filename = match.group(1)
        old_path = os.path.join(settings.MEDIA_ROOT, 'uploads', filename)
        new_path = os.path.join(post_folder, filename)

        if os.path.exists(old_path) and not os.path.exists(new_path):
            shutil.move(old_path, new_path)

            # Update the URL in block data - handle both URL formats
            if '/blog/media/uploads/' in url:
                new_url = url.replace(f'/blog/media/uploads/{filename}', f'/blog/media/posts/{self.slug}/{filename}')
            else:
                new_url = url.replace(f'/media/uploads/{filename}', f'/media/posts/{self.slug}/{filename}')
            block_data[key] = new_url

            # Update Media model if exists
            media = Media.objects.filter(file=f'uploads/{filename}').first()
            if media:
                media.file.name = f'posts/{self.slug}/{filename}'
                media.post = self
                media.save()

            return True

        return False

    def delete(self, *args, **kwargs):
        # Delete the post's media folder
        post_folder = os.path.join(settings.MEDIA_ROOT, 'posts', self.slug)
        if os.path.exists(post_folder):
            shutil.rmtree(post_folder)

        # Delete associated media records
        self.media.all().delete()

        super().delete(*args, **kwargs)


class Media(models.Model):
    """Uploaded media files (images, videos)."""
    class MediaType(models.TextChoices):
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Video'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media', null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to=post_media_path)
    media_type = models.CharField(max_length=10, choices=MediaType.choices)
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    alt_text = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Media'

    def __str__(self):
        return self.filename

    def save(self, *args, **kwargs):
        """Move file to correct location if post is assigned"""
        is_new = self.pk is None
        old_post = None

        # Check if post assignment changed
        if not is_new:
            try:
                old_instance = Media.objects.get(pk=self.pk)
                old_post = old_instance.post
            except Media.DoesNotExist:
                pass

        # Save the instance first
        super().save(*args, **kwargs)

        # Move file if post was assigned/changed
        if self.post and (is_new or old_post != self.post):
            current_name = self.file.name
            expected_path = f'posts/{self.post.slug}/{os.path.basename(current_name)}'

            # Only move if not already in correct location
            if current_name != expected_path:
                old_file_path = self.file.path

                # Update file field to new path
                self.file.name = expected_path
                new_file_path = self.file.path

                # Move the physical file
                if os.path.exists(old_file_path) and old_file_path != new_file_path:
                    os.makedirs(os.path.dirname(new_file_path), exist_ok=True)
                    shutil.move(old_file_path, new_file_path)

                    # Update database with new path (without triggering save recursion)
                    Media.objects.filter(pk=self.pk).update(file=self.file.name)