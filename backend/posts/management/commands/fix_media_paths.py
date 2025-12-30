import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from posts.models import Media


class Command(BaseCommand):
    help = 'Move media files from uploads/ to their correct post folders'

    def handle(self, *args, **options):
        uploads_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')

        if not os.path.exists(uploads_dir):
            self.stdout.write(self.style.WARNING('No uploads directory found'))
            return

        # Get all media objects that have a post assigned but file is in uploads/
        media_items = Media.objects.filter(post__isnull=False, file__startswith='uploads/')

        moved_count = 0
        error_count = 0

        for media in media_items:
            try:
                old_path = media.file.path
                filename = os.path.basename(media.file.name)
                new_name = f'posts/{media.post.slug}/{filename}'
                new_path = os.path.join(settings.MEDIA_ROOT, new_name.replace('posts/', 'posts/'))

                if os.path.exists(old_path):
                    # Create directory if needed
                    os.makedirs(os.path.dirname(new_path), exist_ok=True)

                    # Move file
                    shutil.move(old_path, new_path)

                    # Update database
                    media.file.name = new_name
                    Media.objects.filter(pk=media.pk).update(file=new_name)

                    moved_count += 1
                    self.stdout.write(self.style.SUCCESS(f'Moved: {filename} -> posts/{media.post.slug}/'))
                else:
                    self.stdout.write(self.style.WARNING(f'File not found: {old_path}'))

            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f'Error moving {media.filename}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'\nMoved {moved_count} files'))
        if error_count:
            self.stdout.write(self.style.WARNING(f'{error_count} errors'))
