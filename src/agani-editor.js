/**
 * AganiEditor - A lightweight WYSIWYG text editor
 * @version 1.0.0
 * @author Abdul Gani Pohan
 * @license MIT
 */

(function(window) {
    'use strict';

    /**
     * AganiEditor Constructor
     * @param {string} selector - CSS selector untuk textarea
     * @param {object} options - Konfigurasi editor
     */
    function AganiEditor(selector, options) {
        this.selector = selector;
        this.element = document.querySelector(selector);
        
        if (!this.element) {
            console.error('AganiEditor: Element tidak ditemukan');
            return;
        }

        // Default options
        this.options = Object.assign({
            height: 300,
            placeholder: 'Mulai menulis...',
            toolbar: ['bold', 'italic', 'underline', 'heading', 'list', 'link', 'image'],
            onChange: null,
            theme: 'light' // 'light' atau 'dark'
        }, options);

        this.init();
    }

    /**
     * Inisialisasi Editor
     */
    AganiEditor.prototype.init = function() {
        this.createEditor();
        this.createToolbar();
        this.attachEvents();
        this.hideOriginalElement();
    };

    /**
     * Struktur editor
     */
    AganiEditor.prototype.createEditor = function() {
        // Container utama
        this.container = document.createElement('div');
        this.container.className = 'agani-editor-container';
        this.container.setAttribute('data-theme', this.options.theme);

        // Toolbar container
        this.toolbarContainer = document.createElement('div');
        this.toolbarContainer.className = 'agani-editor-toolbar';

        // Content editable area
        this.editorContent = document.createElement('div');
        this.editorContent.className = 'agani-editor-content';
        this.editorContent.contentEditable = true;
        this.editorContent.setAttribute('data-placeholder', this.options.placeholder);
        this.editorContent.style.minHeight = this.options.height + 'px';

        // Set initial content dari textarea
        this.editorContent.innerHTML = this.element.value || '';

        // Susun struktur
        this.container.appendChild(this.toolbarContainer);
        this.container.appendChild(this.editorContent);
        
        // Insert setelah textarea
        this.element.parentNode.insertBefore(this.container, this.element.nextSibling);
    };

    /**
     * Toolbar buttons
     */
    AganiEditor.prototype.createToolbar = function() {
        const tools = {
            'bold': { icon: '𝐁', title: 'Bold', command: 'bold' },
            'italic': { icon: '𝐼', title: 'Italic', command: 'italic' },
            'underline': { icon: '𝐔', title: 'Underline', command: 'underline' },
            'heading': { icon: 'H', title: 'Heading', type: 'dropdown' },
            'list': { icon: '≡', title: 'List', type: 'dropdown' },
            'link': { icon: '🔗', title: 'Link', command: 'createLink' },
            'image': { icon: '🖼️', title: 'Image', command: 'insertImage' },
            'code': { icon: '</>', title: 'Code View', type: 'toggle' }
        };

        this.options.toolbar.forEach(toolName => {
            const tool = tools[toolName];
            if (!tool) return;

            if (tool.type === 'dropdown') {
                this.createDropdown(toolName, tool);
            } else if (tool.type === 'toggle') {
                this.createToggleButton(toolName, tool);
            } else {
                this.createButton(toolName, tool);
            }
        });
    };

    /**
     * Button biasa
     */
    AganiEditor.prototype.createButton = function(name, tool) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'agani-editor-btn';
        button.setAttribute('data-command', tool.command);
        button.title = tool.title;
        button.innerHTML = tool.icon;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.executeCommand(tool.command);
        });

        this.toolbarContainer.appendChild(button);
    };

    /**
     * Dropdown untuk heading dan list
     */
    AganiEditor.prototype.createDropdown = function(name, tool) {
        const dropdown = document.createElement('div');
        dropdown.className = 'agani-editor-dropdown';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'agani-editor-btn';
        button.innerHTML = tool.icon + ' ▾';
        button.title = tool.title;

        const menu = document.createElement('div');
        menu.className = 'agani-editor-dropdown-menu';

        if (name === 'heading') {
            const headings = [
                { label: 'Heading 1', tag: 'h1' },
                { label: 'Heading 2', tag: 'h2' },
                { label: 'Heading 3', tag: 'h3' },
                { label: 'Paragraph', tag: 'p' }
            ];

            headings.forEach(h => {
                const item = document.createElement('div');
                item.className = 'agani-editor-dropdown-item';
                item.textContent = h.label;
                item.addEventListener('click', () => {
                    this.executeCommand('formatBlock', h.tag);
                    menu.classList.remove('show');
                });
                menu.appendChild(item);
            });
        } else if (name === 'list') {
            const lists = [
                { label: 'Bullet List', command: 'insertUnorderedList' },
                { label: 'Numbered List', command: 'insertOrderedList' }
            ];

            lists.forEach(l => {
                const item = document.createElement('div');
                item.className = 'agani-editor-dropdown-item';
                item.textContent = l.label;
                item.addEventListener('click', () => {
                    this.executeCommand(l.command);
                    menu.classList.remove('show');
                });
                menu.appendChild(item);
            });
        }

        button.addEventListener('click', (e) => {
            e.preventDefault();
            menu.classList.toggle('show');
        });

        dropdown.appendChild(button);
        dropdown.appendChild(menu);
        this.toolbarContainer.appendChild(dropdown);
    };

    /**
     * Toggle button untuk code view
     */
    AganiEditor.prototype.createToggleButton = function(name, tool) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'agani-editor-btn';
        button.innerHTML = tool.icon;
        button.title = tool.title;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCodeView();
            button.classList.toggle('active');
        });

        this.toolbarContainer.appendChild(button);
    };

    /**
     * Execute command
     */
    AganiEditor.prototype.executeCommand = function(command, value) {
        this.editorContent.focus();

        if (command === 'createLink') {
            const url = prompt('Masukkan URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else if (command === 'insertImage') {
            const url = prompt('Masukkan URL gambar:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else {
            document.execCommand(command, false, value);
        }

        this.updateOriginalElement();
    };

    /**
     * Toggle code view
     */
    AganiEditor.prototype.toggleCodeView = function() {
        if (this.editorContent.style.display === 'none') {
            // Kembali ke visual mode
            this.editorContent.innerHTML = this.codeView.value;
            this.editorContent.style.display = 'block';
            this.codeView.style.display = 'none';
        } else {
            // Ke code mode
            if (!this.codeView) {
                this.codeView = document.createElement('textarea');
                this.codeView.className = 'agani-editor-code';
                this.container.appendChild(this.codeView);
            }
            this.codeView.value = this.editorContent.innerHTML;
            this.codeView.style.minHeight = this.options.height + 'px';
            this.editorContent.style.display = 'none';
            this.codeView.style.display = 'block';
        }
    };

    /**
     * Attach event listeners
     */
    AganiEditor.prototype.attachEvents = function() {
        // Update textarea saat konten berubah
        this.editorContent.addEventListener('input', () => {
            this.updateOriginalElement();
            if (this.options.onChange) {
                this.options.onChange(this.getContent());
            }
        });

        // Close dropdown saat klik di luar
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.agani-editor-dropdown')) {
                document.querySelectorAll('.agani-editor-dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });

        // Prevent form submit dengan Enter di link prompt
        this.editorContent.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
            }
        });
    };

    /**
     * Update original textarea
     */
    AganiEditor.prototype.updateOriginalElement = function() {
        this.element.value = this.editorContent.innerHTML;
    };

    /**
     * Hide original textarea
     */
    AganiEditor.prototype.hideOriginalElement = function() {
        this.element.style.display = 'none';
    };

    /**
     * Get konten HTML
     */
    AganiEditor.prototype.getContent = function() {
        return this.editorContent.innerHTML;
    };

    /**
     * Set konten
     */
    AganiEditor.prototype.setContent = function(html) {
        this.editorContent.innerHTML = html;
        this.updateOriginalElement();
    };

    /**
     * Clear konten
     */
    AganiEditor.prototype.clear = function() {
        this.editorContent.innerHTML = '';
        this.updateOriginalElement();
    };

    /**
     * Destroy editor
     */
    AganiEditor.prototype.destroy = function() {
        this.element.style.display = 'block';
        this.container.remove();
    };

    // Expose ke global scope
    window.AganiEditor = AganiEditor;

    // Support AMD
    if (typeof define === 'function' && define.amd) {
        define(function() { return AganiEditor; });
    }

    // Support CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AganiEditor;
    }

})(window);