// Popup and confetti helpers
const popup = document.getElementById('popup-message');
const confettiCanvas = document.getElementById('confetti-canvas');

function showPopupMessage(msg) {
    popup.textContent = msg;
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 1800);
}

// Simple confetti animation
function showConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiCanvas.style.display = 'block';
    const colors = ['#fbbfef', '#d72660', '#fbbf24', '#4a90e2', '#27ae60', '#fff0fa'];
    let pieces = Array.from({length: 60}, () => ({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * -confettiCanvas.height,
        r: 6 + Math.random() * 8,
        c: colors[Math.floor(Math.random()*colors.length)],
        s: 2 + Math.random() * 3,
        a: Math.random() * Math.PI * 2
    }));
    let frame = 0;
    function draw() {
        ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
        pieces.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.a);
            ctx.fillStyle = p.c;
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            p.y += p.s;
            p.x += Math.sin(p.a) * 2;
            p.a += 0.02;
        });
        frame++;
        if (frame < 50) requestAnimationFrame(draw);
        else confettiCanvas.style.display = 'none';
    }
    draw();
}
const progressBar = document.getElementById('progress-bar');
const coinCount = document.getElementById('coin-count');

function getCoins() {
    return parseInt(localStorage.getItem('adhd_coins') || '0', 10);
}
function setCoins(n) {
    localStorage.setItem('adhd_coins', n);
    coinCount.textContent = n;
}

function updateProgressAndCoins() {
    const todos = loadTodos();
    const completed = todos.filter(t => t.completed).length;
    const progress = Math.min(completed % 10, 10);
    progressBar.style.width = (progress * 10) + '%';
    // Reward coin for every 10 completed
    let coins = getCoins();
    if (completed > 0 && completed % 10 === 0 && !window._coinGivenFor || window._lastCoinCount !== Math.floor(completed / 10)) {
        coins += 1;
        setCoins(coins);
        window._coinGivenFor = true;
        window._lastCoinCount = Math.floor(completed / 10);
        // Optional: Add a little animation or alert here
        coinCount.style.transform = 'scale(1.3)';
        setTimeout(() => { coinCount.style.transform = ''; }, 400);
    } else if (completed % 10 !== 0) {
        window._coinGivenFor = false;
    }
}

// Simple ADHD To-Do Helper
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoCompleted = document.getElementById('todo-completed');
const todoListIncomplete = document.getElementById('todo-list-incomplete');
const todoListCompleted = document.getElementById('todo-list-completed');
const motivator = document.getElementById('motivator');

const motivators = [
    "Stay focused! You can do it!",
    "One step at a time!",
    "Small wins matter!",
    "Half clean is better than none!",
    "You are making progress!",
    "Take a deep breath and keep going!",
    "Celebrate small achievements!",
    "Break big tasks into small ones!",
    "Rest is productive too!",
    "You are capable!"
];

function showMotivator() {
    motivator.textContent = motivators[Math.floor(Math.random() * motivators.length)];
}

function saveTodos(todos) {
    localStorage.setItem('adhd_todos', JSON.stringify(todos));
}
function loadTodos() {
    return JSON.parse(localStorage.getItem('adhd_todos') || '[]');
}

function renderTodos() {
    const todos = loadTodos();
    todoListIncomplete.innerHTML = '';
    todoListCompleted.innerHTML = '';
    todos.forEach((todo, idx) => {
        const li = document.createElement('li');
        if (!todo.completed) {
            li.innerHTML = `
                <span>${todo.text}</span>
                <span class="todo-actions">
                    <button title="Complete">✔️</button>
                    <button title="Delete">🗑️</button>
                </span>
            `;
            li.querySelector('button[title="Complete"]').onclick = () => {
                todos[idx].completed = true;
                saveTodos(todos);
                renderTodos();
                showMotivator();
                updateProgressAndCoins();
                showPopupMessage('Yay! Task completed! 🎉');
                showConfetti();
            };
            li.querySelector('button[title="Delete"]').onclick = () => {
                todos.splice(idx, 1);
                saveTodos(todos);
                renderTodos();
                showMotivator();
            };
            todoListIncomplete.appendChild(li);
        } else {
            li.innerHTML = `
                <span>${todo.text}</span>
                <span class="todo-actions">
                    <button title="Delete">🗑️</button>
                </span>
            `;
            li.className = 'completed';
            li.querySelector('button[title="Delete"]').onclick = () => {
                todos.splice(idx, 1);
                saveTodos(todos);
                renderTodos();
                showMotivator();
            };
            todoListCompleted.appendChild(li);
        }
    });
    // Only update progress bar visually on render
    const todos = loadTodos();
    const completed = todos.filter(t => t.completed).length;
    const progress = Math.min(completed % 10, 10);
    progressBar.style.width = (progress * 10) + '%';
}


todoForm.onsubmit = (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    const completed = todoCompleted.checked;
    const todos = loadTodos();
    todos.push({ text, completed });
    saveTodos(todos);
    todoInput.value = '';
    todoCompleted.checked = false;
    renderTodos();
    showMotivator();
    updateProgressAndCoins();
    showPopupMessage('Task added! ✨');
    showConfetti();
};

// Initial load
setCoins(getCoins());
renderTodos();
showMotivator();
