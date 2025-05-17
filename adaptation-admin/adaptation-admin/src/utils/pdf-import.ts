import { Slide, ImageSlide, TextSlide } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';
import { uploadImage } from '@/utils/file-storage';

// Set worker path to CDN - simple approach that works in most environments
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
  
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
 * Получает текстовое содержимое страницы PDF
 */
const getPageText = async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
  try {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const textItems = textContent.items as any[];
    
    let lastY = null;
    let text = '';
    
    for (const item of textItems) {
      if ('str' in item) {
        // Определяем, нужно ли начать новый параграф
        if (lastY !== null && Math.abs(lastY - item.transform[5]) > 10) {
          text += '<p>';
        }
        
        text += item.str;
        
        // Если строка заканчивается, добавляем закрывающий тег параграфа
        if (item.str.trim() && (lastY === null || Math.abs(lastY - item.transform[5]) > 10)) {
          text += '</p>';
        }
        
        lastY = item.transform[5];
      }
    }
    
    // Проверяем, начинается ли текст с <p> и заканчивается </p>
    if (!text.startsWith('<p>')) {
      text = '<p>' + text;
    }
    if (!text.endsWith('</p>')) {
      text += '</p>';
    }
    
    return text;
  } catch (error) {
    console.error('Ошибка при извлечении текста из PDF:', error);
    return '';
  }
};

/**
 * Рендерит страницу PDF в canvas и возвращает URL изображения
 */
const renderPageToImage = async (
  pdfDoc: pdfjsLib.PDFDocumentProxy, 
  pageNum: number, 
  scale = 1.5
): Promise<string | null> => {
  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }
    
    const renderContext = {
      canvasContext: context,
      viewport
    };
    
    await page.render(renderContext).promise;
    
    // Получаем Blob из canvas
    const blob = await canvasToBlob(canvas, 'image/png', 0.8);
    
    // Загружаем изображение на сервер вместо создания локального URL
    const imageUrl = await uploadImage(blob, 'pdf-slides');
    return imageUrl;
  } catch (error) {
    console.error('Ошибка при рендеринге страницы PDF:', error);
    return null;
  }
};

/**
 * Извлекает заголовок страницы из текста
 * Берет первую строку или первый абзац
 */
const extractTitle = (text: string): { title: string, restText: string } => {
  // Удаляем HTML-теги для поиска заголовка
  const plainText = text.replace(/<\/?[^>]+(>|$)/g, ' ').trim();
  const sentences = plainText.split(/[.!?]/).filter(s => s.trim().length > 0);
  
  // Если есть первое предложение и оно достаточно короткое, используем его как заголовок
  if (sentences.length > 0 && sentences[0].length < 100) {
    const title = sentences[0].trim();
    return { 
      title,
      // Возвращаем остальной текст с HTML-тегами
      restText: text.replace(title, '').trim()
    };
  }
  
  // Иначе просто формируем заголовок из номера страницы
  return { 
    title: '',
    restText: text
  };
};

/**
 * Импортирует PDF-файл и преобразует его страницы в слайды
 */
export const importPdfFile = async (file: File): Promise<Slide[]> => {
  try {
    // Проверяем тип файла
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      throw new Error('Файл должен быть в формате PDF');
    }
    
    // Загружаем файл в ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Загружаем PDF документ
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDoc.numPages;
    
    const slides: Slide[] = [];
    
    // Обрабатываем каждую страницу
    for (let i = 1; i <= numPages; i++) {
      // Извлекаем текст со страницы
      const pageText = await getPageText(pdfDoc, i);
      
      // Извлекаем заголовок из текста
      const { title, restText } = extractTitle(pageText);
      const pageTitle = title || `Страница ${i}`;
      
      // Рендерим страницу в изображение
      const imageUrl = await renderPageToImage(pdfDoc, i);
      
      if (imageUrl) {
        // Создаем слайд с изображением
        slides.push({
          id: crypto.randomUUID(),
          type: 'image',
          url: imageUrl,
          caption: pageTitle
        } as ImageSlide);
      } else if (restText && restText.length > 0) {
        // Если не удалось создать изображение, но есть текст, создаем текстовый слайд
        slides.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: `<h2>${pageTitle}</h2>${restText}`
        } as TextSlide);
      } else {
        // Создаем пустой текстовый слайд если ничего не удалось извлечь
        slides.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: `<h2>${pageTitle}</h2><p>Не удалось извлечь содержимое страницы</p>`
        } as TextSlide);
      }
    }
    
    // Если не удалось создать ни одного слайда
    if (slides.length === 0) {
      slides.push({
        id: crypto.randomUUID(),
        type: 'text',
        content: `<h1>PDF импортирован</h1><p>Не удалось извлечь содержимое PDF файла. Возможно, файл защищен или содержит только изображения.</p>`
      } as TextSlide);
    }
    
    return slides;
  } catch (error) {
    console.error('Ошибка при импорте PDF:', error);
    throw new Error(error instanceof Error ? error.message : 'Ошибка при обработке PDF файла');
  }
}; 