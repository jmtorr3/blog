import os
from django.core.management.base import BaseCommand
from django.conf import settings
from posts.models import Media, Post


class Command(BaseCommand):
    help = 'List and optionally delete orphaned media files (files not in database)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Delete orphaned files',
        )

    def handle(self, *args, **options):
        media_root = settings.MEDIA_ROOT
        delete_files = options['delete']

        # Get all file paths from database
        db_files = set()
        for media in Media.objects.all():
            if media.file:
                db_files.add(os.path.join(media_root, media.file.name))

        # Find all physical files
        physical_files = set()
        for root, dirs, files in os.walk(media_root):
            # Skip covers directory
            if 'covers' in root:
                continue
            for file in files:
                if file.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.webm', '.mov')):
                    physical_files.add(os.path.join(root, file))

        # Find orphaned files (in filesystem but not in database)
        orphaned_files = physical_files - db_files

        if not orphaned_files:
            self.stdout.write(self.style.SUCCESS('No orphaned files found!'))
            return

        self.stdout.write(self.style.WARNING(f'\nFound {len(orphaned_files)} orphaned files:'))

        total_size = 0
        for file_path in sorted(orphaned_files):
            size = os.path.getsize(file_path)
            total_size += size
            size_mb = size / (1024 * 1024)
            rel_path = os.path.relpath(file_path, media_root)
            self.stdout.write(f'  - {rel_path} ({size_mb:.2f} MB)')

        self.stdout.write(self.style.WARNING(f'\nTotal size: {total_size / (1024 * 1024):.2f} MB'))

        if delete_files:
            confirm = input('\nAre you sure you want to delete these files? (yes/no): ')
            if confirm.lower() == 'yes':
                deleted_count = 0
                for file_path in orphaned_files:
                    try:
                        os.remove(file_path)
                        deleted_count += 1
                        self.stdout.write(self.style.SUCCESS(f'Deleted: {os.path.relpath(file_path, media_root)}'))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'Error deleting {file_path}: {str(e)}'))

                self.stdout.write(self.style.SUCCESS(f'\nDeleted {deleted_count} files'))
            else:
                self.stdout.write(self.style.WARNING('Deletion cancelled'))
        else:
            self.stdout.write(self.style.WARNING('\nRun with --delete to remove these files'))
