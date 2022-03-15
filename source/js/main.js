// 设置加载进度条颜色
topbar.config({
	barColors: {
		'0': '#333333'
	},
	barThickness: 3
});

// 切换顶部导航
let fixelEl = document.querySelector("#fixel-nav")
window.onscroll = function() {
  //为了保证兼容性，这里取两个值，哪个有值取哪一个
  //scrollTop就是触发滚轮事件时滚轮的高度
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  if(scrollTop > 40){
  	fixelEl.style.transform = "translateY(0%)";
  } else {
  	fixelEl.style.transform = "translateY(-100%)";
  }
}

// 滚动限制
const bodyHeight = {
	hasScroll: true,
	wellFun: M,
	fixed() {
		document.body.style.height = `${document.body.scrollHeight}px`;
		this.hasScroll = false;
		if (M !== null) {
			window.removeEventListener("mousewheel", M, { passive: false });
			window.addEventListener("mousewheel", event => {
				if (this.hasScroll) {
					this.wellFun(event);
				} else {
					event.preventDefault();
				}
			}, { passive: false });
			M = null;
		}
	},
	release(lastTop = 0, tryNum = 0) {
		if (!document.documentElement.scrollTop) {
			document.body.removeAttribute("style");
			this.hasScroll = true;
		} else if (!this.hasScroll) {
			if (lastTop === document.documentElement.scrollTop && tryNum === 10) {
				console.warn("纠正错误锁定滚轮");
				tryNum = 0;
				window.scrollTo(0, 0);
			}
			setTimeout(() => { this.release(document.documentElement.scrollTop, ++tryNum) }, 100);
		}
	}
}

// 启用pjax局部刷新
const pjax = new Pjax({
	selectors: ["#fixel-nav .center-block", "#main-block .center-block", "#top-pic"],
	cacheBust: false,
	scrollTo: false,
	scrollRestoration: false,
	switches: {
		"#main-block .center-block"(oldEl, newEl) { // 正文 正文加载完成后释放滚轮
			let mainEl = document.querySelector("#main-block");
			mainEl.style.opacity = 0;
			mainEl.addEventListener("transitionend", () => {
				mainEl.style.opacity = 1;
				oldEl.outerHTML = newEl.outerHTML;
				// 页面加载完成后释放滚动
				bodyHeight.release();
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
		"#top-pic"(oldEl, newEl) { // banner图
			let picEl = document.querySelector("#top-pic .bgi"),
				bgiUrl = newEl.querySelector(".bgi").style.backgroundImage
			changeTitle();
			// 图片相同则不进行替换
			if (picEl.style.backgroundImage !== bgiUrl) {
				// 利用缓存机制让顶部图片加载完成后再进行替换
				let newPic = document.createElement("div"),
					picUrl = bgiUrl.replace(/^url\("/, "").replace(/"\)$/, ""),
					newImg = document.createElement("img");
				newImg.src = picUrl;
				newImg.onload = () => {
					newPic.className = "bgi";
					newPic.style.backgroundImage = bgiUrl;
					picEl.parentNode.appendChild(newPic);
					picEl.className += " hidden";
					picEl.addEventListener("transitionend", () => {
						picEl.remove();
						newPic.className += " shadow-blur";
						this.onSwitch();
					}, { once: true });
				}
			} else {
				this.onSwitch();
			}

			function changeTitle() {
				let picTitle = document.querySelector("#top-pic .top-title");
				picTitle.style.opacity = 0;
				picTitle.addEventListener("transitionend", () => {
					picTitle.innerHTML = newEl.querySelector(".top-title").innerHTML;
					picTitle.style.opacity = 1;
				}, { once: true });
			}
		}
	},
	timeout: 5000
});

// 重写滚动函数,强制使用过渡效果
let rewScroll = window.scrollTo;
window.scrollTo = function(...options) {
	rewScroll({
		top: options[1],
		left: options[0],
		behavior: "smooth"
	});
}

// 监听pjax事件展示加载进度条
document.addEventListener('pjax:send', () => {
	window.scrollTo(0, 0);
	topbar.show();
	bodyHeight.fixed();
});
document.addEventListener('pjax:complete', () => {
	showScroll();
	topbar.hide();
	bodyHeight.release();
});

function showScroll() {
	if (document.body.scrollHeight > window.innerHeight) {
		console.log("展示滚动条");
	} else {
		console.log("移除滚动条");
	}
}