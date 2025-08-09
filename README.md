# KPPM - AI App Library

A Canva-style, local-only AI app library built with React, TypeScript, and Vite. Browse, execute, and clone AI applications with dynamic form rendering and Replicate integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Local Development Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd kppm

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint

# Type checking
npx tsc --noEmit     # Check TypeScript types
```

## 🏗️ Architecture

### Core Components
- **App Library** - Browse and search AI applications
- **Dynamic Forms** - Schema-driven form rendering
- **App Detail** - Complete app pages with live forms
- **Mock Integration** - Simulated API responses for development

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Forms**: React Hook Form with validation
- **State**: React Query for data management
- **Routing**: React Router DOM

## 🔧 Configuration

### Environment Setup
For Replicate integration, create a `.env.local` file:

```bash
# Replicate API (for actual integration)
VITE_REPLICATE_API_TOKEN=your_token_here
```

**Note**: Keep all API keys local and never commit them to version control.

### Mock Data
The app includes comprehensive mock data for development:
- 6 sample AI applications
- 5 app categories  
- Complete form schemas
- Simulated API responses

## 🎯 Features

### App Library
- **Category Filtering** - Filter apps by category with counts
- **Search** - Full-text search across apps, descriptions, and tags
- **Responsive Grid** - Beautiful card-based layout
- **App Metadata** - Author, version, pricing, and rating info

### Dynamic Forms
- **Schema-Driven** - Forms generated from JSON schemas
- **Field Types** - Text, textarea, select, slider, checkbox, file upload
- **Validation** - Built-in form validation with error handling
- **Loading States** - Smooth loading indicators during processing

### App Detail Pages
- **Tabbed Interface** - Form, About, and Examples sections
- **Live Results** - Display generated outputs inline
- **App Information** - Complete metadata and model details
- **Social Actions** - Share, clone, and download functionality

## 📁 Project Structure

```
src/
├── components/
│   ├── app-detail/          # App detail page components
│   ├── app-library/         # Library and card components  
│   ├── forms/               # Dynamic form system
│   ├── layout/              # Header and layout components
│   └── ui/                  # shadcn/ui components
├── data/                    # Mock data and schemas
├── types/                   # TypeScript type definitions
├── pages/                   # Route components
└── lib/                     # Utilities and helpers
```

## 🧪 Development

### Adding New Apps
1. Add app manifest to `src/data/mockApps.ts`
2. Define form schema with validation rules
3. Test form rendering and validation
4. Add category if needed in `mockCategories`

### Form Schema Format
```typescript
{
  title: "App Name",
  description: "App description",
  fields: [
    {
      id: "field_id",
      name: "field_name", 
      label: "Field Label",
      type: "text|textarea|select|slider|checkbox|file",
      required: true,
      validation: {
        min: 0,
        max: 100,
        options: ["option1", "option2"]
      }
    }
  ]
}
```

### Design System
All styling uses the design system defined in:
- `src/index.css` - CSS custom properties and themes
- `tailwind.config.ts` - Tailwind configuration
- Component variants use semantic tokens only

## 🔒 Security Notes

- **Local Only** - This project runs entirely locally
- **API Keys** - Store all secrets in `.env.local` (gitignored)
- **No Cloud** - No deployment configs or cloud dependencies
- **Server-Side** - Keep sensitive operations server-side when integrating

## 🎨 Design Philosophy

Inspired by Canva's design principles:
- **Clean & Modern** - Minimalist interface with purposeful elements
- **Intuitive Navigation** - Easy discovery and interaction patterns  
- **Visual Hierarchy** - Clear content organization and typography
- **Smooth Interactions** - Polished animations and hover effects
- **Responsive Design** - Works beautifully on all screen sizes

## 📖 Usage Examples

### Running a Text-to-Image App
1. Browse the App Library
2. Click on "Stable Diffusion XL"
3. Fill out the prompt and settings
4. Click "Run App" to generate image
5. Download or share the result

### Adding Custom Apps
1. Define your app manifest in `mockApps.ts`
2. Create a form schema with required fields
3. The dynamic form system handles the rest
4. Integrate with your preferred AI service

## 🔄 Local Development Workflow

1. **Start Development** - `npm run dev`
2. **Make Changes** - Edit components, add features
3. **Test Locally** - Use mock data for rapid iteration
4. **Build & Preview** - `npm run build && npm run preview`
5. **Type Check** - `npx tsc --noEmit`

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Replicate API](https://replicate.com/docs) (for actual integration)

---

**Note**: This is a local development project. All execution happens on your machine with no external dependencies required for basic functionality.
