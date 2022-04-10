let themer = localStorage.getItem('colorThemer');
if (themer) {
	document.querySelector("html").className = themer;
}

// 设置加载进度条颜色
topbar.config({
	barColors: {
		'0': '#333333'
	},
	barThickness: 3
});

// 初始化目录功能
let postToc = [],
	showToc = false;
initToc();

// pjax初始化
const pjax = new Pjax({
	selectors: ["#fixel-nav .center-block", "#main-block .center-block", "#top-pic .bgi", "#top-pic .center-box"],
	cacheBust: false, // 阻止携带时间戳
	scrollTo: false, // 阻止滚动到指定位置
	scrollRestoration: false, // 阻止切换页面时回到上次位置
	switches: {
		"#main-block .center-block"(oldEl, newEl) { // 正文
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
					oldEl.addEventListener("transitionstart", () => {
						newPic.className += " shadow-blur";
					}, { once: true });
					oldEl.addEventListener("transitionend", () => {
						oldEl.remove();
					}, { once: true });
					this.onSwitch();
				}
			} else {
				this.onSwitch();
			}
		},
		"#top-pic .center-box"(oldEl, newEl) { // title信息
			if (oldEl.outerHTML !== newEl.outerHTML) {
				let parentEl = oldEl.parentNode;
				parentEl.style.opacity = 0;
				parentEl.addEventListener("transitionend", () => {
					oldEl.outerHTML = newEl.outerHTML;
					parentEl.style.opacity = 1;
					this.onSwitch();
				}, { once: true });
			}
		}
	},
	timeout: 5000 // 请求超时时长
});

// 加载进度条
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

// 判断是否展示滚动条
let count = 0,
	doc = document,
	box = doc.querySelector('body'),
	content = doc.querySelector('#main'),
	scrollBar = doc.querySelector('.scroll-bar'),
	scroll = doc.querySelector('.scroll-bar .scroll-block'),
	scrollBarHeight = scrollBar.clientHeight, // .scroll-bar 可视区域高度
	contentSH = content.scrollHeight, // .box-content 高度，包括被卷入的高度
	contentCH = scrollBarHeight, // .box-content 可视区域高度
	multiple = contentSH / contentCH, // 滚动条移动倍数
	num = contentCH * (contentCH / contentSH); // 计算滚动条内可滚动部分的长度

showScroll();

function showScroll() {
	if (document.body.scrollHeight > window.innerHeight) {
		changeScrollBarSize();
		let scrollBlockHeight = Math.round(window.innerHeight * (window.innerHeight / document.body.scrollHeight)),
			scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		scroll.style.transform = `translateY(${(scrollTop / window.innerHeight) * 100}%)`;
		if (scrollBar.className.includes("hiden") && scroll.offsetHeight !== scrollBlockHeight) {
			scroll.style.transition = "all 0ms";
			scroll.style.height = `${scrollBlockHeight}px`;
			setTimeout(() => {
				scroll.style.transition = "";
				document.querySelector(".scroll-bar").className = "scroll-bar";
			}, 0);
		} else {
			scroll.style.height = `${scrollBlockHeight}px`;
			scrollBar.className = "scroll-bar";
		}
	} else {
		scrollBar.className = "scroll-bar hiden";
	}
}

// 监听页面尺寸变化修改滚动条滑块参数
window.addEventListener("resize", () => {
	if (document.body.scrollHeight > window.innerHeight) {
		if (scrollBar.className.includes("hiden")) {
			scrollBar.className = "scroll-bar";
		}
		let scrollBlockHeight = Math.round(window.innerHeight * (window.innerHeight / document.body.scrollHeight)),
			scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		scroll.style.transform = `translateY(${(scrollTop / window.innerHeight) * 100}%)`;
		scroll.style.height = `${scrollBlockHeight}px`;
	} else {
		scrollBar.className = "scroll-bar hiden";
	}
})

function changeScrollBarSize() {
	scrollBarHeight = scrollBar.clientHeight; // .scroll-bar 可视区域高度
	contentSH = content.scrollHeight; // .box-content 高度，包括被卷入的高度
	contentCH = scrollBarHeight; // .box-content 可视区域高度
	multiple = contentSH / contentCH; // 滚动条移动倍数
	num = contentCH * (contentCH / contentSH); // 计算滚动条内可滚动部分的长度
}

customScrollBar();

function customScrollBar() {
	// 这个函数在开发过程中遇到一个很奇怪的bug,侧边的滑块会在未知情况下超出限制范围,但是当我开始调试时又完全无法复现了...
	let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	scroll.style.transform = `translateY(${(scrollTop / window.innerHeight) * 100}%)`;
	if (contentCH >= contentSH) {
		scrollBar.className = "scroll-bar hiden";
	} else if (!scrollBar.className.includes("hiden")) {
		scrollBar.className = "scroll-bar";
	}

	document.addEventListener('scroll', function() {
		let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		scroll.style.transform = `translateY(${(scrollTop / window.innerHeight) * 100}%)`;
	});


	function mouseEvents(e) {
		window.scrollTo({
			top: ((e.clientY - 0) * multiple) - count,
			left: 0
		});
	}

	scroll.onmousedown = function(e) {
		doc.onselectstart = function() {
			return false;
		};
		count = e.offsetY * multiple;
		box.addEventListener('mousemove', mouseEvents);
		if (!scrollBar.className.includes("hiden")) {
			scrollBar.className = "scroll-bar active";
		}
	};

	box.onmouseup = function() {
		this.removeEventListener('mousemove', mouseEvents);
		doc.onselectstart = function() {
			return true;
		}
		if (!scrollBar.className.includes("hiden")) {
			scrollBar.className = "scroll-bar";
		}
	};

	box.onmouseleave = function() {
		this.removeEventListener('mousemove', mouseEvents);
		doc.onselectstart = function() {
			return true;
		}
		if (!scrollBar.className.includes("hiden")) {
			scrollBar.className = "scroll-bar";
		}
	}
}

// 切换顶部导航
let fixelEl = document.querySelector("#fixel-nav");
if (fixelEl) {
	showFixelNav();
	document.addEventListener("scroll", function() {
		showFixelNav();
	})
}

// 显示浮动导航栏
function showFixelNav() {
	let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	if (scrollTop > 40) {
		fixelEl.style.transform = "translateY(0%)";
	} else {
		fixelEl.style.transform = "translateY(-100%)";
	}
}

// 目录初始化
function initToc() {
	if (document.querySelector(".toc")) {
		showToc = true;
		postToc = document.querySelectorAll(".toc ul p");
	} else {
		showToc = false;
	}
}

// 激活目录
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

function isInViewPortOfOne(el) {
	const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	const offsetTop = el.offsetTop;
	const scrollTop = document.documentElement.scrollTop;
	const top = offsetTop - scrollTop + (viewPortHeight / 3) * 2; // 增加像素偏移,让标题居中偏上后再激活
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

// 主题切换
let switchIn = false;

function changeThemer(type) {
	if (!switchIn) {
		let htmlEl = document.querySelector("html")
		if (["dark", "light"].indexOf(type) !== -1) {
			switchIn = !switchIn;
			htmlEl.className = `transition-color `;
			setTimeout(() => {
				htmlEl.className += type;
			}, 0)
			document.body.addEventListener("transitionend", function() {
				switchIn = !switchIn;
				htmlEl.className = type;
			}, { once: true })
			localStorage.setItem('colorThemer', type)
		} else {
			// 自动切换
			let thisType = htmlEl.className || "light";
			if (thisType === "dark") {
				changeThemer("light");
			} else {
				changeThemer("dark");
			}
		}
	}
}