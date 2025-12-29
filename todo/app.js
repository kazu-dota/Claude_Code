class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.editingId = null;

        this.initElements();
        this.attachEventListeners();
        this.render();
    }

    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: this.prioritySelect.value,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    startEdit(id) {
        this.editingId = id;
        this.render();
    }

    saveEdit(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveTodos();
        }
        this.editingId = null;
        this.render();
    }

    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;

        this.totalCount.textContent = `全て: ${total}`;
        this.activeCount.textContent = `未完了: ${active}`;
        this.completedCount.textContent = `完了: ${completed}`;
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item priority-${todo.priority}`;
        if (todo.completed) {
            li.classList.add('completed');
        }

        const isEditing = this.editingId === todo.id;

        if (isEditing) {
            li.innerHTML = `
                <input type="checkbox"
                       class="todo-checkbox"
                       ${todo.completed ? 'checked' : ''}>
                <input type="text"
                       class="todo-edit-input active"
                       value="${this.escapeHtml(todo.text)}">
                <div class="todo-actions">
                    <button class="todo-btn save-btn">保存</button>
                    <button class="todo-btn cancel-btn">キャンセル</button>
                </div>
            `;

            const checkbox = li.querySelector('.todo-checkbox');
            const editInput = li.querySelector('.todo-edit-input');
            const saveBtn = li.querySelector('.save-btn');
            const cancelBtn = li.querySelector('.cancel-btn');

            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            saveBtn.addEventListener('click', () => this.saveEdit(todo.id, editInput.value));
            cancelBtn.addEventListener('click', () => this.cancelEdit());
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveEdit(todo.id, editInput.value);
                }
            });
            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            });

            setTimeout(() => editInput.focus(), 0);
        } else {
            const priorityText = {
                high: '高',
                medium: '中',
                low: '低'
            };

            li.innerHTML = `
                <input type="checkbox"
                       class="todo-checkbox"
                       ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <span class="priority-badge ${todo.priority}">${priorityText[todo.priority]}</span>
                <div class="todo-actions">
                    <button class="todo-btn edit-btn">編集</button>
                    <button class="todo-btn delete-btn">削除</button>
                </div>
            `;

            const checkbox = li.querySelector('.todo-checkbox');
            const editBtn = li.querySelector('.edit-btn');
            const deleteBtn = li.querySelector('.delete-btn');

            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            editBtn.addEventListener('click', () => this.startEdit(todo.id));
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
        }

        return li;
    }

    render() {
        this.todoList.innerHTML = '';
        const filteredTodos = this.getFilteredTodos();

        filteredTodos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            this.todoList.appendChild(todoElement);
        });

        this.updateStats();

        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '40px';
            emptyMessage.style.color = '#999';
            emptyMessage.textContent = 'タスクがありません';
            this.todoList.appendChild(emptyMessage);
        }
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
