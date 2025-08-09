import { AppManifest, AppCategory } from "@/types/app";

export const mockCategories: AppCategory[] = [
  {
    id: "image-generation",
    name: "Image Generation",
    description: "Create stunning images with AI",
    icon: "🎨",
    count: 12
  },
  {
    id: "text-processing",
    name: "Text Processing",
    description: "Transform and analyze text",
    icon: "📝",
    count: 8
  },
  {
    id: "audio",
    name: "Audio",
    description: "Generate and process audio",
    icon: "🎵",
    count: 6
  },
  {
    id: "video",
    name: "Video",
    description: "Create and edit videos",
    icon: "🎬",
    count: 4
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    description: "Analyze and visualize data",
    icon: "📊",
    count: 3
  }
];

export const mockApps: AppManifest[] = [
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    description: "Generate high-quality images from text prompts using Stable Diffusion XL model. Perfect for creating artwork, illustrations, and concept designs.",
    category: "image-generation",
    author: "Stability AI",
    version: "1.0.0",
    icon: "🎨",
    tags: ["text-to-image", "ai-art", "stable-diffusion", "xl"],
    pricing: "free",
    replicate_model: "stability-ai/sdxl",
    form_schema: {
      title: "Generate Image with Stable Diffusion XL",
      description: "Enter your prompt and settings to generate a high-quality image",
      fields: [
        {
          id: "prompt",
          name: "prompt",
          label: "Prompt",
          type: "textarea",
          required: true,
          placeholder: "A serene landscape with mountains and a lake at sunset...",
          description: "Describe the image you want to generate"
        },
        {
          id: "negative_prompt",
          name: "negative_prompt",
          label: "Negative Prompt",
          type: "textarea",
          placeholder: "blurry, low quality, distorted...",
          description: "Describe what you don't want in the image"
        },
        {
          id: "width",
          name: "width",
          label: "Width",
          type: "select",
          default_value: "1024",
          validation: {
            options: ["512", "768", "1024", "1152", "1216"]
          }
        },
        {
          id: "height",
          name: "height",
          label: "Height",
          type: "select",
          default_value: "1024",
          validation: {
            options: ["512", "768", "1024", "1152", "1216"]
          }
        },
        {
          id: "num_inference_steps",
          name: "num_inference_steps",
          label: "Inference Steps",
          type: "slider",
          default_value: 25,
          validation: {
            min: 10,
            max: 50
          },
          description: "Number of denoising steps. Higher values = better quality but slower"
        },
        {
          id: "guidance_scale",
          name: "guidance_scale",
          label: "Guidance Scale",
          type: "slider",
          default_value: 7.5,
          validation: {
            min: 1,
            max: 20
          },
          description: "How closely to follow the prompt. Higher values = more literal"
        }
      ]
    },
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z"
  },
  {
    id: "gpt-text-summarizer",
    name: "GPT Text Summarizer",
    description: "Summarize long texts into concise, well-structured summaries using advanced GPT models. Perfect for research, articles, and documents.",
    category: "text-processing",
    author: "OpenAI",
    version: "2.1.0",
    icon: "📄",
    tags: ["text-summarization", "gpt", "nlp", "research"],
    pricing: "paid",
    form_schema: {
      title: "Summarize Text with GPT",
      description: "Enter your text and get a concise summary",
      fields: [
        {
          id: "text",
          name: "text",
          label: "Text to Summarize",
          type: "textarea",
          required: true,
          placeholder: "Paste your long text here...",
          description: "The text you want to summarize (max 10,000 characters)"
        },
        {
          id: "summary_length",
          name: "summary_length",
          label: "Summary Length",
          type: "select",
          default_value: "medium",
          validation: {
            options: ["short", "medium", "long"]
          },
          description: "Choose how detailed you want the summary to be"
        },
        {
          id: "focus_areas",
          name: "focus_areas",
          label: "Focus Areas",
          type: "text",
          placeholder: "key findings, methodology, conclusions...",
          description: "Specific areas to focus on in the summary (optional)"
        }
      ]
    },
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-18T12:00:00Z"
  },
  {
    id: "musicgen-composer",
    name: "MusicGen Composer",
    description: "Generate original music tracks from text descriptions using Meta's MusicGen AI. Create background music, soundtracks, and musical ideas.",
    category: "audio",
    author: "Meta",
    version: "1.5.0",
    icon: "🎼",
    tags: ["music-generation", "audio", "composition", "ai"],
    pricing: "free",
    replicate_model: "meta/musicgen",
    form_schema: {
      title: "Compose Music with MusicGen",
      description: "Describe the music you want to create",
      fields: [
        {
          id: "prompt",
          name: "prompt",
          label: "Music Description",
          type: "textarea",
          required: true,
          placeholder: "Upbeat jazz piano solo with walking bass line...",
          description: "Describe the style, instruments, mood, and tempo"
        },
        {
          id: "duration",
          name: "duration",
          label: "Duration (seconds)",
          type: "slider",
          default_value: 30,
          validation: {
            min: 10,
            max: 120
          },
          description: "Length of the generated music"
        },
        {
          id: "model_version",
          name: "model_version",
          label: "Model Version",
          type: "select",
          default_value: "melody",
          validation: {
            options: ["melody", "large", "medium", "small"]
          },
          description: "Choose model size (larger = better quality, slower generation)"
        }
      ]
    },
    created_at: "2024-01-12T14:00:00Z",
    updated_at: "2024-01-19T16:45:00Z"
  },
  {
    id: "video-interpolation",
    name: "Video Interpolation",
    description: "Create smooth slow-motion videos by interpolating frames between existing frames. Perfect for sports analysis, artistic effects, and scientific visualization.",
    category: "video",
    author: "DeepMind",
    version: "1.2.0",
    icon: "🎥",
    tags: ["video-processing", "interpolation", "slow-motion", "ai"],
    pricing: "paid",
    form_schema: {
      title: "Video Frame Interpolation",
      description: "Upload a video to create smooth slow-motion effects",
      fields: [
        {
          id: "video",
          name: "video",
          label: "Video File",
          type: "file",
          required: true,
          description: "Upload your video file (MP4, max 100MB)"
        },
        {
          id: "interpolation_factor",
          name: "interpolation_factor",
          label: "Interpolation Factor",
          type: "select",
          default_value: "2x",
          validation: {
            options: ["2x", "4x", "8x", "16x"]
          },
          description: "How many new frames to generate between existing frames"
        },
        {
          id: "output_fps",
          name: "output_fps",
          label: "Output FPS",
          type: "select",
          default_value: "60",
          validation: {
            options: ["30", "60", "120", "240"]
          },
          description: "Frame rate of the output video"
        },
        {
          id: "preserve_quality",
          name: "preserve_quality",
          label: "Preserve Original Quality",
          type: "checkbox",
          default_value: true,
          description: "Maintain original video resolution and bitrate"
        }
      ]
    },
    created_at: "2024-01-08T11:00:00Z",
    updated_at: "2024-01-17T13:20:00Z"
  },
  {
    id: "data-visualizer",
    name: "Smart Data Visualizer",
    description: "Automatically generate beautiful charts and visualizations from your data using AI. Supports CSV, JSON, and direct data input with intelligent chart selection.",
    category: "data-analysis",
    author: "DataViz AI",
    version: "1.0.5",
    icon: "📈",
    tags: ["data-visualization", "charts", "analytics", "csv"],
    pricing: "free",
    form_schema: {
      title: "Generate Data Visualizations",
      description: "Upload your data or paste it directly to create charts",
      fields: [
        {
          id: "data_source",
          name: "data_source",
          label: "Data Source",
          type: "select",
          required: true,
          default_value: "csv_upload",
          validation: {
            options: ["csv_upload", "json_input", "direct_input"]
          },
          description: "Choose how to provide your data"
        },
        {
          id: "data_file",
          name: "data_file",
          label: "Data File",
          type: "file",
          description: "Upload your CSV or JSON file (max 10MB)"
        },
        {
          id: "chart_type",
          name: "chart_type",
          label: "Chart Type",
          type: "select",
          default_value: "auto",
          validation: {
            options: ["auto", "line", "bar", "pie", "scatter", "heatmap", "histogram"]
          },
          description: "Let AI choose automatically or specify a chart type"
        },
        {
          id: "color_scheme",
          name: "color_scheme",
          label: "Color Scheme",
          type: "select",
          default_value: "default",
          validation: {
            options: ["default", "blue", "green", "purple", "orange", "red", "gradient"]
          },
          description: "Choose a color palette for your visualization"
        },
        {
          id: "include_insights",
          name: "include_insights",
          label: "Generate Insights",
          type: "checkbox",
          default_value: true,
          description: "Include AI-generated insights about your data"
        }
      ]
    },
    created_at: "2024-01-14T16:00:00Z",
    updated_at: "2024-01-21T10:15:00Z"
  },
  {
    id: "code-generator",
    name: "AI Code Generator",
    description: "Generate clean, well-documented code in multiple programming languages from natural language descriptions. Perfect for prototyping and learning.",
    category: "text-processing",
    author: "CodeAI",
    version: "2.0.1",
    icon: "💻",
    tags: ["code-generation", "programming", "ai", "development"],
    pricing: "free",
    form_schema: {
      title: "Generate Code with AI",
      description: "Describe what you want to build and get working code",
      fields: [
        {
          id: "description",
          name: "description",
          label: "Code Description",
          type: "textarea",
          required: true,
          placeholder: "Create a function that sorts an array of objects by date...",
          description: "Describe the functionality you want to implement"
        },
        {
          id: "language",
          name: "language",
          label: "Programming Language",
          type: "select",
          required: true,
          default_value: "python",
          validation: {
            options: ["python", "javascript", "typescript", "java", "csharp", "go", "rust", "php"]
          },
          description: "Choose your preferred programming language"
        },
        {
          id: "complexity",
          name: "complexity",
          label: "Code Complexity",
          type: "select",
          default_value: "intermediate",
          validation: {
            options: ["simple", "intermediate", "advanced"]
          },
          description: "How complex should the generated code be?"
        },
        {
          id: "include_tests",
          name: "include_tests",
          label: "Include Unit Tests",
          type: "checkbox",
          default_value: true,
          description: "Generate unit tests for the code"
        },
        {
          id: "include_comments",
          name: "include_comments",
          label: "Include Comments",
          type: "checkbox",
          default_value: true,
          description: "Add detailed comments to explain the code"
        }
      ]
    },
    created_at: "2024-01-16T08:30:00Z",
    updated_at: "2024-01-22T14:00:00Z"
  }
];