import { createClient } from '@supabase/supabase-js'
import { AppManifest } from '../src/lib/schemas'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for seeding')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Seed data
const seedApps: Omit<AppManifest, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Image Generator',
    slug: 'image-generator',
    description: 'Generate stunning images from text prompts using Stable Diffusion XL',
    category: 'Image Generation',
    tags: ['text-to-image', 'stable-diffusion', 'ai-art'],
    repo_url: 'https://github.com/replicate/sdxl',
    cover_image: 'https://replicate.delivery/pbxt/placeholder-image-gen.jpg',
    replicate: {
      model: 'stability-ai/sdxl',
      version: 'latest',
      defaultHardware: 'gpu-a40-large',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'prompt',
        name: 'prompt',
        label: 'Prompt',
        type: 'textarea',
        required: true,
        placeholder: 'A serene landscape with mountains and a lake at sunset',
        description: 'Describe the image you want to generate',
      },
      {
        id: 'guidance_scale',
        name: 'guidance_scale',
        label: 'Guidance Scale',
        type: 'slider',
        default_value: 7.5,
        validation: {
          min: 0,
          max: 20,
          step: 0.5,
        },
        description: 'How closely to follow the prompt (higher = more literal)',
      },
      {
        id: 'seed',
        name: 'seed',
        label: 'Seed',
        type: 'number',
        placeholder: 'Leave empty for random',
        validation: {
          min: 0,
          max: 2147483647,
        },
      },
    ],
  },
  {
    name: 'Image to Image',
    slug: 'image-to-image',
    description: 'Transform existing images with AI-powered style transfer and editing',
    category: 'Image Generation',
    tags: ['image-editing', 'style-transfer', 'img2img'],
    cover_image: 'https://replicate.delivery/pbxt/placeholder-img2img.jpg',
    replicate: {
      model: 'stability-ai/stable-diffusion-img2img',
      defaultHardware: 'gpu-t4',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'image',
        name: 'image',
        label: 'Input Image',
        type: 'file',
        required: true,
        validation: {
          maxSize: 5242880, // 5MB
          accept: ['image/jpeg', 'image/png', 'image/webp'],
        },
      },
      {
        id: 'prompt',
        name: 'prompt',
        label: 'Transformation Prompt',
        type: 'textarea',
        required: true,
        placeholder: 'Make it look like a watercolor painting',
      },
      {
        id: 'strength',
        name: 'strength',
        label: 'Transformation Strength',
        type: 'slider',
        default_value: 0.75,
        validation: {
          min: 0,
          max: 1,
          step: 0.05,
        },
      },
    ],
  },
  {
    name: 'Chat Assistant',
    slug: 'chat-assistant',
    description: 'Conversational AI powered by Llama 2 for intelligent dialogue',
    category: 'Text Generation',
    tags: ['chat', 'llama', 'conversation', 'llm'],
    cover_image: 'https://replicate.delivery/pbxt/placeholder-chat.jpg',
    replicate: {
      model: 'meta/llama-2-70b-chat',
      defaultHardware: 'gpu-a100-large',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'system_prompt',
        name: 'system_prompt',
        label: 'System Prompt',
        type: 'textarea',
        default_value: 'You are a helpful assistant.',
        description: 'Set the AI behavior and personality',
      },
      {
        id: 'prompt',
        name: 'prompt',
        label: 'Your Message',
        type: 'textarea',
        required: true,
        placeholder: 'Ask me anything...',
      },
      {
        id: 'temperature',
        name: 'temperature',
        label: 'Temperature',
        type: 'slider',
        default_value: 0.7,
        validation: {
          min: 0,
          max: 2,
          step: 0.1,
        },
        description: 'Controls randomness (0 = focused, 2 = creative)',
      },
    ],
  },
  {
    name: 'Text Summarizer',
    slug: 'summarizer',
    description: 'Automatically summarize long texts into concise, readable summaries',
    category: 'Text Generation',
    tags: ['summarization', 'text-processing', 'nlp'],
    cover_image: 'https://replicate.delivery/pbxt/placeholder-summary.jpg',
    replicate: {
      model: 'facebook/bart-large-cnn',
      defaultHardware: 'cpu',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'text',
        name: 'text',
        label: 'Text to Summarize',
        type: 'textarea',
        required: true,
        placeholder: 'Paste your long text here...',
        validation: {
          min: 100,
          max: 10000,
        },
      },
      {
        id: 'ratio',
        name: 'ratio',
        label: 'Summary Length',
        type: 'select',
        default_value: 'medium',
        validation: {
          options: ['short', 'medium', 'long'],
        },
      },
    ],
  },
  {
    name: 'OCR Scanner',
    slug: 'ocr-scanner',
    description: 'Extract text from images with high accuracy optical character recognition',
    category: 'Utility',
    tags: ['ocr', 'text-extraction', 'document-processing'],
    cover_image: 'https://replicate.delivery/pbxt/placeholder-ocr.jpg',
    replicate: {
      model: 'abiruyt/text-extract-ocr',
      defaultHardware: 'cpu',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'image',
        name: 'image',
        label: 'Document Image',
        type: 'file',
        required: true,
        validation: {
          maxSize: 5242880, // 5MB
          accept: ['image/jpeg', 'image/png', 'image/pdf'],
        },
      },
      {
        id: 'language',
        name: 'language',
        label: 'Document Language',
        type: 'select',
        default_value: 'eng',
        validation: {
          options: ['eng', 'spa', 'fra', 'deu', 'chi_sim', 'jpn'],
        },
      },
    ],
  },
  {
    name: 'Text to Speech',
    slug: 'text-to-speech',
    description: 'Convert text to natural-sounding speech with multiple voice options',
    category: 'Audio',
    tags: ['tts', 'speech-synthesis', 'audio-generation'],
    cover_image: 'https://replicate.delivery/pbxt/placeholder-tts.jpg',
    replicate: {
      model: 'suno-ai/bark',
      defaultHardware: 'gpu-t4',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'text',
        name: 'text',
        label: 'Text to Speak',
        type: 'textarea',
        required: true,
        placeholder: 'Enter the text you want to convert to speech...',
        validation: {
          max: 500,
        },
      },
      {
        id: 'voice',
        name: 'voice',
        label: 'Voice Selection',
        type: 'select',
        default_value: 'v2/en_speaker_0',
        validation: {
          options: [
            'v2/en_speaker_0',
            'v2/en_speaker_1',
            'v2/en_speaker_2',
            'v2/en_speaker_3',
            'v2/en_speaker_4',
            'v2/en_speaker_5',
          ],
        },
      },
      {
        id: 'speed',
        name: 'speed',
        label: 'Speech Speed',
        type: 'slider',
        default_value: 1.0,
        validation: {
          min: 0.5,
          max: 2.0,
          step: 0.1,
        },
      },
      {
        id: 'normalize',
        name: 'normalize',
        label: 'Normalize Audio',
        type: 'boolean',
        default_value: true,
      },
    ],
  },
  {
    name: 'Background Remover',
    slug: 'background-remover',
    description: 'Remove backgrounds from images instantly with AI-powered segmentation',
    category: 'Image Generation',
    tags: ['background-removal', 'image-editing', 'segmentation'],
    cover_image: 'https://replicate.delivery/pbxt/placeholder-bg-remove.jpg',
    replicate: {
      model: 'cjwbw/rembg',
      defaultHardware: 'cpu',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'image',
        name: 'image',
        label: 'Input Image',
        type: 'file',
        required: true,
        validation: {
          maxSize: 10485760, // 10MB
          accept: ['image/jpeg', 'image/png', 'image/webp'],
        },
        description: 'Upload an image to remove its background',
      },
      {
        id: 'output_format',
        name: 'output_format',
        label: 'Output Format',
        type: 'select',
        default_value: 'png',
        validation: {
          options: ['png', 'webp'],
        },
        description: 'Choose the output image format',
      },
    ],
  },
  {
    name: 'Music Generator',
    slug: 'music-generator',
    description: 'Create original music tracks from text descriptions using MusicGen',
    category: 'Audio',
    tags: ['music-generation', 'audio', 'composition', 'musicgen'],
    cover_image: 'https://replicate.delivery/pbxt/placeholder-music.jpg',
    replicate: {
      model: 'meta/musicgen',
      defaultHardware: 'gpu-t4',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'prompt',
        name: 'prompt',
        label: 'Music Description',
        type: 'textarea',
        required: true,
        placeholder: 'Upbeat electronic dance music with heavy bass...',
        description: 'Describe the style, mood, and instruments',
      },
      {
        id: 'duration',
        name: 'duration',
        label: 'Duration (seconds)',
        type: 'slider',
        default_value: 30,
        validation: {
          min: 10,
          max: 120,
          step: 5,
        },
        description: 'Length of the generated music',
      },
      {
        id: 'top_k',
        name: 'top_k',
        label: 'Creativity',
        type: 'slider',
        default_value: 250,
        validation: {
          min: 0,
          max: 500,
          step: 10,
        },
        description: 'Higher values = more creative output',
      },
    ],
  },
  {
    name: 'Voice Cloner',
    slug: 'voice-cloner',
    description: 'Clone voices and generate speech in any voice from a short audio sample',
    category: 'Audio',
    tags: ['voice-cloning', 'speech-synthesis', 'audio', 'tts'],
    cover_image: 'https://replicate.delivery/pbxt/placeholder-voice.jpg',
    replicate: {
      model: 'lucataco/xtts-v2',
      defaultHardware: 'gpu-t4',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'text',
        name: 'text',
        label: 'Text to Speak',
        type: 'textarea',
        required: true,
        placeholder: 'Enter the text you want to be spoken...',
        validation: {
          max: 1000,
        },
      },
      {
        id: 'speaker',
        name: 'speaker',
        label: 'Voice Sample',
        type: 'file',
        required: true,
        validation: {
          maxSize: 5242880, // 5MB
          accept: ['audio/wav', 'audio/mp3', 'audio/mpeg'],
        },
        description: 'Upload a 5-10 second voice sample',
      },
      {
        id: 'language',
        name: 'language',
        label: 'Language',
        type: 'select',
        default_value: 'en',
        validation: {
          options: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar', 'zh-cn', 'ja', 'ko'],
        },
      },
    ],
  },
  {
    name: 'CSV Data Analyzer',
    slug: 'csv-analyzer',
    description: 'Automatically analyze and visualize CSV data with AI-powered insights',
    category: 'Data Analysis',
    tags: ['data-analysis', 'csv', 'visualization', 'charts'],
    cover_image: 'https://replicate.delivery/pbxt/placeholder-data.jpg',
    replicate: {
      model: 'andreasjansson/pandas-ai',
      defaultHardware: 'cpu',
      minInstances: 0,
      maxInstances: 1,
    },
    inputs: [
      {
        id: 'csv_file',
        name: 'csv_file',
        label: 'CSV File',
        type: 'file',
        required: true,
        validation: {
          maxSize: 10485760, // 10MB
          accept: ['text/csv', 'application/csv'],
        },
        description: 'Upload your CSV data file',
      },
      {
        id: 'query',
        name: 'query',
        label: 'Analysis Query',
        type: 'textarea',
        required: true,
        placeholder: 'Show me the correlation between columns X and Y...',
        description: 'What would you like to analyze?',
      },
      {
        id: 'chart_type',
        name: 'chart_type',
        label: 'Visualization Type',
        type: 'select',
        default_value: 'auto',
        validation: {
          options: ['auto', 'line', 'bar', 'scatter', 'pie', 'heatmap'],
        },
        description: 'Choose chart type or let AI decide',
      },
    ],
  },
]

async function seed() {
  console.log('🌱 Starting database seed...')
  
  try {
    // Clear existing data
    console.log('Clearing existing data...')
    await supabase.from('runs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('deployments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('app_versions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('apps').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Insert apps
    console.log('Inserting apps...')
    for (const appData of seedApps) {
      const { replicate, inputs, ...app } = appData
      
      // Add author and initial stats
      const appWithStats = {
        ...app,
        author: 'Replicate Hub Team',
        fork_count: Math.floor(Math.random() * 50) + 10,
        run_count: Math.floor(Math.random() * 200) + 50,
        rating_avg: (Math.random() * 1.5 + 3.5).toFixed(2),
        featured: Math.random() > 0.7,
      }
      
      // Insert app
      const { data: insertedApp, error: appError } = await supabase
        .from('apps')
        .insert(appWithStats)
        .select()
        .single()
      
      if (appError) {
        console.error(`Failed to insert app ${app.name}:`, appError)
        continue
      }
      
      console.log(`✅ Inserted app: ${app.name}`)
      
      // Insert app version
      const { error: versionError } = await supabase
        .from('app_versions')
        .insert({
          app_id: insertedApp.id,
          replicate_model: replicate.model,
          version_id: replicate.version || 'latest',
          schema: { replicate, inputs },
          default_hardware: replicate.defaultHardware,
        })
      
      if (versionError) {
        console.error(`Failed to insert version for ${app.name}:`, versionError)
      }
    }
    
    // Get count of inserted apps
    const { count } = await supabase
      .from('apps')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n✨ Seed completed! Inserted ${count} apps.`)
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

// Run the seed
seed().then(() => process.exit(0))