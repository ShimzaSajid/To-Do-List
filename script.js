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

function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
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
      <div class="task-item-top">
        <input type="checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}">
        <span class="task-text">${task.text}</span>
      </div>
      <div class="task-item-bottom">
        ${task.dueDate ? `<span class="due-date">📆 ${formatDate(task.dueDate)}</span>` : '<span></span>'}
        <div class="task-actions">
          <button class="edit-btn" data-id="${task.id}">✏️</button>
          <button class="delete-btn" data-id="${task.id}">🗑️</button>
        </div>
      </div>
    `;

    // ✅ Complete Task
    li.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
      const taskToUpdate = tasks.find(t => t.id === task.id);
      if (taskToUpdate) {
        taskToUpdate.completed = e.target.checked;
        saveAndRender();
      }
    });

    // 🗑️ Delete Task
    li.querySelector(".delete-btn").addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveAndRender();
    });

    // ✏️ Inline Edit
   // ✏️ Inline Edit (improved version)
li.querySelector(".edit-btn").addEventListener("click", (e) => {
  const span = li.querySelector(".task-text");
  const input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "editing-input";
  
  span.replaceWith(input);
  input.focus();
  
  const handleEditComplete = () => {
    const newText = input.value.trim();
    if (newText) {
      tasks.find(t => t.id === task.id).text = newText;
      saveAndRender();
    }
  };
  
  const cleanUp = () => {
    input.removeEventListener("blur", handleEditComplete);
    input.removeEventListener("keydown", handleKeydown);
  };
  
  const handleKeydown = (e) => {
    if (e.key === "Enter") {
      handleEditComplete();
      cleanUp();
    }
    if (e.key === "Escape") {
      cleanUp();
      saveAndRender(); // Re-render to show original text
    }
  };
  
  input.addEventListener("blur", handleEditComplete);
  input.addEventListener("keydown", handleKeydown);
});

    document.getElementById(`${task.category.toLowerCase()}-list`).appendChild(li);
  });
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
