export interface AppManifest {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  icon: string;
  banner?: string;
  tags: string[];
  pricing: 'free' | 'paid';
  replicate_model?: string;
  form_schema: FormSchema;
  created_at: string;
  updated_at: string;
}

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'file' | 'slider' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  description?: string;
  default_value?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface AppCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface AppSubmission {
  app_id: string;
  form_data: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  created_at: string;
}