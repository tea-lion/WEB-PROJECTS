const STORAGE_KEY = "friendship-forest-state-v1";
const moodDefinitions = [
  {
    id: "happy",
    label: "😊 Happy",
    description: "The forest is shining with fresh energy.",
  },
  {
    id: "fun",
    label: "😄 Fun Day",
    description: "Laughter and playfulness bring extra sparkle.",
  },
  {
    id: "celebration",
    label: "🎉 Celebration",
    description: "Golden flowers bloom and the whole scene feels festive.",
  },
  {
    id: "reconciled",
    label: "🤝 Solved a Fight",
    description: "A rainbow appears and new buds emerge.",
  },
  {
    id: "normal",
    label: "😐 Normal",
    description: "The forest stays healthy and steady.",
  },
  {
    id: "sad",
    label: "😢 Sad",
    description: "A few leaves drift down and the sky softens.",
  },
  {
    id: "fight",
    label: "💔 Fight",
    description: "Rain falls and the forest feels worn down.",
  },
  {
    id: "big-fight",
    label: "😡 Big Fight",
    description: "The forest becomes stormy and the branches tremble.",
  },
];

const defaultState = {
  profile: {
    yourName: "You",
    friendName: "Mina",
    startDate: "2023-08-12",
  },
  mood: "happy",
  timeline: [
    {
      id: crypto.randomUUID(),
      type: "start",
      date: "2023-08-12",
      title: "Friendship started",
      text: "The first day of your shared story.",
    },
    {
      id: crypto.randomUUID(),
      type: "mood",
      date: new Date().toISOString().slice(0, 10),
      title: "😊 Happy",
      text: "A bright and joyful day for the forest.",
    },
  ],
  memories: [
    {
      id: crypto.randomUUID(),
      title: "Movie Night",
      date: "2024-03-18",
      text: "Watched your favorite movie together and shared popcorn under blankets.",
    },
  ],
};

let state = loadState();

const profileForm = document.getElementById("profileForm");
const profileYourName = document.getElementById("yourName");
const profileFriendName = document.getElementById("friendName");
const profileStartDate = document.getElementById("startDate");
const moodButtons = document.getElementById("moodButtons");
const moodBadge = document.getElementById("moodBadge");
const moodDescription = document.getElementById("moodDescription");
const timelineList = document.getElementById("timelineList");
const memoryFruits = document.getElementById("memoryFruits");
const memoryForm = document.getElementById("memoryForm");
const memoryModal = document.getElementById("memoryModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalText = document.getElementById("modalText");
const rainLayer = document.getElementById("rainLayer");
const birds = document.getElementById("birds");
const stars = document.getElementById("stars");
const forestLayer = document.getElementById("forestLayer");
const wildlifeLayer = document.getElementById("wildlifeLayer");
const benchButton = document.getElementById("benchButton");
const seasonBadge = document.getElementById("seasonBadge");
const timeBadge = document.getElementById("timeBadge");
const milestoneText = document.getElementById("milestoneText");

init();

function init() {
  populateProfileForm();
  renderMoodButtons();
  renderAll();
  bindEvents();
}

function bindEvents() {
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile = {
      yourName: profileYourName.value.trim() || "You",
      friendName: profileFriendName.value.trim() || "Friend",
      startDate: profileStartDate.value,
    };

    if (!state.timeline.some((entry) => entry.type === "start")) {
      state.timeline.unshift({
        id: crypto.randomUUID(),
        type: "start",
        date: state.profile.startDate,
        title: "Friendship started",
        text: `A new chapter with ${state.profile.friendName}.`,
      });
    } else {
      state.timeline = state.timeline.map((entry) =>
        entry.type === "start"
          ? { ...entry, date: state.profile.startDate, text: `A new chapter with ${state.profile.friendName}.` }
          : entry
      );
    }

    saveState();
    renderAll();
  });

  memoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("memoryTitle").value.trim();
    const date = document.getElementById("memoryDate").value;
    const text = document.getElementById("memoryText").value.trim();

    if (!title || !date || !text) return;

    state.memories.unshift({ id: crypto.randomUUID(), title, date, text });
    state.timeline.unshift({
      id: crypto.randomUUID(),
      type: "memory",
      date,
      title,
      text,
    });

    memoryForm.reset();
    saveState();
    renderAll();
  });

  benchButton.addEventListener("click", () => {
    const memorySummary = state.memories
      .slice(0, 8)
      .map((memory) => `${formatDate(memory.date)} — ${memory.title}: ${memory.text}`)
      .join("\n\n");
    openMemoryModal({
      title: "Bench of memories",
      date: "",
      text: memorySummary || "Plant a memory and it will appear here.",
    });
  });

  closeModal.addEventListener("click", closeMemoryModal);
  memoryModal.addEventListener("click", (event) => {
    if (event.target === memoryModal) closeMemoryModal();
  });
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  } catch (error) {
    console.warn("Could not load state", error);
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function populateProfileForm() {
  profileYourName.value = state.profile.yourName;
  profileFriendName.value = state.profile.friendName;
  profileStartDate.value = state.profile.startDate;
}

function renderAll() {
  renderMetrics();
  renderMoodButtons();
  renderTimeline();
  renderMemories();
  renderScene();
}

function renderMetrics() {
  const { days, months, years } = calculateAge(state.profile.startDate);
  document.getElementById("daysCount").textContent = days;
  document.getElementById("monthsCount").textContent = months;
  document.getElementById("yearsCount").textContent = years;
  document.getElementById("friendshipTitle").textContent = `${state.profile.yourName} + ${state.profile.friendName}`;

  const season = getSeason();
  const timeOfDay = getTimeOfDay();
  seasonBadge.textContent = season.icon + " " + season.label;
  timeBadge.textContent = timeOfDay.icon + " " + timeOfDay.label;
  document.body.dataset.season = season.key;
  document.body.dataset.time = timeOfDay.key;

  const milestone = getMilestone(years);
  milestoneText.textContent = milestone;
}

function renderMoodButtons() {
  moodButtons.innerHTML = "";
  moodDefinitions.forEach((mood) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mood-btn ${state.mood === mood.id ? "active" : ""}`;
    button.textContent = mood.label;
    button.addEventListener("click", () => updateMood(mood.id));
    moodButtons.appendChild(button);
  });

  const activeMood = moodDefinitions.find((mood) => mood.id === state.mood) || moodDefinitions[0];
  moodBadge.textContent = activeMood.label;
  moodDescription.textContent = activeMood.description;
  document.body.dataset.mood = state.mood;
}

function updateMood(moodId) {
  if (state.mood === moodId) return;
  state.mood = moodId;
  state.timeline.unshift({
    id: crypto.randomUUID(),
    type: "mood",
    date: new Date().toISOString().slice(0, 10),
    title: moodDefinitions.find((mood) => mood.id === moodId)?.label || moodId,
    text: moodDefinitions.find((mood) => mood.id === moodId)?.description || "A fresh moment for the forest.",
  });
  saveState();
  renderAll();
}

function renderTimeline() {
  const sorted = [...state.timeline].sort((a, b) => new Date(b.date) - new Date(a.date));
  timelineList.innerHTML = "";
  sorted.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "timeline-item";
    const dateLabel = formatDate(entry.date);
    item.innerHTML = `<strong>${entry.title}</strong><small>${dateLabel}</small><div>${entry.text}</div>`;
    timelineList.appendChild(item);
  });
}

function renderMemories() {
  memoryFruits.innerHTML = "";
  state.memories.forEach((memory) => {
    const card = document.createElement("div");
    card.className = "fruit-btn";

    const mainButton = document.createElement("button");
    mainButton.type = "button";
    mainButton.className = "fruit-btn";
    mainButton.innerHTML = `<strong>${memory.title}</strong><span>${formatDate(memory.date)}</span>`;
    mainButton.addEventListener("click", () => openMemoryModal(memory));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "fruit-delete";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete memory ${memory.title}`);
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteMemory(memory.id);
    });

    card.appendChild(mainButton);
    card.appendChild(deleteButton);
    memoryFruits.appendChild(card);
  });
}

function renderScene() {
  forestLayer.innerHTML = "";
  wildlifeLayer.innerHTML = "";
  rainLayer.innerHTML = "";
  birds.innerHTML = "";
  stars.innerHTML = "";

  const { years, days } = calculateAge(state.profile.startDate);
  const completedYears = Math.max(0, years);
  const activeYearOffset = days % 365 === 0 ? 0 : 1;
  const totalTrees = Math.min(10, completedYears + activeYearOffset + 1);
  const positions = [
    { left: "16%", size: 0.8 },
    { left: "34%", size: 1.05 },
    { left: "50%", size: 1.2 },
    { left: "66%", size: 0.95 },
    { left: "82%", size: 0.9 },
    { left: "24%", size: 0.95 },
    { left: "58%", size: 0.85 },
    { left: "74%", size: 1.1 },
    { left: "40%", size: 0.8 },
    { left: "90%", size: 0.75 },
  ];

  for (let index = 0; index < totalTrees; index += 1) {
    const tree = document.createElement("div");
    tree.className = "forest-tree";
    tree.style.left = positions[index].left;
    tree.style.setProperty("--tree-size", positions[index].size);

    let stage = "seed";
    if (index < completedYears) {
      stage = index >= 5 ? "fruit" : index >= 3 ? "mature" : "young";
    } else if (index === completedYears) {
      stage = getInYearStage(days);
    }

    tree.dataset.stage = stage;
    tree.innerHTML = `
      <div class="tree-trunk"></div>
      <div class="tree-canopy"></div>
      <div class="tree-fruit"></div>
    `;
    forestLayer.appendChild(tree);
  }

  if (state.mood === "celebration") {
    for (let i = 0; i < 8; i += 1) {
      const flower = document.createElement("div");
      flower.className = "wildlife";
      flower.textContent = "🌸";
      flower.style.left = `${10 + i * 10}%`;
      flower.style.top = `${18 + (i % 3) * 12}%`;
      wildlifeLayer.appendChild(flower);
    }
  }

  if (years >= 2) {
    const butterfly = document.createElement("div");
    butterfly.className = "wildlife";
    butterfly.textContent = "🦋";
    butterfly.style.left = "20%";
    butterfly.style.top = "26%";
    wildlifeLayer.appendChild(butterfly);
  }

  if (years >= 3) {
    const bird = document.createElement("div");
    bird.className = "wildlife";
    bird.textContent = "🐦";
    bird.style.left = "78%";
    bird.style.top = "24%";
    wildlifeLayer.appendChild(bird);
  }

  if (years >= 5) {
    const squirrel = document.createElement("div");
    squirrel.className = "wildlife";
    squirrel.textContent = "🐿️";
    squirrel.style.left = "66%";
    squirrel.style.top = "58%";
    wildlifeLayer.appendChild(squirrel);
  }

  if (years >= 10) {
    const owl = document.createElement("div");
    owl.className = "wildlife";
    owl.textContent = "🦉";
    owl.style.left = "84%";
    owl.style.top = "20%";
    wildlifeLayer.appendChild(owl);
  }

  if (state.mood === "fight" || state.mood === "big-fight") {
    for (let i = 0; i < 28; i += 1) {
      const drop = document.createElement("div");
      drop.className = "rain-drop";
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.top = `${Math.random() * -20}%`;
      drop.style.animationDuration = `${0.8 + Math.random() * 0.7}s`;
      drop.style.animationDelay = `${Math.random() * 0.4}s`;
      rainLayer.appendChild(drop);
    }
  }

  if (state.mood === "happy" || state.mood === "celebration" || state.mood === "reconciled") {
    const birdMarkup = [
      { left: "16%", top: "22%", delay: "0s" },
      { left: "72%", top: "28%", delay: "1.4s" },
    ];
    birdMarkup.forEach((bird) => {
      const span = document.createElement("div");
      span.className = "bird";
      span.style.left = bird.left;
      span.style.top = bird.top;
      span.style.animationDelay = bird.delay;
      span.textContent = "🐦";
      birds.appendChild(span);
    });
  }

  if (state.mood === "sad" || state.mood === "fight" || state.mood === "big-fight") {
    for (let i = 0; i < 24; i += 1) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 45}%`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      stars.appendChild(star);
    }
  }
}

function getInYearStage(days) {
  const progress = days % 365;
  if (progress < 90) return "seed";
  if (progress < 180) return "sprout";
  if (progress < 270) return "sapling";
  if (progress < 365) return "young";
  return "fruit";
}

function getMilestone(years) {
  if (years >= 25) return "✨ Legendary forest of 25 years of friendship.";
  if (years >= 10) return "🏡 A golden forest is growing around your memories.";
  if (years >= 5) return "🌿 A little tree house has appeared in the woods.";
  if (years >= 3) return "🦋 Butterflies and birds have arrived.";
  if (years >= 1) return "🌱 A new tree has joined the forest.";
  return "🌱 The first seed of your friendship is growing.";
}

function getSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return { key: "spring", label: "Spring", icon: "🌸" };
  if (month >= 5 && month <= 7) return { key: "summer", label: "Summer", icon: "☀" };
  if (month >= 8 && month <= 10) return { key: "autumn", label: "Autumn", icon: "🍁" };
  return { key: "winter", label: "Winter", icon: "❄" };
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 5) return { key: "night", label: "Night", icon: "🌙" };
  if (hour >= 17) return { key: "evening", label: "Evening", icon: "🌇" };
  return { key: "day", label: "Morning", icon: "☀" };
}

function calculateAge(startDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const now = new Date();
  const diffMs = now - start;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor(days / 30);
  return { days, months, years };
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function deleteMemory(memoryId) {
  state.memories = state.memories.filter((memory) => memory.id !== memoryId);
  state.timeline = state.timeline.filter((entry) => entry.type !== "memory" || entry.title !== state.memories.find((memory) => memory.id === memoryId)?.title);
  saveState();
  renderAll();
}

function openMemoryModal(memory) {
  modalTitle.textContent = memory.title;
  modalDate.textContent = memory.date ? formatDate(memory.date) : "";
  modalText.textContent = memory.text;
  memoryModal.classList.remove("hidden");
  memoryModal.setAttribute("aria-hidden", "false");
}

function closeMemoryModal() {
  memoryModal.classList.add("hidden");
  memoryModal.setAttribute("aria-hidden", "true");
}
