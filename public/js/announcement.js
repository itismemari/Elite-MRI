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
