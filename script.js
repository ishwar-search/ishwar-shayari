
"use strict";

/* =========================================
   ISHWAR SHAYARI
   Main JavaScript
   Version 3.0
========================================= */

const $ = id => document.getElementById(id);

let shayariData = [];
let currentItems = [];
let visibleCount = 12;
let currentMode = "all";

/* CATEGORY IMAGES */

const categoryImages = {
    "प्यार": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1000",
    "दर्द": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000",
    "दोस्ती": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000",
    "एटीट्यूड": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000",
    "मोटिवेशन": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000",
    "भक्ति": "https://images.unsplash.com/photo-1604608672516-3a9b8f7a4c4c?w=1000",
    "देशभक्ति": "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1000",
    "रात": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000",
    "प्रकृति": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1000",
    "परिवार": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1000",
    "जिंदगी": "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1000"
};

const defaultImage =
"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000";

/* TOAST MESSAGE */

function toast(message) {
    const box = $("toast");

    if (!box) return;

    box.textContent = message;
    box.style.display = "block";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        box.style.display = "none";
    }, 2500);
}

/* NAVIGATION */

function scrollToId(id) {
    const section = $(id);

    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
}

function goHome() {
    scrollToId("home");
}

function toggleMenu() {
    scrollToId("categories");
}

/* DARK MODE */

function toggleTheme() {
    document.body.classList.toggle("dark");

    try {
        localStorage.setItem(
            "ishwarTheme",
            document.body.classList.contains("dark")
                ? "dark"
                : "light"
        );
    } catch (error) {
        console.log(error);
    }
}

try {
    if (localStorage.getItem("ishwarTheme") === "dark") {
        document.body.classList.add("dark");
    }
} catch (error) {
    console.log(error);
}

/* FAVORITES */

function getFavorites() {
    try {
        return JSON.parse(
            localStorage.getItem("ishwarFavorites") || "[]"
        );
    } catch (error) {
        return [];
    }
}

function isFavorite(id) {
    return getFavorites().includes(String(id));
}

function toggleFavorite(id) {
    let favorites = getFavorites();

    id = String(id);

    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
        toast("पसंदीदा सूची से हटाई गई");
    } else {
        favorites.push(id);
        toast("पसंदीदा शायरी सेव हो गई ❤️");
    }

    try {
        localStorage.setItem(
            "ishwarFavorites",
            JSON.stringify(favorites)
        );
    } catch (error) {
        toast("ब्राउज़र में सेव नहीं हो पाया");
    }

    if (currentMode === "favorites") {
        showFavorites();
    } else {
        renderShayari(currentItems);
    }
}

/* LOAD SHAYARI JSON */

async function loadShayari() {
    const grid = $("shayariGrid");

    try {
        grid.innerHTML =
            '<div class="empty">शायरियाँ लोड हो रही हैं...</div>';

        const response = await fetch("./shayari.json", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error("shayari.json नहीं मिली");
        }

        const data = await response.json();

        const list = Array.isArray(data)
            ? data
            : data.shayari;

        if (!Array.isArray(list)) {
            throw new Error("JSON फॉर्मेट सही नहीं है");
        }

        shayariData = list.map((item, index) => ({
            id: String(item.id ?? index + 1),
            category: String(
                item.category ?? item.type ?? "अन्य"
            ),
            text: String(
                item.text ?? item.content ?? item.shayari ?? ""
            ),
            image: String(item.image ?? "")
        })).filter(item => item.text.trim());

        currentItems = shayariData;
        visibleCount = 12;

        renderShayari(currentItems);

        console.log(
            "Ishwar Shayari Loaded:",
            shayariData.length
        );

    } catch (error) {
        console.error("Shayari Error:", error);

        grid.innerHTML = `
            <div class="empty">
                <h3>शायरियाँ लोड नहीं हो सकीं।</h3>
                <p>shayari.json फाइल और उसका JSON फॉर्मेट जाँचें।</p>
            </div>
        `;
    }
}

/* GET SHAYARI IMAGE */

function getImage(item) {
    return item.image || categoryImages[item.category] || defaultImage;
}

/* CREATE SHAYARI CARD */

function createCard(item) {
    const card = document.createElement("article");
    card.className = "shayari-card";

    /* PHOTO */

    const photo = document.createElement("div");
    photo.className = "shayari-photo";

    photo.style.backgroundImage =
        `url("${getImage(item)}")`;

    /* QUOTE CONTENT */

    const content = document.createElement("div");
    content.className = "quote-content";

    const quote = document.createElement("div");
    quote.className = "quote-mark";
    quote.textContent = "“";

    const text = document.createElement("p");
    text.className = "shayari-text";
    text.textContent = item.text;

    const category = document.createElement("span");
    category.className = "shayari-category";
    category.textContent = item.category;

    content.append(quote, text, category);
    photo.append(content);

    /* ACTIONS */

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const like = document.createElement("button");
    like.className = isFavorite(item.id) ? "saved" : "";
    like.textContent = isFavorite(item.id) ? "♥" : "♡";
    like.title = "पसंद करें";

    like.onclick = () => toggleFavorite(item.id);

    const count = document.createElement("span");
    count.className = "like-count";
    count.textContent = "128";

    const copy = document.createElement("button");
    copy.textContent = "▣";
    copy.title = "कॉपी करें";
    copy.onclick = () => copyText(item.text);

    const share = document.createElement("button");
    share.textContent = "↗";
    share.title = "शेयर करें";
    share.onclick = () => shareText(item.text);

    const download = document.createElement("button");
    download.textContent = "↓";
    download.title = "इमेज डाउनलोड";
    download.onclick = () => downloadImage(item);

    actions.append(
        like,
        count,
        copy,
        share,
        download
    );

    card.append(photo, actions);

    return card;
}

/* DISPLAY SHAYARI */

function renderShayari(items) {
    const grid = $("shayariGrid");

    grid.innerHTML = "";

    if (!items.length) {
        grid.innerHTML = `
            <div class="empty">
                <h3>कोई शायरी नहीं मिली।</h3>
                <p>दूसरे शब्द से खोजने की कोशिश करें।</p>
            </div>
        `;

        $("loadMoreWrap").style.display = "none";
        return;
    }

    const visibleItems = items.slice(0, visibleCount);

    visibleItems.forEach(item => {
        grid.appendChild(createCard(item));
    });

    $("loadMoreWrap").style.display =
        visibleCount < items.length ? "block" : "none";
}

/* LOAD MORE */

function loadMore() {
    visibleCount += 12;
    renderShayari(currentItems);
}

/* SHOW ALL */

function showAll() {
    currentMode = "all";

    document.querySelectorAll(".category").forEach(button => {
        button.classList.remove("active");
    });

    $("listTitle").textContent = "ताज़ा शायरियाँ";

    currentItems = shayariData;
    visibleCount = 12;

    renderShayari(currentItems);
    scrollToId("allShayari");
}

/* CATEGORY FILTER */

function filterCategory(category, button) {
    currentMode = "category";

    document.querySelectorAll(".category").forEach(item => {
        item.classList.remove("active");
    });

    button.classList.add("active");

    $("listTitle").textContent =
        category + " शायरियाँ";

    currentItems = shayariData.filter(item =>
        item.category === category
    );

    visibleCount = 12;

    renderShayari(currentItems);
    scrollToId("allShayari");
}

/* SEARCH */

function searchShayari() {
    const query = $("searchInput")
        .value
        .trim()
        .toLocaleLowerCase("hi");

    currentMode = "search";

    document.querySelectorAll(".category").forEach(item => {
        item.classList.remove("active");
    });

    $("listTitle").textContent = "शायरी खोज परिणाम";

    currentItems = query
        ? shayariData.filter(item =>
            (item.text + " " + item.category)
                .toLocaleLowerCase("hi")
                .includes(query)
        )
        : shayariData;

    visibleCount = 12;

    renderShayari(currentItems);
    scrollToId("allShayari");
}

/* FAVORITES PAGE */

function showFavorites() {
    currentMode = "favorites";

    const favorites = getFavorites();

    currentItems = shayariData.filter(item =>
        favorites.includes(String(item.id))
    );

    $("listTitle").textContent =
        "मेरी पसंदीदा शायरियाँ";

    visibleCount = 12;

    renderShayari(currentItems);
    scrollToId("allShayari");
}

/* COPY SHAYARI */

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        toast("शायरी कॉपी हो गई ❤️");

    } catch (error) {
        const area = document.createElement("textarea");

        area.value = text;
        document.body.appendChild(area);

        area.select();

        document.execCommand("copy");
        area.remove();

        toast("शायरी कॉपी हो गई ❤️");
    }
}

/* SHARE SHAYARI */

async function shareText(text) {
    const data = {
        title: "Ishwar Shayari",
        text: text + "\n\n— Ishwar Shayari",
        url: location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(data);
        } catch (error) {
            console.log("Share cancelled");
        }
    } else {
        copyText(data.text + "\n" + data.url);
    }
}

/* DESIGNER MODAL */

function openDesigner() {
    $("designerModal").classList.add("open");
}

function closeDesigner() {
    $("designerModal").classList.remove("open");
}

/* CREATE SHAYARI IMAGE */

function drawQuote(item, theme) {
    const canvas = $("canvasPreview");
    const ctx = canvas.getContext("2d");

    canvas.width = 1080;
    canvas.height = 1080;

    const themes = {
        orange: ["#382418", "#d66a0b", "#ffe3aa"],
        pink: ["#48102c", "#ce327c", "#ffd0e7"],
        night: ["#071b37", "#16547a", "#9bdcff"],
        sunset: ["#5d214c", "#e66a4c", "#ffdb9b"]
    };

    const colors = themes[theme] || themes.orange;

    const gradient = ctx.createLinearGradient(
        0, 0, 1080, 1080
    );

    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.strokeStyle = colors[2];
    ctx.lineWidth = 5;

    ctx.strokeRect(35, 35, 1010, 1010);
    ctx.strokeRect(53, 53, 974, 974);

    ctx.textAlign = "center";

    ctx.fillStyle = colors[2];
    ctx.font = "bold 60px sans-serif";
    ctx.fillText("Ishwar Shayari", 540, 170);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 43px sans-serif";

    const words = item.text.split(/\s+/);
    const lines = [];
    let line = "";

    words.forEach(word => {
        const test = line ? line + " " + word : word;

        if (ctx.measureText(test).width > 850 && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    });

    if (line) lines.push(line);

    const shownLines = lines.slice(0, 11);
    const lineHeight = 65;

    const start =
        535 - (shownLines.length - 1) * lineHeight / 2;

    shownLines.forEach((value, index) => {
        ctx.fillText(
            value,
            540,
            start + index * lineHeight
        );
    });

    ctx.fillStyle = colors[2];
    ctx.font = "34px sans-serif";

    ctx.fillText(
        "हर एहसास, अल्फ़ाज़ों में... ❤️",
        540,
        900
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "25px sans-serif";
    ctx.fillText("Ishwar Shayari", 540, 970);

    canvas.style.display = "block";

    return canvas;
}

/* DOWNLOAD IMAGE */

function downloadImage(item, theme = "orange") {
    const canvas = drawQuote(item, theme);

    const link = document.createElement("a");

    link.download = "ishwar-shayari-" + item.id + ".png";
    link.href = canvas.toDataURL("image/png");

    link.click();

    toast("शायरी इमेज डाउनलोड हो गई ❤️");
}

/* DESIGNER DOWNLOAD */

function makeDesign() {
    const text = $("designText").value.trim();

    if (!text) {
        toast("पहले शायरी लिखें");
        return;
    }

    const item = {
        id: "custom",
        text: text,
        category: "शायरी"
    };

    downloadImage(item, $("designTheme").value);
}

/* SEARCH ENTER KEY */

$("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchShayari();
    }
});

/* MODAL EVENTS */

$("designerModal").addEventListener("click", event => {
    if (event.target.id === "designerModal") {
        closeDesigner();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeDesigner();
    }
});

/* START WEBSITE */

loadShayari();
