import client from './client';

export const getPosts = async () => {
  const response = await client.get('/posts/');
  return response.data;
};

export const getPost = async (slug) => {
  const response = await client.get(`/posts/${slug}/`);
  return response.data;
};

export const getDrafts = async () => {
  const response = await client.get('/posts/drafts/');
  return response.data;
};

export const createPost = async (data, coverImageFile = null) => {
  if (coverImageFile) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('blocks', JSON.stringify(data.blocks));
    formData.append('status', data.status);
    formData.append('cover_image', coverImageFile);

    const response = await client.post('/posts/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  const response = await client.post('/posts/', data);
  return response.data;
};

export const updatePost = async (slug, data, coverImageFile = null) => {
  if (coverImageFile) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('blocks', JSON.stringify(data.blocks));
    formData.append('status', data.status);
    formData.append('cover_image', coverImageFile);

    const response = await client.patch(`/posts/${slug}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  const response = await client.patch(`/posts/${slug}/`, data);
  return response.data;
};

export const deletePost = async (slug) => {
  await client.delete(`/posts/${slug}/`);
};

export const publishPost = async (slug) => {
  const response = await client.post(`/posts/${slug}/publish/`);
  return response.data;
};

export const unpublishPost = async (slug) => {
  const response = await client.post(`/posts/${slug}/unpublish/`);
  return response.data;
};