const tasksList = document.getElementById('tasksList');
const newTaskInput = document.getElementById('newTaskInput');
const countLeft = document.getElementById('countLeft');
const clearCompletedBtn = document.getElementById('clearCompleted');
let filter = 'all';

// ---------- Зберігання ----------
function saveTasks() {
  const tasks = Array.from(tasksList.children).map((task) => ({
    id: task.id,
    text: task.querySelector('.task-text').textContent,
    completed: task.getAttribute('aria-checked') === 'true',
  }));
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem('todoTasks') || '[]');
  data.forEach((task) => {
    const element = createTaskElement(task.text, task.id);
    if (task.completed) {
      element.setAttribute('aria-checked', 'true');
      element.querySelector('input[type="checkbox"]').checked = true;
    }
    tasksList.appendChild(element);
  });
  updateCount();
}

// ---------- Створення задач ----------
// function createTaskElement(text, id) {
//   const li = document.createElement('li');
//   li.className = 'task';
//   li.setAttribute('role', 'checkbox');
//   li.setAttribute('aria-checked', 'false');
//   li.setAttribute('tabindex', '0');
//   li.setAttribute('draggable', 'true');
//   li.id = id;

//   const checkbox = document.createElement('input');
//   checkbox.type = 'checkbox';
//   checkbox.className = 'checkbox';

//   const span = document.createElement('span');
//   span.className = 'task-text';
//     span.textContent = text;
    
//     const btn = document.createElement('button');
//     btn.className = 'task-btn';
//     btn.textContent = "Видалити";

    

//   li.append(checkbox, span, btn);

//   checkbox.addEventListener('change', () => {
//     li.setAttribute('aria-checked', checkbox.checked ? 'true' : 'false');
//     updateCount();
//     saveTasks();
//     applyFilter();
//   });

//   li.addEventListener('keydown', (e) => {
//     if (e.key === ' ' || e.key === 'Enter') {
//       e.preventDefault();
//       checkbox.checked = !checkbox.checked;
//       checkbox.dispatchEvent(new Event('change'));
//     }
//   });
//   btn.addEventListener('click', () => {
//     li.remove();
//     updateCount(); // (опціонально) оновлення лічильника
//     saveTasks(); // (опціонально) збереження після видалення
//   });
//   return li;
// }

function createTaskElement(text, id) {
  const li = document.createElement('li');
  li.className = 'task';
  li.setAttribute('role', 'checkbox');
  li.setAttribute('aria-checked', 'false');
  li.setAttribute('tabindex', '0');
  li.setAttribute('draggable', 'true');
  li.id = id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checkbox';
  checkbox.style.display = 'none';

  const custom = document.createElement('span');
  custom.className = 'custom-checkbox';

  const textSpan = document.createElement('span');
  textSpan.className = 'task-text';
  textSpan.textContent = text;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-delete';

  // Додаємо <img> всередину кнопки
  const img = document.createElement('img');
  img.src = './images/icon-cross.svg';
  img.alt = 'Delete';
  img.className = 'delete-icon'; // для стилізації

  deleteBtn.appendChild(img);

  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Щоб не змінювався checked
    li.remove();
    saveTasks();
    updateCount();
  });

  li.append(checkbox, custom, textSpan, deleteBtn);

  li.addEventListener('click', () => {
    checkbox.checked = !checkbox.checked;
    li.setAttribute('aria-checked', checkbox.checked ? 'true' : 'false');
    updateCount();
    saveTasks();
    applyFilter();
  });

  li.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    }
  });

  return li;
}
  
  
  

// ---------- Додавання нової задачі ----------
newTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && newTaskInput.value.trim()) {
    const taskText = newTaskInput.value.trim();
    const id = Date.now().toString();
    const taskElement = createTaskElement(taskText, id);
    tasksList.append(taskElement);
    newTaskInput.value = '';
    updateCount();
    saveTasks();
    applyFilter();
  }
});

// ---------- Drag & Drop ----------
let draggedItem = null;

tasksList.addEventListener('dragstart', (e) => {
  draggedItem = e.target;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', e.target.id);
});

tasksList.addEventListener('dragend', () => {
  draggedItem = null;
  document
    .querySelectorAll('.drag-over')
    .forEach((el) => el.classList.remove('drag-over'));
  saveTasks();
});

tasksList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const target = e.target.closest('.task');
  if (target && target !== draggedItem) {
    target.classList.add('drag-over');
  }
});

tasksList.addEventListener('dragleave', (e) => {
  const target = e.target.closest('.task');
  if (target) {
    target.classList.remove('drag-over');
  }
});

tasksList.addEventListener('drop', (e) => {
  e.preventDefault();
  const target = e.target.closest('.task');
  if (!target || target === draggedItem) return;

  target.classList.remove('drag-over');
  const offset = e.clientY - target.getBoundingClientRect().top;
  const before = offset < target.offsetHeight / 2;

  if (before) {
    tasksList.insertBefore(draggedItem, target);
  } else {
    tasksList.insertBefore(draggedItem, target.nextSibling);
  }

  saveTasks();
});

// ---------- Фільтрація ----------
function applyFilter() {
  const items = tasksList.querySelectorAll('.task');
  items.forEach((task) => {
    const completed = task.getAttribute('aria-checked') === 'true';
    task.classList.remove('hidden');

    if (filter === 'active' && completed) task.classList.add('hidden');
    if (filter === 'completed' && !completed) task.classList.add('hidden');
  });
}

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    filter = button.getAttribute('data-filter');
    applyFilter();
  });
});

// ---------- Підрахунок ----------
function updateCount() {
  const activeCount = Array.from(tasksList.children).filter(
    (task) => task.getAttribute('aria-checked') === 'false'
  ).length;
  countLeft.textContent = `${activeCount} items left`;
}

// ---------- Очистити виконані ----------
clearCompletedBtn.addEventListener('click', () => {
  const tasks = tasksList.querySelectorAll('.task');
  tasks.forEach((task) => {
    if (task.getAttribute('aria-checked') === 'true') {
      task.remove();
    }
  });
  updateCount();
  saveTasks();
});

// Перемикач теми

const toggleBtn = document.getElementById('themeToggle');
const toggleIcon = toggleBtn.querySelector('img');

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    toggleIcon.src = './images/icon-sun.svg';
    toggleIcon.alt = 'Light mode';
  } else {
    toggleIcon.src = './images/icon-moon.svg';
    toggleIcon.alt = 'Dark mode';
  }
}

toggleBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

// При завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
});


// ---------- Ініціалізація ----------
loadTasks();
