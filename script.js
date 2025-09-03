// Storage key
const STORAGE_KEY = "calendar_todo_v1";

// Load & save helpers
function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Elements
const datePicker = document.getElementById("datePicker");
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const selectedDateTitle = document.getElementById("selectedDateTitle");

let data = loadData();
let currentDate = formatDate(new Date());

// Initialize date picker to today
datePicker.value = currentDate;
render();

// Change date when user picks one
datePicker.addEventListener("change", () => {
  currentDate = datePicker.value;
  render();
});

// Add task
addBtn.addEventListener("click", () => {
  if (isLocked(currentDate)) return; // prevent adding if locked
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  if (!data[currentDate]) data[currentDate] = { tasks: [], locked: false };

  data[currentDate].tasks.push({
    id: crypto.randomUUID(),
    text: taskText,
    done: false,
  });

  saveData(data);
  taskInput.value = "";
  render();
});

// Toggle task status
function toggleTask(id) {
  if (isLocked(currentDate)) return;
  const day = data[currentDate];
  if (!day) return;

  const task = day.tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;

  // Lock the day if all tasks are done
  if (day.tasks.length > 0 && day.tasks.every((t) => t.done)) {
    day.locked = true;
  }

  saveData(data);
  render();
}

// Delete task
function deleteTask(id) {
  if (isLocked(currentDate)) return;
  const day = data[currentDate];
  if (!day) return;

  day.tasks = day.tasks.filter((t) => t.id !== id);
  saveData(data);
  render();
}

// Check if a date is locked (past or completed)
function isLocked(date) {
  const today = formatDate(new Date());
  if (date < today) return true; // past dates locked
  return data[date]?.locked || false; // completed days locked
}

// Render UI
function render() {
  const dayData = data[currentDate] || { tasks: [], locked: false };
  const locked = isLocked(currentDate);

  // Update title
  selectedDateTitle.textContent = `Tasks for ${currentDate}${
    locked ? " (Completed - Read Only)" : ""
  }`;

  // Toggle input UI
  taskInput.disabled = locked;
  addBtn.disabled = locked;

  // Build task list
  taskList.innerHTML = "";
  dayData.tasks.forEach((task) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <label>
        <input type="checkbox" ${task.done ? "checked" : ""} ${
      locked ? "disabled" : ""
    } />
        ${task.text}
      </label>
      ${
        locked
          ? ""
          : `<button class="delete-btn" style="margin-left:10px;">Delete</button>`
      }
    `;

    // Toggle task status
    if (!locked) {
      li.querySelector("input").addEventListener("change", () =>
        toggleTask(task.id)
      );
      li.querySelector(".delete-btn").addEventListener("click", () =>
        deleteTask(task.id)
      );
    }

    taskList.appendChild(li);
  });
}
