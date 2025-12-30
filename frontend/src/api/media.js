import client from './client';

export const getMedia = async () => {
  const response = await client.get('/media/');
  return response.data;
};

export const uploadMedia = async (file, altText = '', postSlug = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('alt_text', altText);
  if (postSlug) {
    formData.append('post_slug', postSlug);
  }

  const response = await client.post('/media/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteMedia = async (id) => {
  await client.delete(`/media/${id}/`);
};

export const deleteMediaByUrl = async (url) => {
  // Get all media and find the one matching the URL
  const response = await client.get('/media/');
  const media = response.data.find(m => m.url === url);
  if (media) {
    await client.delete(`/media/${media.id}/`);
  }
};