export const createRandomCNChar = () => {
  let unicode =
    "\\u" + (Math.round(Math.random() * 20901) + 19968).toString(16);
  return eval("'" + unicode + "'");
};
export const formatTime = (timeObj) => {
  if (timeObj instanceof Date) {
    let y = timeObj.getFullYear();
    let m = timeObj.getMonth() + 1;
    let d = timeObj.getDate();
    let hh = timeObj.getHours().toString().padStart(2, "0");
    let mm = timeObj.getMinutes().toString().padStart(2, "0");
    let ss = timeObj.getSeconds().toString().padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  } else {
    return "参数不是Date对象";
  }
};
