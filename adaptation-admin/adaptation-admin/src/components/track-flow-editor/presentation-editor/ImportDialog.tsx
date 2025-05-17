import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileIcon, Loader2, Package, Presentation, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

type ImportStatus = 'idle' | 'importing';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScormImport: (file: File) => Promise<void>;
  onPptxImport: (file: File) => Promise<void>;
  onPdfImport: (file: File) => Promise<void>;
  isImporting: boolean;
  importError: string | null;
}

export function ImportDialog({
  open,
  onOpenChange,
  onScormImport,
  onPptxImport,
  onPdfImport,
  isImporting,
  importError
}: ImportDialogProps) {
  const [activeTab, setActiveTab] = useState("scorm");
  const [pptxImportStatus, setPptxImportStatus] = useState<ImportStatus>('idle');
  const scormFileInputRef = useRef<HTMLInputElement>(null);
  const pptxFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const handleScormFileSelect = () => {
    scormFileInputRef.current?.click();
  };

  const handlePptxFileSelect = () => {
    pptxFileInputRef.current?.click();
  };
  
  const handlePdfFileSelect = () => {
    pdfFileInputRef.current?.click();
  };

  const handleScormFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      await onScormImport(file);
      
      // Reset file input
      if (scormFileInputRef.current) {
        scormFileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing SCORM:', error);
    }
  };
  
  const handlePptxFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Обновляем статус на "importing"
      setPptxImportStatus('importing');
      
      // Вызываем обработчик импорта PPTX напрямую
      await onPptxImport(file);
      
      // Сбрасываем статус
      setPptxImportStatus('idle');
      
      // Reset file input
      if (pptxFileInputRef.current) {
        pptxFileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing PPTX:', error);
      // Сбрасываем статус при ошибке
      setPptxImportStatus('idle');
    }
  };
  
  const handlePdfFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      await onPdfImport(file);
      
      // Reset file input
      if (pdfFileInputRef.current) {
        pdfFileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing PDF:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Импорт презентации</DialogTitle>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scorm" disabled={isImporting}>
              <Package className="h-4 w-4 mr-2" />
              SCORM
            </TabsTrigger>
            <TabsTrigger value="pptx" disabled={isImporting}>
              <Presentation className="h-4 w-4 mr-2" />
              PowerPoint
            </TabsTrigger>
            <TabsTrigger value="pdf" disabled={isImporting}>
              <FileIcon className="h-4 w-4 mr-2" />
              PDF
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scorm" className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">
              Выберите SCORM пакет (ZIP-файл) для импорта презентации.
            </p>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleScormFileSelect}
                className="w-full py-8 border-dashed"
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 mr-2" />
                    Выбрать SCORM файл
                  </>
                )}
              </Button>
              <input 
                type="file" 
                ref={scormFileInputRef}
                className="hidden"
                accept=".zip"
                onChange={handleScormFileUpload}
                disabled={isImporting}
              />
            </div>
            
            {importError && activeTab === "scorm" && (
              <div className="bg-destructive/10 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{importError}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Поддерживаемые форматы: SCORM 1.2, SCORM 2004 (ZIP архив)</p>
              <p className="mt-1">Импортированные слайды будут добавлены в конец текущей презентации.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="pptx" className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">
              Выберите PowerPoint презентацию (PPTX) для импорта.
            </p>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handlePptxFileSelect}
                className="w-full py-8 border-dashed"
                disabled={pptxImportStatus !== 'idle' || isImporting}
              >
                {pptxImportStatus === 'importing' ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Обработка и сохранение слайдов...
                  </>
                ) : isImporting ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <Presentation className="h-6 w-6 mr-2" />
                    Выбрать PPTX файл
                  </>
                )}
              </Button>
              <input 
                type="file" 
                ref={pptxFileInputRef}
                className="hidden"
                accept=".pptx"
                onChange={handlePptxFileUpload}
                disabled={isImporting}
              />
            </div>
            
            {importError && activeTab === "pptx" && (
              <div className="bg-destructive/10 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{importError}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Поддерживаемый формат: PowerPoint (PPTX)</p>
              <p className="mt-1">При импорте программа выполнит следующие действия:</p>
              <ul className="list-disc ml-4 mt-1">
                <li>Извлечет содержимое слайдов и все изображения из PPTX</li>
                <li>Воссоздаст визуальное представление каждого слайда</li>
                <li>Сохранит точное расположение всех элементов слайда</li>
                <li>Импортирует каждый слайд как отдельное изображение высокого качества</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="pdf" className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">
              Выберите PDF документ для импорта.
            </p>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handlePdfFileSelect}
                className="w-full py-8 border-dashed"
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <FileIcon className="h-6 w-6 mr-2" />
                    Выбрать PDF файл
                  </>
                )}
              </Button>
              <input 
                type="file" 
                ref={pdfFileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handlePdfFileUpload}
                disabled={isImporting}
              />
            </div>
            
            {importError && activeTab === "pdf" && (
              <div className="bg-destructive/10 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{importError}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Поддерживаемый формат: PDF</p>
              <p className="mt-1">При импорте программа попытается извлечь содержимое страниц PDF:</p>
              <ul className="list-disc ml-4 mt-1">
                <li>Каждая страница будет преобразована в изображение</li>
                <li>Также будут извлечены тексты, если они есть</li>
                <li>Каждая страница будет добавлена как отдельный слайд</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 