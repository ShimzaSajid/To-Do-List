// 🌟 Element Selectors
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-button");
const taskList = document.getElementById("task-list");
const filters = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed");
const dueDateInput = document.getElementById("due-date");
const toggleDateBtn = document.getElementById("toggle-date");
const categorySelector = document.getElementById("category-selector");
const dateElement = document.getElementById("today-date");
const taskCount = document.getElementById("task-count");

// 📅 Show Today’s Date
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.textContent = `📅 ${today.toLocaleDateString(undefined, options)}`;

// 📦 Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// 📅 Toggle Due Date Input
toggleDateBtn.addEventListener("click", () => {
  dueDateInput.style.display = dueDateInput.style.display === "none" ? "inline-block" : "none";
});

// ➕ Add Task
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const category = categorySelector.value;

  if (text !== "") {
    const newTask = {
      id: Date.now(),
      text,
      completed: false,
      dueDate: dueDate || null,
      category
    };

    tasks.push(newTask);
    taskInput.value = "";
    dueDateInput.value = "";
    dueDateInput.style.display = "none";
    saveAndRender();
  }
});

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

// 🖼️ Render Tasks
function renderTasks(filter = "all") {
  ["work", "personal", "study"].forEach(cat => {
    document.getElementById(`${cat}-list`).innerHTML = "";
  });

  const filtered = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item${task.completed ? " completed" : ""}`;

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}">
      <span class="task-text">${task.text}</span>
      ${task.dueDate ? `<span class="due-date">📆 ${task.dueDate}</span>` : ""}
      <div class="task-actions">
        <button class="edit-btn" data-id="${task.id}">✏️</button>
        <button onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    `;

    // ✅ Complete Task
    li.querySelector('input[type="checkbox"]').addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      const t = tasks.find(t => t.id === id);
      t.completed = e.target.checked;
      saveAndRender();
    });

    // ✏️ Inline Edit
    li.querySelector(".edit-btn").addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      const taskSpan = li.querySelector(".task-text");

      const input = document.createElement("input");
      input.type = "text";
      input.value = taskSpan.textContent;
      input.className = "editing-input";

      taskSpan.replaceWith(input);
      input.focus();

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          const updatedText = input.value.trim();
          if (updatedText !== "") {
            const t = tasks.find(t => t.id === id);
            t.text = updatedText;
            saveAndRender();
          }
        }
      });
    });

    // 📂 Append to Category
    document.getElementById(`${task.category.toLowerCase()}-list`).appendChild(li);
  });
}

// 🗑️ Delete Task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveAndRender();
}

// 🔄 Save + Render All
function saveAndRender() {
  saveTasks();
  const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
  renderTasks(activeFilter);
  updateTaskCount();
  updateCategoryProgress("work");
  updateCategoryProgress("personal");
  updateCategoryProgress("study");
}

// 🔢 Update Remaining Task Count
function updateTaskCount() {
  const activeTasks = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} remaining`;
}

// 📊 Update Category Progress Circle
function updateCategoryProgress(categoryId) {
  const list = document.getElementById(`${categoryId}-list`);
  const total = list.children.length;
  const completed = Array.from(list.children).filter(li => li.classList.contains('completed')).length;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const circle = document.getElementById(`${categoryId}-progress-circle`);
  const text = document.getElementById(`${categoryId}-progress-text`);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = `${offset}`;
  text.textContent = `${percent}%`;
}

// 🚀 Initialize
saveAndRender();
