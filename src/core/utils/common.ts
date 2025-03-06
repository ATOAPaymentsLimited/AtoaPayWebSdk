export function detectBrowser() {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  if (userAgent.match(/opt\//i)) {
    browserName = "Opera";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "Opera";
  } else if (userAgent.match(/Edg/)) {
    browserName = "Edge";
  } else if (userAgent.match(/Brave/i)) {
    browserName = "Brave";
  } else if (userAgent.match(/SamsungBrowser/i)) {
    browserName = "Samsung";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "Firefox";
  } else if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "Chrome";
  } else if (userAgent.match(/safari/i)) {
    browserName = "Safari";
  } else if (userAgent.match(/android/i)) {
    browserName = "Android";
  } else if (userAgent.match(/iphone/i)) {
    browserName = "iPhone";
  } else {
    browserName = "Unknown";
  }

  return browserName;
}

export function getOS() {
  const userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"];
  let os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "Mac OS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (!os && /Linux/.test(platform)) {
    os = "Linux";
  }

  return os;
}

export const isMobile = function () {
  return getOS() == "Android" || getOS() == "iOS";
};

export const isAndroid = function () {
  return getOS() == "Android";
};

export const isIos = function () {
  return getOS() == "iOS";
};

export const formatDate = (dateString: string) => {
  const timeObj = new Date(dateString);

  const formattedTime = timeObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return formattedTime;
};
