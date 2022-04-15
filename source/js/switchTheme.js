// 加载存储的主题值
let themer = localStorage.getItem('colorThemer');
if (themer) {
  document.querySelector("html").className = themer;
}

// 图标添加点击事件
document.addEventListener('DOMContentLoaded',addChangeEvent, false);
document.addEventListener('pjax:complete',addChangeEvent, false);

function addChangeEvent() {
  document.querySelectorAll(".switch-theme .icons").forEach(el => {
    el.addEventListener("click", changeThemer, false);
  })
}

let switchIn = false;

// 主题切换方法
function changeThemer(type) {
  if (!switchIn) {
    let htmlEl = document.querySelector("html")
    if (["dark", "light"].indexOf(type) !== -1) {
      switchIn = true;
      htmlEl.className = `transition-color `;
      document.querySelector(".switch-theme").className = `switch-theme ${type}`;
      localStorage.setItem('colorThemer', type);
      setTimeout(() => {
        htmlEl.className += type;
      }, 0);
      // 因为会触发多个结束事件，所以只有当触发事件和规定时间相同时才结束
      let transitionEnd = (event) => {
        if (event.elapsedTime === 0.6) {
          switchIn = false;
          htmlEl.className = type;
          document.body.removeEventListener("transitionend", transitionEnd);
        }
      }
      document.body.addEventListener("transitionend", transitionEnd, false);
    } else {
      let thisType = htmlEl.className || "light";
      if (thisType === "dark") {
        changeThemer("light");
      } else {
        changeThemer("dark");
      }
    }
  }
}