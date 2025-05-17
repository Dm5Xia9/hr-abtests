import apiClient from '@/lib/api';

// Получаем базовый URL API из клиента API
const API_DOMAIN = apiClient.getBaseUrl().replace(/\/api\/?$/, '');

/**
 * Нормализует URL изображения - добавляет домен для относительных путей
 * @param url URL изображения
 * @returns Нормализованный URL
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return '';
  
  // Если это уже полный URL (с протоколом), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  // Если это относительный путь, добавляем домен
  if (url.startsWith('/')) {
    return `${API_DOMAIN}${url}`;
  }
  
  // Если нет начального слеша, добавляем его
  return `${API_DOMAIN}/${url}`;
}

/**
 * Загружает файл изображения на сервер
 * @param imageFile Файл изображения или Blob для загрузки
 * @param folder Опциональный путь (папка) для сохранения
 * @returns URL загруженного изображения
 */
export async function uploadImage(imageFile: File | Blob, folder: string = 'slides'): Promise<string> {
  try {
    // Если передан Blob, преобразуем его в File
    const file = imageFile instanceof Blob && !(imageFile instanceof File) 
      ? new File([imageFile], `image-${Date.now()}.png`, { type: 'image/png' }) 
      : imageFile;
    
    // Загружаем изображение
    const response = await apiClient.uploadImage(file, folder);
    
    // Возвращаем URL загруженного изображения
    return response.url;
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    throw error;
  }
}

/**
 * Загружает изображение из URL на сервер
 * @param url URL изображения для загрузки
 * @param folder Опциональный путь (папка) для сохранения
 * @returns URL загруженного изображения
 */
export async function uploadImageFromUrl(url: string, folder: string = 'slides'): Promise<string> {
  try {
    // Проверяем, если URL уже с сервера (относительный путь или с того же домена)
    if (url.startsWith('/') || url.startsWith(window.location.origin)) {
      // URL уже ссылается на наш сервер, можно использовать как есть
      return url;
    }
    
    // Получаем изображение из URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Не удалось загрузить изображение по URL: ${url}`);
    }
    
    // Получаем Blob из ответа
    const blob = await response.blob();
    
    // Получаем расширение файла из URL или MIME типа
    const extension = getExtensionFromUrlOrMimeType(url, blob.type);
    
    // Создаем File из Blob
    const file = new File([blob], `image-${Date.now()}.${extension}`, { type: blob.type });
    
    // Загружаем файл на сервер
    return await uploadImage(file, folder);
  } catch (error) {
    console.error('Ошибка при загрузке изображения из URL:', error);
    throw error;
  }
}

/**
 * Получает расширение файла из URL или MIME типа
 */
function getExtensionFromUrlOrMimeType(url: string, mimeType: string): string {
  // Пытаемся получить расширение из URL
  const extensionMatch = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  if (extensionMatch && extensionMatch[1]) {
    return extensionMatch[1].toLowerCase();
  }
  
  // Если не получилось, определяем по MIME типу
  const mimeExtensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp'
  };
  
  return mimeExtensionMap[mimeType] || 'png';
} 