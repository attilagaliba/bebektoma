// Oyun elemanlarını seçelim
const game = document.getElementById('game');
const character = document.getElementById('character');
const obstacles = document.getElementById('obstacles');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

// Debug modu
const DEBUG_MODE = true; // Geliştirme sırasında true, yayınlamadan önce false yapın

// Oyun durumu
let isJumping = false;
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem('tomaHighScore') || 0;
let animationId = null;
let obstacleGenerationInterval = null;
let gameSpeed = 15;
let obstacleTypes = ['gasbomb', 'bariyer', 'devilToma'];
let minObstacleInterval = 500; // Minimum engel üretme aralığı (500ms'ye düşürüldü)
let maxObstacleInterval = 2500; // Maximum engel üretme aralığı
let lastScoreTime = 0; // Zaman bazlı puan için son zaman
let lastObstacleType = null; // Son üretilen engel tipi
let activeObstacleCount = 0; // Ekranda aktif olan engel sayısı
let canGenerateCloseObstacle = false; // Yakın engel üretme izni
let debugElements = []; // Debug için oluşturulan elemanları takip etme

// Karakteri zıplatma fonksiyonu
function jump() {
    if (isJumping || isGameOver) return;
    
    isJumping = true;
    character.classList.add('jumping');
    
    setTimeout(() => {
        character.classList.remove('jumping');
        isJumping = false;
    }, 850); // Animasyon süresini aynı tutuyoruz (CSS'de değiştirildi)
}

// Oyunu başlatma fonksiyonu
function startGame() {
    isGameOver = false;
    score = 0;
    gameSpeed = 15;
    scoreDisplay.textContent = score;
    gameOverScreen.classList.add('hide');
    lastScoreTime = Date.now(); // Puanlama için zamanı başlat
    activeObstacleCount = 0; // Aktif engel sayısını sıfırla
    
    // Arka plan hızını ayarla
    updateBackgroundSpeed();
    
    // Tüm engelleri temizle
    const allObstacles = document.querySelectorAll('.obstacle');
    allObstacles.forEach(obstacle => obstacle.remove());
    
    // Engel üretme interval'ını temizle ve yeniden başlat
    if (obstacleGenerationInterval) {
        clearInterval(obstacleGenerationInterval);
    }
    
    // İlk engeli üret
    generateObstacle();
    
    // Sonraki engelleri rastgele aralıklarla üret
    scheduleNextObstacle();
    
    // Animasyon döngüsünü başlat
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    gameLoop();
    
    // Yüksek skoru göster
    updateHighScore();
}

// Çarpışma kontrolü
function checkCollision(obstacle) {
    // Eğer obstacle'ın boyutları çok küçük veya hiç yoksa çarpışma kontrolü yapma
    // Bu genellikle DOM elemanı doğru yüklenmemişse olur
    const obstacleWidth = obstacle.offsetWidth;
    const obstacleHeight = obstacle.offsetHeight;
    
    if (obstacleWidth < 5 || obstacleHeight < 5) {
        return false;
    }
    
    const characterRect = character.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    
    // Çarpışma algılama hassasiyetini ayarla
    const buffer = 15; // Makul bir tampon bölge
    
    // Karakterin hitbox'ını biraz daralt
    const adjustedCharRect = {
        left: characterRect.left + 15,
        right: characterRect.right - 15,
        top: characterRect.top + 10,
        bottom: characterRect.bottom - 10
    };
    
    // Engelin hitbox'ını biraz daralt
    const adjustedObsRect = {
        left: obstacleRect.left + 5,
        right: obstacleRect.right - 5,
        top: obstacleRect.top + 5,
        bottom: obstacleRect.bottom - 5
    };
    
    // Debug modunda hitbox'ları göster
    if (DEBUG_MODE) {
        // Önce eski debug elemanlarını temizle
        clearDebugElements();
        
        // Karakter hitbox'ını göster
        showHitbox(adjustedCharRect, 'rgba(0, 255, 0, 0.5)');
        
        // Engel hitbox'ını göster
        showHitbox(adjustedObsRect, 'rgba(255, 0, 0, 0.5)');
    }
    
    return !(
        adjustedCharRect.right < adjustedObsRect.left || 
        adjustedCharRect.left > adjustedObsRect.right || 
        adjustedCharRect.bottom < adjustedObsRect.top || 
        adjustedCharRect.top > adjustedObsRect.bottom
    );
}

// Debug elemanlarını temizle
function clearDebugElements() {
    debugElements.forEach(elem => {
        if (elem && elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }
    });
    debugElements = [];
}

// Hitbox'ı görünür hale getir
function showHitbox(rect, color) {
    const hitbox = document.createElement('div');
    hitbox.style.position = 'absolute';
    hitbox.style.left = rect.left + 'px';
    hitbox.style.top = rect.top + 'px';
    hitbox.style.width = (rect.right - rect.left) + 'px';
    hitbox.style.height = (rect.bottom - rect.top) + 'px';
    hitbox.style.backgroundColor = color;
    hitbox.style.zIndex = '100';
    hitbox.style.pointerEvents = 'none'; // Tıklamaları geçir
    
    document.body.appendChild(hitbox);
    debugElements.push(hitbox);
}

// Rastgele engel üretme
function generateObstacle() {
    if (isGameOver) return;
    
    // Maksimum 2 engel kontrolü
    if (activeObstacleCount >= 2) {
        return;
    }
    
    activeObstacleCount++;
    
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    
    // Rastgele engel tipi seç (son üretilenden farklı olması için bir şans ver)
    let obstacleType;
    if (lastObstacleType && Math.random() < 0.7 && !canGenerateCloseObstacle) {
        // %70 şansla son üretilenden farklı bir tip seç (yakın engel değilse)
        do {
            obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        } while (obstacleType === lastObstacleType);
    } else {
        obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    }
    
    obstacle.classList.add(obstacleType);
    lastObstacleType = obstacleType;
    
    // Engeli ekranın dışında başlat
    obstacle.style.right = '0px';
    
    // Engelin görünürlüğünü kontrol et
    setTimeout(() => {
        // Eğer engel boyutları çok küçük veya sıfırsa, stil sorunları olabilir
        if (obstacle.offsetWidth < 5 || obstacle.offsetHeight < 5) {
            console.log("Engel boyutları çok küçük, oyunu yeniden yükleyin!");
        }
    }, 100);
    
    // Engel kaldırıldığında sayacı azalt (event yerine direkt metod)
    obstacle.onremove = function() {
        activeObstacleCount--;
    };
    
    game.appendChild(obstacle);
    
    // Debug - engel oluşturma kontrolü
    console.log("Engel oluşturuldu: " + obstacleType);
}

// Bir sonraki engeli zamanla
function scheduleNextObstacle() {
    if (isGameOver) return;
    
    // Skorla birlikte engel üretme hızını değiştir (oyun zorlaşır)
    const baseInterval = Math.max(
        minObstacleInterval, 
        maxObstacleInterval - (score * 50)
    );
    
    // Yakın engel üretme şansı (%20)
    let interval = baseInterval;
    if (Math.random() < 0.2 && score > 200) {
        // Çok yakın engel
        interval = Math.max(200, minObstacleInterval / 2);
        canGenerateCloseObstacle = true;
    } else {
        // Normal engel
        // Rastgele bir gecikme ekle (300-2000ms)
        // Skorla birlikte üst sınır azalır, böylece oyun zorlaşır
        const maxRandomDelay = Math.max(800, 2000 - (score * 15));
        const minRandomDelay = Math.max(300, 500 - (score * 5));
        interval += Math.random() * (maxRandomDelay - minRandomDelay) + minRandomDelay;
        canGenerateCloseObstacle = false;
    }
    
    setTimeout(() => {
        generateObstacle();
        scheduleNextObstacle();
    }, interval);
}

// Oyun döngüsü
function gameLoop() {
    if (isGameOver) return;
    
    // Zamanla puanlama sistemini güncelle (her saniye 50 puan)
    const currentTime = Date.now();
    if (currentTime - lastScoreTime >= 1000) { // 1 saniye geçtiyse
        score += 50; // Zaman bazlı puan
        scoreDisplay.textContent = score;
        lastScoreTime = currentTime;
        
        // Skorla birlikte oyun hızını artır
        if (score % 200 === 0 && score > 0) {
            gameSpeed += 0.5;
            // Arka plan animasyonunu güncelle
            updateBackgroundSpeed();
        }
    }
    
    // Engelleri hareket ettir
    const obstacleElements = document.querySelectorAll('.obstacle');
    
    obstacleElements.forEach(obstacle => {
        // Eğer right stili henüz set edilmemişse 0 olarak ata
        if (!obstacle.style.right || obstacle.style.right === '') {
            obstacle.style.right = '0px';
        }
        
        const currentPosition = parseInt(obstacle.style.right) || 0;
        const newPosition = currentPosition + gameSpeed;
        
        // Ekrandan çıkan engelleri kaldır
        if (newPosition > window.innerWidth + 100) {
            if (typeof obstacle.onremove === 'function') {
                obstacle.onremove();
            }
            activeObstacleCount--; // Engel kaldırıldığında sayacı azalt
            obstacle.remove();
            score += 10; // Engel atladığında 10 puan ekle
            scoreDisplay.textContent = score;
            console.log("Engel kaldırıldı, yeni engel sayısı: " + activeObstacleCount);
        } else {
            obstacle.style.right = `${newPosition}px`;
            
            // Çarpışma kontrolü
            if (checkCollision(obstacle)) {
                console.log("Çarpışma tespit edildi!");
                gameOver();
                return;
            }
        }
    });
    
    animationId = requestAnimationFrame(gameLoop);
}

// Oyun bitti
function gameOver() {
    isGameOver = true;
    
    // Debug elemanlarını temizle
    if (DEBUG_MODE) {
        clearDebugElements();
    }
    
    // Tüm zamanlanmış görevleri temizle
    if (obstacleGenerationInterval) {
        clearInterval(obstacleGenerationInterval);
    }
    
    // Animasyonu durdur
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Yüksek skoru güncelle
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('tomaHighScore', highScore);
        updateHighScore();
    }
    
    gameOverScreen.classList.remove('hide');
}

// Yüksek skoru güncelle
function updateHighScore() {
    // Eğer yüksek skor göstergesi yoksa oluştur
    let highScoreDisplay = document.getElementById('high-score');
    if (!highScoreDisplay) {
        highScoreDisplay = document.createElement('div');
        highScoreDisplay.id = 'high-score';
        document.querySelector('.game-container').appendChild(highScoreDisplay);
    }
    
    highScoreDisplay.textContent = `EN YÜKSEK: ${highScore}`;
}

// Event listener'ları ekle
document.addEventListener('keydown', event => {
    if ((event.code === 'Space' || event.code === 'ArrowUp') && !isGameOver) {
        jump();
    }
});

game.addEventListener('click', () => {
    if (!isGameOver) {
        jump();
    }
});

restartButton.addEventListener('click', startGame);

// Oyunu başlat
window.addEventListener('load', startGame);

// Arka plan hızını güncelle
function updateBackgroundSpeed() {
    const newDuration = Math.max(3, 10 - (gameSpeed - 5) * 0.3);
    document.getElementById('game').style.animationDuration = `${newDuration}s`;
} 