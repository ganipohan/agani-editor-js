/**
 * AganiEditor - Advanced WYSIWYG text editor
 * @version 2.3.0 (Enhanced Features)
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
        this.savedRange = null;
        this.currentFont = 'Arial';
        this.currentFontSize = '3';
        this.init();
    }

    AganiEditor.prototype.init = function() {
        this.createEditor();
        this.createToolbar();
        this.attachEvents();
        this.hideOriginalElement();
        this.saveHistory();
    };

    AganiEditor.prototype.saveSelection = function() {
        if (window.getSelection) {
            const sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                this.savedRange = sel.getRangeAt(0);
            }
        }
    };

    AganiEditor.prototype.restoreSelection = function() {
        this.editorContent.focus();
        if (this.savedRange) {
            if (window.getSelection) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(this.savedRange);
            }
        }
    };

    AganiEditor.prototype.updateToolbarState = function() {
        const buttons = this.toolbarContainer.querySelectorAll('.agani-editor-btn[data-command]');
        
        buttons.forEach(button => {
            const command = button.getAttribute('data-command');
            if (command) {
                try {
                    const isActive = document.queryCommandState(command);
                    if (isActive) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                } catch(e) {
                    // Some commands don't support queryCommandState
                }
            }
        });
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
            'undo': { icon: '↶', title: 'Undo (Ctrl+Z)', command: 'undo' },
            'redo': { icon: '↷', title: 'Redo (Ctrl+Y)', command: 'redo' },
            'bold': { icon: '𝐁', title: 'Bold (Ctrl+B)', command: 'bold' },
            'italic': { icon: '𝐼', title: 'Italic (Ctrl+I)', command: 'italic' },
            'underline': { icon: '𝐔', title: 'Underline (Ctrl+U)', command: 'underline' },
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
            'link': { icon: '🔗', title: 'Insert Link', command: 'createLink' },
            'image': { icon: '🖼️', title: 'Insert Image', command: 'insertImage' },
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
        
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.restoreSelection();
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
        
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.restoreSelection();
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
        button.className = 'agani-editor-btn agani-editor-dropdown-btn';
        button.innerHTML = tool.icon + ' ▾';
        button.title = tool.title;
        button.setAttribute('data-dropdown-type', name);

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
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.restoreSelection();
                    this.executeCommand('formatBlock', '<' + h.tag + '>');
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
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.restoreSelection();
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
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.restoreSelection();
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
                item.setAttribute('data-font', font);
                item.textContent = font;
                item.style.fontFamily = font;
                
                if (font === this.currentFont) {
                    item.classList.add('active');
                }
                
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Remove active class dari semua font items
                    menu.querySelectorAll('.agani-editor-dropdown-item').forEach(el => {
                        el.classList.remove('active');
                    });
                    // Tambah active class ke item yang diklik
                    item.classList.add('active');
                    this.currentFont = font;
                    this.restoreSelection();
                    this.executeCommand('fontName', font);
                    menu.classList.remove('show');
                });
                menu.appendChild(item);
            });
        } else if (name === 'fontsize') {
            const sizes = [
                { label: 'Very Small (8pt)', value: '1' },
                { label: 'Small (10pt)', value: '2' },
                { label: 'Normal (12pt)', value: '3' },
                { label: 'Medium (14pt)', value: '4' },
                { label: 'Large (18pt)', value: '5' },
                { label: 'Very Large (24pt)', value: '6' },
                { label: 'Huge (32pt)', value: '7' }
            ];

            sizes.forEach(s => {
                const item = document.createElement('div');
                item.className = 'agani-editor-dropdown-item';
                item.textContent = s.label;
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.restoreSelection();
                    this.executeCommand('fontSize', s.value);
                    menu.classList.remove('show');
                });
                menu.appendChild(item);
            });

            // Tambah separator
            const separator = document.createElement('div');
            separator.className = 'agani-editor-dropdown-separator';
            menu.appendChild(separator);

            // Input custom size
            const customContainer = document.createElement('div');
            customContainer.className = 'agani-editor-custom-size-container';

            const label = document.createElement('label');
            label.textContent = 'Custom (px):';
            label.className = 'agani-editor-custom-size-label';

            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'agani-editor-custom-size-input';
            input.placeholder = '16';
            input.min = '8';
            input.max = '200';

            const applyBtn = document.createElement('button');
            applyBtn.type = 'button';
            applyBtn.className = 'agani-editor-custom-size-btn';
            applyBtn.textContent = 'Apply';

            applyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const size = input.value;
                if (size && parseInt(size) > 0) {
                    this.restoreSelection();
                    this.editorContent.focus();
                    if (window.getSelection().toString()) {
                        document.execCommand('fontSize', false, '7');
                        const spans = this.editorContent.querySelectorAll('span[style*="font-size"]');
                        spans.forEach(span => {
                            span.style.fontSize = size + 'px';
                        });
                    }
                    menu.classList.remove('show');
                }
            });

            customContainer.appendChild(label);
            customContainer.appendChild(input);
            customContainer.appendChild(applyBtn);
            menu.appendChild(customContainer);
        }

        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns
            document.querySelectorAll('.agani-editor-dropdown-menu').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('show');
                }
            });
            
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

        const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'agani-editor-btn agani-editor-reset-color-btn';
        resetBtn.title = name === 'color' ? 'Reset Text Color' : 'Reset Background Color';
        resetBtn.innerHTML = '↻';

        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            colorInput.click();
        });

        resetBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.restoreSelection();
            if (name === 'color') {
                // Reset text color ke hitam
                if (window.getSelection().toString()) {
                    document.execCommand('foreColor', false, '#000000');
                }
            } else if (name === 'bgcolor') {
                // Reset background color ke putih
                if (window.getSelection().toString()) {
                    document.execCommand('hiliteColor', false, '#FFFFFF');
                }
            }
            this.updateOriginalElement();
            this.saveHistory();
        });

        colorInput.addEventListener('change', (e) => {
            const color = e.target.value;
            this.restoreSelection();
            if (name === 'color') {
                this.executeCommand('foreColor', color);
            } else if (name === 'bgcolor') {
                this.executeCommand('hiliteColor', color);
            }
        });

        container.appendChild(button);
        container.appendChild(colorInput);
        container.appendChild(resetBtn);
        this.toolbarContainer.appendChild(container);
    };

    AganiEditor.prototype.createToggleButton = function(name, tool) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'agani-editor-btn';
        button.innerHTML = tool.icon;
        button.title = tool.title;

        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

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
        
        if (rows && cols && parseInt(rows) > 0 && parseInt(cols) > 0) {
            let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
            
            for (let i = 0; i < parseInt(rows); i++) {
                tableHTML += '<tr>';
                for (let j = 0; j < parseInt(cols); j++) {
                    tableHTML += '<td style="padding: 8px; border: 1px solid #ddd;">Cell</td>';
                }
                tableHTML += '</tr>';
            }
            
            tableHTML += '</table><p><br></p>';
            
            this.insertHTMLAtCursor(tableHTML);
        }
    };

    AganiEditor.prototype.insertHTMLAtCursor = function(html) {
        this.restoreSelection();
        
        if (document.queryCommandSupported('insertHTML')) {
            document.execCommand('insertHTML', false, html);
        } else {
            const sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                const range = sel.getRangeAt(0);
                range.deleteContents();
                
                const el = document.createElement('div');
                el.innerHTML = html;
                const frag = document.createDocumentFragment();
                let node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
                
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
        
        this.saveSelection();
        this.updateOriginalElement();
        this.saveHistory();
    };

    AganiEditor.prototype.executeCommand = function(command, value) {
        if (command === 'createLink') {
            const selection = window.getSelection();
            const selectedText = selection.toString();
            
            if (!selectedText) {
                alert('Silakan pilih teks terlebih dahulu untuk dijadikan link!');
                return;
            }
            
            const url = prompt('Masukkan URL:', 'https://');
            if (url && url !== 'https://' && url !== '') {
                document.execCommand('createLink', false, url);
                
                setTimeout(() => {
                    const links = this.editorContent.querySelectorAll('a');
                    links.forEach(link => {
                        if (!link.hasAttribute('target')) {
                            link.setAttribute('target', '_blank');
                            link.setAttribute('rel', 'noopener noreferrer');
                        }
                    });
                }, 10);
            }
        } else if (command === 'insertImage') {
            const url = prompt('Masukkan URL gambar:', 'https://');
            if (url && url !== 'https://' && url !== '') {
                const imgHTML = `<img src="${url}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" alt="Image">`;
                this.insertHTMLAtCursor(imgHTML);
                return;
            }
        } else if (command === 'undo') {
            this.undo();
            return;
        } else if (command === 'redo') {
            this.redo();
            return;
        } else {
            document.execCommand(command, false, value);
        }

        this.saveSelection();
        this.updateToolbarState();
        this.updateOriginalElement();
        this.saveHistory();
    };

    AganiEditor.prototype.saveHistory = function() {
        const content = this.editorContent.innerHTML;
        
        if (this.historyStep < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyStep + 1);
        }
        
        if (this.history.length > 0 && this.history[this.history.length - 1] === content) {
            return;
        }
        
        this.history.push(content);
        this.historyStep = this.history.length - 1;
        
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
            this.updateToolbarState();
        }
    };

    AganiEditor.prototype.redo = function() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.editorContent.innerHTML = this.history[this.historyStep];
            this.updateOriginalElement();
            this.updateToolbarState();
        }
    };

    AganiEditor.prototype.toggleCodeView = function() {
        if (this.editorContent.style.display === 'none') {
            this.editorContent.innerHTML = this.codeView.value;
            this.editorContent.style.display = 'block';
            this.codeView.style.display = 'none';
            this.saveHistory();
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

        this.editorContent.addEventListener('mouseup', () => {
            this.saveSelection();
            this.updateToolbarState();
        });

        this.editorContent.addEventListener('keyup', () => {
            this.saveSelection();
            this.updateToolbarState();
        });

        this.editorContent.addEventListener('focus', () => {
            this.saveSelection();
            this.updateToolbarState();
        });

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

        this.editorContent.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            }
        });

        this.editorContent.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    window.open(e.target.href, '_blank');
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