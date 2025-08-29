const sidebar = document.querySelector('.sidebar');
const cards = document.querySelectorAll('.card');
const typing = document.getElementById('typing');
const toggle = document.getElementById('language-toggle');
const canvasContainer = document.querySelector(".canvas-container");
const canvasOverlay = document.querySelector(".canvas__overlay");
const contact = document.getElementById('contact');
const currentLang = localStorage.getItem('currentLang') || 'en';
const boxArea = document.querySelector(".box-area");
const boxBtn = document.querySelectorAll(".box-btn");
const modal = document.querySelector(".popup");
const closeBtn = document.querySelector(".popup__close");
const popupText = document.querySelector('.popup__text p');
let typewriterInterval;
let scrollPosition = 0;
let currentid = null;

const urls = [
    "/image/card1.jpg",
    "/image/card2.jpg",
    "/image/card3.mp4",
    "/image/card4.jpg",
    "/image/card5.jpg",
    "/image/card6.jpg",
    "/image/card7.jpg"
];



const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

function showSidebar() {
    sidebar.classList.add('show');
}

function hideSidebar() {
    sidebar.classList.remove('show');
}

function renderBoxes() {
    urls.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("box")
        div.setAttribute('id', index);
        if (item.includes(".mp4")) {
            div.innerHTML = `                    <video autoplay muted loop playsinline>
                        <source src="${item}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="overlay">
                        <button class="box-btn" data-i18n="home.images.btn">Details</button>
                    </div>`;
        } else {
            div.innerHTML = `                    <img src="${item}" alt="card">
                    <div class="overlay">
                        <button class="box-btn" data-i18n="home.images.btn">Details</button>
                    </div>`;
        }

        boxArea.appendChild(div);

    })

    document.querySelectorAll(".box-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            openPopup(e); // pass the click event
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const featureVideo = document.querySelector(".feature .video-background");
    if (!featureVideo) return;


    window.addEventListener("scroll", function () {
        let fromTop = window.scrollY;

        // Zoom effect (scale)
        let scale = 1 + fromTop / 1000; // adjust divisor to taste
        featureVideo.style.transform = `scale(${scale})`;

        // Blur effect
        let blur = Math.min(fromTop / 100, 5); // max 5px blur
        featureVideo.style.filter = `blur(${blur}px)`;

        // Opacity
        let opacity = Math.max(1 - fromTop / 1000, 0.3); // min 0.3 opacity
        featureVideo.style.opacity = opacity;
    });
});

// ---- Browser check + fallback opaque div ----
var isChrome =
    /Chrome/.test(navigator.userAgent) &&
    /Google Inc/.test(navigator.vendor);
var isSafari =
    /Safari/.test(navigator.userAgent) &&
    /Apple Computer/.test(navigator.vendor);

if (!(isChrome || isSafari)) {
    let opaque = document.createElement("div");
    opaque.className = "opaque";
    feature.appendChild(opaque);

    window.addEventListener("scroll", function () {
        let opacity = window.scrollY / 5000;
        opaque.style.opacity = opacity;
    });
}


function typeWriterLoop(text, speed, el) {
    if (!el) return;
    clearTimeout(typewriterInterval);
    let i = 0;
    let deleting = false;

    function type() {
        if (!deleting) {
            el.textContent = text.substring(0, i + 1);
            i++;
            if (i === text.length) {
                deleting = true;
                typewriterInterval = setTimeout(type, 1000); // wait before deleting
                return;
            }
        } else {
            el.textContent = text.substring(0, i - 1);
            i--;
            if (i === 0) {
                deleting = false;
            }
        }
        typewriterInterval = setTimeout(type, speed);
    }

    type();
}

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(observerCallback, options);
observer.observe(canvasOverlay);
observer.observe(canvasContainer);
cards.forEach(card => observer.observe(card));

async function loadTranslations(lang) {
    const res = await fetch("/public/text.json");
    const data = await res.json();

    function getNestedText(obj, path) {
        const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        let text = obj;
        for (let k of keys) {
            if (!text) break;

            if (k === 'info' || k === 'intro') {
                text = text[k][lang];
            }
            else {
                text = text[k];
            }

        }
        // If the result is language-specific, pick the lang
        if (text && typeof text === 'object' && lang in text) {
            text = text[lang];
        }

        return text;
    }

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const path = el.getAttribute("data-i18n");
        const text = getNestedText(data, path);
        if (text) el.textContent = text;
    });

    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // Update typewriter dynamically
    typeWriterLoop(lang === "en" ? 'Our Imaging Services' : 'خدمات التصوير لدينا', 100, typing);
    typeWriterLoop(lang === "en" ? 'Contact & Location' : 'الاتصال والموقع', 100, contact);
}


function switchLanguage(lang) {
    localStorage.setItem('currentLang', lang);
    loadTranslations(localStorage.getItem('currentLang'));
    if (currentid !== null && modal.classList.contains("active")) {
        setPopupText(currentid);
    }

}

async function setPopupText(id) {
    const res = await fetch("/public/text.json");
    const data = await res.json();

    const lang = localStorage.getItem('currentLang') || 'en';
    const content = data.home.images.content["card" + (parseFloat(id) + 1)];

    if (content && content[lang]) {
        popupText.textContent = content[lang];
    } else {
        popupText.textContent = ""; // fallback if missing
    }
}

function openPopup(e) {
    const boxDiv = e.target.closest(".box");
    if (!boxDiv) return;

    const id = boxDiv.getAttribute("id");
    currentid = id;

    // Update popup text for the selected card
    setPopupText(id);

    const url = urls[id];
    const popupMedia = document.querySelector(".popup__media");

    if (url.includes(".mp4")) {
        popupMedia.innerHTML = `
            <video controls autoplay muted playsinline loop>
                <source src="${url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>`;
    } else {
        popupMedia.innerHTML = `
            <img src="${url}" alt="Preview">`;
    }

    // Show modal
    scrollPosition = window.scrollY;
    modal.classList.add("active");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";
}



function closePopup() {
    document.querySelector('.popup').classList.remove('active');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);
    currentid = null;       // Restore scroll position
}

toggle.addEventListener('change', () => {
    switchLanguage(toggle.checked ? 'ar' : 'en');
});

window.addEventListener('load', () => {
    const currentLang = localStorage.getItem('currentLang') || 'en';
    if (currentLang === 'ar') {
        toggle.checked = true;
    } else {
        toggle.checked = false;
    }
});

// Initialize
renderBoxes();
loadTranslations(currentLang);


closeBtn.addEventListener("click", () => {
    closePopup();
});