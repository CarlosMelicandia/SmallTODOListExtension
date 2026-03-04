let todos = [];
let stickyEl = null;

function createSticky() {
    const el = document.createElement('div');
    el.id = 'todo-sticky';
    el.innerHTML = `
        <div id="todo-drag-handle">PlaceHolder</div>
        <div class="input-row">
            <input type="text" id="todo-input" placeholder="new task..." autocomplete="off">
            <button id="add-btn">add</button>
        </div>
        <ul id="todo-list"></ul>
        <div class="footer">
            <span id="item-count"></span>
            <button id="clear-btn">clear done</button>
        </div>
    `;
    document.body.appendChild(el);

    // Drag logic
    const handle = el.querySelector('#todo-drag-handle');
    let isDragging = false, startX, startY, origX, origY;

    handle.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origX = el.offsetLeft;
        origY = el.offsetTop;
        e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const maxX = window.innerWidth - el.offsetWidth;
        const maxY = window.innerHeight - el.offsetHeight;
        const newX = Math.min(Math.max(0, origX + e.clientX - startX), maxX);
        const newY = Math.min(Math.max(0, origY + e.clientY - startY), maxY);
        el.style.setProperty('left', newX + 'px', 'important');
        el.style.setProperty('top', newY + 'px', 'important');
        el.style.setProperty('right', 'auto', 'important');
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    el.querySelector('#add-btn').addEventListener('click', addTodo);
    el.querySelector('#todo-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') addTodo();
    });
    el.querySelector('#clear-btn').addEventListener('click', () => {
        todos = todos.filter(t => !t.done);
        saveTodos();
        renderTodos();
    });

    return el;
}

function saveTodos() {
    chrome.storage.local.set({ todos });
}

function renderTodos() {
    const list = stickyEl.querySelector('#todo-list');
    list.innerHTML = '';

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.done ? ' done' : '');

        const span = document.createElement('span');
        span.textContent = todo.text;
        span.addEventListener('click', () => {
            todos[index].done = !todos[index].done;
            saveTodos();
            renderTodos();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => {
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });

    const remaining = todos.filter(t => !t.done).length;
    stickyEl.querySelector('#item-count').textContent =
        `${remaining} item${remaining !== 1 ? 's' : ''}`;
    stickyEl.querySelector('.footer').style.display = todos.length > 0 ? 'flex' : 'none';
}

function addTodo() {
    const input = stickyEl.querySelector('#todo-input');
    const text = input.value.trim();
    if (!text) return;
    todos.push({ text, done: false });
    input.value = '';
    saveTodos();
    renderTodos();
}

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action !== 'toggle') return;

    if (!stickyEl) {
        stickyEl = createSticky();
        chrome.storage.local.get(['todos'], result => {
            todos = result.todos || [];
            renderTodos();
        });
    } else {
        const hidden = stickyEl.style.display === 'none';
        stickyEl.style.display = hidden ? 'block' : 'none';
    }
});
