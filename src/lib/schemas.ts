import { z } from 'zod'

// App manifest schema
export const ManifestInputFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'textarea', 'number', 'select', 'file', 'slider', 'checkbox', 'boolean']),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  default_value: z.any().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    options: z.array(z.string()).optional(),
    step: z.number().optional(),
    maxSize: z.number().optional(), // For file uploads (bytes)
    accept: z.array(z.string()).optional(), // For file uploads (mime types)
  }).optional(),
})

export const ManifestReplicateSchema = z.object({
  model: z.string(),
  version: z.string().optional(),
  defaultHardware: z.string().default('cpu-t4'),
  minInstances: z.number().min(0).default(0),
  maxInstances: z.number().min(1).default(1),
})

export const AppManifestSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  category: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  repo_url: z.string().url().optional(),
  cover_image: z.string().url().optional(),
  owner_id: z.string().uuid().optional(),
  replicate: ManifestReplicateSchema,
  inputs: z.array(ManifestInputFieldSchema),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export type AppManifest = z.infer<typeof AppManifestSchema>
export type ManifestInputField = z.infer<typeof ManifestInputFieldSchema>
export type ManifestReplicate = z.infer<typeof ManifestReplicateSchema>

// API request schemas
export const SearchAppsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export const CloneRunSchema = z.object({
  appId: z.string().uuid(),
  hardware: z.string().optional(),
  minInstances: z.number().min(0).optional(),
  maxInstances: z.number().min(1).optional(),
})

export const RunPredictionSchema = z.object({
  deploymentId: z.string().uuid().optional(),
  model: z.string().optional(),
  input: z.record(z.unknown()),
  stream: z.boolean().optional(),
  preferWaitSeconds: z.number().min(1).max(60).optional(),
})

// File upload validation
export const FileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ),
  type: z.enum(['image', 'audio', 'video', 'document']).optional(),
})

// Form validation helpers
export function createFormSchema(inputs: ManifestInputField[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  
  for (const input of inputs) {
    let fieldSchema: z.ZodTypeAny
    
    switch (input.type) {
      case 'text':
      case 'textarea':
        fieldSchema = z.string()
        if (input.validation?.pattern) {
          fieldSchema = fieldSchema.regex(new RegExp(input.validation.pattern))
        }
        if (input.validation?.min) {
          fieldSchema = (fieldSchema as z.ZodString).min(input.validation.min)
        }
        if (input.validation?.max) {
          fieldSchema = (fieldSchema as z.ZodString).max(input.validation.max)
        }
        break
        
      case 'number':
      case 'slider':
        fieldSchema = z.number()
        if (input.validation?.min !== undefined) {
          fieldSchema = fieldSchema.min(input.validation.min)
        }
        if (input.validation?.max !== undefined) {
          fieldSchema = fieldSchema.max(input.validation.max)
        }
        break
        
      case 'select':
        if (input.validation?.options) {
          fieldSchema = z.enum(input.validation.options as [string, ...string[]])
        } else {
          fieldSchema = z.string()
        }
        break
        
      case 'checkbox':
      case 'boolean':
        fieldSchema = z.boolean()
        break
        
      case 'file':
        fieldSchema = z.instanceof(File).refine(
          (file) => {
            if (input.validation?.maxSize) {
              return file.size <= input.validation.maxSize
            }
            return file.size <= 5 * 1024 * 1024 // Default 5MB
          },
          `File size must be less than ${
            input.validation?.maxSize
              ? `${input.validation.maxSize / 1024 / 1024}MB`
              : '5MB'
          }`
        )
        
        if (input.validation?.accept) {
          fieldSchema = fieldSchema.refine(
            (file) => {
              const accept = input.validation?.accept || []
              return accept.some(type => {
                if (type.includes('*')) {
                  const prefix = type.split('*')[0]
                  return file.type.startsWith(prefix)
                }
                return file.type === type
              })
            },
            `File type must be one of: ${input.validation.accept.join(', ')}`
          )
        }
        break
        
      default:
        fieldSchema = z.any()
    }
    
    // Apply required/optional
    if (!input.required) {
      fieldSchema = fieldSchema.optional()
    }
    
    // Apply default value
    if (input.default_value !== undefined) {
      fieldSchema = fieldSchema.default(input.default_value)
    }
    
    shape[input.name] = fieldSchema
  }
  
  return z.object(shape)
}

// API error schema
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
  status: z.number(),
  correlationId: z.string().optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>