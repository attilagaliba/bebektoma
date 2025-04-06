// Assetleri kontrol eden script
document.addEventListener('DOMContentLoaded', function() {
    const assetUrls = [
        './assets/toma.png',
        './assets/gasbomb.png',
        './assets/bariyer.png',
        './assets/devilToma.png',
        './assets/bg.png'
    ];
    
    const results = document.createElement('div');
    results.style.position = 'fixed';
    results.style.top = '10px';
    results.style.left = '10px';
    results.style.backgroundColor = 'rgba(0,0,0,0.8)';
    results.style.color = 'white';
    results.style.padding = '10px';
    results.style.zIndex = '9999';
    results.style.fontFamily = 'monospace';
    results.style.fontSize = '12px';
    results.style.maxWidth = '80%';
    results.style.overflowY = 'auto';
    results.style.maxHeight = '80vh';
    
    results.innerHTML = '<h3>Asset yüklenme durumu:</h3>';
    
    assetUrls.forEach(url => {
        const img = new Image();
        img.onload = function() {
            results.innerHTML += `<div style="color: green;">✓ ${url} (${img.width}x${img.height})</div>`;
        };
        img.onerror = function() {
            results.innerHTML += `<div style="color: red;">✗ ${url} - YÜKLENEMEDİ!</div>`;
            // Alternatif yolları dene
            checkAlternativeUrls(url, results);
        };
        img.src = url;
    });
    
    document.body.appendChild(results);
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