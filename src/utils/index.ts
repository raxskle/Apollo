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
