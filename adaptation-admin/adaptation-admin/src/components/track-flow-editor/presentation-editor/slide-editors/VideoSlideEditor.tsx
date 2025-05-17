import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VideoSlide } from '@/types';

interface VideoSlideEditorProps {
  slide: VideoSlide;
  onChange: (id: string, updates: Partial<VideoSlide>) => void;
}

export function VideoSlideEditor({ slide, onChange }: VideoSlideEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="video-url">URL видео</Label>
        <Input
          id="video-url"
          value={slide.url}
          onChange={e => onChange(slide.id, { url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="video-caption">Подпись</Label>
        <Input
          id="video-caption"
          value={slide.caption || ''}
          onChange={e => onChange(slide.id, { caption: e.target.value })}
          placeholder="Добавьте подпись к видео..."
        />
      </div>
      {slide.url && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Предпросмотр</h3>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <iframe
              src={slide.url.replace('watch?v=', 'embed/')}
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
} 