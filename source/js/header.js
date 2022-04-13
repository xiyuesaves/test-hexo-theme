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

bannerScrollFun();
document.addEventListener("scroll", function() {
  bannerScrollFun();
})

// 顶栏图片分层滚动效果
function bannerScrollFun(argument) {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
    bannerHeight = document.querySelector("#top-pic .bgi").offsetHeight,
    showHeight = bannerHeight - scrollTop;
  if (showHeight > 0) {
    document.querySelector("#top-pic .bgi").style.backgroundPosition = `center ${50 - (30 * (scrollTop / bannerHeight))}%`
  }
}