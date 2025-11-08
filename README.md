# 🎨 AganiEditor

> A lightweight, zero-dependency WYSIWYG text editor built with pure vanilla JavaScript

[![npm version](https://img.shields.io/npm/v/agani-editor-js.svg)](https://www.npmjs.com/package/agani-editor-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Size](https://img.shields.io/badge/size-5KB-green.svg)](https://github.com/ganipohan/agani-editor-js)

---

## ✨ Features

- 🚀 **Zero Dependencies** - Pure vanilla JavaScript, no jQuery or other libraries
- 🎨 **Rich Text Editing** - Bold, italic, underline, headings, lists, links, and images
- 🌓 **Dark Mode** - Built-in light and dark theme support
- 📱 **Responsive** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Lightweight** - Only ~5KB minified and gzipped
- 🔧 **Easy Integration** - Simple API, works with any framework
- 🎯 **Modern Browsers** - Supports all modern browsers (Chrome, Firefox, Safari, Edge)
- 💾 **Form Compatible** - Automatically syncs with textarea for form submission

---

## 📦 Installation

### Option 1: NPM (Recommended)
 
npm install agani-editor-js 

### Option 2: CDN

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/agani-editor-js@1.0.0/dist/agani-editor.min.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/agani-editor-js@1.0.0/dist/agani-editor.min.js"></script> 

### Option 3: Manual Download

Download the latest release from [GitHub Releases](https://github.com/ganipohan/agani-editor-js/releases)

---

## 🚀 Quick Start

### Basic Example
 
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="agani-editor.min.css">
</head>
<body>
    <!-- Your textarea -->
    <textarea id="myEditor"></textarea>
    
    <!-- Load the library -->
    <script src="agani-editor.min.js"></script>
    
    <!-- Initialize -->
    <script>
        const editor = new AganiEditor('#myEditor', {
            height: 300,
            placeholder: 'Start typing...'
        });
    </script>
</body>
</html> 

That's it! Your editor is ready to use. 🎉

---

## 📚 Configuration

### All Options
 
const editor = new AganiEditor('#myEditor', {
    // Editor height in pixels
    height: 300,
    
    // Placeholder text when editor is empty
    placeholder: 'Start typing...',
    
    // Toolbar buttons to display
    toolbar: ['bold', 'italic', 'underline', 'heading', 'list', 'link', 'image', 'code'],
    
    // Theme: 'light' or 'dark'
    theme: 'light',
    
    // Callback function when content changes
    onChange: function(content) {
        console.log('Content updated:', content);
    }
}); 

### Available Toolbar Buttons

| Button | Description |
|--------|-------------|
| `bold` | Make text bold |
| `italic` | Make text italic |
| `underline` | Underline text |
| `heading` | H1, H2, H3, Paragraph dropdown |
| `list` | Bullet and numbered lists |
| `link` | Insert hyperlinks |
| `image` | Insert images via URL |
| `code` | Toggle HTML code view |

### Custom Toolbar Example
const editor = new AganiEditor('#myEditor', {
    toolbar: ['bold', 'italic', 'link']
}); 

---

## 🎨 Themes

### Light Theme (Default)

const editor = new AganiEditor('#myEditor', {
    theme: 'light'
}); 

### Dark Theme
 
const editor = new AganiEditor('#myEditor', {
    theme: 'dark'
});  

---

## 🌐 Framework Integration

### React

import { useEffect, useRef } from 'react';
import 'agani-editor-js/dist/agani-editor.min.css';
import AganiEditor from 'agani-editor-js';

function MyEditor() {
    const editorRef = useRef(null);
    const instanceRef = useRef(null);
    
    useEffect(() => {
        // Initialize editor
        instanceRef.current = new AganiEditor(editorRef.current, {
            height: 400,
            onChange: (content) => {
                console.log('Content:', content);
            }
        });
        
        // Cleanup on unmount
        return () => {
            if (instanceRef.current) {
                instanceRef.current.destroy();
            }
        };
    }, []);
    
    return <textarea ref={editorRef}></textarea>;
}

export default MyEditor;
 

### Laravel Blade
  
@extends('layouts.app')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/agani-editor.min.css') }}">
@endsection

@section('content')
<form action="{{ route('posts.store') }}" method="POST">
    @csrf
    
    <div class="form-group">
        <label for="content">Post Content</label>
        <textarea id="content" name="content">{{ old('content') }}</textarea>
        @error('content')
            <span class="text-danger">{{ $message }}</span>
        @enderror
    </div>
    
    <button type="submit" class="btn btn-primary">Publish Post</button>
</form>
@endsection

@section('scripts')
<script src="{{ asset('js/agani-editor.min.js') }}"></script>
<script>
    const editor = new AganiEditor('#content', {
        height: 500,
        placeholder: 'Write your blog post here...',
        theme: 'light'
    });
</script>
@endsection 

---
 

## 🔒 Security

AganiEditor uses `contentEditable` and `document.execCommand()` for editing.

**⚠️ Important Security Notes:**

1. **Always sanitize HTML on the server-side** before saving to database
2. **Never directly render user-generated HTML** without sanitization
3. **Use a sanitization library** like [DOMPurify](https://github.com/cure53/DOMPurify)

### Example: Sanitize Before Sending 

const content = editor.getContent();
const cleanContent = DOMPurify.sanitize(content);
 
fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ content: cleanContent })
}); 

---

## 🐛 Troubleshooting

### Editor not showing?

**Problem:** Editor doesn't appear on the page.

**Solution:** Make sure you've included the CSS file: 
<link rel="stylesheet" href="agani-editor.min.css"> 

### "AganiEditor is not defined"

**Problem:** JavaScript error in console.

**Solution:** Load the JavaScript file before initializing: 
<!-- Load library first -->
<script src="agani-editor.min.js"></script>

<!-- Then initialize -->
<script>
    const editor = new AganiEditor('#myEditor');
</script> 

### Content not saving to form

**Problem:** Form submits but textarea is empty.

**Solution:** Editor automatically updates the textarea. Make sure your textarea has a `name` attribute: 
<textarea id="editor" name="content"></textarea> 

### Styling looks broken

**Problem:** Editor styling doesn't match your site.

**Solution:** The editor uses its own scoped CSS. You can override styles:

.agani-editor-container {
    border: 2px solid #your-color;
}


---

## 📊 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | ✅ 60+ |
| Firefox | ✅ 55+ |
| Safari | ✅ 12+ |
| Edge | ✅ 79+ |
| Opera | ✅ 47+ |

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/AmazingFeature`
3. **Commit** your changes: `git commit -m 'Add some AmazingFeature'`
4. **Push** to the branch: `git push origin feature/AmazingFeature`
5. **Open** a Pull Request

### Development Setup


# Clone the repository
git clone https://github.com/ganipohan/agani-editor-js.git

# Install dependencies
cd agani-editor-js
npm install

# Build the project
npm run build

# Test in browser
open examples/index.html


---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Summary:** You can use this library for free in personal and commercial projects. No attribution required (but appreciated! ⭐).

---

## 👨‍💻 Author

**Abdul Gani Pohan**

- 📧 Email: ganipohan28@gmail.com
- 🐙 GitHub: [@ganipohan](https://github.com/ganipohan)

---

## 📞 Support

Need help? Here's how to get support:

- 📖 **Documentation:** [Read the full docs](https://github.com/ganipohan/agani-editor-js#readme)
- 🐛 **Bug Reports:** [Open an issue](https://github.com/ganipohan/agani-editor-js/issues)
- 💬 **Questions:** [GitHub Discussions](https://github.com/ganipohan/agani-editor-js/discussions)
- 📧 **Email:** ganipohan28@gmail.com

---

## 🙏 Acknowledgments

- Inspired by [Summernote](https://summernote.org/) and [TinyMCE](https://www.tiny.cloud/)
- Icons from Unicode characters
- Built with ❤️ using pure vanilla JavaScript

---

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub! ⭐

---

## 📈 Roadmap

Planned features for future releases:

- [ ] **v1.1.0**
  - Table insertion support
  - Text color picker
  - Background color picker
  - Undo/Redo functionality

- [ ] **v1.2.0**
  - File upload support
  - Emoji picker
  - Markdown support
  - Export to PDF

- [ ] **v2.0.0**
  - Collaborative editing
  - Mentions (@username)
  - Real-time preview
  - Plugin system

---

## 🎉 Show Your Support

If you like this project:

- ⭐ Star the repository on GitHub
- 🐦 Tweet about it
- 📝 Write a blog post
- 💰 [Buy me a coffee](https://ko-fi.com/aganipohan)

---

<div align="center">

**Made with ❤️ by [Abdul Gani Pohan](https://github.com/ganipohan)**

**AganiEditor** © 2025 • [MIT License](LICENSE)

[Website](https://github.com/ganipohan/agani-editor-js) • [Documentation](https://github.com/ganipohan/agani-editor-js#readme) • [Issues](https://github.com/ganipohan/agani-editor-js/issues)

</div>