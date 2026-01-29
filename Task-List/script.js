const inputTask = document.getElementById("taskInput");
const inputDuration = document.getElementById("taskDuration");
const inputDeadline = document.getElementById("taskDeadline");
const list = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");

let allTasks = [];

loadTasks();

if (addBtn) {
  addBtn.addEventListener("click", addNewTask);
}

if (inputTask) {
  inputTask.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addNewTask();
  });
  inputTask.focus();
}

function addNewTask() {
  const text = inputTask.value.trim();
  const duration = inputDuration.value.trim();
  const deadline = inputDeadline.value;

  if (!text) return;

  const newTask = {
    id: Date.now(),
    text: text,
    duration: duration,
    deadline: deadline,
    completed: false
  };

  allTasks.unshift(newTask);

  createTaskElement(newTask, true);
  
  saveToStorage();

  inputTask.value = "";
  inputDuration.value = "";
  inputDeadline.value = "";
  inputTask.focus();
}

function createTaskElement(task, insertAtTop) {
  const li = document.createElement("li");
  li.dataset.id = task.id;

  const label = document.createElement("label");
  label.className = "custom-checkbox";
  
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  
  const checkmark = document.createElement("span");
  checkmark.className = "checkmark";
  
  label.appendChild(checkbox);
  label.appendChild(checkmark);

  const contentDiv = document.createElement("div");
  contentDiv.className = "task-content";
  contentDiv.title = "Doppelklick zum Bearbeiten";
  
  renderTaskContent(contentDiv, task);

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    li.classList.toggle("completed", task.completed);
    
    // NEU: Sortierung im DOM
    if (task.completed) {
      // Wenn erledigt -> Ans Ende der Liste schieben
      list.appendChild(li);
    } else {
      // Wenn wieder offen -> An den Anfang der Liste schieben
      list.insertBefore(li, list.firstChild);
    }
    
    saveToStorage();
  });

  if (task.completed) li.classList.add("completed");

  contentDiv.addEventListener("dblclick", () => {
    enableEditMode(li, task, contentDiv);
  });

  li.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    
    if (e.shiftKey) {
      li.remove();
      
      allTasks = allTasks.filter(t => t.id !== task.id);
      
      saveToStorage();
      
      inputTask.focus();
    } else {
      const originalPlaceholder = inputTask.placeholder;
      inputTask.value = "";
      inputTask.placeholder = "Hold SHIFT + Right Click to delete!";
      
      setTimeout(() => {
        inputTask.placeholder = originalPlaceholder;
      }, 2000);
    }
  });

  li.appendChild(label);
  li.appendChild(contentDiv);

  if (insertAtTop) {
    list.insertBefore(li, list.firstChild);
  } else {
    list.appendChild(li);
  }
}

function renderTaskContent(container, task) {
  let metaHtml = "";
  
  let dateDisplay = "";
  if(task.deadline) {
      const date = new Date(task.deadline);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      dateDisplay = `${day}.${month}. ${time}`;
  }

  if (task.duration) {
    metaHtml += `<span class="meta-item icon-time">${task.duration}</span>`;
  }
  if (dateDisplay) {
    metaHtml += `<span class="meta-item icon-date">${dateDisplay}</span>`;
  }

  container.innerHTML = `
    <div class="task-text">${task.text}</div>
    <div class="task-meta">${metaHtml}</div>
  `;
}

function enableEditMode(li, task, contentDiv) {
  if (li.classList.contains("editing")) return;
  li.classList.add("editing");

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = task.text;

  const editDuration = document.createElement("input");
  editDuration.type = "text";
  editDuration.placeholder = "Dauer";
  editDuration.value = task.duration || "";

  const editDeadline = document.createElement("input");
  editDeadline.type = "datetime-local";
  editDeadline.value = task.deadline || "";
  editDeadline.style.colorScheme = "dark";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Speichern";

  contentDiv.innerHTML = "";
  contentDiv.appendChild(editInput);
  contentDiv.appendChild(editDuration);
  contentDiv.appendChild(editDeadline);
  contentDiv.appendChild(saveBtn);

  editInput.focus();

  const saveAction = () => {
    if (!editInput.value.trim()) return;

    task.text = editInput.value.trim();
    task.duration = editDuration.value.trim();
    task.deadline = editDeadline.value;

    li.classList.remove("editing");
    renderTaskContent(contentDiv, task);
    saveToStorage();
    inputTask.focus();
  };

  saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      saveAction();
  });
  
  editInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveAction();
  });
}

function saveToStorage() {
  localStorage.setItem("modernTasksApp", JSON.stringify(allTasks));
}

function loadTasks() {
  const saved = localStorage.getItem("modernTasksApp");
  if (saved) {
    try {
      allTasks = JSON.parse(saved);

      // NEU: Sortieren -> Erst offene (false=0), dann erledigte (true=1)
      allTasks.sort((a, b) => a.completed - b.completed);

      // Rendern (false bedeutet hier: hinten anhängen)
      allTasks.forEach(t => createTaskElement(t, false));
    } catch (e) {
      console.error("Fehler beim Laden:", e);
      allTasks = [];
    }
  }
}