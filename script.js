// Voeg voorbeeldblog toe als er nog geen blogs zijn
document.addEventListener('DOMContentLoaded', function() {
  const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
  if (blogs.length === 0) {
    blogs.push({
      title: 'Welkom bij onze blog!',
      content: 'Dit is een voorbeeld blogpost. Deel hier jouw ervaring, tips of leuke momenten over onze zaak!',
      image: 'img/blogic.png',
      date: new Date().toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })
    });
    localStorage.setItem('blogs', JSON.stringify(blogs));
  }
});
// Blog systeem met popup
document.addEventListener('DOMContentLoaded', function() {
  const blogForm = document.getElementById('blog-form');
  const blogList = document.getElementById('blog-list');
  const blogModal = document.getElementById('blog-modal');
  const openModalBtn = document.getElementById('open-blog-modal');
  const closeModalBtn = document.getElementById('close-blog-modal');

  // Blog post popup
  let blogPostModal = document.getElementById('blog-post-modal');
  if (!blogPostModal) {
    blogPostModal = document.createElement('div');
    blogPostModal.id = 'blog-post-modal';
    blogPostModal.className = 'blog-modal';
    blogPostModal.innerHTML = '<div class="blog-modal-content"><span id="close-blog-post-modal" class="blog-modal-close">&times;</span><div id="blog-post-modal-content"></div></div>';
    document.body.appendChild(blogPostModal);
  }
  const closeBlogPostModalBtn = document.getElementById('close-blog-post-modal');
  const blogPostModalContent = document.getElementById('blog-post-modal-content');

  function getBlogs() {
    return JSON.parse(localStorage.getItem('blogs') || '[]');
  }

  function saveBlogs(blogs) {
    localStorage.setItem('blogs', JSON.stringify(blogs));
  }

  function renderBlogs() {
    const blogs = getBlogs();
    blogList.innerHTML = '';
    const containerWidth = blogList.offsetWidth || 1200;
    const containerHeight = blogList.offsetHeight || 600;
    const minX = 0, minY = 0, maxX = containerWidth - 340, maxY = containerHeight - 180;
    blogs.slice().reverse().forEach((blog, idx) => {
      const post = document.createElement('div');
      post.className = 'blog-post';
      post.tabIndex = 0;
      post.setAttribute('role', 'button');
      post.setAttribute('aria-label', 'Bekijk blogpost');
      post.addEventListener('click', function() {
        showBlogPostModal(blog);
      });
      post.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.key === ' ') showBlogPostModal(blog);
      });
      if (blog.image) {
        const img = document.createElement('img');
        img.src = blog.image;
        img.alt = 'Blog afbeelding';
        post.appendChild(img);
      }
      const title = document.createElement('div');
      title.className = 'blog-post-title';
      title.textContent = blog.title;
      post.appendChild(title);
      const date = document.createElement('div');
      date.className = 'blog-post-date';
      date.textContent = blog.date;
      post.appendChild(date);
      const content = document.createElement('div');
      content.className = 'blog-post-content';
      content.textContent = blog.content;
      post.appendChild(content);
      // Willekeurige positie, laatste blog altijd bovenaan
      if (window.innerWidth > 700) {
        let x = Math.floor(Math.random() * maxX);
        let y = Math.floor(Math.random() * maxY);
        if (idx === 0) { x = containerWidth/2 - 170; y = 40; post.style.zIndex = 10; }
        post.style.left = x + 'px';
        post.style.top = y + 'px';
      }
      blogList.appendChild(post);
    });
  }

  function showBlogPostModal(blog) {
    let html = '';
    if (blog.image) {
      html += `<img src="${blog.image}" alt="Blog afbeelding" style="max-width:100%;border-radius:8px;margin-bottom:12px;">`;
    }
    html += `<div class="blog-post-title" style="font-size:1.3rem;color:#000;margin-bottom:6px;">${blog.title}</div>`;
    html += `<div class="blog-post-date" style="font-size:0.9rem;color:#333;margin-bottom:8px;">${blog.date}</div>`;
    html += `<div class="blog-post-content" style="font-size:1.05rem;color:#000;">${blog.content}</div>`;
    blogPostModalContent.innerHTML = html;
    blogPostModal.classList.add('show');
  }

  openModalBtn.addEventListener('click', function() {
    blogModal.classList.remove('hidden');
    blogModal.classList.add('show');
  });

  closeModalBtn.addEventListener('click', function() {
    blogModal.classList.add('hidden');
    blogModal.classList.remove('show');
  });

  window.addEventListener('click', function(e) {
    if (e.target === blogModal) {
      blogModal.classList.add('hidden');
      blogModal.classList.remove('show');
    }
    if (e.target === blogPostModal) {
      blogPostModal.classList.remove('show');
    }
  });

  closeBlogPostModalBtn.addEventListener('click', function() {
    blogPostModal.classList.remove('show');
  });

  blogForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('blog-title').value.trim();
    const content = document.getElementById('blog-content').value.trim();
    const imageInput = document.getElementById('blog-image');
    const file = imageInput.files[0];

    if (!title || !content) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        addBlog(title, content, evt.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      addBlog(title, content, null);
    }
    blogForm.reset();
    blogModal.classList.remove('show');
  });

  function addBlog(title, content, image) {
    const blogs = getBlogs();
    blogs.push({
      title,
      content,
      image,
      date: new Date().toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })
    });
    saveBlogs(blogs);
    renderBlogs();
  }

  renderBlogs();
});
// 3D BOUM physics animation
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import * as CANNON from 'cannon-es';

window.addEventListener('DOMContentLoaded', () => {
  // ABOUT SLIDESHOW - Center active image, slider controls
  const slideshowTrack = document.querySelector('.about-slideshow-track');
  const slideshowImages = Array.from(document.querySelectorAll('.about-slideshow-image'));
  const leftArrow = document.querySelector('.about-slideshow-arrow-left');
  const rightArrow = document.querySelector('.about-slideshow-arrow-right');
  let currentIndex = Math.floor(slideshowImages.length / 2);

  function centerImage(index) {
    if (!slideshowTrack || slideshowImages.length === 0) return;
    const container = slideshowTrack.parentElement;
    const image = slideshowImages[index];
    if (!image) return;
    // Bereken offset zodat de gekozen afbeelding in het midden staat
    const containerWidth = container.offsetWidth;
    const imageWidth = image.offsetWidth;
    const imageLeft = image.offsetLeft;
    const offset = imageLeft - (containerWidth / 2) + (imageWidth / 2);
    slideshowTrack.style.transform = `translateX(${-offset}px)`;
  }

  function showPrev() {
    currentIndex = Math.max(0, currentIndex - 1);
    centerImage(currentIndex);
  }
  function showNext() {
    currentIndex = Math.min(slideshowImages.length - 1, currentIndex + 1);
    centerImage(currentIndex);
  }
  if (leftArrow) leftArrow.addEventListener('click', showPrev);
  if (rightArrow) rightArrow.addEventListener('click', showNext);

  window.addEventListener('resize', () => centerImage(currentIndex));
  // Initieel centreren
  setTimeout(() => centerImage(currentIndex), 100);
    // Zet 3D BOUM home logo tree terug
    const boumHome = document.getElementById('boum-3d-bg');
    if (boumHome && typeof create3DTitle === 'function') {
      create3DTitle(boumHome, 'BOUM');
    }
  // ...existing code...
  // Forceer de 3D Location titel te centreren en lager te plaatsen
  var loc3d = document.getElementById('location-3d-bg');
  if (loc3d) {
    loc3d.style.position = 'absolute';
    loc3d.style.left = '50%';
    loc3d.style.top = '70px'; // lager zetten
    loc3d.style.transform = 'translateX(-50%)';
    loc3d.style.zIndex = '10';
  }
  var locSection = document.querySelector('.location-section');
  if (locSection) {
    locSection.style.position = 'relative';
  }

  // Refresh sectie om animatie opnieuw te starten bij navbar klik
  ['about-link','menu-link','blog-link','location-link'].forEach(id => {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.hash = this.getAttribute('href');
        window.location.reload();
      });
    }
  });
  // Menu 3D animatie
  const menuContainer = document.getElementById('menu-3d-bg');
  if (menuContainer) {
    create3DTitle(menuContainer, 'Menu');
  }

  // Blog 3D animatie
  const blogContainer = document.getElementById('blog-3d-bg');
  if (blogContainer) {
    create3DTitle(blogContainer, 'Blog');
  }

  // Location 3D animatie pas starten als sectie in beeld komt
  const locationContainer = document.getElementById('location-3d-bg');
  let locationStarted = false;
  if (locationContainer) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !locationStarted) {
          locationStarted = true;
          create3DTitle(locationContainer, 'Location', { startY: 30, groundY: -7 });
        }
      });
    }, { threshold: 0.3 });
    observer.observe(locationContainer);
  }

  // About 3D animatie
  const aboutContainer = document.getElementById('about-3d-bg');
  if (aboutContainer) {
    create3DTitle(aboutContainer, 'About');
  }

  // Universele functie voor 3D titel
  function create3DTitle(container, text) {
    const width = container.offsetWidth || 400;
    const height = container.offsetHeight || 120;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 8, 20);
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5,10,5);
    dir.castShadow = true;
    scene.add(dir);
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = true;
    const groundMat = new CANNON.Material("ground");
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: groundMat
    });
    groundBody.quaternion.setFromEuler(-Math.PI/2, 0, 0);
    world.addBody(groundBody);
    const letterBodies = [];
    const letterMeshes = [];
    let font;
    const letterMaterial = new CANNON.Material("letterMat");
    const contactMat = new CANNON.ContactMaterial(groundMat, letterMaterial, {
      friction: 0.4,
      restitution: 0.3
    });
    world.addContactMaterial(contactMat);
    const loader = new FontLoader();
    loader.load('fonts/Dogbangy_Regular (2).json', f => {
      font = f;
      createLetters(text);
    });
    function createLetters(text) {
      letterBodies.forEach(b => world.removeBody(b));
      letterMeshes.forEach(m => scene.remove(m));
      letterBodies.length = 0;
      letterMeshes.length = 0;
      const size = 3.2;
      const spacing = 3.5;
      const maxX = 260;
      // Opties voor startY en groundY
      const opts = arguments[2] || {};
      const startY = opts.startY !== undefined ? opts.startY : 10;
      const groundY = opts.groundY !== undefined ? opts.groundY : 3;
      [...text].forEach((char, i) => {
        const geo = new TextGeometry(char, {
          font,
          size,
          height: 1,
          bevelEnabled: true,
          bevelThickness: 0.15,
          bevelSize: 0.15
        });
        geo.computeBoundingBox();
        geo.center();
        const mat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.2,
          roughness: 0.4
        });
        const bevelMat = new THREE.MeshStandardMaterial({
          color: 0xFAF2D4,
          metalness: 0.5,
          roughness: 0.3
        });
        const mesh = new THREE.Mesh(geo, [mat, bevelMat]);
        mesh.position.set((i - (text.length-1)/2) * spacing, startY + Math.random()*2, 0);
        mesh.position.x = Math.max(Math.min(mesh.position.x, maxX), -maxX);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        letterMeshes.push(mesh);
        const box = geo.boundingBox;
        const w = box.max.x - box.min.x;
        const h = box.max.y - box.min.y;
        const d = 1;
        const shape = new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2));
        const body = new CANNON.Body({
          mass: 1,
          shape,
          material: letterMaterial,
          position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z)
        });
        // Beperk rotatie zodat ze rechtop blijven
        body.angularDamping = 0.99;
        body.angularVelocity.set(0, 0, 0);
        body.fixedRotation = true;
        body.updateMassProperties();
        world.addBody(body);
        letterBodies.push(body);
      });
      // Zet de grond lager zodat de letters lager eindigen
      groundBody.position.y = groundY;
    }
    const clock = new THREE.Clock();
    function animate(){
      const dt = clock.getDelta();
      world.step(1/60, dt, 3);
      letterMeshes.forEach((m, i) => {
        const b = letterBodies[i];
        m.position.copy(b.position);
        m.quaternion.copy(b.quaternion);
      });
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
      const w = container.offsetWidth || 400;
      const h = container.offsetHeight || 120;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }
  const container = document.getElementById('boum-3d-bg');
  if (!container) return;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.set(0, 8, 20);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));
  // Directional light met bruine schaduw
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5,10,5);
  dir.castShadow = true;
  dir.shadow.mapSize.width = 1024;
  dir.shadow.mapSize.height = 1024;
  dir.shadow.bias = -0.0005;
  dir.shadow.camera.near = 1;
  dir.shadow.camera.far = 50;
  dir.shadow.camera.left = -20;
  dir.shadow.camera.right = 20;
  dir.shadow.camera.top = 20;
  dir.shadow.camera.bottom = -20;
  scene.add(dir);
  // Voeg een bruin vlak toe om schaduw op te vangen
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 20),
    new THREE.ShadowMaterial({ color: 0x421915, opacity: 0.45 })
  );
  shadowPlane.position.y = 0.01;
  shadowPlane.rotation.x = -Math.PI/2;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // Physics
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;

  const groundMat = new CANNON.Material("ground");
  const groundBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: groundMat
  });
  groundBody.quaternion.setFromEuler(-Math.PI/2, 0, 0);
  world.addBody(groundBody);

  const letterBodies = [];
  const letterMeshes = [];
  let font;
  let inEndPose = false;

  const letterMaterial = new CANNON.Material("letterMat");
  const contactMat = new CANNON.ContactMaterial(groundMat, letterMaterial, {
    friction: 0.4,
    restitution: 0.3
  });
  world.addContactMaterial(contactMat);

  const loader = new FontLoader();
  loader.load('fonts/Dogbangy_Regular (2).json', f => {
    font = f;
    createLetters("BOUM");
  }, undefined, err => {
    console.error('Dogbangy font kon niet geladen worden:', err);
    alert('Dogbangy font kon niet geladen worden. Controleer of fonts/Dogbangy.json bestaat.');
  });

  function createLetters(text) {
    letterBodies.forEach(b => world.removeBody(b));
    letterMeshes.forEach(m => scene.remove(m));
    letterBodies.length = 0;
    letterMeshes.length = 0;
    inEndPose = false;

    const size = 3.6;
    const spacing = 4.0;

    [...text].forEach((char, i) => {
      const geo = new TextGeometry(char, {
        font,
        size,
        height: 1,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.15
      });
      geo.computeBoundingBox();
      geo.center();
      // Letter wit
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.2,
        roughness: 0.4
      });
      // Zijkant/bevel licht crème
      const bevelMat = new THREE.MeshStandardMaterial({
        color: 0xFAF2D4,
        metalness: 0.5,
        roughness: 0.3
      });
      const mesh = new THREE.Mesh(geo, [mat, bevelMat]);
      mesh.position.set((i - (text.length-1)/2) * spacing, 12 + Math.random()*2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      letterMeshes.push(mesh);

      const box = geo.boundingBox;
      const w = box.max.x - box.min.x;
      const h = box.max.y - box.min.y;
      const d = 1;
      const shape = new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2));
      const body = new CANNON.Body({
        mass: 1,
        shape,
        material: letterMaterial,
        position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z)
      });
      body.angularVelocity.set(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1);
      body.angularDamping = 0.4;
      world.addBody(body);
      letterBodies.push(body);
    });
  }

  function checkAllSleeping() {
    return letterBodies.every(b => b.sleepState === CANNON.Body.SLEEPING || b.velocity.length() < 0.05);
  }

  function moveToEndPose() {
    inEndPose = true;
    const targetSpacing = 4;
    const baseY = 0.6;
    letterMeshes.forEach((mesh, i) => {
      const targetX = (i - (letterMeshes.length-1)/2) * targetSpacing;
      const targetY = baseY;
      const startPos = mesh.position.clone();
      const startRot = mesh.rotation.clone();
      let t = 0;
      const anim = () => {
        t += 0.03;
        const ease = t < 1 ? (1 - Math.pow(1-t, 3)) : 1;
        mesh.position.lerpVectors(startPos, new THREE.Vector3(targetX, targetY, 0), ease);
        mesh.rotation.y = THREE.MathUtils.lerp(startRot.y, 0, ease);
        mesh.rotation.x = THREE.MathUtils.lerp(startRot.x, 0, ease);
        mesh.rotation.z = THREE.MathUtils.lerp(startRot.z, 0, ease);
        if (ease < 1) requestAnimationFrame(anim);
      };
      anim();
    });
  }

  // Geen click event meer, letters vallen direct bij laden

  const clock = new THREE.Clock();
  function animate(){
    const dt = clock.getDelta();
    world.step(1/60, dt, 3);

    letterMeshes.forEach((m, i) => {
      const b = letterBodies[i];
      m.position.copy(b.position);
      m.quaternion.copy(b.quaternion);
    });

    if (!inEndPose && checkAllSleeping()) {
      moveToEndPose();
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    if (renderer && typeof renderer.setSize === 'function') {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  });
});
// Translations
const translations = {
  en: {
    "nav-home": "Home",
    "nav-about": "About",
    "nav-menu": "Menu",
    "nav-blog": "Blog",
    "nav-location": "Location",
    "home-title": "Welcome to BOUM",
    "about-title": "BOUM",
    "about-text": "Welcome to BOUM — where flavor and style meet in the heart of Diest. With a passion for delicious food, a warm atmosphere and community vibes, we offer more than just a bite — we offer an experience. Whether you're craving comfort food or catching up with friends, BOUM is the place to be.",
    "menu-title": "Menu",
    "blog-title": "Blog",
    "location-title": "Our Location"
  },
  nl: {
    "nav-home": "Start",
    "nav-about": "Over",
    "nav-menu": "Menu",
    "nav-blog": "Blog",
    "nav-location": "Locatie",
    "home-title": "Welkom bij BOUM",
    "about-title": "BOUM",
    "about-text": "Welkom bij BOUM — waar smaak en stijl samenkomen in het hart van Diest. [...]",
    "menu-title": "Menu",
    "blog-title": "Blog",
    "location-title": "Onze locatie"
  },
  fr: {
    "nav-home": "Accueil",
    "nav-about": "À propos",
    "nav-menu": "Carte",
    "nav-blog": "Blog",
    "nav-location": "Emplacement",
    "home-title": "Bienvenue chez BOUM",
    "about-title": "BOUM",
    "about-text": "Bienvenue chez BOUM — où saveur et style se rencontrent au cœur de Diest. [...]",
    "menu-title": "La carte",
    "blog-title": "Blog",
    "location-title": "Notre emplacement"
  }
};

// Hamburger menu
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = document.querySelectorAll('#mobile-menu a');

hamburger.addEventListener("click", () => {
  mobileMenu.classList.toggle("active");
});

// Close mobile menu on link click
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active'); // Close the menu
  });
});

// Language selection
const langSelect = document.getElementById("language-select");
const mobileLangSelect = document.getElementById("mobile-language-select");

function updateLanguage(lang) {
  const elements = document.querySelectorAll("[data-key]");
  elements.forEach(el => {
    const key = el.getAttribute("data-key");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  // Synchronize select dropdowns
  langSelect.value = lang;
  mobileLangSelect.value = lang;
}

langSelect.addEventListener("change", e => updateLanguage(e.target.value));
mobileLangSelect.addEventListener("change", e => updateLanguage(e.target.value));

function animateHomeImage() {
  const img = document.querySelector('.home-image');
  if (img) {
    img.classList.remove('animate-in'); // reset
    void img.offsetWidth;               // force reflow
    img.classList.add('animate-in');    // trigger
  }
}

document.addEventListener("DOMContentLoaded", animateHomeImage);

document.querySelectorAll('a[href="#home"]').forEach(link => {
  link.addEventListener("click", () => {
    animateHomeImage();
  });
});

// Music player
const toggleButton = document.getElementById('music-toggle');
const volumeSlider = document.getElementById('volume-slider');
const music = document.getElementById('background-music');
let isPlaying = true;

// Zet volume slider en audio op 25%

volumeSlider.value = 0.15;
music.volume = 0.15;

// Probeer muziek direct te starten
music.play().then(() => {
  toggleButton.textContent = '🔊';
  isPlaying = true;
});
