// 🌟 Element Selectors
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-button");
const filters = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed");
const dueDateInput = document.getElementById("due-date");
const toggleDateBtn = document.getElementById("toggle-date");
const categorySelector = document.getElementById("category-selector");
const dateElement = document.getElementById("today-date");
const taskCount = document.getElementById("task-count");

// 📅 Show Today's Date
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.textContent = `📅 ${today.toLocaleDateString(undefined, options)}`;

// 📦 Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// 📅 Toggle Due Date Input
toggleDateBtn.addEventListener("click", () => {
  dueDateInput.style.display = dueDateInput.style.display === "none" ? "block" : "none";
  if (dueDateInput.style.display === "block") dueDateInput.focus();
});

// ➕ Add Task
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

function addTask() {
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const category = categorySelector.value;

  if (text === "") return;

  if (tasks.some(t => t.text === text && t.category === category)) {
    alert("This task already exists in this category!");
    return;
  }

  tasks.push({
    id: Date.now(),
    text,
    completed: false,
    dueDate: dueDate || null,
    category
  });

  taskInput.value = "";
  dueDateInput.value = "";
  dueDateInput.style.display = "none";
  saveAndRender();
}

// 🧼 Clear Completed Tasks
clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveAndRender();
});

// 🔍 Filter Buttons
filters.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    renderTasks(btn.dataset.filter);
  });
});

// 💾 Save to LocalStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// 🖼️ Render Tasks
let renderTimeout;
function renderTasks(filter = "all") {
  clearTimeout(renderTimeout);

  const workFragment = document.createDocumentFragment();
  const personalFragment = document.createDocumentFragment();
  const studyFragment = document.createDocumentFragment();

  const workList = document.getElementById("work-list");
  const personalList = document.getElementById("personal-list");
  const studyList = document.getElementById("study-list");

  workList.innerHTML = "";
  personalList.innerHTML = "";
  studyList.innerHTML = "";

  const filtered = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item${task.completed ? " completed" : ""}`;

    const topDiv = document.createElement("div");
    topDiv.className = "task-item-top";
    topDiv.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}">
      <span class="task-text">${task.text}</span>
    `;

    const bottomDiv = document.createElement("div");
    bottomDiv.className = "task-item-bottom";
    bottomDiv.innerHTML = `
      ${task.dueDate ? `<span class="due-date">📆 ${formatDate(task.dueDate)}</span>` : '<span></span>'}
      <div class="task-actions">
        <button class="edit-btn" data-id="${task.id}">✏️</button>
        <button class="delete-btn" data-id="${task.id}">🗑️</button>
      </div>
    `;

    li.appendChild(topDiv);
    li.appendChild(bottomDiv);

    switch(task.category.toLowerCase()) {
      case "work": workFragment.appendChild(li); break;
      case "personal": personalFragment.appendChild(li); break;
      case "study": studyFragment.appendChild(li); break;
    }

    const checkbox = topDiv.querySelector('input[type="checkbox"]');
    const deleteBtn = bottomDiv.querySelector(".delete-btn");
    const editBtn = bottomDiv.querySelector(".edit-btn");

    checkbox.addEventListener("change", (e) => {
      const taskToUpdate = tasks.find(t => t.id === task.id);
      if (taskToUpdate) {
        taskToUpdate.completed = e.target.checked;
        saveAndRender();
      }
    });

    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveAndRender();
    });

    editBtn.addEventListener("click", (e) => {
      const span = topDiv.querySelector(".task-text");
      const input = document.createElement("input");
      input.type = "text";
      input.value = span.textContent;
      input.className = "editing-input";

      span.replaceWith(input);
      input.focus();

      let edited = false;
      const handleEditComplete = () => {
        const newText = input.value.trim();
        if (!newText) return saveAndRender();

        if (tasks.some(t => t.text === newText && t.category === task.category && t.id !== task.id)) {
          alert("Another task with the same name already exists in this category!");
          return saveAndRender();
        }

        const taskToUpdate = tasks.find(t => t.id === task.id);
        if (taskToUpdate) {
          taskToUpdate.text = newText;
          saveAndRender();
        }
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !edited) {
          edited = true;
          handleEditComplete();
        }
      });

      input.addEventListener("blur", () => {
        if (!edited) handleEditComplete();
      });
    });
  });

  renderTimeout = setTimeout(() => {
    workList.appendChild(workFragment);
    personalList.appendChild(personalFragment);
    studyList.appendChild(studyFragment);
    updateCategoryProgress("work");
    updateCategoryProgress("personal");
    updateCategoryProgress("study");
  }, 50);
}

function saveAndRender() {
  saveTasks();
  const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
  renderTasks(activeFilter);
  updateTaskCount();
}

function updateTaskCount() {
  const activeTasks = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} remaining`;
}

function updateCategoryProgress(categoryId) {
  const list = document.getElementById(`${categoryId}-list`);
  const total = list.children.length;
  const completed = Array.from(list.children).filter(li => li.classList.contains('completed')).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const circle = document.getElementById(`${categoryId}-progress-circle`);
  const text = document.getElementById(`${categoryId}-progress-text`);
  const circumference = 2 * Math.PI * 18;

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
  text.textContent = `${percent}%`;
}

function initializeApp() {
  document.getElementById('current-year').textContent = new Date().getFullYear();
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = `📅 ${today.toLocaleDateString(undefined, options)}`;
  saveAndRender();
}

initializeApp();
