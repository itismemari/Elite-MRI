const sidebar = document.querySelector('.sidebar');
const cards = document.querySelectorAll('.card');
const typing = document.getElementById('typing');
const toggle = document.getElementById('language-toggle');
const contact = document.getElementById('contact');
const currentLang = localStorage.getItem('currentLang') || 'en';
let typewriterInterval;

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
    localStorage.setItem('currentLang' , lang);
    loadTranslations(localStorage.getItem('currentLang'));
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
loadTranslations(currentLang);
