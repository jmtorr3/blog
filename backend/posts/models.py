import uuid
import os
import shutil
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.conf import settings


def post_media_path(instance, filename):
    """Upload media to media/{username}/posts/{post_slug}/{filename}"""
    if instance.post:
        username = instance.post.author.username
        return f'{username}/posts/{instance.post.slug}/{filename}'
    # Fallback for media without a post assigned yet
    username = instance.uploaded_by.username
    return f'{username}/uploads/{filename}'


def cover_image_path(instance, filename):
    """Upload cover images to media/{username}/posts/{slug}/{filename}"""
    username = instance.author.username
    slug = instance.slug or 'temp'
    return f'{username}/posts/{slug}/{filename}'


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
    cover_image = models.ImageField(upload_to=cover_image_path, blank=True, null=True)
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

        # Track if cover image changed
        cover_image_changed = False
        if self.pk:
            try:
                old_instance = Post.objects.get(pk=self.pk)
                if old_instance.cover_image != self.cover_image:
                    cover_image_changed = True
            except Post.DoesNotExist:
                cover_image_changed = True
        elif self.cover_image:
            cover_image_changed = True

        super().save(*args, **kwargs)

        # Create Media object for cover image if it was just uploaded
        if cover_image_changed and self.cover_image:
            try:
                # Get file size
                file_size = self.cover_image.size if hasattr(self.cover_image, 'size') else os.path.getsize(self.cover_image.path)

                Media.objects.create(
                    post=self,
                    uploaded_by=self.author,
                    file=self.cover_image.name,
                    media_type=Media.MediaType.IMAGE,
                    filename=os.path.basename(self.cover_image.name),
                    file_size=file_size,
                    alt_text=f'Cover image for {self.title}'
                )
            except Exception as e:
                # Log the error but don't fail the save
                print(f"Failed to create Media object for cover image: {e}")

        self.organize_media()

    def organize_media(self):
        """Move uploaded images to post folder based on URLs in blocks"""
        username = self.author.username
        post_folder = os.path.join(settings.MEDIA_ROOT, username, 'posts', self.slug)
        os.makedirs(post_folder, exist_ok=True)

        updated = False
        for block in self.blocks:
            if block.get('type') == 'image' and block.get('src'):
                if self._move_media_file(block, 'src', post_folder, username):
                    updated = True
            elif block.get('type') == 'image-row' and block.get('images'):
                for image in block['images']:
                    if image.get('src'):
                        if self._move_media_file(image, 'src', post_folder, username):
                            updated = True

        # Save updated URLs to database without triggering organize_media again
        if updated:
            Post.objects.filter(pk=self.pk).update(blocks=self.blocks)

    def _move_media_file(self, block_data, key, post_folder, username):
        """Move a single media file to the post folder and update the URL"""
        import re

        url = block_data.get(key, '')
        if not url:
            return False

        # Match both /media/{username}/uploads/ and /blog/media/{username}/uploads/
        match = re.search(r'/(?:blog/)?media/([^/]+)/uploads/([^/]+)$', url)
        if not match:
            return False

        url_username = match.group(1)
        filename = match.group(2)
        old_path = os.path.join(settings.MEDIA_ROOT, url_username, 'uploads', filename)
        new_path = os.path.join(post_folder, filename)

        if os.path.exists(old_path) and not os.path.exists(new_path):
            shutil.move(old_path, new_path)

            # Update the URL in block data - handle both URL formats
            if '/blog/media/' in url:
                new_url = url.replace(f'/blog/media/{url_username}/uploads/{filename}', f'/blog/media/{username}/posts/{self.slug}/{filename}')
            else:
                new_url = url.replace(f'/media/{url_username}/uploads/{filename}', f'/media/{username}/posts/{self.slug}/{filename}')
            block_data[key] = new_url

            # Update Media model if exists
            media = Media.objects.filter(file=f'{url_username}/uploads/{filename}').first()
            if media:
                media.file.name = f'{username}/posts/{self.slug}/{filename}'
                media.post = self
                media.save()

            return True

        return False

    def delete(self, *args, **kwargs):
        # Delete the post's media folder
        username = self.author.username
        post_folder = os.path.join(settings.MEDIA_ROOT, username, 'posts', self.slug)
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
            username = self.post.author.username
            expected_path = f'{username}/posts/{self.post.slug}/{os.path.basename(current_name)}'

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