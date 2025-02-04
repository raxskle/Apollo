export function getRelativeTime(timestamp: number) {
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (timeDiff < minute) {
    return "刚刚";
  } else if (timeDiff < hour) {
    const minutes = Math.floor(timeDiff / minute);
    return `${minutes}分钟前`;
  } else if (timeDiff < day) {
    const hours = Math.floor(timeDiff / hour);
    return `${hours}小时前`;
  } else if (timeDiff < week) {
    const days = Math.floor(timeDiff / day);
    return `${days}天前`;
  } else if (timeDiff < month) {
    const weeks = Math.floor(timeDiff / week);
    return `${weeks}周前`;
  } else if (timeDiff < year) {
    const months = Math.floor(timeDiff / month);
    return `${months}个月前`;
  } else {
    const years = Math.floor(timeDiff / year);
    return `${years}年前`;
  }
}

export function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

export function generateRandomString(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，所以需要加1
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
}

export const DOMAIN = "http://localhost:4008";
