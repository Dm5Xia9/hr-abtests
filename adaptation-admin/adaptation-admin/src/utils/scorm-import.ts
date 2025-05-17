import JSZip from 'jszip';
import { DOMParser } from 'xmldom';
import { Slide, TextSlide, ImageSlide, TestSlide, TestOption } from '@/types';
import { uploadImage } from '@/utils/file-storage';

interface ScormResource {
  identifier: string;
  type: string;
  href: string;
  dependencies?: string[];
}

interface ScormItem {
  identifier: string;
  title: string;
  resourceId: string;
  children?: ScormItem[];
}

interface ScormManifest {
  defaultOrganization: string;
  resources: Record<string, ScormResource>;
  organizations: Record<string, ScormItem[]>;
}

interface ScormExtractedContent {
  manifest: ScormManifest;
  files: Record<string, Uint8Array>;
}

/**
 * Парсит XML строку и извлекает данные манифеста SCORM
 */
const parseManifest = (xmlString: string): ScormManifest => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  // Инициализация структуры манифеста
  const manifest: ScormManifest = {
    defaultOrganization: '',
    resources: {},
    organizations: {}
  };

  // Получаем defaultOrganization
  const defaultOrg = xmlDoc.getElementsByTagName('organizations')[0]?.getAttribute('default');
  if (defaultOrg) {
    manifest.defaultOrganization = defaultOrg;
  }

  // Парсинг ресурсов
  const resourceNodes = xmlDoc.getElementsByTagName('resource');
  for (let i = 0; i < resourceNodes.length; i++) {
    const resource = resourceNodes[i];
    const identifier = resource.getAttribute('identifier') || '';
    const type = resource.getAttribute('type') || '';
    const href = resource.getAttribute('href') || '';
    
    // Парсинг зависимостей
    const dependencies: string[] = [];
    const dependencyNodes = resource.getElementsByTagName('dependency');
    for (let j = 0; j < dependencyNodes.length; j++) {
      const identifierref = dependencyNodes[j].getAttribute('identifierref');
      if (identifierref) {
        dependencies.push(identifierref);
      }
    }
    
    manifest.resources[identifier] = {
      identifier,
      type,
      href,
      dependencies: dependencies.length > 0 ? dependencies : undefined
    };
  }

  // Парсинг организаций
  const organizationNodes = xmlDoc.getElementsByTagName('organization');
  for (let i = 0; i < organizationNodes.length; i++) {
    const organization = organizationNodes[i];
    const identifier = organization.getAttribute('identifier') || '';
    manifest.organizations[identifier] = [];
    
    // Парсинг элементов (items)
    const parseItems = (parentNode: Element, parentArray: ScormItem[]) => {
      const itemNodes = parentNode.getElementsByTagName('item');
      for (let j = 0; j < itemNodes.length; j++) {
        const item = itemNodes[j];
        if (item.parentNode !== parentNode) continue; // Пропускаем вложенные элементы
        
        const identifier = item.getAttribute('identifier') || '';
        const identifierref = item.getAttribute('identifierref') || '';
        const titleNode = item.getElementsByTagName('title')[0];
        const title = titleNode ? titleNode.textContent || '' : '';
        
        const scormItem: ScormItem = {
          identifier,
          title,
          resourceId: identifierref
        };
        
        // Рекурсивно обрабатываем дочерние элементы
        const children: ScormItem[] = [];
        parseItems(item, children);
        if (children.length > 0) {
          scormItem.children = children;
        }
        
        parentArray.push(scormItem);
      }
    };
    
    parseItems(organization, manifest.organizations[identifier]);
  }
  
  return manifest;
};

/**
 * Извлекает содержимое SCORM пакета
 */
const extractScormPackage = async (file: File): Promise<ScormExtractedContent> => {
  try {
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(file);
    
    // Ищем манифест
    let manifestContent = '';
    const files: Record<string, Uint8Array> = {};
    
    for (const filename in zipContents.files) {
      const file = zipContents.files[filename];
      
      // Пропускаем директории
      if (file.dir) continue;
      
      if (filename.toLowerCase() === 'imsmanifest.xml') {
        // Получаем содержимое манифеста
        manifestContent = await file.async('string');
      } else {
        // Сохраняем все остальные файлы в бинарном формате
        const content = await file.async('uint8array');
        files[filename] = content;
      }
    }
    
    if (!manifestContent) {
      throw new Error('Файл imsmanifest.xml не найден в SCORM пакете');
    }
    
    const manifest = parseManifest(manifestContent);
    return { manifest, files };
  } catch (error) {
    console.error('Ошибка при извлечении SCORM пакета:', error);
    throw new Error('Не удалось извлечь содержимое SCORM пакета');
  }
};

/**
 * Конвертирует HTML содержимое в текстовый слайд
 */
const convertHtmlToTextSlide = (html: string, title: string): TextSlide => {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    content: `<h2>${title}</h2>${html}`
  };
};

/**
 * Создает тестовый слайд из данных SCORM
 */
const createTestSlide = (title: string, questionText: string, options: string[], correctAnswers: number[]): TestSlide => {
  const testOptions: TestOption[] = options.map((text, index) => ({
    id: crypto.randomUUID(),
    text,
    isCorrect: correctAnswers.includes(index)
  }));
  
  return {
    id: crypto.randomUUID(),
    type: 'test',
    question: questionText,
    options: testOptions,
    testType: correctAnswers.length === 1 ? 'single' : 'multiple',
    explanation: ''
  };
};

/**
 * Создает слайд с изображением из данных SCORM
 */
const createImageSlide = async (imageData: Uint8Array, mimeType: string, title: string): Promise<ImageSlide> => {
  // Создаем Blob из данных файла
  const blob = new Blob([imageData], { type: mimeType });
  
  // Загружаем изображение на сервер
  const imageUrl = await uploadImage(blob, 'scorm-slides');
  
  return {
    id: crypto.randomUUID(),
    type: 'image',
    url: imageUrl,
    caption: title
  };
};

/**
 * Анализирует HTML-контент для извлечения вопросов и ответов
 * Это упрощенная реализация, которая ищет данные по определенным паттернам
 */
const parseQuizFromHtml = (html: string): { 
  isQuiz: boolean; 
  question?: string; 
  options?: string[]; 
  correctAnswers?: number[];
} => {
  // Простая проверка, является ли содержимое тестом
  const hasQuizPatterns = /class=['"]question|type=['"]radio|type=['"]checkbox|<quiz|<assessment/i.test(html);
  
  if (!hasQuizPatterns) {
    return { isQuiz: false };
  }
  
  try {
    // Создаем DOM из HTML для анализа (это упрощенная версия)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Ищем вопрос
    const questionEl = doc.querySelector('.question, .questiontext, .quiz-question');
    const question = questionEl?.textContent?.trim() || 'Вопрос теста';
    
    // Ищем варианты ответов
    const optionElements = doc.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    const options: string[] = [];
    const correctAnswers: number[] = [];
    
    for (let i = 0; i < optionElements.length; i++) {
      const input = optionElements[i] as Element;
      const labelEl = input.nextSibling as Element;
      const labelText = labelEl?.textContent?.trim() || `Вариант ${i+1}`;
      options.push(labelText);
      
      // Проверяем, правильный ли ответ
      const isCorrect = input.getAttribute('data-correct') === 'true' || 
                        input.getAttribute('correct') === 'true' ||
                        input.hasAttribute('checked');
      if (isCorrect) {
        correctAnswers.push(i);
      }
    }
    
    return {
      isQuiz: true,
      question,
      options: options.length > 0 ? options : ['Вариант 1', 'Вариант 2'],
      correctAnswers: correctAnswers.length > 0 ? correctAnswers : [0]
    };
  } catch (error) {
    console.error('Ошибка при анализе HTML теста:', error);
    return { isQuiz: false };
  }
};

/**
 * Преобразует SCORM-контент в слайды презентации
 */
const convertScormToSlides = async (scormContent: ScormExtractedContent): Promise<Slide[]> => {
  const slides: Slide[] = [];
  
  // Получаем основные данные SCORM
  const { manifest } = scormContent;
  
  // Обработка элементов
  const processItems = async (items: ScormItem[]): Promise<void> => {
    for (const item of items) {
      // Пропускаем элементы без ссылки на ресурс
      if (!item.resourceId) {
        // Если есть дочерние элементы, обрабатываем их
        if (item.children && item.children.length > 0) {
          await processItems(item.children);
        }
        continue;
      }
      
      // Получаем ресурс, связанный с элементом
      const resource = manifest.resources[item.resourceId];
      if (!resource || !resource.href) continue;
      
      // Нормализуем путь к ресурсу
      const resourcePath = resource.href.replace('\\', '/');
      
      // Получаем содержимое файла
      const fileContent = scormContent.files[resourcePath];
      
      if (fileContent) {
        // Определяем тип файла по расширению
        const fileExtension = resourcePath.split('.').pop()?.toLowerCase() || '';
        
        if (['html', 'htm'].includes(fileExtension)) {
          // Конвертируем бинарные данные в строку
          const textDecoder = new TextDecoder('utf-8');
          const htmlContent = textDecoder.decode(fileContent);
          
          // Проверяем, является ли HTML контент тестом
          const quizData = parseQuizFromHtml(htmlContent);
          
          if (quizData.isQuiz && quizData.options && quizData.correctAnswers) {
            // Создаем тестовый слайд
            slides.push(createTestSlide(
              item.title,
              quizData.question || item.title,
              quizData.options,
              quizData.correctAnswers
            ));
          } else {
            // Создаем обычный текстовый слайд
            slides.push(convertHtmlToTextSlide(htmlContent, item.title));
          }
        } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension)) {
          // Создаем слайд с изображением
          const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
          
          // Загружаем изображение и создаем слайд
          const imageSlide = await createImageSlide(fileContent, mimeType, item.title);
          slides.push(imageSlide);
        }
      }
      
      // Рекурсивно обрабатываем дочерние элементы
      if (item.children && item.children.length > 0) {
        await processItems(item.children);
      }
    }
  };
  
  // Запускаем обработку
  await processItems(manifest.organizations[manifest.defaultOrganization] || []);
  
  // Если не удалось создать слайды из контента, создаем хотя бы один информационный слайд
  if (slides.length === 0) {
    slides.push({
      id: crypto.randomUUID(),
      type: 'text',
      content: `<h1>SCORM пакет импортирован</h1>
                <p>К сожалению, не удалось автоматически преобразовать содержимое SCORM в слайды.</p>
                <p>Возможные причины:</p>
                <ul>
                  <li>Неподдерживаемый формат контента</li>
                  <li>Специфическая структура SCORM пакета</li>
                  <li>Отсутствие HTML/изображений для преобразования в слайды</li>
                </ul>`
    } as TextSlide);
  }
  
  return slides;
};

/**
 * Основная функция для импорта SCORM-пакета и преобразования его в слайды
 */
export const importScormPackage = async (file: File): Promise<Slide[]> => {
  try {
    // Проверка, что это ZIP-файл
    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
      throw new Error('Файл должен быть в формате ZIP');
    }
    
    // Извлекаем содержимое пакета
    const scormContent = await extractScormPackage(file);
    
    // Преобразуем содержимое в слайды
    const slides = await convertScormToSlides(scormContent);
    
    return slides;
  } catch (error) {
    console.error('Ошибка при импорте SCORM:', error);
    throw new Error(error instanceof Error ? error.message : 'Ошибка при обработке SCORM файла');
  }
}; 