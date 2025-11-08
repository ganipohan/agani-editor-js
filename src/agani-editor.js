/**
 * AganiEditor - Advanced WYSIWYG text editor
 * @version 2.1.0
 * @author Abdul Gani Pohan
 */

(function(window) {
    'use strict';

    function AganiEditor(selector, options) {
        this.selector = selector;
        this.element = document.querySelector(selector);
        
        if (!this.element) {
            console.error('AganiEditor: Element tidak ditemukan');
            return;
        }

        this.options = Object.assign({
            height: 300,
            placeholder: 'Mulai menulis...',
            toolbar: [
                'undo', 'redo',
                'bold', 'italic', 'underline', 'strikethrough',
                'subscript', 'superscript',
                'fontfamily', 'fontsize',
                'color', 'bgcolor',
                'heading', 'align', 'list',
                'outdent', 'indent',
                'link', 'image', 'table',
                'hr', 'removeformat', 'code'
            ],
            onChange: null,
            theme: 'light'
        }, options);

        this.history = [];
        this.historyStep = -1;
        this.init();
    }

    AganiEditor.prototype.init = function() {
        this.createEditor();
        this.createToolbar();
        this.attachEvents();
        this.hideOriginalElement();
        this.saveHistory();
    };

    AganiEditor.prototype.createEditor = function() {
        this.container = document.createElement('div');
        this.container.className = 'agani-editor-container';
        this.container.setAttribute('data-theme', this.options.theme);

        this.toolbarContainer = document.createElement('div');
        this.toolbarContainer.className = 'agani-editor-toolbar';

        this.editorContent = document.createElement('div');
        this.editorContent.className = 'agani-editor-content';
        this.editorContent.contentEditable = true;
        this.editorContent.setAttribute('data-placeholder', this.options.placeholder);
        this.editorContent.style.minHeight = this.options.height + 'px';
        this.editorContent.innerHTML = this.element.value || '';

        this.container.appendChild(this.toolbarContainer);
        this.container.appendChild(this.editorContent);
        this.element.parentNode.insertBefore(this.container, this.element.nextSibling);
    };

    AganiEditor.prototype.createToolbar = function() {
        const tools = {
            'undo': { icon: '↶', title: 'Undo', command: 'undo' },
            'redo': { icon: '↷', title: 'Redo', command: 'redo' },
            'bold': { icon: '𝐁', title: 'Bold', command: 'bold' },
            'italic': { icon: '𝐼', title: 'Italic', command: 'italic' },
            'underline': { icon: '𝐔', title: 'Underline', command: 'underline' },
            'strikethrough': { icon: 'S̶', title: 'Strikethrough', command: 'strikeThrough' },
            'subscript': { icon: 'X₂', title: 'Subscript', command: 'subscript' },
            'superscript': { icon: 'X²', title: 'Superscript', command: 'superscript' },
            'fontfamily': { icon: 'Aa', title: 'Font Family', type: 'dropdown' },
            'fontsize': { icon: '12', title: 'Font Size', type: 'dropdown' },
            'color': { icon: '🎨', title: 'Text Color', type: 'color' },
            'bgcolor': { icon: '◧', title: 'Background Color', type: 'color' },
            'heading': { icon: 'H', title: 'Heading', type: 'dropdown' },
            'align': { icon: '⚏', title: 'Align', type: 'dropdown' },
            'list': { icon: '≡', title: 'List', type: 'dropdown' },
            'outdent': { icon: '←', title: 'Decrease Indent', command: 'outdent' },
            'indent': { icon: '→', title: 'Increase Indent', command: 'indent' },
            'link': { icon: '🔗', title: 'Link', command: 'createLink' },
            'image': { icon: '🖼️', title: 'Image', command: 'insertImage' },
            'table': { icon: '⊞', title: 'Insert Table', type: 'custom', action: 'insertTable' },
            'hr': { icon: '─', title: 'Horizontal Rule', command: 'insertHorizontalRule' },
            'removeformat': { icon: '✗', title: 'Clear Formatting', command: 'removeFormat' },
            'code': { icon: '</>', title: 'Code View', type: 'toggle' }
        };

        this.options.toolbar.forEach(toolName => {
            const tool = tools[toolName];
            if (!tool) return;

            if (tool.type === 'dropdown') {
                this.createDropdown(toolName, tool);
            } else if (tool.type === 'toggle') {
                this.createToggleButton(toolName, tool);
            } else if (tool.type === 'color') {
                this.createColorPicker(toolName, tool);
            } else if (tool.type === 'custom') {
                this.createCustomButton(toolName, tool);
            } else {
                this.createButton(toolName, tool);
            }
        });
    };

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

    AganiEditor.prototype.createCustomButton = function(name, tool) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'agani-editor-btn';
        button.title = tool.title;
        button.innerHTML = tool.icon;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (tool.action === 'insertTable') {
                this.insertTable();
            }
        });

        this.toolbarContainer.appendChild(button);
    };

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
                { label: 'Heading 4', tag: 'h4' },
                { label: 'Heading 5', tag: 'h5' },
                { label: 'Heading 6', tag: 'h6' },
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
        } else if (name === 'align') {
            const alignments = [
                { label: 'Align Left', command: 'justifyLeft', icon: '⚋' },
                { label: 'Align Center', command: 'justifyCenter', icon: '⚌' },
                { label: 'Align Right', command: 'justifyRight', icon: '⚍' },
                { label: 'Justify', command: 'justifyFull', icon: '⚏' }
            ];

            alignments.forEach(a => {
                const item = document.createElement('div');
                item.className = 'agani-editor-dropdown-item';
                item.innerHTML = a.icon + ' ' + a.label;
                item.addEventListener('click', () => {
                    this.executeCommand(a.command);
                    menu.classList.remove('show');
                });
                menu.appendChild(item);
            });
        } else if (name === 'fontfamily') {
            const fonts = [
                'Arial', 'Times New Roman', 'Courier New',
                'Georgia', 'Verdana', 'Comic Sans MS', 'Impact',
                'Trebuchet MS', 'Palatino', 'Garamond'
            ];

            fonts.forEach(font => {
                const item = document.createElement('div');
                item.className = 'agani-editor-dropdown-item';
                item.textContent = font;
                item.style.fontFamily = font;
                item.addEventListener('click', () => {
                    this.executeCommand('fontName', font);
                    menu.classList.remove('show');
                });
                menu.appendChild(item);
            });
        } else if (name === 'fontsize') {
            const sizes = [
                { label: 'Very Small', value: '1' },
                { label: 'Small', value: '2' },
                { label: 'Normal', value: '3' },
                { label: 'Medium', value: '4' },
                { label: 'Large', value: '5' },
                { label: 'Very Large', value: '6' },
                { label: 'Huge', value: '7' }
            ];

            sizes.forEach(s => {
                const item = document.createElement('div');
                item.className = 'agani-editor-dropdown-item';
                item.textContent = s.label;
                item.addEventListener('click', () => {
                    this.executeCommand('fontSize', s.value);
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

    AganiEditor.prototype.createColorPicker = function(name, tool) {
        const container = document.createElement('div');
        container.className = 'agani-editor-color-picker';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'agani-editor-btn';
        button.innerHTML = tool.icon;
        button.title = tool.title;

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'agani-editor-color-input';

        button.addEventListener('click', (e) => {
            e.preventDefault();
            colorInput.click();
        });

        colorInput.addEventListener('change', (e) => {
            const color = e.target.value;
            if (name === 'color') {
                this.executeCommand('foreColor', color);
            } else if (name === 'bgcolor') {
                this.executeCommand('backColor', color);
            }
        });

        container.appendChild(button);
        container.appendChild(colorInput);
        this.toolbarContainer.appendChild(container);
    };

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

    AganiEditor.prototype.insertTable = function() {
        const rows = prompt('Jumlah baris:', '3');
        const cols = prompt('Jumlah kolom:', '3');
        
        if (rows && cols) {
            let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
            
            for (let i = 0; i < parseInt(rows); i++) {
                tableHTML += '<tr>';
                for (let j = 0; j < parseInt(cols); j++) {
                    tableHTML += '<td style="padding: 8px; border: 1px solid #ddd;">Cell</td>';
                }
                tableHTML += '</tr>';
            }
            
            tableHTML += '</table><p><br></p>';
            
            this.executeCommand('insertHTML', tableHTML);
        }
    };

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
        } else if (command === 'insertHTML') {
            document.execCommand(command, false, value);
        } else if (command === 'undo') {
            this.undo();
            return;
        } else if (command === 'redo') {
            this.redo();
            return;
        } else {
            document.execCommand(command, false, value);
        }

        this.updateOriginalElement();
        this.saveHistory();
    };

    AganiEditor.prototype.saveHistory = function() {
        const content = this.editorContent.innerHTML;
        
        // Remove future history if we're not at the end
        if (this.historyStep < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyStep + 1);
        }
        
        // Don't save if content hasn't changed
        if (this.history.length > 0 && this.history[this.history.length - 1] === content) {
            return;
        }
        
        this.history.push(content);
        this.historyStep = this.history.length - 1;
        
        // Limit history to 50 steps
        if (this.history.length > 50) {
            this.history.shift();
            this.historyStep--;
        }
    };

    AganiEditor.prototype.undo = function() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.editorContent.innerHTML = this.history[this.historyStep];
            this.updateOriginalElement();
        }
    };

    AganiEditor.prototype.redo = function() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.editorContent.innerHTML = this.history[this.historyStep];
            this.updateOriginalElement();
        }
    };

    AganiEditor.prototype.toggleCodeView = function() {
        if (this.editorContent.style.display === 'none') {
            this.editorContent.innerHTML = this.codeView.value;
            this.editorContent.style.display = 'block';
            this.codeView.style.display = 'none';
        } else {
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

    AganiEditor.prototype.attachEvents = function() {
        let typingTimer;
        const typingDelay = 500;

        this.editorContent.addEventListener('input', () => {
            this.updateOriginalElement();
            
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                this.saveHistory();
            }, typingDelay);
            
            if (this.options.onChange) {
                this.options.onChange(this.getContent());
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.agani-editor-dropdown')) {
                document.querySelectorAll('.agani-editor-dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });

        // Keyboard shortcuts
        this.editorContent.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if (e.key === 'z' && e.shiftKey || e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            }
        });
    };

    AganiEditor.prototype.updateOriginalElement = function() {
        this.element.value = this.editorContent.innerHTML;
    };

    AganiEditor.prototype.hideOriginalElement = function() {
        this.element.style.display = 'none';
    };

    AganiEditor.prototype.getContent = function() {
        return this.editorContent.innerHTML;
    };

    AganiEditor.prototype.setContent = function(html) {
        this.editorContent.innerHTML = html;
        this.updateOriginalElement();
        this.saveHistory();
    };

    AganiEditor.prototype.clear = function() {
        this.editorContent.innerHTML = '';
        this.updateOriginalElement();
        this.saveHistory();
    };

    AganiEditor.prototype.destroy = function() {
        this.element.style.display = 'block';
        this.container.remove();
    };

    window.AganiEditor = AganiEditor;

    if (typeof define === 'function' && define.amd) {
        define(function() { return AganiEditor; });
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AganiEditor;
    }

})(window);