// Assetleri kontrol eden script
document.addEventListener('DOMContentLoaded', function() {
    // Kontrol edilecek asset'lerin yolları
    const assetPaths = [
        'assets/toma.png',
        './assets/toma.png',
        '/assets/toma.png',
        'assets/gasbomb.png',
        './assets/gasbomb.png',
        '/assets/gasbomb.png',
        'assets/bariyer.png',
        './assets/bariyer.png',
        '/assets/bariyer.png',
        'assets/devilToma.png',
        './assets/devilToma.png',
        '/assets/devilToma.png',
        'assets/bg.png',
        './assets/bg.png',
        '/assets/bg.png'
    ];

    // Debug paneli oluştur
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.top = '0';
    debugPanel.style.left = '0';
    debugPanel.style.background = 'rgba(0, 0, 0, 0.8)';
    debugPanel.style.color = 'white';
    debugPanel.style.padding = '10px';
    debugPanel.style.zIndex = '10000';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.maxHeight = '100vh';
    debugPanel.style.overflowY = 'auto';
    debugPanel.style.width = '300px';
    
    // Başlık ekle
    const title = document.createElement('h3');
    title.textContent = 'Asset Yükleme Durumu';
    title.style.color = 'white';
    title.style.margin = '0 0 10px 0';
    debugPanel.appendChild(title);
    
    // Kapatma butonu ekle
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Kapat';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.addEventListener('click', function() {
        document.body.removeChild(debugPanel);
    });
    debugPanel.appendChild(closeButton);

    // Sonuçlar için konteyner
    const resultsContainer = document.createElement('div');
    debugPanel.appendChild(resultsContainer);
    
    // Document başlığının üzerine info yaz
    document.title = 'Debug - ' + document.title;
    
    // Path bilgisi
    const pathInfo = document.createElement('p');
    pathInfo.innerHTML = `<strong>Sayfa URL:</strong> ${window.location.href}<br>
                         <strong>Base URL:</strong> ${document.baseURI}`;
    resultsContainer.appendChild(pathInfo);
    
    // Her bir asset'i kontrol et
    assetPaths.forEach(path => {
        const row = document.createElement('div');
        row.style.margin = '5px 0';
        row.style.padding = '5px';
        row.style.borderBottom = '1px solid #333';
        
        const img = new Image();
        img.src = path;
        
        const statusSpan = document.createElement('span');
        statusSpan.textContent = 'Kontrol ediliyor...';
        
        row.innerHTML = `<strong>${path}</strong>: `;
        row.appendChild(statusSpan);
        
        resultsContainer.appendChild(row);
        
        img.onload = function() {
            statusSpan.textContent = 'BAŞARILI ✅';
            statusSpan.style.color = 'lime';
        };
        
        img.onerror = function() {
            statusSpan.textContent = 'BAŞARISIZ ❌';
            statusSpan.style.color = 'red';
        };
    });
    
    // CSS için kontrol
    const cssStatus = document.createElement('div');
    cssStatus.innerHTML = '<strong>CSS Durumu:</strong> ';
    cssStatus.style.margin = '15px 0 5px 0';
    cssStatus.style.fontWeight = 'bold';
    
    const styleSheets = document.styleSheets;
    let hasErrors = false;
    
    for (let i = 0; i < styleSheets.length; i++) {
        try {
            const rules = styleSheets[i].cssRules;
            // Eğer kurallar erişilebilirse, stylesheet düzgün yüklenmiştir
        } catch (e) {
            hasErrors = true;
            cssStatus.innerHTML += `<br>Hata: ${styleSheets[i].href} yüklenemedi`;
        }
    }
    
    if (!hasErrors) {
        cssStatus.innerHTML += '<span style="color: lime;">Tüm CSS dosyaları yüklendi ✅</span>';
    }
    
    resultsContainer.appendChild(cssStatus);
    
    // Debug panelini sayfaya ekle
    document.body.appendChild(debugPanel);
    
    console.log('Debug paneli yüklendi.');
});

// Alternatif yolları dene
function checkAlternativeUrls(originalUrl, results) {
    const alternatives = [
        originalUrl.replace('./', ''),
        originalUrl.replace('./', '/'),
        '/assets/' + originalUrl.split('/').pop()
    ];
    
    alternatives.forEach(altUrl => {
        const img = new Image();
        img.onload = function() {
            results.innerHTML += `<div style="color: orange;">⚠ Alternatif çalışıyor: ${altUrl}</div>`;
        };
        img.onerror = function() {
            // Başarısız alternatif
        };
        img.src = altUrl;
    });
} 