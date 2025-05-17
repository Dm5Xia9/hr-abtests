import { jsPDF } from "jspdf";
import JSZip from 'jszip';

interface SlideInfo {
  number: number;
  title?: string;
  imageData?: {
    content: Uint8Array;
    extension: string;
  };
}

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
 * Рендерит изображение на canvas и возвращает data URL
 */
function renderImageToCanvas(img: HTMLImageElement, width: number, height: number): string {
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
  
  // Возвращаем данные как base64 Data URL
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Извлекает и обрабатывает изображения слайдов для создания PDF
 */
async function extractSlidesAsImages(zipContents: JSZip): Promise<SlideInfo[]> {
  // Собираем информацию о слайдах
  const slideInfos: SlideInfo[] = [];
  
  // Получаем список XML файлов слайдов для определения количества слайдов
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
  
  // Если не найдены XMLs слайдов, ищем напрямую изображения
  if (slideXmlFiles.length === 0) {
    const mediaFiles: Record<string, JSZip.JSZipObject> = {};
    for (const filename in zipContents.files) {
      if (
        (filename.startsWith('ppt/media/') || 
         filename.startsWith('ppt/slides/media/') || 
         filename.startsWith('ppt/slideMasters/media/')) && 
        (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg'))
      ) {
        mediaFiles[filename] = zipContents.files[filename];
      }
    }
    
    // Сортируем файлы по имени
    const sortedMediaFiles = Object.entries(mediaFiles)
      .sort(([filenameA], [filenameB]) => filenameA.localeCompare(filenameB));
    
    // Обрабатываем медиа-файлы как слайды
    for (let i = 0; i < sortedMediaFiles.length; i++) {
      const [filename, file] = sortedMediaFiles[i];
      const imageData = await file.async('uint8array');
      const fileExtension = filename.split('.').pop()?.toLowerCase() || 'png';
      
      slideInfos.push({
        number: i + 1,
        title: `Слайд ${i + 1}`,
        imageData: {
          content: imageData,
          extension: fileExtension
        }
      });
    }
    
    return slideInfos;
  }
  
  // Обрабатываем стандартные слайды
  for (const slideXmlFile of slideXmlFiles) {
    const slideNumber = parseInt(slideXmlFile.match(/slide([0-9]+)\.xml/)?.[1] || '0');
    const slideXmlContent = await zipContents.files[slideXmlFile].async('string');
    
    // Ищем заголовок слайда
    let slideTitle = '';
    const titleMatch = slideXmlContent.match(/<a:t>([^<]+)<\/a:t>/);
    if (titleMatch && titleMatch[1]) {
      slideTitle = titleMatch[1].trim();
    }
    
    // Получаем rels файл для этого слайда
    const relsFilename = `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
    const relsFile = zipContents.files[relsFilename];
    
    const slideInfo: SlideInfo = {
      number: slideNumber,
      title: slideTitle || `Слайд ${slideNumber}`
    };
    
    // Ищем изображения для слайда
    if (relsFile) {
      const relsContent = await relsFile.async('string');
      const imageMatches = slideXmlContent.match(/r:embed="rId[0-9]+"/g);
      
      if (imageMatches && imageMatches.length > 0) {
        const mainImageMatch = imageMatches[0];
        const rIdValue = mainImageMatch.match(/rId([0-9]+)"/)?.[1];
        
        if (rIdValue) {
          const targetMatch = relsContent.match(new RegExp(`Id="${rIdValue}" [^>]*Target="([^"]+)"`));
          if (targetMatch && targetMatch[1]) {
            let imagePath = targetMatch[1];
            
            // Преобразуем относительный путь в абсолютный
            if (imagePath.startsWith('../')) {
              imagePath = imagePath.replace('../', 'ppt/');
            } else {
              imagePath = `ppt/slides/${imagePath}`;
            }
            
            // Проверяем, что файл изображения существует
            const imageFile = zipContents.files[imagePath];
            
            if (imageFile && !imageFile.dir) {
              const imageContent = await imageFile.async('uint8array');
              const fileExtension = imagePath.split('.').pop()?.toLowerCase() || 'png';
              
              // Сохраняем данные изображения
              slideInfo.imageData = {
                content: imageContent,
                extension: fileExtension
              };
            }
          }
        }
      }
    }
    
    // Добавляем информацию о слайде в массив
    slideInfos.push(slideInfo);
  }
  
  return slideInfos;
}

/**
 * Конвертирует PPTX-файл в PDF
 * @param pptxFile PPTX-файл для конвертации
 * @returns File объект с PDF-файлом
 */
export const convertPptxToPdf = async (pptxFile: File): Promise<File> => {
  try {
    // Проверка, что это PPTX-файл
    if (!pptxFile.name.endsWith('.pptx')) {
      throw new Error('Файл должен быть в формате PPTX');
    }
    
    // Извлекаем содержимое PPTX (ZIP-архива)
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(pptxFile);
    
    // Извлекаем слайды как изображения
    const slideInfos = await extractSlidesAsImages(zipContents);
    
    // Создаем PDF-документ
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [1280, 720] // Стандартный размер слайда 16:9
    });
    
    // Конвертируем слайды в страницы PDF
    for (let i = 0; i < slideInfos.length; i++) {
      const slideInfo = slideInfos[i];
      
      // Добавляем новую страницу, кроме первой
      if (i > 0) {
        pdf.addPage();
      }
      
      if (slideInfo.imageData) {
        try {
          // Если у слайда есть изображение, добавляем его
          const { content, extension } = slideInfo.imageData;
          const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
          
          // Создаем изображение из ArrayBuffer
          const img = await createImageFromArrayBuffer(content, mimeType);
          
          // Рендерим изображение на canvas и получаем dataURL
          const dataUrl = renderImageToCanvas(
            img, 
            pdf.internal.pageSize.getWidth(), 
            pdf.internal.pageSize.getHeight()
          );
          
          // Добавляем изображение на страницу
          pdf.addImage(
            dataUrl,
            'JPEG',
            0, 0,
            pdf.internal.pageSize.getWidth(),
            pdf.internal.pageSize.getHeight()
          );
        } catch (error) {
          console.error('Ошибка при обработке изображения слайда:', error);
          // Если не удалось обработать изображение, создаем текстовый слайд
          pdf.setFontSize(32);
          pdf.setTextColor(0, 0, 0);
          pdf.text(
            slideInfo.title || `Слайд ${i + 1}`,
            pdf.internal.pageSize.getWidth() / 2,
            pdf.internal.pageSize.getHeight() / 2,
            { align: 'center' }
          );
          pdf.setFontSize(14);
          pdf.text(
            'Не удалось обработать изображение для этого слайда',
            pdf.internal.pageSize.getWidth() / 2,
            pdf.internal.pageSize.getHeight() / 2 + 40,
            { align: 'center' }
          );
        }
      } else {
        // Если изображения нет, создаем текстовый слайд с заголовком
        pdf.setFontSize(32);
        pdf.setTextColor(0, 0, 0);
        
        // Заголовок
        pdf.text(
          slideInfo.title || `Слайд ${i + 1}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() / 2,
          { align: 'center' }
        );
      }
    }
    
    // Если не удалось создать ни одного слайда, создаем заглушку
    if (slideInfos.length === 0) {
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        'Не удалось извлечь содержимое PPTX. Попробуйте другой файл.',
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() / 2,
        { align: 'center' }
      );
    }
    
    // Сохраняем PDF в Blob
    const pdfBlob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
    
    // Создаем File объект
    const pdfFile = new File([pdfBlob], `${pptxFile.name.replace('.pptx', '')}.pdf`, {
      type: 'application/pdf',
      lastModified: new Date().getTime()
    });
    
    return pdfFile;
  } catch (error) {
    console.error('Error converting PPTX to PDF:', error);
    throw new Error('Ошибка при конвертации PPTX в PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}; 