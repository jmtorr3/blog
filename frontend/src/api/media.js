import client from './client';

export const getMedia = async () => {
  const response = await client.get('/media/');
  return response.data;
};

export const uploadMedia = async (file, altText = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('alt_text', altText);
  
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
