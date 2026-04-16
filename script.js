let tasks = [];
let filter = "all";

function addTask() {
    const input = document.getElementById("taskInput");
    if (input.value === "") return;

    tasks.push({ text: input.value, done: false });
    input.value = "";

    render();
}

function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    render();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    render();
}

function filterTasks(type) {
    filter = type;
    render();
}

function clearCompleted() {
    tasks = tasks.filter(t => !t.done);
    render();
}

function render() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    let filtered = tasks.filter(t => {
        if (filter === "active") return !t.done;
        if (filter === "completed") return t.done;
        return true;
    });

    filtered.forEach((task, index) => {
        const div = document.createElement("div");
        div.className = "task" + (task.done ? " completed" : "");

        div.innerHTML = `
            <span onclick="toggleTask(${index})">${task.text}</span>
            <i onclick="deleteTask(${index})" class="fas fa-trash"></i>
        `;

        list.appendChild(div);
    });

    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const active = total - done;

    document.getElementById("total").innerText = total;
    document.getElementById("active").innerText = active;
    document.getElementById("done").innerText = done;

    let percent = total === 0 ? 0 : Math.round((done / total) * 100);
    document.getElementById("percent").innerText = percent + "%";
    document.getElementById("fill").style.width = percent + "%";
}