const tabs = [
  {
    label: "Set an Alarm",
    content: `<div id="clock" class="clock">00:00:00</div>
        <div class="line"></div>
        <div class="alarm-input-area">
          <div class="time-selectors">
            <input type="number" id="alarmHour" placeholder="HH" min="1" max="24"/>
            <input type="number" id="alarmMinute" placeholder="MM" min="0" max="59"/>
          </div>
          <button id="addAlarmBtn">Add Alarm</button>
        </div>
        <div id="alarmsList" class="alarms-list"></div>
        <div id="ringingInterface">
           <h2>Alarm is Ringing!</h2>
          <button id="snoozeBtn">Snooze (2 min)</button>
          <button id="stopBtn" >Stop</button>
    </div>`,
  },
  {
    label: "Evaluation",
    content: `<div class="rating-container">
        <h1>Rate Our Services </h1>
        <div class="stars" id="star-container">
            <div class="star-layer empty">★★★★★</div>
            <div class="star-layer filled" id="star-filled">★★★★★</div>
        </div>
        <p id="rating-text">Waiting for your Rating</p>
    </div>`,
  },
  {
    label: "Count Characters",
    content: `<div>
        <h3>Count Characters<h3>
        <textarea
          id="text-input"
          placeholder="Type something..."
        ></textarea>
        <p class="counter"><span id="char-count">0</span>/200 characters</p>
        <button id="text-action-btn" type="button">Submit Text</button>
      </div>`,
  },
  {
    label: "New Tab",
      content: `<h3 style="color: white; font-size: 18px; background: #8447FF; text-align: center; padding:10px 0px;">Bytes4Future</h3><input
                 style="width: 50%; display: block; margin: 10px auto; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" type="text" placeholder="Type here..."/>`,
   
  }
];

function buildTabs(containerId, tabData) {
  const container = document.getElementById(containerId);
  const buttonBar = document.createElement("div");
  buttonBar.className = "tab-buttons";

  let activeIndex = 0;

  const panelsWrapper = document.createElement("div");

  const addBtn = document.createElement("button");
  addBtn.className = "add-tab-btn";
  addBtn.textContent = "+";

  function switchTab(nextIndex) {
    activeIndex = Math.max(0, Math.min(nextIndex, tabData.length - 1));

    buttonBar.querySelectorAll(".tab-btn").forEach((btn, index) => {
      btn.classList.toggle("active", index === activeIndex);
    });

    panelsWrapper.querySelectorAll(".tab-panel").forEach((panel, index) => {
      panel.classList.toggle("active", index === activeIndex);
    });
  }

  function renderTabs() {
    buttonBar.querySelectorAll(".tab-btn").forEach((btn) => btn.remove());
    panelsWrapper.innerHTML = "";

    tabData.forEach((tab, index) => {
      const btn = document.createElement("button");
      btn.className = "tab-btn" + (index === activeIndex ? " active" : "");
      btn.innerHTML = `
        <span class="tab-label">${tab.label}</span>
        <span class="tab-close" data-close-tab="true" aria-label="Close tab" title="Close tab">×</span>
      `;

      btn.addEventListener("click", (event) => {
        if (event.target && event.target.closest("[data-close-tab='true']")) {
          event.stopPropagation();
          closeTab(index);
          return;
        }

        switchTab(index);
      });

      buttonBar.insertBefore(btn, addBtn);

      const panel = document.createElement("div");
      panel.className = "tab-panel" + (index === activeIndex ? " active" : "");
      panel.innerHTML = tab.content;
      panelsWrapper.appendChild(panel);
    });
  }

  function closeTab(indexToRemove) {
    if (tabData.length === 1) {
      return;
    }

    tabData.splice(indexToRemove, 1);

    if (activeIndex === indexToRemove) {
      activeIndex = Math.min(indexToRemove, tabData.length - 1);
    } else if (activeIndex > indexToRemove) {
      activeIndex -= 1;
    }

    renderTabs();
  }

 

  buttonBar.appendChild(addBtn);
  container.appendChild(buttonBar);
  container.appendChild(panelsWrapper);

  renderTabs();
}

buildTabs("myTabs", tabs);

const commentContainer = document.querySelector(".comment-container");
const textarea = document.getElementById("text-input");
const charCount = document.getElementById("char-count");
const countText = document.querySelector(".counter");
const textActionBtn = document.getElementById("text-action-btn");
const maxCharacters = 200;

function updateCharacterCounter() {
  const length = textarea.value.length;
  charCount.textContent = length;
  countText.classList.toggle("counter-over-limit", length > maxCharacters);
  textActionBtn.disabled = length > maxCharacters;
}

textarea.addEventListener("input", updateCharacterCounter);
updateCharacterCounter();

let alarms = [];
const alarmSound = document.getElementById("alarmSound");
let currentRingingAlarmId = null;

const updateClock = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");

  document.querySelectorAll(".clock").forEach((clockElement) => {
    clockElement.textContent = `${h}:${m}:${s}`;
  });

  alarms.forEach((alarm) => {
    if (alarm.active && alarm.time === `${h}:${m}` && s === "00") {
      ringAlarm(alarm.id);
    }
  });
};

const hourInput = document.getElementById("alarmHour");
const minInput = document.getElementById("alarmMinute");

// Pad on blur (when user leaves the field)
hourInput.addEventListener("blur", () => {
  if (hourInput.value) {
    hourInput.value = String(parseInt(hourInput.value)).padStart(2, "0");
  }
});

minInput.addEventListener("blur", () => {
  if (minInput.value) {
    minInput.value = String(parseInt(minInput.value)).padStart(2, "0");
  }
});

document.getElementById("addAlarmBtn").addEventListener("click", () => {
  const hrVal = parseInt(hourInput.value);
  const minVal = parseInt(minInput.value);

  if (
    !hourInput.value ||
    !minInput.value ||
    hrVal < 1 ||
    hrVal > 24 ||
    minVal < 0 ||
    minVal > 59
  ) {
    alert("Please enter valid time!");
    return;
  }

  const hr = String(hrVal).padStart(2, "0");
  const min = String(minVal).padStart(2, "0");
  const formattedTime = `${hr}:${min}`;

  const isDuplicate = alarms.some((alarm) => alarm.time === formattedTime);
  if (isDuplicate) {
    alert(`An alarm for ${formattedTime} already exists!`);
    return;
  }

  const newAlarm = {
    id: Date.now(),
    time: `${hr}:${min}`,
    active: true,
  };

  alarms.push(newAlarm);
  renderAlarms();
});

function renderAlarms() {
  const list = document.getElementById("alarmsList");
  list.innerHTML = "";

  alarms.forEach((alarm) => {
    const item = document.createElement("div");
    item.className = "alarm-item";
    item.innerHTML = `
            <div class="alarm-info">${alarm.time}</div>
            <div class="alarm-controls">
                <label class="switch">
                    <input type="checkbox" ${alarm.active ? "checked" : ""} onchange="toggleAlarm(${alarm.id})">
                    <span class="slider"></span>
                </label>
                <button class="delete-btn" onclick="deleteAlarm(${alarm.id})">🗑️</button>
            </div>
        `;
    list.appendChild(item);
  });
}

window.toggleAlarm = (id) => {
  const alarm = alarms.find((a) => a.id === id);
  if (alarm) alarm.active = !alarm.active;
};

window.deleteAlarm = (id) => {
  alarms = alarms.filter((a) => a.id !== id);
  renderAlarms();
};

function ringAlarm(id) {
  currentRingingAlarmId = id;
  alarmSound.currentTime = 0;
  alarmSound.play().catch(() => {});
  const ringUI = document.getElementById("ringingInterface");
  if (ringUI) ringUI.style.display = "block";
}

const snoozeButton = document.getElementById("snoozeBtn");
if (snoozeButton) {
  snoozeButton.onclick = () => {
    alarmSound.pause();
    const ringUI = document.getElementById("ringingInterface");
    if (ringUI) ringUI.style.display = "none";

    const alarm = alarms.find((a) => a.id === currentRingingAlarmId);
    if (alarm) {
      let [h, m] = alarm.time.split(":").map(Number);
      m += 2;
      if (m >= 60) {
        m -= 60;
        h = (h + 1) % 24;
      }
      alarm.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      renderAlarms();
      alert("Snoozed for 2 minutes!");
    }
  };
}

const stopButton = document.getElementById("stopBtn");
if (stopButton) {
  stopButton.onclick = () => {
    alarmSound.pause();
    const ringUI = document.getElementById("ringingInterface");
    if (ringUI) ringUI.style.display = "none";
    const alarm = alarms.find((a) => a.id === currentRingingAlarmId);
    if (alarm) alarm.active = false;
    renderAlarms();
  };
}

window.toggleAlarm = (id) => {
  const alarm = alarms.find((a) => a.id === id);
  if (alarm) alarm.active = !alarm.active;
};

window.deleteAlarm = (id) => {
  alarms = alarms.filter((a) => a.id !== id);
  renderAlarms();
};

updateClock();
setInterval(updateClock, 1000);

const container = document.getElementById("star-container");
const filledStars = document.getElementById("star-filled");
const ratingText = document.getElementById("rating-text");

let currentRating = 0; // القيمة المثبتة

// دالة لتحديد النص بناءً على عدد النجوم
const updateLabel = (starsCount) => {
  if (starsCount <= 1.5) return "bad";
  if (starsCount <= 3.5) return "good";
  return "excelent";
};

// عند تحريك الماوس فوق النجوم
container.addEventListener("mousemove", (e) => {
  const rect = container.getBoundingClientRect();
  let x = e.clientX - rect.left; // المسافة من بداية النجوم اليسرى

  // حساب النسبة المئوية
  let widthPercent = (x / rect.width) * 100;

  // Hard Mode: التقريب لأقرب نصف نجمة (كل 10%)
  let snapPercent = Math.ceil(widthPercent / 10) * 10;

  // التأكد أن النسبة لا تخرج عن حدود 0-100
  snapPercent = Math.max(0, Math.min(100, snapPercent));

  filledStars.style.width = `${snapPercent}%`;
});

// عند خروج الماوس، نعود للقيمة التي تم النقر عليها سابقاً
container.addEventListener("mouseleave", () => {
  filledStars.style.width = `${currentRating}%`;
});

// عند النقر لتثبيت التقييم
container.addEventListener("click", (e) => {
  const rect = container.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let widthPercent = (x / rect.width) * 100;

  // تثبيت القيمة
  currentRating = Math.ceil(widthPercent / 10) * 10;
  filledStars.style.width = `${currentRating}%`;

  // حساب القيمة من 5 لعرضها كصنف
  const finalValue = (currentRating / 100) * 5;
  ratingText.innerText = `Your Rating ${finalValue} - ${updateLabel(finalValue)}`;
});
