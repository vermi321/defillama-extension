import { getStorage } from "@src/pages/libs/helpers";
import levenshtein from "fast-levenshtein";

const debouncedVerifyHandle = debounce(verifyHandle, 200);
const debouncedVerifyHandle2 = debounce(verifyHandle, 2000); // maybe tweets take some time to load if you scroll too fast
const debouncedVerifyHandle3 = debounce(verifyHandle, 5000); // maybe tweets take some time to load if you scroll too fast
// const debouncedVerifyHandle4 = debounce(verifyHandle, 15000); // maybe tweets take some time to load if you scroll too fast
// const debouncedVerifyHandle5 = debounce(verifyHandle, 10000); // maybe tweets take some time to load if you scroll too fast

export default async function initPhishingHandleDetector() {
  const phishingHandleDetector = await getStorage("local", "settings:phishingHandleDetector", true);
  if (!phishingHandleDetector) return;

  verifyHandle();
  window.addEventListener("scroll", () => {
    debouncedVerifyHandle();
    debouncedVerifyHandle2();
    debouncedVerifyHandle3();
    // debouncedVerifyHandle4();
    // debouncedVerifyHandle5();
  });
}

const handleToName = {}
async function verifyHandle() {
  const isTweetPage = window.location.pathname.split("/")[2] === "status";
  if (!isTweetPage) return

  const safeHandle = window.location.pathname.split("/")[1].toLowerCase();
  const tweets = document.querySelectorAll('[data-testid="tweet"]');

  tweets.forEach((tweet, index) => {
    handleTweet(tweet, index)
    const quotedTweet = getQT(tweet);
    if (quotedTweet) handleTweet(quotedTweet, 42, true);
  });

  function handleTweet(tweet: any, index: number, isQT = false) {
    const { tweetHandle, displayName, tweetText, isRepliedTo } = getTweetInfo(tweet, isQT);

    if (!tweetHandle) return;
    if (/^[0-9]+$/.test(tweetText)) {
      // blurRT(tweet);
      return handleSusTweet(tweet);
    }
    if (tweetHandle.toLowerCase() === safeHandle) {
      handleToName[safeHandle] = displayName.toLowerCase();
      return;
    }
    if (handleToName[safeHandle]) {
      const distance = levenshtein.get(handleToName[safeHandle], displayName.toLowerCase());
      if (distance <= 1) {
        if (index === 0 && isRepliedTo) {
          tweets.forEach((tweet2) => {
            if (getTweetInfo(tweet2).tweetHandle.toLowerCase() == safeHandle) {
              handleSusTweet(tweet2);
            }
          })
        } else {
          handleSusTweet(tweet);
        }
        return;
      }
    }
  }

  function getQT(tweet: any): any {
    const probableQTs = Array.from(tweet.querySelectorAll('[tabindex="0"]')).filter((i: any) => i.innerText?.includes('@'));
    return probableQTs[0];
  }

  function handleSusTweet(tweet: any) {
    (tweet as any).style.background = "#c0000069"; // set background as light red
  }
  function blurRT(tweet: any) {
    if (tweet.isBlrred) return;

    tweet.isBlrred = true;
    const quotedTweet = getQT(tweet);
    if (!quotedTweet) return;

    // write vannila code to blur the tweet and add a warning with click to reveal
    // Create a new div to serve as the warning overlay
    const warningDiv = document.createElement('div');
    warningDiv.style.position = 'absolute';
    warningDiv.style.top = '0';
    warningDiv.style.left = '0';
    warningDiv.style.width = '100%';
    warningDiv.style.height = '100%';
    warningDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    warningDiv.style.zIndex = '1';
    warningDiv.style.display = 'flex';
    warningDiv.style.justifyContent = 'center';
    warningDiv.style.alignItems = 'center';
    warningDiv.innerText = 'This tweet is blurred. Click to reveal.';

    // Add the warning overlay to the tweet
    quotedTweet.style.position = 'relative';
    quotedTweet.appendChild(warningDiv);

    // Blur the tweet
    quotedTweet.style.filter = 'blur(10px)';

    // Add a click event listener to the warning overlay
    warningDiv.addEventListener('click', function () {
      // Remove the blur and the warning overlay when the overlay is clicked
      tweet.style.filter = '';
      tweet.removeChild(warningDiv);
    })

  }
}

async function handleHomePage(twitterConfig) {
  return; // disable for now
  /*
  const tweets = document.querySelectorAll('[data-testid="tweet"]');
  for (const tweet of tweets) {
    const { comments, likes, retweets, tweetHandle } = getTweetInfo(tweet);
    // if (comments === 0 && (likes > 10 || retweets > 5)) handleSusTweets(tweet);
    if (twitterConfig.blacklistSet.has(tweetHandle)) handleSusTweets(tweet);
    else if (twitterConfig.whitelistSet.has(tweetHandle)) continue;
    else if (twitterConfig.whitelist.some((i) => areHandlesSimilar(i, tweetHandle, 3))) handleSusTweets(tweet);
  }

  function handleSusTweets(tweet: any) {
    (tweet as any).style.background = "#ff000069"; // set background as light red
  }
  */
}

function getTweetInfo(tweet: any, isQT = false) {
  try {
    if (isQT) {
      const [displayName, tweetHandle] = tweet.querySelectorAll('[data-testid="User-Name"]')[0]?.innerText.split('\n') ?? []
      return {
        tweetHandle: tweetHandle?.replace("@", ""),
        displayName,
        isRepliedTo: false
      }
    }
    let element = tweet.querySelectorAll('a[role="link"]')
    if (element[0]?.innerText.endsWith("retweeted") || element[0].innerText?.endsWith("reposted")) element = Array.from(element).slice(1);
    const tweetText = tweet.querySelectorAll('[data-testid="tweetText"]')[0]?.innerText
    const isRepliedTo = tweet.querySelector('[data-testid="Tweet-User-Avatar"]')?.parentElement?.children?.length > 1
    return {
      tweetHandle: (element[2] as any)?.innerText.replace("@", ""),
      displayName: (element[1] as any)?.innerText,
      tweetText,
      isRepliedTo
    };
  } catch (e) {
    console.error("Error in getTweetInfo", e);
    return { tweetHandle: "", displayName: "", tweetText: "", isRepliedTo: false };
  }
}

const debounceTimers = {} as any;

function debounce(func, delay) {
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimers[delay]);
    debounceTimers[delay] = setTimeout(() => func.apply(context, args), delay);
  };
}
