import os
from django.core.management.base import BaseCommand
from django.conf import settings
from posts.models import Media


class Command(BaseCommand):
    help = 'List all media files and their status'

    def handle(self, *args, **options):
        media_items = Media.objects.all().order_by('-created_at')

        if not media_items:
            self.stdout.write(self.style.WARNING('No media found in database'))
            return

        self.stdout.write(self.style.SUCCESS(f'\nFound {media_items.count()} media items:\n'))

        total_size = 0
        for media in media_items:
            file_exists = os.path.exists(media.file.path) if media.file else False
            size_mb = media.file_size / (1024 * 1024) if media.file_size else 0
            total_size += media.file_size if media.file_size else 0

            status = '✓' if file_exists else '✗ MISSING'
            post_info = f'Post: {media.post.slug}' if media.post else 'No post assigned'

            self.stdout.write(
                f'{status} {media.filename}\n'
                f'   Path: {media.file.name}\n'
                f'   Size: {size_mb:.2f} MB\n'
                f'   {post_info}\n'
                f'   Uploaded: {media.created_at.strftime("%Y-%m-%d %H:%M")}\n'
            )

        self.stdout.write(self.style.SUCCESS(f'\nTotal size: {total_size / (1024 * 1024):.2f} MB'))

        # Show statistics
        with_post = Media.objects.filter(post__isnull=False).count()
        without_post = Media.objects.filter(post__isnull=True).count()
        in_uploads = Media.objects.filter(file__startswith='uploads/').count()

        self.stdout.write(self.style.WARNING(f'\nStatistics:'))
        self.stdout.write(f'  - With post: {with_post}')
        self.stdout.write(f'  - Without post: {without_post}')
        self.stdout.write(f'  - In uploads/: {in_uploads}')
