
/* ==========================================
   ISHWAR SHAYARI
   Main JavaScript File
   Version: 2.0
========================================== */

let shayariData = [];
let currentShayari = [];
let visibleCount = 30;

const grid = document.getElementById("shayariGrid");
const featuredText = document.getElementById("featuredText");

/* CATEGORY WISE PHOTOS */

const categoryImages = {
    "प्यार": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900",
    "दर्द": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=900",
    "दोस्ती": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900",
    "एटीट्यूड": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900",
    "मोटिवेशन": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900",
    "भक्ति": "https://images.unsplash.com/photo-1604608672516-3a9b8f7a4c4c?w=900",
    "देशभक्ति": "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=900",
    "रात": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900"
};

const defaultImage =
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900";

/* ADD EXTRA CSS */

const extraCSS = document.createElement("style");

extraCSS.textContent = `
.shayari-card {
    overflow: hidden;
    padding: 0 !important;
    border-radius: 20px;
    background: #17152b;
    box-shadow: 0 8px 25px #17152b25;
    transition: transform .3s ease;
}

.shayari-card:hover {
    transform: translateY(-5px);
}

.shayari-photo {
    height: 190px;
    position: relative;
    background-size: cover;
    background-position: center;
}

.shayari-photo::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent, #17152b);
}

.shayari-content {
    padding: 20px;
    color: white;
}

.shayari-card p {
    white-space: pre-line;
    font-size: 19px;
    line-height: 1.9;
    margin: 12px 0;
}

.shayari-card .actions {
    margin-top: 15px;
}

.shayari-card .action-btn {
    font-size: 13px;
}

.load-more-wrap {
    text-align: center;
    margin: 25px 0;
}

.load-more-btn {
    background: linear-gradient(110deg,#ff1684,#8d32df);
    color: white;
    border: 0;
    border-radius: 30px;
    padding: 13px 30px;
    font-size: 16px;
    font-weight: bold;
}

.no-result {
    text-align: center;
    padding: 30px;
    color: #777;
    grid-column: 1 / -1;
}

@media(max-width:700px) {
    .shayari-grid {
        grid-template-columns: repeat(1,1fr) !important;
    }
    .shayari-photo {
        height: 210px;
    }
}
`;

document.head.appendChild(extraCSS);

/* LOAD SHAYARI JSON */

async function loadShayari() {
    try {
        grid.innerHTML = "<p>शायरियाँ लोड हो रही हैं...</p>";

        const response = await fetch("shayari.json");

        if (!response.ok) {
            throw new Error("shayari.json नहीं मिली");
        }

        const data = await response.json();

        if (!data.shayari || !Array.isArray(data.shayari)) {
            throw new Error("JSON का फॉर्मेट सही नहीं है");
        }

        shayariData = data.shayari;
        currentShayari = shayariData;

        renderShayari(currentShayari);

        if (shayariData.length > 0 && featuredText) {
            featuredText.textContent = shayariData[0].text;
        }

        console.log("Ishwar Shayari Loaded:", shayariData.length);

    } catch (error) {
        console.error(error);

        grid.innerHTML = `
            <div class="no-result">
                <h3>शायरियाँ लोड नहीं हो सकीं!</h3>
                <p>कृपया shayari.json फाइल और उसका JSON फॉर्मेट जाँचें।</p>
            </div>
        `;
    }
}

/* GET PHOTO */

function getCategoryImage(category) {
    return categoryImages[category] || defaultImage;
}

/* RENDER SHAYARI CARDS */

function renderShayari(items, reset = true) {

    if (!grid) return;

    currentShayari = items;

    if (reset) {
        visibleCount = 30;
        grid.innerHTML = "";
    }

    if (!items.length) {
        grid.innerHTML = `
            <div class="no-result">
                <h3>कोई शायरी नहीं मिली 😔</h3>
                <p>दूसरी कैटेगरी या शब्द से खोजें।</p>
            </div>
        `;
        return;
    }

    const start = reset ? 0 : grid.children.length;
    const end = Math.min(start + 30, items.length);

    for (let i = start; i < end; i++) {

        const item = items[i];

        const card = document.createElement("article");
        card.className = "shayari-card";

        const photo = document.createElement("div");
        photo.className = "shayari-photo";

        const image = getCategoryImage(item.category);
        photo.style.backgroundImage = `url("${image}")`;

        const content = document.createElement("div");
        content.className = "shayari-content";

        const category = document.createElement("div");
        category.className = "small-category";
        category.textContent = (item.category || "शायरी") + " शायरी";

        const p = document.createElement("p");
        p.textContent = item.text || "";

        const actions = document.createElement("div");
        actions.className = "actions";

        const copy = createButton("▣ कॉपी");
        copy.onclick = () => copyText(item.text);

        const share = createButton("↗ शेयर");
        share.onclick = () => shareText(item.text);

        const download = createButton("↓ इमेज डाउनलोड");
        download.onclick = () => downloadQuote(
            item.text,
            item.category
        );

        actions.append(copy, share, download);

        content.append(category, p, actions);
        card.append(photo, content);

        grid.appendChild(card);
    }

    updateLoadMoreButton();
}

/* BUTTON CREATOR */

function createButton(label) {
    const button = document.createElement("button");
    button.className = "action-btn";
    button.textContent = label;
    return button;
}

/* LOAD MORE BUTTON */

function updateLoadMoreButton() {

    let oldButton = document.getElementById("loadMoreWrap");

    if (oldButton) oldButton.remove();

    if (grid.children.length >= currentShayari.length) return;

    const wrap = document.createElement("div");
    wrap.className = "load-more-wrap";
    wrap.id = "loadMoreWrap";

    const button = document.createElement("button");
    button.className = "load-more-btn";
    button.textContent = "और शायरियाँ देखें ↓";

    button.onclick = () => {
        const oldLength = grid.children.length;
        renderShayari(currentShayari, false);

        if (grid.children.length > oldLength) {
            wrap.remove();
        }
    };

    wrap.appendChild(button);
    grid.parentElement.appendChild(wrap);
}

/* CATEGORY FILTER */

function filterCategory(category, button) {

    document.querySelectorAll(".category").forEach(item => {
        item.classList.remove("selected");
    });

    if (button) button.classList.add("selected");

    document.getElementById("listTitle").textContent =
        category + " शायरी";

    const result = shayariData.filter(item =>
        item.category === category
    );

    renderShayari(result);

    scrollToSection("allShayari");
}

/* SHOW ALL SHAYARI */

function showAll() {

    document.querySelectorAll(".category").forEach(item => {
        item.classList.remove("selected");
    });

    document.getElementById("listTitle").textContent =
        "सभी शायरियाँ";

    renderShayari(shayariData);

    scrollToSection("allShayari");
}

/* SEARCH SHAYARI */

function searchShayari() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const query = input.value.trim().toLowerCase();

    if (!query) {
        showAll();
        return;
    }

    const result = shayariData.filter(item => {
        const text = (item.text || "").toLowerCase();
        const category = (item.category || "").toLowerCase();

        return text.includes(query) || category.includes(query);
    });

    document.getElementById("listTitle").textContent =
        "खोज के परिणाम";

    renderShayari(result);

    scrollToSection("allShayari");
}

/* SCROLL */

function scrollToSection(id) {

    const section = document.getElementById(id);

    if (section) {
        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}

function goHome() {
    scrollToSection("home");
}

/* TOAST MESSAGE */

function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.style.display = "block";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.style.display = "none";
    }, 2400);
}

/* COPY SHAYARI */

async function copyText(text) {

    try {
        await navigator.clipboard.writeText(text);
        showToast("शायरी कॉपी हो गई ❤️");

    } catch (error) {

        const textarea = document.createElement("textarea");
        textarea.value = text;

        document.body.appendChild(textarea);
        textarea.select();

        document.execCommand("copy");
        textarea.remove();

        showToast("शायरी कॉपी हो गई ❤️");
    }
}

/* SHARE SHAYARI */

async function shareText(text) {

    const data = {
        title: "Ishwar Shayari",
        text: text + "\n\n— Ishwar Shayari"
    };

    if (navigator.share) {
        try {
            await navigator.share(data);
        } catch (error) {
            console.log("Share cancelled");
        }
    } else {
        await copyText(data.text);
        showToast("शायरी कॉपी हुई, अब शेयर करें");
    }
}

/* DOWNLOAD SHAYARI IMAGE */

function downloadQuote(text, category = "शायरी") {

    const canvas = document.createElement("canvas");

    canvas.width = 1080;
    canvas.height = 1350;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(
        0, 0, 1080, 1350
    );

    gradient.addColorStop(0, "#17152b");
    gradient.addColorStop(0.5, "#51246e");
    gradient.addColorStop(1, "#a52b78");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.strokeStyle = "#ff75b8";
    ctx.lineWidth = 8;
    ctx.strokeRect(35, 35, 1010, 1280);

    ctx.textAlign = "center";

    ctx.fillStyle = "#ff8bc1";
    ctx.font = "bold 65px sans-serif";
    ctx.fillText("Ishwar Shayari", 540, 180);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(category + " शायरी", 540, 280);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px sans-serif";

    const words = text.split(/\s+/);
    const lines = [];
    let line = "";

    words.forEach(word => {
        const test = line ? line + " " + word : word;

        if (ctx.measureText(test).width > 850) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    });

    if (line) lines.push(line);

    const lineHeight = 75;
    const totalHeight = lines.length * lineHeight;
    let y = Math.max(430, (1350 - totalHeight) / 2);

    lines.slice(0, 10).forEach(item => {
        ctx.fillText(item, 540, y, 900);
        y += lineHeight;
    });

    ctx.fillStyle = "#ffb2d5";
    ctx.font = "35px sans-serif";
    ctx.fillText("हर एहसास, अल्फ़ाज़ों में... ❤️", 540, 1190);

    const link = document.createElement("a");

    link.download = "ishwar-shayari.png";
    link.href = canvas.toDataURL("image/png");

    link.click();

    showToast("शायरी इमेज डाउनलोड हो गई ❤️");
}

/* SHAYARI DESIGNER */

function openDesigner() {

    const text = prompt("अपनी शायरी लिखें:");

    if (text && text.trim()) {
        downloadQuote(text.trim());
    }
}

/* SEARCH ENTER KEY */

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            searchShayari();
        }
    });
}

/* START WEBSITE */

loadShayari();

