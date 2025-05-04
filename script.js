// DOM elemanlarını seçme
const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');

// Kaydırma fonksiyonu - header'ı küçültme
window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
        header.style.padding = '10px 0';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.padding = '20px 0';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
});


// Mobil menüyü kapatma - link tıklaması
const navLinks = document.querySelectorAll('nav ul li a');
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Sayfa içi kaydırma animasyonu - görünüm elemanları
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

function revealOnScroll() {
    const elements = document.querySelectorAll('.skill-card, .project-card, .testimonial, .section-title');
    
    for (let i = 0; i < elements.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = elements[i].getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            elements[i].classList.add('fade-in');
        }
    }
}

// Referanslar (Testimonials) slider fonksiyonu
// Bu basit bir versiyon - daha gelişmiş slider için bir kütüphane kullanılabilir
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial');

// Bu fonksiyon, ekranın genişliğini kontrol ederek slider'ı sadece mobil cihazlarda çalıştırır
function setupTestimonialSlider() {
    if (window.innerWidth <= 992 && testimonials.length > 1) {
        // İlk başta tüm referansları gizle, sadece aktif olanı göster
        testimonials.forEach((testimonial, index) => {
            if (index === currentTestimonial) {
                testimonial.style.display = 'block';
            } else {
                testimonial.style.display = 'none';
            }
        });
        
        // Otomatik slider fonksiyonu - her 5 saniyede bir değişir
        setInterval(() => {
            testimonials[currentTestimonial].style.display = 'none';
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].style.display = 'block';
        }, 5000);
    } else {
        // Ekran genişse tüm referansları göster
        testimonials.forEach(testimonial => {
            testimonial.style.display = 'block';
        });
    }
}

// Sayfa yüklendiğinde ve pencere boyutu değiştiğinde slider'ı kontrol et
window.addEventListener('load', setupTestimonialSlider);
window.addEventListener('resize', setupTestimonialSlider);

// Proje filtresi - projeler sayfası için
const filterButtons = document.querySelectorAll('.filter-btn');
const projectItems = document.querySelectorAll('.project-item');

if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Tüm butonlardan active sınıfını kaldır
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Tıklanan butona active sınıfı ekle
            this.classList.add('active');
            
            // Filtre değerini al
            const filterValue = this.getAttribute('data-filter');
            
            // Projeleri filtrele
            projectItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                } else if (item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
                
                // Animasyon için
                setTimeout(() => {
                    item.classList.add('fade-in');
                }, 200);
            });
        });
    });
}

// Type effect - yazı efekti (ana sayfa için)
const typeElement = document.querySelector('.hero h2');
if (typeElement) {
    const text = typeElement.textContent;
    typeElement.textContent = '';
    
    // Her karakteri tek tek yazdır
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            typeElement.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
        }
    }, 100);
}

// Sayfa yukarı kaydırma butonu
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.className = 'scroll-top-btn';
document.body.appendChild(scrollTopBtn);

// Sayfa yukarı kaydırma fonksiyonu
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Sayfa kaydırma butonu görünürlüğü
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

// Portfolyo sayfası için lightbox fonksiyonu
const portfolioImages = document.querySelectorAll('.portfolio-image');
if (portfolioImages.length > 0) {
    portfolioImages.forEach(image => {
        image.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').getAttribute('src');
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="close-lightbox">&times;</span>
                    <img src="${imgSrc}" alt="Portfolyo Resmi">
                </div>
            `;
            document.body.appendChild(lightbox);
            
            // Lightbox'ı kapat
            const closeLightbox = lightbox.querySelector('.close-lightbox');
            closeLightbox.addEventListener('click', () => {
                lightbox.remove();
            });
            
            // Dışarı tıklayarak da kapatabilir
            lightbox.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.remove();
                }
            });
        });
    });
}


// Resim Yükleme ve Yönetim Özellikleri
(function() {
    // DOMContentLoaded olayının zaten dinlenip dinlenmediğini kontrol et
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageUpload);
    } else {
        // Sayfa zaten yüklenmişse doğrudan başlat
        initImageUpload();
    }

    function initImageUpload() {
        // Resim yükleme fonksiyonları
        setupImageUpload();
        
        // Animasyonlar için görünürlük kontrolü
        checkVisibility();
        
        // Scroll olayı zaten dinleniyorsa tekrar eklemememiz gerekiyor
        // Fakat bu basit bir örnek için güvenli bir ekleme yaklaşımı
        window.addEventListener('scroll', checkVisibility);
    }

    // Resim yükleme ve değiştirme işlevselliği
    function setupImageUpload() {
        // Admin paneli kontrolü - Sadece geliştirme modunda görünür olacak
        const isAdmin = localStorage.getItem('adminMode') === 'true';
        
        if (isAdmin) {
            createAdminControls();
        }
        
        // Sayfa içi resimleri kayıtlı olanlarla değiştir
        loadSavedImages();
    }

    // Admin kontrolleri oluşturma
    function createAdminControls() {
        // Daha önce eklenmiş bir panel varsa kaldır
        const existingPanel = document.querySelector('.admin-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        const adminPanel = document.createElement('div');
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <div class="admin-header">
                <h3>Resim Yönetimi</h3>
                <button id="toggleAdmin">Gizle</button>
            </div>
            <div class="admin-controls">
                <button id="addImageButton">Resim Ekle</button>
                <button id="resetImages">Resimleri Sıfırla</button>
            </div>
            <input type="file" id="imageUploader" accept="image/*" style="display:none">
        `;
        
        document.body.appendChild(adminPanel);
        
        // Admin panel kontrolleri
        document.getElementById('toggleAdmin').addEventListener('click', function() {
            const controls = document.querySelector('.admin-controls');
            controls.style.display = controls.style.display === 'none' ? 'flex' : 'none';
            this.textContent = controls.style.display === 'none' ? 'Göster' : 'Gizle';
        });
        
        document.getElementById('addImageButton').addEventListener('click', function() {
            document.getElementById('imageUploader').click();
        });
        
        document.getElementById('imageUploader').addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    selectImageToReplace(event.target.result);
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        document.getElementById('resetImages').addEventListener('click', function() {
            if (confirm('Tüm resimleri sıfırlamak istediğinizden emin misiniz?')) {
                localStorage.removeItem('siteImages');
                location.reload();
            }
        });
        
        // Admin modu CSS
        const adminStyleId = 'admin-image-style';
        if (!document.getElementById(adminStyleId)) {
            const adminStyle = document.createElement('style');
            adminStyle.id = adminStyleId;
            adminStyle.textContent = `
                .admin-panel {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: #fff;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    z-index: 1000;
                    padding: 10px;
                    width: 250px;
                }
                
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                
                .admin-header h3 {
                    margin: 0;
                    font-size: 16px;
                }
                
                .admin-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .admin-controls button {
                    padding: 8px;
                    background-color: #4a89dc;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .admin-panel button {
                    padding: 5px 10px;
                    background-color: #4a89dc;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .admin-panel button:hover {
                    background-color: #3b7dd8;
                }
                
                .image-select-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0,0,0,0.7);
                    z-index: 2000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                
                .image-select-overlay h3 {
                    margin-bottom: 20px;
                }
                
                .image-select-overlay button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                img.selectable {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                img.selectable:hover {
                    outline: 3px solid #4a89dc;
                    transform: scale(1.03);
                }
            `;
            
            document.head.appendChild(adminStyle);
        }
    }

    // Resim değiştirme işlemi için resim seçim paneli
    function selectImageToReplace(newImageSrc) {
        // Varolan overlay'i kaldır
        const existingOverlay = document.querySelector('.image-select-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'image-select-overlay';
        overlay.innerHTML = `
            <h3>Değiştirmek istediğiniz resme tıklayın</h3>
            <button id="cancelImageSelect">İptal</button>
        `;
        
        document.body.appendChild(overlay);
        
        // Sayfadaki tüm resimleri seçilebilir yap
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Placeholder olmayan resimleri seçilebilir yap
            if (!img.src.includes('/api/placeholder/')) {
                return;
            }
            
            img.classList.add('selectable');
            
            const clickHandler = function() {
                // Resmi değiştir
                replaceImage(img.src, newImageSrc);
                
                // Overlay'i kaldır
                overlay.remove();
                
                // Seçilebilir sınıfını kaldır
                images.forEach(i => {
                    i.classList.remove('selectable');
                    i.removeEventListener('click', clickHandler);
                });
            };
            
            img.addEventListener('click', clickHandler);
        });
        
        document.getElementById('cancelImageSelect').addEventListener('click', function() {
            overlay.remove();
            images.forEach(img => img.classList.remove('selectable'));
        });
    }

    // Resim değiştirme ve kaydetme
    function replaceImage(oldSrc, newSrc) {
        // Sayfadaki resmi değiştir
        const images = document.querySelectorAll(`img[src="${oldSrc}"]`);
        images.forEach(img => {
            img.src = newSrc;
        });
        
        // Local storage'a kaydet
        let siteImages = JSON.parse(localStorage.getItem('siteImages') || '{}');
        siteImages[oldSrc] = newSrc;
        localStorage.setItem('siteImages', JSON.stringify(siteImages));
    }

    // Kaydedilmiş resimleri yükle
    function loadSavedImages() {
        const siteImages = JSON.parse(localStorage.getItem('siteImages') || '{}');
        
        // Her kaydedilmiş resim için
        for (const [oldSrc, newSrc] of Object.entries(siteImages)) {
            const images = document.querySelectorAll(`img[src="${oldSrc}"]`);
            images.forEach(img => {
                img.src = newSrc;
            });
        }
    }

    // Admin modunu aç/kapat
    function toggleAdminMode() {
        const isAdmin = localStorage.getItem('adminMode') === 'true';
        localStorage.setItem('adminMode', !isAdmin);
        location.reload();
    }

    // Klavye kısayolu ile admin modunu aç
    function setupAdminShortcut() {
        document.addEventListener('keydown', function(e) {
            // Ctrl + Shift + A tuş kombinasyonu
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                toggleAdminMode();
            }
        });
    }
    setupAdminShortcut();

    // Animasyonlar için görünürlük kontrolü
    function checkVisibility() {
        const elements = document.querySelectorAll('.fade-in, .slide-in, .fade-in-delay');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }
})();