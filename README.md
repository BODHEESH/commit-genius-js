# 🚀 Bodhi Commit Genius JS

A powerful npm package that generates smart, AI-powered commit messages for your Git repositories. Works offline with smart heuristics, with cloud AI (OpenAI), or with local AI models (Ollama). Perfect for developers, teams, and organizations looking to maintain clean, consistent, and meaningful Git history.



## 📦 Installation

```bash
# Install globally
npm install -g bodhi-commit-genius-js

# Or install in your project
npm install --save-dev bodhi-commit-genius-js
```

## 🚀 Usage Examples

### Basic Usage

```bash
# Generate message for staged changes
bodhi commit

# Stage and commit all changes
bodhi commit .

# Stage specific files
bodhi commit src/feature.ts tests/feature.test.ts

# Use specific provider
bodhi commit --provider openai
bodhi commit --provider ollama
bodhi commit --provider simple
```


## 🎯 Why Choose Bodhi Commit Genius?

- 🤖 **AI-Powered Intelligence**: Uses advanced AI to understand your code changes
- 🔄 **Works Offline**: Smart heuristics work without internet or AI
- 🛡️ **Fallback Protection**: Automatically switches to offline mode if AI is unavailable
- 📊 **Smart Analysis**: Understands code patterns, file types, and change context
- 🌐 **Multiple AI Options**: Choose between cloud AI (OpenAI) or local AI (Ollama)
- 💰 **Cost-Effective**: Free offline mode, optional AI integration
- 🔒 **Privacy-Focused**: Local AI option for sensitive code
- 🚀 **Developer-Friendly**: Easy setup, works with existing Git workflow

## ✨ Features

- 🤖 Smart commit message generation using multiple providers:
  - 📝 Simple mode: No dependencies, works offline using smart heuristics
  - 🌐 OpenAI mode: Uses OpenAI's GPT models (requires API key)
  - 💻 Ollama mode: Uses local LLMs (requires Ollama installation)
- 📊 Intelligent diff analysis for better context understanding
- 🎯 Conventional commits support with type inference
- ⚡ Git hooks integration for seamless workflow
- 🔧 Customizable commit message templates
- 💻 Interactive mode for message editing
- 🚀 TypeScript support out of the box

### Advanced Examples

```bash
# Custom commit template
bodhi commit --template "type(scope): message"

# Interactive mode
bodhi commit -i

# With OpenAI key
bodhi commit --provider openai --api-key your-key

# With specific Ollama model
bodhi commit --provider ollama --model codellama
```

### Example Commit Messages

1. **Feature Addition**
   ```
   feat(auth): add OAuth2 authentication with Google provider
   ```

2. **Bug Fix**
   ```
   fix(api): handle null response in user service
   ```

3. **Code Refactoring**
   ```
   refactor(core): move API routes to dedicated modules
   ```

4. **Documentation**
   ```
   docs(api): add OpenAPI specification and examples
   ```

5. **Testing**
   ```
   test(auth): add integration tests for login flow
   ```

6. **Performance**
   ```
   perf(db): optimize user query with index
   ```

### Configuration

Create a `.commitgenius.json` in your project root or configure via CLI:

```json
{
  "provider": "simple", // "simple", "ollama", or "openai"
  "model": "codellama", // for ollama provider
  "apiKey": "your-openai-key", // for openai provider
  "template": "{type}: {description}",
  "conventionalCommits": true
}
```

## 🤖 Provider Setup Guide

Commit Genius offers three modes of operation, giving you the flexibility to use it with or without AI capabilities:

### 1. Simple Mode (Default) - No AI Required
The simplest way to get started - works offline and requires no additional setup.

✨ **Features:**
- Works completely offline
- No API keys or external dependencies
- Smart heuristics for commit type detection
- Conventional commit format support
- Analyzes file changes and code patterns

🚀 **Setup:**
```bash
# Just install and use!
npm install -g bodhi-commit-genius-js
bodhi commit
```

### 2. OpenAI Mode - Cloud AI
Get high-quality commit messages using OpenAI's GPT models. Requires an API key but offers the best quality.

✨ **Features:**
- High-quality, context-aware commit messages
- Understands complex code changes
- Best semantic analysis of changes
- Handles multiple files intelligently

🔑 **Setup:**
1. Get your OpenAI API key:
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Go to API Keys section
   - Create a new API key

2. Configure Commit Genius:
   ```bash
   # Set API key permanently
   cmg config set apiKey your-openai-key
   cmg config set provider openai
   
   # Or use per command
   bodhi commit --provider openai --api-key your-openai-key
   ```

💡 **Note:** If OpenAI is unavailable or the API key is invalid, Commit Genius will automatically fall back to simple mode.

### 3. Ollama Mode - Local AI
Run AI locally on your machine. Free to use and privacy-friendly, but requires local installation.

✨ **Features:**
- Runs completely locally
- No API keys needed
- Good balance of quality and privacy
- Multiple models supported

🚀 **Setup:**
1. Install Ollama:
   - **Windows:**
     ```bash
     # Download and install from:
     https://ollama.ai/download/windows
     ```
   - **Mac:**
     ```bash
     brew install ollama
     ```
   - **Linux:**
     ```bash
     curl -fsSL https://ollama.ai/install.sh | sh
     ```

2. Pull the model (one-time setup):
   ```bash
   ollama pull codellama
   ```

3. Configure Commit Genius:
   ```bash
   # Set as default provider
   cmg config set provider ollama
   
   # Or use per command
   bodhi commit --provider ollama
   ```

💡 **Note:** If Ollama is not running or encounters an error, Commit Genius will automatically fall back to simple mode.

### Comparison of Modes

| Feature                    | Simple         | OpenAI         | Ollama         |
|---------------------------|----------------|----------------|----------------|
| Setup Required            | None           | API Key        | Local Install  |
| Works Offline            | ✅             | ❌             | ✅             |
| Message Quality          | Good           | Best           | Very Good      |
| Privacy                  | Best           | Cloud-Based    | Local Only     |
| Cost                     | Free           | Pay-per-use    | Free          |
| Speed                    | Fastest        | Fast           | Moderate       |
| Resource Usage           | Minimal        | Cloud-Based    | Local GPU/CPU  |

## 🔧 Integration Guide

### Git Hooks Setup

1. **Automatic Setup**
   ```json
   {
     "scripts": {
       "prepare": "bodhi-commit-genius-js install-hooks"
     }
   }
   ```

2. **Manual Setup**
   ```bash
   # Install husky
   npm install husky --save-dev
   
   # Add prepare script
   npm pkg set scripts.prepare="husky install"
   
   # Add commit-msg hook
   npx husky add .husky/commit-msg 'npx bodhi validate $1'
   ```

### CI/CD Integration

```yaml
# GitHub Actions Example
name: Validate Commits
on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g bodhi-commit-genius-js
      - run: cmg validate --from ${{ github.event.pull_request.base.sha }}
```

### IDE Integration

1. **VS Code**
   - Install Git Lens extension
   - Configure external diff tool
   - Use with VS Code source control

2. **JetBrains IDEs**
   - Use with built-in VCS
   - Configure external diff tool
   - Terminal integration

## 📚 Best Practices

1. **Commit Organization**
   - One logical change per commit
   - Clear, descriptive messages
   - Reference issues when relevant

2. **Message Structure**
   ```
   type(scope): description
   
   [optional body]
   [optional footer]
   ```

3. **Common Types**
   - `feat`: New features
   - `fix`: Bug fixes
   - `docs`: Documentation
   - `style`: Formatting
   - `refactor`: Code restructuring
   - `test`: Adding tests
   - `chore`: Maintenance

4. **Scopes**
   - Module names
   - Feature areas
   - Components
   - File types

## 📝 License

MIT

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
