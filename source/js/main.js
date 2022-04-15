console.log("%c %c %c %c Hello World!", "background:#e16c96", "background:#951c48", "background:#62102e", "background:transparent");
// 设置加载进度条颜色
topbar.config({
  barColors: {
    '0': '#333333'
  },
  barThickness: 3
});

// pjax初始化
const pjax = new Pjax({
  selectors: ["title", "#fixel-nav .center-block", "#main-block .center-block", "#top-pic .bgi", "#top-pic .center-box"],
  cacheBust: false, // 阻止携带时间戳
  scrollTo: false, // 阻止滚动到指定位置
  scrollRestoration: false, // 阻止切换页面时回到上次位置
  switches: {
    async "title-disable"(oldEl, newEl) { // 动态切换标题，但是实际效果太差所以禁用，不知道后面会不会用到这个算法所以先留着 =-=
      let stopStart = false,
        stopEnd = false,
        startText = oldEl.innerText.split("").filter(item => {
          if (!stopStart) {
            if (newEl.innerText.split("").indexOf(item) > -1) {
              return true;
            } else {
              stopStart = !stopStart;
              return false;
            }
          }
          return false;
        }).join(""),
        endText = oldEl.innerText.split("").reverse().filter(item => {
          if (!stopEnd) {
            if (newEl.innerText.split("").reverse().indexOf(item) > -1) {
              return true;
            } else {
              stopEnd = !stopEnd;
              return false;
            }
          }
          return false;
        }).reverse().join(""),
        rechangeText = oldEl.innerText.replace(startText, "").replace(endText, "");
      changeText = newEl.innerText.replace(startText, "").replace(endText, "");
      for (var i = rechangeText.length; i > 0; i--) {
        rechangeText = rechangeText.slice(0, rechangeText.length - 1);
        document.title = `${startText}${rechangeText}${endText}`;
        await new Promise((rj, re) => setTimeout(rj, 100));
      }
      for (var i = changeText.length; i > 0; i--) {
        document.title = `${startText}${changeText.slice(0,(changeText.length+1) - i)}${endText}`;
        await new Promise((rj, re) => setTimeout(rj, 100));
      }
      this.onSwitch();
    },
    "#main-block .center-block"(oldEl, newEl) { // 正文
      let mainEl = document.querySelector("#main-block");
      mainEl.style.opacity = 0;
      let transitionEnd = (event) => {
        if (event.target.id.includes("main-block")) {
          mainEl.style.opacity = 1;
          oldEl.outerHTML = newEl.outerHTML;
          mainEl.removeEventListener("transitionend", transitionEnd);
          this.onSwitch();
        }
      }
      mainEl.addEventListener("transitionend", transitionEnd, false);
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
        newImg.onerror = (err) => {
          console.log("头图加载失败", err);
          this.onSwitch();
        }
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
      } else {
        this.onSwitch();
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
  topbar.hide();
});
