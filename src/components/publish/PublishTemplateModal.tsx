import { useState } from 'react'
import type { AppTemplate, ModelInputField } from '../../types'
import { createTemplate } from '../../services/templates'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface PublishTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  initialTemplate?: AppTemplate
}

export function PublishTemplateModal({ isOpen, onClose, initialTemplate }: PublishTemplateModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: initialTemplate?.name || '',
    description: initialTemplate?.description || '',
    category: initialTemplate?.category || 'Image Generation',
    tags: initialTemplate?.tags?.join(', ') || '',
    cover_image_url: initialTemplate?.coverImageUrl || '',
    model: initialTemplate?.connectorConfig?.model || '',
    version: initialTemplate?.connectorConfig?.version || '',
    is_public: false,
  })

  const [inputFields, setInputFields] = useState<ModelInputField[]>(
    initialTemplate?.input?.fields || [
      {
        key: 'prompt',
        label: 'Prompt',
        type: 'textarea',
        required: true,
        placeholder: 'Enter your prompt...',
      },
    ]
  )

  const [outputType, setOutputType] = useState(initialTemplate?.output?.type || 'image')

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please sign in to publish')

      return createTemplate({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        cover_image_url: formData.cover_image_url || undefined,
        connector: 'replicate',
        model: formData.model || undefined,
        version: formData.version || undefined,
        input_spec: { fields: inputFields },
        output_spec: { type: outputType as any, multiple: outputType === 'image' },
        is_public: formData.is_public,
      })
    },
    onSuccess: () => {
      toast({
        title: 'Template published!',
        description: 'Your template has been published successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['my-templates'] })
      queryClient.invalidateQueries({ queryKey: ['public-templates'] })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to publish',
        description: error.message || 'Please try again',
        variant: 'destructive',
      })
    },
  })

  const addInputField = () => {
    setInputFields([
      ...inputFields,
      {
        key: `field_${Date.now()}`,
        label: 'New Field',
        type: 'text',
        required: false,
      },
    ])
  }

  const updateInputField = (index: number, updates: Partial<ModelInputField>) => {
    const updated = [...inputFields]
    const current = updated[index]
    const next = { ...current, ...updates }
    // Ensure type-safe coercion for union field types
    if (current.type === 'number') {
      // keep number-specific fields
      // no-op
    }
    updated[index] = next as ModelInputField
    setInputFields(updated)
  }

  const removeInputField = (index: number) => {
    setInputFields(inputFields.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Publish Template</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Share your AI app template with the community
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full px-3 py-2 rounded border"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Awesome Template"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full px-3 py-2 rounded border"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Image Generation">Image Generation</option>
                <option value="Image Editing">Image Editing</option>
                <option value="Speech">Speech</option>
                <option value="Chat">Chat</option>
                <option value="Vision">Vision</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded border min-h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what your template does..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                className="w-full px-3 py-2 rounded border"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="ai, image, generation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image URL</label>
              <input
                className="w-full px-3 py-2 rounded border"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                placeholder="https://example.com/image.png"
              />
            </div>
          </div>

          {/* Model Config */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">Model Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  className="w-full px-3 py-2 rounded border"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="stability-ai/sdxl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Version (optional)</label>
                <input
                  className="w-full px-3 py-2 rounded border"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f"
                />
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Input Fields</h3>
              <button
                onClick={addInputField}
                className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-sm"
              >
                Add Field
              </button>
            </div>
            <div className="space-y-3">
              {inputFields.map((field, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    <input
                      placeholder="Field key"
                      className="px-2 py-1 rounded border text-sm"
                      value={field.key}
                      onChange={(e) => updateInputField(index, { key: e.target.value })}
                    />
                    <input
                      placeholder="Field label"
                      className="px-2 py-1 rounded border text-sm"
                      value={field.label}
                      onChange={(e) => updateInputField(index, { label: e.target.value })}
                    />
                    <select
                      className="px-2 py-1 rounded border text-sm"
                      value={field.type}
                      onChange={(e) => updateInputField(index, { type: e.target.value as any })}
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="select">Select</option>
                      <option value="image-url">Image URL</option>
                    </select>
                    <button
                      onClick={() => removeInputField(index)}
                      className="px-2 py-1 rounded bg-destructive text-destructive-foreground text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  {('placeholder' in field) && (
                    <input
                      placeholder="Placeholder text"
                      className="w-full px-2 py-1 rounded border text-sm"
                      value={(field as any).placeholder || ''}
                      onChange={(e) => updateInputField(index, { placeholder: e.target.value } as Partial<ModelInputField>)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Output Type */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">Output Type</h3>
            <select
              className="w-full px-3 py-2 rounded border"
              value={outputType}
              onChange={(e) => setOutputType(e.target.value as 'image' | 'text' | 'audio' | 'video' | 'json')}
            >
              <option value="image">Image</option>
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="json">JSON</option>
            </select>
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
            />
            <label htmlFor="is_public" className="text-sm">
              Make this template public (visible to everyone)
            </label>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending || !formData.name || !formData.description}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {publishMutation.isPending ? 'Publishing...' : 'Publish Template'}
          </button>
        </div>
      </div>
    </div>
  )
}
