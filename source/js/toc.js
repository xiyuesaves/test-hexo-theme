// 初始化目录功能
let postToc = [],
  showToc = false;
initToc();


// 目录初始化
function initToc() {
  if (document.querySelector(".toc")) {
    showToc = true;
    postToc = document.querySelectorAll(".toc ul p");
  } else {
    showToc = false;
  }
}

// 滚动监听
document.addEventListener("scroll", function() {
  tocFun();
})

// pjax加载结束监听
document.addEventListener('pjax:complete', () => {
  initToc();
})

// 激活目录
function tocFun() {
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
}

function isInViewPortOfOne(el) {
  const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  const offsetTop = el.offsetTop;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
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