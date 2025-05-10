# 🚀 Commit Genius JS

A powerful npm package that generates smart commit messages using AI. Supports both local LLMs (via Ollama) and cloud APIs (OpenAI).

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

## 📦 Installation

```bash
# Install globally
npm install -g commit-genius-js

# Or install in your project
npm install --save-dev commit-genius-js
```

## 🚀 Usage

### CLI Usage

1. Generate commit message for all staged changes:
```bash
cmg commit
```

2. Stage and commit all changes:
```bash
cmg commit .
```

3. Stage and commit specific files:
```bash
cmg commit file1.js file2.js
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
npm install -g commit-genius-js
cmg commit
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
   cmg commit --provider openai --api-key your-openai-key
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
   cmg commit --provider ollama
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

### Git Hooks Integration

Add to your package.json:

```json
{
  "scripts": {
    "prepare": "commit-genius-js install-hooks"
  }
}
```

## 📝 License

MIT

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
