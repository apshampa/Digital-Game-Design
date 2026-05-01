// --- GAME DATA ---
const caseData = {
  narration: "The call came in at 02:17.\nNo panic. No screams. Just a voice- calm, precise- reporting a dead man like it was a misplaced briefcase.\nBy the time the police arrived, the rain had already begun its quiet work. Washing the edges. Softening the truth.\nThe victim lay in his study, a glass of whiskey untouched beside him. No signs of struggle. No forced entry. No reason to suspect anything but a quiet death.\nExcept for one thing.\nThe clock on the wall had stopped.\nNot broken. Not out of battery.\nStopped... deliberately.\nAnd the person who reported the body?\nThey claimed they hadn't been inside the room.",
  evidence: [
    {
      id: "ev1", title: "Stopped Wall Clock", description: "Analog clock in study stopped at 11:12 PM. Mechanism manually jammed.", isCorrect: true,
      image: "assets/images/Case1_Evidence41_Clock.png",
      questions: [
        { text: "Funny thing about that clock... it stopped right when he died. Almost like someone wanted that moment remembered.", correct: true, penalty: false, response: "I... I don't know. Maybe it broke? These old clocks...." },
        { text: "Was that clock something valuable or meaningful to either of you?", correct: false, penalty: true, response: "It was a gift. I never really cared for it." },
        { text: "Did Arjun ever take responsibility for maintaining things like that?", correct: false, penalty: true, response: "He liked fixing things. Sometimes." },
        { text: "Do you have something against clocks, or was there any particular reason this one stood out to you?", correct: false, penalty: true, response: "What? No. That’s ridiculous." }
      ]
    },
    {
      id: "ev2", title: "Poison Delivery Absence", description: "No poison detected in whiskey bottle or glass.", isCorrect: true,
      image: "assets/images/Case1_Evidence2_Poison.png",
      questions: [
        { text: "If the poison wasn't in the drink... how did it get into his system?", correct: true, penalty: false, response: "I-I wouldn't know. Maybe food? He eats late." },
        { text: "Would you say he had a regular habit of drinking at night, or was it something he only did occasionally?", correct: false, penalty: true, response: "Occasionally. Nothing excessive." },
        { text: "Was that particular whiskey something he preferred and chose often, or was it just randomly available?", correct: false, penalty: true, response: "Yes... I think so." },
        { text: "Did you want to sell that whiskey?", correct: false, penalty: true, response: "No." }
      ]
    },
    {
      id: "ev3", title: "Residue on Kitchen Counter", description: "Trace toxin residue found near sink area, not in study.", isCorrect: true,
      image: "assets/images/Evidence 3 - Trace recidue.png",
      questions: [
        { text: "The toxin wasn't introduced in the study... It started in the kitchen. So how did it reach him?", correct: true, penalty: false, response: "...I ...I..don't know how it got on the counter near the sink." },
        { text: "Do you usually ignore if the kitchen is cleaned properly?", correct: false, penalty: true, response: "Yes." },
        { text: "Were you present in the kitchen at any point during that night, even briefly?", correct: false, penalty: true, response: "Uhhh....I..I was making myself a late night snack." },
        { text: "You cook with chemicals now?", correct: false, penalty: true, response: "...No." }
      ]
    },
    {
      id: "ev4", title: "Security Door Log", description: "Entry recorded at 22:30 PM.", isCorrect: true,
      image: "assets/images/Evidence 4 - Security door log.png",
      questions: [
        { text: "You got home at 10:30... but he died nearly an hour later. What happened in between?", correct: true, penalty: false, response: "I stayed in my room. I didn't see him." },
        { text: "Was the system working properly?", correct: false, penalty: true, response: "Yes." },
        { text: "Is coming home around that time something you do regularly,?", correct: false, penalty: true, response: "Sometimes." },
        { text: "Did you happen to notice anyone else entering or leaving the house around that same time?", correct: false, penalty: true, response: "No." }
      ]
    },
    {
      id: "ev5", title: "Forensic Timing Window", description: "Death estimated between 22:45-23:15.", isCorrect: true,
      image: "assets/images/Evidence 5 - Forensic report.png",
      questions: [
        { text: "So you were in the house when he was poisoned.", correct: true, penalty: false, response: "...Yes. But I didn't do anything." },
        { text: "Do you think there's any possibility that the forensic timing might not be completely accurate?", correct: false, penalty: true, response: "I'm not a forensic expert." },
        { text: "Was he alive when you came home?", correct: false, penalty: true, response: "I didn't check." },
        { text: "Is it normal for you to ignore your husband and not interact with him for such long periods?", correct: false, penalty: true, response: "...Excuse me?" }
      ]
    },
    {
      id: "ev6", title: "Absence of Fingerprints", description: "Only victim's prints on glass.", isCorrect: true,
      image: "assets/images/case 1 evidence 2 whiskey bottle.png",
      questions: [
        { text: "You never touched the glass... but you still served him that drink, didn't you?", correct: true, penalty: false, response: "I told you! I did not serve him that whiskey or the ice!" },
        { text: "Do you usually serve him drinks yourself, or does he prefer to handle that on his own?", correct: false, penalty: true, response: "Sometimes." },
        { text: "Was the glass recently cleaned or handled by someone else before he used it?", correct: false, penalty: true, response: "I don't know." },
        { text: "Was it common for him to sit alone and drink without any interaction?", correct: false, penalty: true, response: "Yes." }
      ]
    },
    {
      id: "ev7", title: "Study Door Condition", description: "Closed and locked. A key was found in the suspect's robe.", isCorrect: true,
      image: "assets/images/Case1_Evidence7_Closed door log.png",
      questions: [
        { text: "You locked the door after poisoning him... to delay discovery.", correct: true, penalty: false, response: "...No. That's not true, I don't have the spare key." },
        { text: "Was the study door usually kept closed, or was that something unusual?", correct: false, penalty: true, response: "Sometimes." },
        { text: "Was the locking mechanism something you both used regularly?", correct: false, penalty: true, response: "Yes." },
        { text: "Do you generally prefer keeping doors locked around the house for any particular reason?", correct: false, penalty: true, response: "What kind of question is that?" }
      ]
    },
    {
      id: "ev8", title: "Torn Magazine Page", description: "Interior design page ripped.", isCorrect: false,
      image: "assets/images/Case1_Evidence1_torn magazine.png",
      questions: [
        { text: "Were you working on something related to this page, or planning any changes based on it recently?", correct: false, penalty: true, response: "I don't really remember... it was just a page." },
        { text: "Did this page or the idea in it ever lead to any kind of disagreement between you both?", correct: false, penalty: true, response: "No. It's just a magazine." },
        { text: "Can you clearly recall why this specific page might have been torn out?", correct: false, penalty: true, response: "No idea." }
      ]
    },
    {
      id: "ev9", title: "Kitchen Knife Set", description: "One knife slightly out of alignment.", isCorrect: false,
      image: "assets/images/Case1_Evidence2_knife set.png",
      questions: [
        { text: "Did anything about the placement of this knife seem unusual to you when you first noticed it?", correct: false, penalty: true, response: "No." },
        { text: "Do you usually handle or rearrange the knives yourself while cooking?", correct: false, penalty: true, response: "Yes, I suppose." },
        { text: "Was there anything missing or slightly out of place in the set when you looked at it?", correct: false, penalty: true, response: "No." }
      ]
    },
    {
      id: "ev10", title: "Neighbor Complaint", description: "Previous argument reported.", isCorrect: false,
      image: "assets/images/Case1_Evidence3_NEIGHBOR COMPLAINT.png",
      questions: [
        { text: "Would you say arguments between you two were frequent?", correct: false, penalty: true, response: "Like any couple." },
        { text: "Did any of those arguments ever escalate beyond what you would consider normal?", correct: false, penalty: true, response: "No." },
        { text: "Do you think the neighbors might have misunderstood or exaggerated what they heard?", correct: false, penalty: true, response: "Yes." }
      ]
    },
    {
      id: "ev11", title: "Client Meeting Calendar Entry", description: "Confirms the victim had someone in his office earlier.", isCorrect: false,
      image: "assets/images/Case1_Evidence3_Phone activity.png",
      questions: [
        { text: "Do you know how that meeting earlier in the day went, or what it was about?", correct: false, penalty: true, response: "I don't keep track of his clients." },
        { text: "Were you aware of who he was supposed to meet that day?", correct: false, penalty: true, response: "Not really." },
        { text: "Did anything about his schedule that day seem unusual or different to you?", correct: false, penalty: true, response: "It was a normal day." }
      ]
    },
    {
      id: "ev12", title: "Broken Vase", description: "Found in hallway.", isCorrect: false,
      image: "assets/images/Case1_Evidence5_Broken vase.png",
      questions: [
        { text: "Do you remember when you first noticed that the vase was broken?", correct: false, penalty: true, response: "Maybe." },
        { text: "Did anything around it suggest that there had been some kind of disturbance?", correct: false, penalty: true, response: "No." },
        { text: "Do you have any idea at all how it might have ended up in that condition?", correct: false, penalty: true, response: "I don't know." }
      ]
    }
  ]
};

// --- DOM ELEMENTS ---
const titleScreen = document.getElementById("titleScreen");
const titleStartBtn = document.getElementById("titleStartBtn");

const introScreen = document.getElementById("introScreen");
const introText = document.getElementById("introText");
const continueBtn = document.getElementById("continueBtn");

const rulesScreen = document.getElementById("rulesScreen");
const toNarrationBtn = document.getElementById("toNarrationBtn");

const narrationScreen = document.getElementById("narrationScreen");
const narrationText = document.getElementById("narrationText");
const skipNarrationBtn = document.getElementById("skipNarrationBtn");
const startGameBtn = document.getElementById("startGameBtn");

const gameScreen = document.getElementById("gameScreen");
const timerDisplay = document.getElementById("timerDisplay");
const penaltyAlert = document.getElementById("penaltyAlert");
const actionLogs = document.getElementById("actionLogs");
const suspectDialogue = document.getElementById("suspectDialogue");

const evidenceGrid = document.getElementById("evidenceGrid");
const evidenceOverlay = document.getElementById("evidenceOverlay");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const questionsContainer = document.getElementById("questionsContainer");

const finalOverlay = document.getElementById("finalOverlay");
const finalQuestionBtn = document.getElementById("finalQuestionBtn");

const endingScreen = document.getElementById("endingScreen");
const endingContent = document.getElementById("endingContent");

// --- AUDIO ELEMENTS ---
const audioTitle = new Audio("assets/audio/TItle bg music.mp3");
audioTitle.loop = true;
const audioNarrationBg = new Audio("assets/audio/MYSTERY BACKGROUND-dark-mystery-intro-352303.mp3");
audioNarrationBg.loop = true;
const audioMainGame = new Audio("assets/audio/Main game bgm.mp3");
audioMainGame.loop = true;
const audioTypewriter = new Audio("assets/audio/TYPEWRITER.mp3");
audioTypewriter.loop = true;
const audioClock = new Audio("assets/audio/CLOCK TICKING.mp3");
audioClock.loop = true;
const audioClue = new Audio("assets/audio/CLUE_CLICK.mp3");
const audioQuestion = new Audio("assets/audio/QUESTION{_CLICK.mp3");
const audioRight = new Audio("assets/audio/RIGHT QUESTION.mp3");
const audioWrong = new Audio("assets/audio/FUNNY WRONG ANS.mp3");
const audioConfession = new Audio("assets/audio/CONFESSION DONE.mp3");
const audioFail = new Audio("assets/audio/WRONG CONFESSION.mp3");

// --- GAME STATE ---
let timeRemaining = 300; // 5 minutes
let timerInterval = null;
let correctQuestionsAsked = 0;
const correctThreshold = 5; // Need 5/7 to unlock ending
let activeEvidenceId = null;
let isGameOver = false;

// --- INITIALIZATION ---
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

// shuffle questions so correct isn't always first
caseData.evidence.forEach(ev => shuffle(ev.questions));
// shuffle evidence on the board
shuffle(caseData.evidence);

// --- TYPEWRITER EFFECT ---
let typewriterTimeout = null;

function typeWriterEffect(element, text, speed, callback) {
  element.innerHTML = "";
  let i = 0;
  audioTypewriter.play().catch(e => console.log("Audio play prevented by browser:", e));
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
      i++;
      typewriterTimeout = setTimeout(type, speed);
    } else {
      audioTypewriter.pause();
      audioTypewriter.currentTime = 0;
      if (callback) callback();
    }
  }
  type();
}

// --- FLOW CONTROLS ---

// 0. TITLE -> INTRO
titleStartBtn.addEventListener("click", () => {
  titleScreen.style.display = "none";
  introScreen.style.display = "flex";
  
  audioTitle.pause();
  
  if(introText.innerHTML === "") {
    audioNarrationBg.volume = 0.4;
    audioNarrationBg.play().catch(e => console.log("Audio play prevented:", e));
    typeWriterEffect(introText, "Every story breaks.\nIf you press in the right place.\n\nEvery suspect slips.\nIf you let them talk long enough.", 40, () => {
      continueBtn.style.display = "inline-block";
    });
  }
});

continueBtn.addEventListener("click", () => {
  introScreen.style.display = "none";
  rulesScreen.style.display = "flex";
});

// 2. RULES -> NARRATION
toNarrationBtn.addEventListener("click", () => {
  rulesScreen.style.display = "none";
  narrationScreen.style.display = "flex";
  typeWriterEffect(narrationText, caseData.narration, 30, () => {
    startGameBtn.style.display = "inline-block";
    skipNarrationBtn.style.display = "none";
  });
});

skipNarrationBtn.addEventListener("click", () => {
  clearTimeout(typewriterTimeout);
  audioTypewriter.pause();
  audioTypewriter.currentTime = 0;
  startGameBtn.click();
});

// 3. START GAME
startGameBtn.addEventListener("click", () => {
  audioNarrationBg.pause();
  
  // Set initial volumes lower so they can build up later, though audioMainGame remains playing
  audioMainGame.volume = 0.15;
  audioClock.volume = 0.2;
  
  audioMainGame.play().catch(e => console.log(e));
  audioClock.play().catch(e => console.log(e));
  narrationScreen.style.display = "none";
  gameScreen.style.display = "flex";
  initBoard();
  startTimer();
});

// --- TIMER LOGIC ---
function startTimer() {
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      triggerEnding(false, "TIME EXPIRED");
    }
  }, 1000);
}

function updateTimerDisplay() {
  if (timeRemaining < 0) timeRemaining = 0;
  const m = Math.floor(timeRemaining / 60);
  const s = timeRemaining % 60;
  timerDisplay.innerText = `${m}:${s.toString().padStart(2, '0')}`;
  
  if (timeRemaining <= 60) {
    timerDisplay.classList.add("timer-red");
  }
  
  // Dynamically increase sound intensity as time decreases
  // timeRemaining goes from 300 down to 0, so progress goes from 0.0 to 1.0
  const progress = Math.max(0, 1 - (timeRemaining / 300));
  
  // Background music goes from 0.15 up to 0.45 maximum
  audioMainGame.volume = Math.min(0.45, 0.15 + (0.30 * progress));
  
  // Clock ticking goes from 0.2 up to 1.0 maximum, getting much more intense
  audioClock.volume = Math.min(1.0, 0.2 + (0.8 * progress));
}

function applyTimeChange(amount) {
  timeRemaining += amount;
  
  // Show alert dynamically
  penaltyAlert.innerText = amount > 0 ? `+${amount}s` : `${amount}s`;
  penaltyAlert.style.color = amount > 0 ? "#4dff88" : "#ff4d4d";
  
  penaltyAlert.classList.remove("hidden");
  penaltyAlert.style.animation = 'none';
  penaltyAlert.offsetHeight; // trigger reflow
  penaltyAlert.style.animation = null; 
  
  setTimeout(() => penaltyAlert.classList.add("hidden"), 1000);
  updateTimerDisplay();
}

function applyPenalty() {
  applyTimeChange(-15);
}

// --- LOGGING ---
function addLog(message, isCorrect) {
  const li = document.createElement("li");
  li.innerText = message;
  li.className = isCorrect ? "log-correct" : "log-wrong";
  actionLogs.prepend(li); // add to top
}

// --- DIALOGUE ---
function showDialogue(text) {
  suspectDialogue.innerText = `"${text}"`;
  suspectDialogue.classList.remove("hidden");
  setTimeout(() => {
    suspectDialogue.classList.add("hidden");
  }, 4000);
}

// --- BOARD LOGIC ---
function initBoard() {
  caseData.evidence.forEach(ev => {
    const el = document.createElement("div");
    el.className = "evidence-item";
    el.id = `ui-${ev.id}`;
    if (ev.image) {
      el.innerHTML = `<img src="${ev.image}" class="evidence-icon" alt="${ev.title}"/><span class="evidence-title">${ev.title}</span>`;
    } else {
      el.innerHTML = `<span class="evidence-title">${ev.title}</span>`;
    }
    
    el.addEventListener("click", () => openEvidence(ev));
    evidenceGrid.appendChild(el);
  });
}

function openEvidence(ev) {
  activeEvidenceId = ev.id;
  audioClue.currentTime = 0;
  audioClue.play().catch(e=>console.log(e));
  applyPenalty(); // opening costs 15s
  
  modalTitle.innerText = ev.title;
  modalDesc.innerText = ev.description;
  
  const modalImg = document.getElementById("modalImage");
  if (ev.image) {
    modalImg.src = ev.image;
    modalImg.style.display = "block";
  } else {
    modalImg.style.display = "none";
  }
  
  questionsContainer.innerHTML = "";
  ev.questions.forEach(q => {
    const btn = document.createElement("button");
    btn.className = "question-btn";
    btn.innerText = q.text;
    btn.onclick = () => handleQuestionClick(ev, q);
    questionsContainer.appendChild(btn);
  });
  
  evidenceOverlay.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", () => {
  evidenceOverlay.classList.add("hidden");
});

function handleQuestionClick(ev, q) {
  audioQuestion.currentTime = 0;
  audioQuestion.play().catch(e=>console.log(e));
  evidenceOverlay.classList.add("hidden");
  
  const evidenceUI = document.getElementById(`ui-${ev.id}`);
  evidenceUI.classList.add("evidence-used");
  
  if (q.correct) {
    audioRight.currentTime = 0;
    audioRight.play().catch(e=>console.log(e));
    correctQuestionsAsked++;
    applyTimeChange(5); // Grant 5 seconds back
    addLog(`Identified weakness in: ${ev.title}`, true);
    showDialogue(q.response);
    checkProgress();
  } else {
    audioWrong.currentTime = 0;
    audioWrong.play().catch(e=>console.log(e));
    addLog(`Question hit a dead end.`, false);
    showDialogue(q.response);
  }
  
  // Auto-fail: All evidence explored, threshold not met
  const usedEvidenceCount = document.querySelectorAll('.evidence-used').length;
  if (usedEvidenceCount >= caseData.evidence.length && correctQuestionsAsked < correctThreshold) {
    setTimeout(() => {
        triggerEnding(false, "NO MORE LEADS");
    }, 2000);
  }
}

function checkProgress() {
  if (correctQuestionsAsked >= correctThreshold) {
    setTimeout(triggerFinalLockIn, 2000);
  }
}

// --- ENDING LOGIC ---
function triggerFinalLockIn() {
  clearInterval(timerInterval);
  finalOverlay.classList.remove("hidden");
}

finalQuestionBtn.addEventListener("click", () => {
  finalOverlay.classList.add("hidden");
  triggerEnding(true, "CONFESSION SECURED");
});

function triggerEnding(isSuccess, title) {
  if (isGameOver) return;
  isGameOver = true;
  clearInterval(timerInterval);
  
  audioMainGame.pause();
  audioClock.pause();

  if (isSuccess) {
    audioConfession.play().catch(e=>console.log(e));
  } else {
    audioFail.play().catch(e=>console.log(e));
  }
  
  gameScreen.style.display = "none";
  endingScreen.style.display = "flex";
  
  let content = `<h2>${title}</h2>`;
  
  if (isSuccess) {
    content += `
      <p>She exhales first.</p>
      <p>Then everything else follows.</p>
      <p>"I didn't put it in the drink," she says. "He would've noticed."</p>
      <p>A pause.</p>
      <p style="color: #ff4d4d; font-size: 24px;">"It was the ice."</p>
      <p>Silence settles like dust.</p>
      <p>"I came home early. We argued. He poured himself a drink... like always. I had already replaced the ice cubes. They melted fast. No trace."</p>
      <p>Her voice fractures.</p>
      <p>"I stopped the clock after."</p>
      <p style="color: #ff4d4d; font-size: 24px;">"Because it was the moment I was finally free from him...."</p>
    `;
  } else {
    content += `
      <p>The door opens.</p>
      <p>A lawyer steps in, polished, precise, already winning.</p>
      <p>Naina says nothing now. She doesn't have to.</p>
      <p>You watch as the moment slips..... quiet, irreversible.</p>
      <p>The case doesn't close.</p>
      <p>It just... stops.</p>
      <p style="color: #ff4d4d; font-size: 24px;">Like a clock someone chose not to fix.</p>
    `;
  }
  
  endingContent.innerHTML = content;
  
  const actionsSlot = document.querySelector(".ending-actions");
  if (isSuccess) {
    actionsSlot.innerHTML = `<button class="primary-btn" onclick="location.reload()">Next Case</button>`;
  } else {
    actionsSlot.innerHTML = `<button class="primary-btn" onclick="location.reload()">Try Again</button>`;
  }
}

// --- AUTOPLAY HOOK ---
audioTitle.play().catch(e => {
  // If browser blocks autoplay, start it on the first raw click across the document if Title Screen is active
  document.body.addEventListener('click', () => {
    if (titleScreen.style.display !== "none") {
      audioTitle.play().catch(e=>console.log(e));
    }
  }, { once: true });
});