<div align="center">

# 🧵 ThreadCraft

**Transform any link into viral social content**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)
[![GitHub Stars](https://img.shields.io/github/stars/BioInfo/threadcraft?style=for-the-badge)](https://github.com/BioInfo/threadcraft/stargazers)

[🚀 Live Demo](https://threadcraft-delta.vercel.app) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

🎯 **Smart Content Generation**
- Transform any article URL into platform-optimized social content
- AI-powered X (Twitter) threads with strategic account tagging
- Professional LinkedIn posts with engagement optimization

🧠 **Intelligent UX**
- Smart URL input with auto-detection and validation
- Recent URLs history and popular source suggestions
- Real-time character count and platform previews

🎨 **Modern Design**
- Beautiful, accessible interface with WCAG 2.1 AA compliance
- Smooth micro-interactions and animations
- Responsive design optimized for all devices

⚡ **Performance Optimized**
- Edge-first architecture with intelligent caching
- Sub-3 second content generation
- Resource preloading and bundle optimization

🔧 **Developer Experience**
- TypeScript-first with comprehensive type safety
- Component-based architecture for maintainability
- Extensive customization options

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- OpenAI API key or OpenRouter API key

### Installation

```bash
# Clone the repository
git clone https://github.com/BioInfo/threadcraft.git
cd threadcraft

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API keys to .env.local
# OPENAI_API_KEY=your_openai_key_here
# or
# OPENROUTER_API_KEY=your_openrouter_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see ThreadCraft in action! 🎉

## 🛠️ Configuration

### Environment Variables

```bash
# Required: Choose your AI provider
LLM_PROVIDER=openai              # or "openrouter"

# OpenAI Configuration
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini         # or gpt-4, gpt-3.5-turbo

# OpenRouter Configuration  
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=anthropic/claude-3.7-sonnet

# Optional: Customize rate limiting
RATE_LIMIT_REQUESTS=20           # requests per window
RATE_LIMIT_WINDOW=600000         # window in milliseconds (10 min)
```

### Supported AI Models

| Provider | Models | Best For |
|----------|--------|----------|
| **OpenAI** | GPT-4, GPT-4o, GPT-3.5-turbo | General content generation |
| **OpenRouter** | Claude 3.7 Sonnet, GPT-4, Llama 3 | Advanced reasoning and creativity |

## 📖 Documentation

### API Reference

#### POST `/api/generate`

Generate social content from a URL.

**Request Body:**
```json
{
  "url": "https://example.com/article",
  "threadType": "regular" | "viral",
  "tone": "professional" | "engaging", 
  "industry": "general" | "saas" | "developer" | "marketing" | "ai" | "product" | "design" | "finance" | "health" | "education"
}
```

**Response:**
```json
{
  "thread": ["🧵 Tweet 1 content... 🧵 1/4", "..."],
  "linkedin": "Professional LinkedIn post content...",
  "source": {
    "title": "Article Title",
    "siteName": "Site Name", 
    "url": "https://example.com/article"
  },
  "meta": {
    "options": { "threadType": "regular", "tone": "professional", "industry": "general" },
    "counts": { "x": [245, 267, 198, 276], "linkedin": 1456 },
    "model": "gpt-4o-mini"
  }
}
```

### Content Templates

#### X Thread Templates

**Regular Thread (Professional)**
- Hook with key insight
- 2-3 actionable takeaways  
- Final tweet with source link, account tags, and hashtags
- Thread emoji (🧵) and count at end of each tweet

**Viral Thread (High Engagement)**
- Controversial or curiosity-driven hook
- Data-backed insights
- Personal angle or story
- Strong call-to-action with strategic tagging

#### LinkedIn Post Template

- Professional emoji-enhanced opening hook
- 3 bullet-pointed insights with concrete value
- Engagement question
- Source attribution with original URL
- 3-5 relevant hashtags

## 🏗️ Architecture

```
ThreadCraft/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/generate/    # Content generation API
│   │   ├── globals.css      # Design system & animations
│   │   └── page.tsx         # Main application UI
│   ├── components/          # Reusable UI components
│   │   ├── Icons.tsx        # SVG icon library
│   │   ├── SmartUrlInput.tsx # Intelligent URL input
│   │   ├── LoadingSkeleton.tsx # Loading states
│   │   ├── CopyButton.tsx   # Enhanced copy functionality
│   │   ├── SuccessToast.tsx # Success notifications
│   │   ├── AccessibilityEnhancer.tsx # A11y features
│   │   └── PerformanceOptimizer.tsx # Performance monitoring
│   └── lib/
│       └── validators.ts    # Zod schemas & validation
├── memory-bank/            # Project context & decisions
└── public/                 # Static assets
```

### Key Technologies

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Validation**: Zod schemas with friendly error messages
- **AI Integration**: OpenAI & OpenRouter APIs
- **Performance**: Edge functions, intelligent caching
- **Accessibility**: WCAG 2.1 AA compliant

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Add JSDoc comments for complex functions
- Ensure accessibility compliance
- Write meaningful commit messages

## 📊 Performance

ThreadCraft is optimized for speed and user experience:

- **Content Generation**: < 3 seconds (target)
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3 seconds

## 🔒 Privacy & Security

- **No Data Storage**: Content is processed in-memory only
- **No User Tracking**: Privacy-first approach
- **Rate Limiting**: 20 requests per 10 minutes per IP
- **Input Validation**: Comprehensive Zod schema validation
- **HTTPS Only**: All communications encrypted

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT models
- [OpenRouter](https://openrouter.ai/) for model access
- [Vercel](https://vercel.com/) for hosting platform
- [Tailwind CSS](https://tailwindcss.com/) for styling system
- [Radix UI](https://www.radix-ui.com/) for accessible components

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=BioInfo/threadcraft&type=Date)](https://star-history.com/#BioInfo/threadcraft&Date)

---

<div align="center">

**Made with ❤️ by the ThreadCraft community**

[Website](https://threadcraft-delta.vercel.app) • [Twitter](https://twitter.com/bioinfo)

</div>
