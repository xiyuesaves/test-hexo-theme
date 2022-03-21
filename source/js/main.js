// 设置加载进度条颜色
topbar.config({
	barColors: {
		'0': '#333333'
	},
	barThickness: 3
});

// 切换顶部导航
let fixelEl = document.querySelector("#fixel-nav");
document.addEventListener("scroll", function() {
	//为了保证兼容性，这里取两个值，哪个有值取哪一个
	//scrollTop就是触发滚轮事件时滚轮的高度
	var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	if (scrollTop > 40) {
		fixelEl.style.transform = "translateY(0%)";
	} else {
		fixelEl.style.transform = "translateY(-100%)";
	}
})

// 启用pjax局部刷新
const pjax = new Pjax({
	selectors: ["#fixel-nav .center-block", "#main-block .center-block", "#top-pic .bgi", "#top-pic .center-box"],
	cacheBust: false, // 阻止携带时间戳
	scrollTo: false, // 阻止滚动到指定位置
	scrollRestoration: false, // 阻止切换页面时回到上次位置
	switches: {
		"#main-block .center-block"(oldEl, newEl) { // 正文 正文加载完成后释放滚轮
			let mainEl = document.querySelector("#main-block");
			mainEl.style.opacity = 0;
			mainEl.addEventListener("transitionend", () => {
				mainEl.style.opacity = 1;
				oldEl.outerHTML = newEl.outerHTML;
				this.onSwitch();
			}, { once: true });
		},
		"#fixel-nav .center-block"(oldEl, newEl) { // 顶栏
			let selectPage = newEl.querySelector(".active"),
				thisPage = document.querySelectorAll("#fixel-nav .center-block .back-link"),
				thisActive = document.querySelector("#fixel-nav .center-block .back-link.active");
			if (thisActive) {
				thisActive.className = thisActive.className.replace(" active", "");
			}
			if (selectPage) {
				thisPage.forEach(el => {
					if (el.innerText === selectPage.innerText) {
						el.className += " active";
					}
				});
			}
			this.onSwitch();
		},
		"#top-pic .bgi"(oldEl, newEl) { // banner图
			let oldUrl = oldEl.style.backgroundImage,
				newUrl = newEl.style.backgroundImage;
			// 图片相同则不进行替换
			if (oldUrl !== newUrl) {
				// 利用缓存机制让顶部图片加载完成后再执行进行替换
				let newPic = document.createElement("div"),
					picUrl = newUrl.replace(/^url\("/, "").replace(/"\)$/, ""),
					newImg = document.createElement("img");
				newImg.src = picUrl;
				newImg.onload = () => {
					newPic.className = "bgi";
					newPic.style.backgroundImage = newUrl;
					oldEl.parentNode.appendChild(newPic);
					oldEl.className += " hidden";
					oldEl.addEventListener("transitionend", () => {
						oldEl.remove();
						newPic.className += " shadow-blur";
						this.onSwitch();
					}, { once: true });
				}
			} else {
				this.onSwitch();
			}
		},
		"#top-pic .center-box"(oldEl, newEl) { // title信息
			let parentEl = oldEl.parentNode;
			parentEl.style.opacity = 0;
			parentEl.addEventListener("transitionend", () => {
				oldEl.outerHTML = newEl.outerHTML;
				parentEl.style.opacity = 1;
				this.onSwitch();
			}, { once: true });
		}
	},
	timeout: 5000 // 请求超时时长
});

// 监听pjax事件展示加载进度条
document.addEventListener('pjax:send', () => {
	topbar.show();
});
document.addEventListener('pjax:complete', () => {
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: "smooth"
	});
	showScroll();
	initToc();
	topbar.hide();
});

function showScroll() {
	if (document.body.scrollHeight > window.innerHeight) {
		console.log("展示滚动条");
	} else {
		console.log("移除滚动条");
	}
}

// 目录刷新
let postToc = [],
	showToc = false;
initToc();

function initToc() {
	if (document.querySelector(".toc")) {
		showToc = true;
		postToc = document.querySelectorAll(".toc ul p");
	} else {
		showToc = false;
	}
}

// 目录上色
document.addEventListener("scroll", function() {
	if (showToc) {
		postToc.forEach((el, index) => {
			let realEl = document.querySelector(`[title="${el.innerText}"]`);
			if (realEl && isInViewPortOfOne(realEl)) {
				let nextEl = postToc[index + 1] ? document.querySelector(`[title="${postToc[index + 1].innerText}"]`) : null;
				if (nextEl && isInViewPortOfOne(nextEl)) {
					el.className = " read";
				} else {
					el.className = " active";
				}
			} else {
				el.className = "";
			}
		})
	}
})

// 方法来自 https://github.com/febobo/web-interview/issues/84
function isInViewPortOfOne(el) {
	// viewPortHeight 兼容所有浏览器写法
	const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	const offsetTop = el.offsetTop;
	const scrollTop = document.documentElement.scrollTop;
	const top = offsetTop - scrollTop + (viewPortHeight / 3) * 2; // 增加40像素偏移,让标题可读后再判定为进入页面
	return top <= viewPortHeight;
}

// 跳转到指定目录
function goto(title) {
	const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
		elTop = document.querySelector(`[title="${title}"]`).offsetTop - viewPortHeight / 3;
	window.scrollTo({
		top: elTop,
		left: 0,
		behavior: "smooth"
	});
}