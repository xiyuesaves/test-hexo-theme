
// 判断是否展示滚动条
let count = 0,
  doc = document,
  pageLoading = false;
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
        scrollBar.className = "scroll-bar";
      }, 10);
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
  if (!pageLoading) {
    if (document.body.scrollHeight > window.innerHeight) {
      if (scrollBar.className.includes("hiden")) {
        scrollBar.className = "scroll-bar";
      }
      let scrollBlockHeight = Math.round(window.innerHeight * (window.innerHeight / document.body.scrollHeight)),
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      scroll.style.transform = `translateY(${(scrollTop / window.innerHeight) * 100}%)`;
      scroll.style.height = `${scrollBlockHeight}px`;
    } else if (!scrollBar.className.includes("hiden")) {
      scrollBar.className = "scroll-bar hiden";
    }
  }
})

document.addEventListener('pjax:send', () => {
  pageLoading = true;
})

document.addEventListener('pjax:complete', () => {
  showScroll();
  pageLoading = false;
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