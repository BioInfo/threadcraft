# Contributing to ThreadCraft 🧵

Thank you for your interest in contributing to ThreadCraft! We're excited to have you join our community of developers building the future of social content generation.

## 🌟 Ways to Contribute

- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new features and improvements
- 📝 **Documentation**: Improve our docs and guides
- 🔧 **Code Contributions**: Submit bug fixes and new features
- 🎨 **Design**: Enhance UI/UX and accessibility
- 🧪 **Testing**: Help us maintain quality and reliability

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Git
- Your favorite code editor
- OpenAI or OpenRouter API key for testing

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/yourusername/threadcraft.git
   cd threadcraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Create a feature branch**
   ```bash
   git checkout -b feature/your-amazing-feature
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript First**: All new code should be written in TypeScript
- **Component Architecture**: Follow the existing component patterns
- **Accessibility**: Ensure WCAG 2.1 AA compliance
- **Performance**: Consider performance implications of changes
- **Testing**: Add tests for new functionality

### Naming Conventions

- **Files**: Use PascalCase for components (`SmartUrlInput.tsx`)
- **Functions**: Use camelCase (`handleSubmit`)
- **Constants**: Use UPPER_SNAKE_CASE (`POPULAR_SOURCES`)
- **CSS Classes**: Use Tailwind utility classes

### Component Structure

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface ComponentProps {
  // Props with JSDoc comments
  value: string;
  onChange: (value: string) => void;
}

export const Component = ({ value, onChange }: ComponentProps) => {
  // Component logic here
  
  return (
    <div className="component-wrapper">
      {/* JSX here */}
    </div>
  );
};
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add smart URL validation
fix: resolve dropdown click issue
docs: update API documentation
style: improve button hover states
refactor: extract common utilities
test: add unit tests for validators
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **Environment details** (OS, browser, Node.js version)
5. **Screenshots or videos** if applicable

### Bug Report Template

```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 18.17.0]
- ThreadCraft version: [e.g., 1.0.0]

## Additional Context
Any other context about the problem.
```

## 💡 Feature Requests

We love new ideas! When suggesting features:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with implementation details
4. **Consider alternatives** and their trade-offs
5. **Think about impact** on existing users

### Feature Request Template

```markdown
## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like this feature to work?

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Any other context, mockups, or examples.
```

## 🔧 Code Contributions

### Pull Request Process

1. **Create an issue** first (unless it's a small fix)
2. **Fork and branch** from `main`
3. **Make your changes** following our guidelines
4. **Test thoroughly** in different scenarios
5. **Update documentation** if needed
6. **Submit a pull request** with a clear description

### Pull Request Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Writing Tests

- **Unit tests** for utilities and pure functions
- **Component tests** for UI components
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows

## 📚 Documentation

Help us improve our documentation:

- **API docs**: Keep endpoint documentation current
- **Component docs**: Add JSDoc comments to components
- **Guides**: Write tutorials and how-to guides
- **Examples**: Provide usage examples

## 🎨 Design Contributions

We welcome design improvements:

- **UI/UX enhancements**: Improve user experience
- **Accessibility**: Ensure inclusive design
- **Visual design**: Enhance aesthetics
- **Responsive design**: Optimize for all devices

### Design Guidelines

- Follow our design system in `globals.css`
- Maintain WCAG 2.1 AA accessibility standards
- Use semantic HTML elements
- Test on multiple devices and browsers

## 🏷️ Issue Labels

We use labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Critical issues
- `priority: low` - Nice to have

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Be constructive** in feedback
- **Be patient** with newcomers
- **Be collaborative** in discussions

### Getting Help

- 💬 **Discord**: Join our [Discord server](https://discord.gg/threadcraft)
- 📧 **Email**: Contact us at hello@threadcraft.dev
- 🐛 **Issues**: Create a GitHub issue
- 📖 **Docs**: Check our documentation

## 🎉 Recognition

Contributors are recognized in:

- **README.md**: Listed in contributors section
- **Release notes**: Mentioned in changelog
- **Discord**: Special contributor role
- **Swag**: Stickers and merchandise (coming soon!)

## 📄 License

By contributing to ThreadCraft, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ThreadCraft! Together, we're building the future of social content creation. 🚀