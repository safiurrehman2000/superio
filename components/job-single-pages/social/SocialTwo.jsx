"use client";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "next-share";

const SocialTwo = () => {
  const getCurrentUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const currentUrl = getCurrentUrl();
  const shareText = "Check out this amazing job opportunity at Flexijobber!";

  return (
    <div className="social-share-buttons">
      <FacebookShareButton
        url={currentUrl}
        quote={shareText}
        hashtag="#Flexijobber"
      >
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={currentUrl} title={shareText}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <LinkedinShareButton url={currentUrl} title={shareText}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
    </div>
  );
};

export default SocialTwo;
