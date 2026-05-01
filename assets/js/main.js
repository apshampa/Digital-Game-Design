// Game Showcase Data
const games = [
    {
        id: "lumos",
        title: "Lumos",
        description: "A challenging atmospheric game focusing on lighting aesthetics and sensory design.",
        student: "Srinivas Mangipudi, Rheem Sharma, Ahana Biswas",
        pdf: "./assets/docs/FINAL CHANGELOG - Srinivas Mangipudi.pdf",
        path: "./LUMOS GAME/To host/index.html"
    },
    {
        id: "froggy",
        title: "Froggy",
        description: "A classic hop-and-dodge mechanic game built around clear cues and meaningful decision-making under time constraints.",
        student: "Azhaan Shaikh, Shlok, Harshit Shah, Sameeran",
        pdf: "./assets/docs/CHANGELOG - Azhaan Shaikh.md",
        path: "./froggy-main/index.html"
    },
    {
        id: "something-lurks",
        title: "Something Lurks",
        description: "A blind navigation experience where players map a sewer using only sound.",
        student: "Tanishk Karale, Akshat Bachal, Aditya Jhadav",
        pdf: "./assets/docs/Concept Overview - Akshat Bachal.pdf",
        path: "./Something Lurks/index.html"
    },
    {
        id: "memory-basket",
        title: "Memory Basket",
        description: "A memory-based game exploring game mechanics and cognitive challenges.",
        student: "Iqra Hamdule, Tanvi Umbre, Zahabiya Unwalla",
        pdf: "./assets/docs/game design - Iqra Ali Hamdule.pdf",
        path: "./Memory basket/index.html"
    },

    {
        id: "before-the-lawyer",
        title: "Before the Lawyer",
        description: "An interrogation game exploring branching narratives and player choices.",
        student: "Mrudula Tiwaskar, Rahi Waikar, Srushti Gaware, Sejal Patel",
        pdf: "./assets/docs/Digital Game Design - Mrudula Tiwaskar.pdf",
        path: "./Before the Lawyer/index.html"
    },
    {
        id: "logic-is-two",
        title: "Logic is Two",
        description: "A cooperative puzzle game emphasizing dual-character logic and teamwork.",
        student: "Mayank Sahu",
        pdf: "./assets/docs/Game Design UX - Mayank Sahu(1).pdf",
        path: "./Logic is Two/Final game.html"
    },
    {
        id: "queue-up",
        title: "Queue Up",
        description: "A low-stimulation, logic-based puzzle game where players arrange characters in a queue.",
        student: "Akshita Jain",
        pdf: "./assets/docs/digitalgamedesign - Akshita Jain.pdf",
        path: "./queue up/index.html"
    }
];

// Slides Data
const gd1_slides = [];
const gd2_slides = [];

for (let i = 1; i <= 15; i++) {
    gd1_slides.push(`./assets/slides/gd1_page_${String(i).padStart(2, '0')}.png`);
}
for (let i = 1; i <= 13; i++) {
    gd2_slides.push(`./assets/slides/gd2_page_${String(i).padStart(2, '0')}.png`);
}

let currentSlideIndex = 0;
let currentSlideArray = [];

document.addEventListener("DOMContentLoaded", () => {
    initGames();
    initSlides();
});

function initGames() {
    const grid = document.getElementById("games-grid");
    const modal = document.getElementById("game-modal");
    const closeBtn = document.getElementById("close-modal");

    games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card";
        card.innerHTML = `
            <h4>${game.title}</h4>
            <div class="student-name">By ${game.student}</div>
            <p>${game.description}</p>
        `;
        card.addEventListener("click", () => openGame(game));
        grid.appendChild(card);
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        document.getElementById("modal-frame-container").innerHTML = ""; // Clear iframe
    });
}

function openGame(game) {
    const modal = document.getElementById("game-modal");
    document.getElementById("modal-title").innerText = game.title;
    document.getElementById("modal-desc").innerText = game.description;

    // Instead of the game, we show the PDF/MD document in the iframe
    const frameContainer = document.getElementById("modal-frame-container");
    frameContainer.innerHTML = `<iframe src="${game.pdf}" title="${game.title} Document"></iframe>`;

    // The "Play Game" button opens the game path in a new tab
    const modalLink = document.getElementById("modal-link");
    modalLink.href = game.path;

    modal.classList.remove("hidden");
}

function initSlides() {
    const btn1 = document.getElementById("btn-slides-1");
    const btn2 = document.getElementById("btn-slides-2");
    const viewer = document.getElementById("slide-viewer");
    const closeBtn = document.getElementById("close-slides");
    const prevBtn = document.getElementById("prev-slide");
    const nextBtn = document.getElementById("next-slide");

    btn1.addEventListener("click", () => openSlides(gd1_slides));
    btn2.addEventListener("click", () => openSlides(gd2_slides));

    closeBtn.addEventListener("click", () => {
        viewer.classList.add("hidden");
    });

    prevBtn.addEventListener("click", () => {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            renderSlide();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentSlideIndex < currentSlideArray.length - 1) {
            currentSlideIndex++;
            renderSlide();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (!viewer.classList.contains("hidden")) {
            if (e.key === "ArrowRight") {
                if (currentSlideIndex < currentSlideArray.length - 1) {
                    currentSlideIndex++;
                    renderSlide();
                }
            } else if (e.key === "ArrowLeft") {
                if (currentSlideIndex > 0) {
                    currentSlideIndex--;
                    renderSlide();
                }
            } else if (e.key === "Escape") {
                viewer.classList.add("hidden");
            }
        }
    });
}

function openSlides(slideArray) {
    currentSlideArray = slideArray;
    currentSlideIndex = 0;
    document.getElementById("slide-viewer").classList.remove("hidden");
    renderSlide();
}

function renderSlide() {
    const img = document.getElementById("slide-image");
    const counter = document.getElementById("slide-counter");
    const progressBar = document.getElementById("slide-progress");

    img.src = currentSlideArray[currentSlideIndex];
    counter.innerText = `${currentSlideIndex + 1} / ${currentSlideArray.length}`;

    const progressPercent = ((currentSlideIndex + 1) / currentSlideArray.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
}
