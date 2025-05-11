import React from 'react';
import { useState } from 'react';
import { SurveyContent, FormComponent } from '../types';

interface SurveyProps {
  content: SurveyContent;
  onComplete: () => void;
  onNextStep?: () => void;
}

function TextField({ component, value, onChange, error }: {
  component: FormComponent;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  if (component.type !== 'textfield') return null;
  
  return (
    <div className="form-field">
      <label className="form-label">
        {component.label}
        {component.required && <span className="required">*</span>}
      </label>
      {component.multiline ? (
        <textarea
          className={`form-input ${error ? 'error' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={component.placeholder}
          rows={4}
        />
      ) : (
        <input
          type="text"
          className={`form-input ${error ? 'error' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={component.placeholder}
        />
      )}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

function Select({ component, value, onChange, error }: {
  component: FormComponent;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}) {
  if (component.type !== 'select') return null;
  
  return (
    <div className="form-field">
      <label className="form-label">
        {component.label}
        {component.required && <span className="required">*</span>}
      </label>
      <select
        className={`form-input ${error ? 'error' : ''}`}
        value={Array.isArray(value) ? value[0] : value}
        onChange={(e) => onChange(component.multiple ? [e.target.value] : e.target.value)}
        multiple={component.multiple}
      >
        <option value="">Выберите вариант</option>
        {component.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

function Rating({ component, value, onChange, error }: {
  component: FormComponent;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  if (component.type !== 'rating') return null;
  
  return (
    <div className="form-field">
      <label className="form-label">
        {component.label}
        {component.required && <span className="required">*</span>}
      </label>
      <div className="rating">
        {Array.from({ length: component.maxRating }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            className={`rating-star ${value >= rating ? 'active' : ''}`}
            onClick={() => onChange(rating)}
          >
            ★
          </button>
        ))}
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export const Survey: React.FC<SurveyProps> = ({ content, onComplete, onNextStep }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    content.form.components.forEach((component) => {
      if (component.required && !formData[component.key]) {
        newErrors[component.key] = 'Это поле обязательно для заполнения';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Здесь можно добавить отправку данных на сервер, если нужно
      await new Promise(resolve => setTimeout(resolve, 500)); // Имитация задержки
      onComplete();
      if (onNextStep) {
        onNextStep();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const renderField = (component: FormComponent) => {
    const value = formData[component.key] ?? '';
    const error = errors[component.key];

    switch (component.type) {
      case 'textfield':
        return (
          <TextField
            component={component}
            value={value}
            onChange={(value) => handleChange(component.key, value)}
            error={error}
          />
        );
      case 'select':
        return (
          <Select
            component={component}
            value={value}
            onChange={(value) => handleChange(component.key, value)}
            error={error}
          />
        );
      case 'rating':
        return (
          <Rating
            component={component}
            value={value}
            onChange={(value) => handleChange(component.key, value)}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="survey">
      <div className="survey-header">
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <form className="survey-form" onSubmit={handleSubmit}>
        {content.form.components.map((component) => (
          <div key={component.key} className="form-component">
            {renderField(component)}
          </div>
        ))}
        <button 
          type="submit" 
          className="form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : 'Завершить опрос'}
        </button>
      </form>
    </div>
  );
}; 