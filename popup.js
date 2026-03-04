let todos = [];

function saveTodos() {
chrome.storage.local.set({ todos });
}

function renderTodos() {
const list = document.getElementById('todo-list');
list.innerHTML = '';

todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.id = `todo-${index}`;
    checkbox.addEventListener('change', () => {
    todos[index].done = checkbox.checked;
    saveTodos();
    renderTodos();
    });

    const label = document.createElement('label');
    label.htmlFor = `todo-${index}`;
    label.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', () => {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(deleteBtn);
    list.appendChild(li);
});

const remaining = todos.filter(t => !t.done).length;
document.getElementById('item-count').textContent =
    `${remaining} item${remaining !== 1 ? 's' : ''} left`;
}

function addTodo() {
const input = document.getElementById('todo-input');
const text = input.value.trim();
if (!text) return;
todos.push({ text, done: false });
input.value = '';
saveTodos();
renderTodos();
}

document.getElementById('add-btn').addEventListener('click', addTodo);

document.getElementById('todo-input').addEventListener('keydown', e => {
if (e.key === 'Enter') addTodo();
});

document.getElementById('clear-btn').addEventListener('click', () => {
todos = todos.filter(t => !t.done);
saveTodos();
renderTodos();
});

chrome.storage.local.get(['todos'], result => {
todos = result.todos || [];
renderTodos();
});
