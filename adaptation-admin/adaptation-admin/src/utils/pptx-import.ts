import JSZip from 'jszip';
import { Slide, ImageSlide, TextSlide } from '@/types';
import { uploadImage } from '@/utils/file-storage';

/**
 * Преобразует canvas в Blob через Promise
 */
const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality = 0.95): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob конвертация не удалась'));
        }
      },
      type,
      quality
    );
  });
};

/**
 * Создает изображение из Uint8Array и возвращает его как HTMLImageElement
 */
function createImageFromArrayBuffer(buffer: Uint8Array, mimeType: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(url); // Освобождаем URL после загрузки
    };
    
    img.onerror = () => {
      reject(new Error('Не удалось создать изображение'));
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  });
}

/**
 * Рендерит изображение на canvas с сохранением пропорций и возвращает Blob
 */
async function renderImageToCanvas(img: HTMLImageElement, width = 800, height = 600): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Не удалось получить 2D контекст для canvas');
  }
  
  // Заливаем фон белым цветом
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Рассчитываем размеры для изображения с сохранением пропорций
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;
  
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = 0;
  let offsetY = 0;
  
  if (imgRatio > canvasRatio) {
    // Изображение шире, подгоняем по ширине
    drawHeight = width / imgRatio;
    offsetY = (height - drawHeight) / 2;
  } else {
    // Изображение выше, подгоняем по высоте
    drawWidth = height * imgRatio;
    offsetX = (width - drawWidth) / 2;
  }
  
  // Рисуем изображение с учетом рассчитанных параметров
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  
  // Возвращаем данные как Blob
  return canvasToBlob(canvas, 'image/jpeg', 0.95);
}

/**
 * Рендерит все изображения на слайде на один canvas и возвращает результат как Blob
 */
async function renderSlideToCanvas(imageInfos: SlideImageInfo[], title: string, width = 1280, height = 720): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Не удалось получить 2D контекст для canvas');
  }
  
  // Заливаем фон белым цветом
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Сначала отрисовываем все изображения
  for (const imageInfo of imageInfos) {
    try {
      // Извлекаем Uint8Array из imageInfo
      const { content, extension, bounds } = imageInfo;
      const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      
      // Создаем изображение
      const img = await createImageFromArrayBuffer(content, mimeType);
      
      // Если есть информация о позиции и размере, используем ее
      if (bounds) {
        const { x, y, w, h } = bounds;
        
        // Преобразуем относительные координаты в абсолютные для canvas
        const canvasX = width * (x / 100);
        const canvasY = height * (y / 100);
        const canvasWidth = width * (w / 100);
        const canvasHeight = height * (h / 100);
        
        // Рисуем изображение на заданной позиции с заданным размером
        ctx.drawImage(img, canvasX, canvasY, canvasWidth, canvasHeight);
      } else {
        // Если нет информации о размерах, рисуем изображение с сохранением пропорций в центре
        const imgRatio = img.width / img.height;
        const maxWidth = width * 0.8; // 80% от ширины слайда
        const maxHeight = height * 0.6; // 60% от высоты слайда
        
        let drawWidth = maxWidth;
        let drawHeight = maxWidth / imgRatio;
        
        if (drawHeight > maxHeight) {
          drawHeight = maxHeight;
          drawWidth = maxHeight * imgRatio;
        }
        
        const centerX = (width - drawWidth) / 2;
        const centerY = (height - drawHeight) / 2;
        
        ctx.drawImage(img, centerX, centerY, drawWidth, drawHeight);
      }
    } catch (error) {
      console.error('Ошибка при отрисовке изображения на canvas:', error);
    }
  }
  
  // Добавляем заголовок слайда, если он есть
  if (title) {
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    // Если есть изображения, рисуем заголовок сверху
    if (imageInfos.length > 0) {
      ctx.fillText(title, width / 2, 80);
    } else {
      // Если изображений нет, рисуем заголовок по центру
      ctx.fillText(title, width / 2, height / 2);
    }
  }
  
  // Преобразуем canvas в Blob
  return canvasToBlob(canvas, 'image/jpeg', 0.95);
}

interface SlideImageInfo {
  content: Uint8Array;
  extension: string;
  bounds?: {
    x: number; // Позиция X в процентах от ширины слайда
    y: number; // Позиция Y в процентах от высоты слайда
    w: number; // Ширина в процентах от ширины слайда
    h: number; // Высота в процентах от высоты слайда
  };
}

interface SlideInfo {
  number: number;
  title?: string;
  content?: string;
  imageData?: {
    content: Uint8Array;
    extension: string;
  };
  images?: SlideImageInfo[]; // Массив всех изображений на слайде
}

/**
 * Извлекает все изображения из слайда PPTX
 */
async function extractAllSlideImages(slideXmlContent: string, relsContent: string, zipContents: JSZip): Promise<SlideImageInfo[]> {
  const images: SlideImageInfo[] = [];
  
  // Ищем все ссылки на изображения в слайде
  const imageMatches = slideXmlContent.match(/r:embed="rId[0-9]+"/g);
  
  if (!imageMatches || imageMatches.length === 0) {
    return images;
  }
  
  // Обрабатываем все найденные изображения
  for (const imageMatch of imageMatches) {
    try {
      const rIdValue = imageMatch.match(/rId([0-9]+)"/)?.[1];
      
      if (!rIdValue) continue;
      
      const targetMatch = relsContent.match(new RegExp(`Id="${rIdValue}" [^>]*Target="([^"]+)"`));
      if (!targetMatch || !targetMatch[1]) continue;
      
      let imagePath = targetMatch[1];
      
      // Преобразуем относительный путь в абсолютный
      if (imagePath.startsWith('../')) {
        imagePath = imagePath.replace('../', 'ppt/');
      } else {
        imagePath = `ppt/slides/${imagePath}`;
      }
      
      // Проверяем, что файл изображения существует
      const imageFile = zipContents.files[imagePath];
      
      if (!imageFile || imageFile.dir) continue;
      
      // Загружаем содержимое изображения
      const imageContent = await imageFile.async('uint8array');
      const fileExtension = imagePath.split('.').pop()?.toLowerCase() || 'png';
      
      // Ищем информацию о позиции и размере изображения
      // Ищем элемент с rId в XML
      const imgElement = slideXmlContent.match(new RegExp(`<p:pic[^>]*>.+?r:embed="${rIdValue}"[^>]*>.+?</p:pic>`, 's'));
      
      let bounds;
      
      if (imgElement) {
        // Ищем информацию о размере и позиции
        const xfrm = imgElement[0].match(/<a:xfrm.+?<\/a:xfrm>/s);
        if (xfrm) {
          // Извлекаем значения off и ext из xfrm
          const offMatch = xfrm[0].match(/<a:off[^>]*x="([0-9]+)"[^>]*y="([0-9]+)"/);
          const extMatch = xfrm[0].match(/<a:ext[^>]*cx="([0-9]+)"[^>]*cy="([0-9]+)"/);
          
          if (offMatch && extMatch) {
            // PPTX использует EMU (English Metric Units) для размеров
            // 1 дюйм = 914400 EMU, стандартный слайд 10x7.5 дюймов (9144000x6858000 EMU)
            const slideWidth = 9144000;
            const slideHeight = 6858000;
            
            const x = parseInt(offMatch[1]) / slideWidth * 100;
            const y = parseInt(offMatch[2]) / slideHeight * 100;
            const w = parseInt(extMatch[1]) / slideWidth * 100;
            const h = parseInt(extMatch[2]) / slideHeight * 100;
            
            bounds = { x, y, w, h };
          }
        }
      }
      
      // Добавляем информацию об изображении
      images.push({
        content: imageContent,
        extension: fileExtension,
        bounds
      });
    } catch (error) {
      console.error('Ошибка при извлечении изображения из слайда:', error);
    }
  }
  
  return images;
}

/**
 * Извлекает содержимое PPTX-файла и преобразует слайды в формат для презентации
 * @param file PPTX-файл
 * @returns Массив слайдов для презентации
 */
export const importPptxPackage = async (file: File): Promise<Slide[]> => {
  try {
    // Проверка, что это PPTX-файл
    if (!file.name.endsWith('.pptx')) {
      throw new Error('Файл должен быть в формате PPTX');
    }
    
    // Извлекаем содержимое PPTX (это ZIP-архив)
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(file);
    
    // Массив для хранения слайдов
    const slides: Slide[] = [];
    
    // Собираем информацию о слайдах
    const slideInfos: SlideInfo[] = [];
    
    // Получаем список XML файлов слайдов
    const slideXmlFiles: string[] = [];
    for (const filename in zipContents.files) {
      if (filename.match(/ppt\/slides\/slide[0-9]+\.xml$/)) {
        slideXmlFiles.push(filename);
      }
    }
    
    // Сортируем по номеру слайда
    slideXmlFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide([0-9]+)\.xml/)?.[1] || '0');
      const numB = parseInt(b.match(/slide([0-9]+)\.xml/)?.[1] || '0');
      return numA - numB;
    });
    
    // Обрабатываем каждый слайд
    for (const slideXmlFile of slideXmlFiles) {
      const slideNumber = parseInt(slideXmlFile.match(/slide([0-9]+)\.xml/)?.[1] || '0');
      
      // Получаем содержимое XML слайда
      const slideXmlContent = await zipContents.files[slideXmlFile].async('string');
      
      // Ищем заголовок слайда (это может быть в разных местах, в зависимости от формата PPTX)
      let slideTitle = '';
      const titleMatch = slideXmlContent.match(/<a:t>([^<]+)<\/a:t>/);
      if (titleMatch && titleMatch[1]) {
        slideTitle = titleMatch[1].trim();
      }
      
      // Пытаемся извлечь текстовое содержимое
      let textContent = '';
      const textMatches = slideXmlContent.match(/<a:t>([^<]+)<\/a:t>/g);
      if (textMatches) {
        for (const match of textMatches) {
          const text = match.replace(/<a:t>|<\/a:t>/g, '').trim();
          if (text && text !== slideTitle) {
            textContent += `<p>${text}</p>`;
          }
        }
      }
      
      // Получаем rels файл для этого слайда, который содержит ссылки на изображения
      const relsFilename = `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
      const relsFile = zipContents.files[relsFilename];
      
      // Данные для слайда
      const slideInfo: SlideInfo = {
        number: slideNumber,
        title: slideTitle || `Слайд ${slideNumber}`,
        content: textContent,
        images: [] 
      };
      
      // Проверяем, есть ли связанные изображения
      if (relsFile) {
        const relsContent = await relsFile.async('string');
        
        // Извлекаем все изображения из слайда
        const slideImages = await extractAllSlideImages(slideXmlContent, relsContent, zipContents);
        
        if (slideImages.length > 0) {
          slideInfo.images = slideImages;
          
          // Также сохраняем первое изображение как основное, для совместимости
          const firstImage = slideImages[0];
          slideInfo.imageData = {
            content: firstImage.content,
            extension: firstImage.extension
          };
        }
      }
      
      // Добавляем информацию о слайде в массив
      slideInfos.push(slideInfo);
    }
    
    // Если не нашли слайды через XML, пробуем найти хотя бы изображения
    if (slideInfos.length === 0) {
      // Fallback к методу извлечения только изображений
      const slideImagePaths = new Set<string>();
      
      // Ищем изображения в разных папках
      for (const filename in zipContents.files) {
        if (
          filename.startsWith('ppt/media/') || 
          filename.startsWith('ppt/slides/media/') ||
          filename.startsWith('ppt/slideMasters/media/')
        ) {
          if (
            filename.endsWith('.png') || 
            filename.endsWith('.jpg') || 
            filename.endsWith('.jpeg') || 
            filename.endsWith('.gif')
          ) {
            slideImagePaths.add(filename);
          }
        }
      }
      
      // Сортируем и обрабатываем изображения
      const sortedImagePaths = [...slideImagePaths].sort();
      
      for (let i = 0; i < sortedImagePaths.length; i++) {
        const imagePath = sortedImagePaths[i];
        const imageFile = zipContents.files[imagePath];
        
        if (imageFile) {
          const imageContent = await imageFile.async('uint8array');
          const fileExtension = imagePath.split('.').pop()?.toLowerCase() || 'png';
          
          slideInfos.push({
            number: i + 1,
            title: `Слайд ${i + 1}`,
            images: [{
              content: imageContent,
              extension: fileExtension
            }],
            imageData: {
              content: imageContent,
              extension: fileExtension
            }
          });
        }
      }
    }
    
    // Создаем слайды из полученной информации
    for (const slideInfo of slideInfos) {
      try {
        // Если у слайда есть изображения, создаем один слайд с полным отображением
        if (slideInfo.images && slideInfo.images.length > 0) {
          // Рендерим весь слайд как одно изображение
          const slideBlob = await renderSlideToCanvas(
            slideInfo.images, 
            slideInfo.title || `Слайд ${slideInfo.number}`,
            1280, 720 // Размеры слайда 16:9
          );
          
          // Загружаем изображение целого слайда на сервер
          const slideImageUrl = await uploadImage(slideBlob, 'pptx-slides');
          
          // Создаем слайд с изображением
          slides.push({
            id: crypto.randomUUID(),
            type: 'image',
            url: slideImageUrl,
            caption: slideInfo.title || `Слайд ${slideInfo.number}`
          } as ImageSlide);
        } else if (slideInfo.content) {
          // Если есть только текстовое содержимое, создаем текстовый слайд
          slides.push({
            id: crypto.randomUUID(),
            type: 'text',
            content: `<h2>${slideInfo.title}</h2>${slideInfo.content}`
          } as TextSlide);
        } else {
          // Если ничего не нашли, создаем пустой текстовый слайд с заголовком
          slides.push({
            id: crypto.randomUUID(),
            type: 'text',
            content: `<h2>${slideInfo.title}</h2><p>Слайд без содержимого</p>`
          } as TextSlide);
        }
      } catch (error) {
        console.error('Ошибка при создании слайда:', error);
        
        // В случае ошибки добавляем текстовый слайд
        slides.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: `<h2>${slideInfo.title || `Слайд ${slideInfo.number}`}</h2><p>Не удалось обработать содержимое слайда</p>`
        } as TextSlide);
      }
    }
    
    // Если не нашли ни слайдов, ни изображений, создаем информационный слайд
    if (slides.length === 0) {
      // Создаем изображение с текстом "PPTX импортирован"
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Заливаем фон
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем текст
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PPTX импортирован', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = '20px Arial';
        ctx.fillText('Не удалось извлечь содержимое из презентации', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Попробуйте другой PPTX-файл', canvas.width / 2, canvas.height / 2 + 30);
        
        // Конвертируем canvas в изображение используя Promise
        try {
          const blob = await canvasToBlob(canvas, 'image/png', 0.95);
          
          // Загружаем изображение на сервер
          const imageUrl = await uploadImage(blob, 'pptx-slides');
          
          slides.push({
            id: crypto.randomUUID(),
            type: 'image',
            url: imageUrl,
            caption: 'PPTX импортирован'
          } as ImageSlide);
        } catch (err) {
          console.error('Ошибка при создании изображения из canvas:', err);
        }
      }
    }
    
    return slides;
  } catch (error) {
    console.error('Ошибка при импорте PPTX:', error);
    throw new Error(error instanceof Error ? error.message : 'Ошибка при обработке PPTX файла');
  }
}; 