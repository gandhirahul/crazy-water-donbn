/**
 *
 * A class representing a Buzz (like a Tweet)
 *
 * */

import { BaseComponent } from "./BaseComponent";
import { getRelativeTime } from "../utils/index";

const BUZZ_TEMPLATE_ID = "buzz-template";

const BUZZ_ELEMENT_IDS = {
  "author-image": "#buzz-author-image",
  "author-username": "#buzz-author-username",
  "published-timestamp": "#buzz-published-timestamp",
  "text-content": "#buzz-text-content"
};

type BuzzDetails = {
  id: number;
  image: string;
  username: string;
  text: string;
  timeStamp: number;
};

class Buzz extends BaseComponent<HTMLElement, HTMLLIElement> {
  constructor(private buzzDetails: BuzzDetails) {
    super(BUZZ_TEMPLATE_ID);
    this.init();
  }

  init() {
    /**
     *
     * Let's initialize content for each Buzz
     *
     * 1. Author image
     * 2. Author name
     * 3. Published timestamp
     * 4. Text content
     *
     * */

    this.initAuthorImage();
    this.initAuthorUsername();
    this.initPublishedTimestamp();
    this.initTextContent();
  }

  getElement() {
    return this.element;
  }

  private initAuthorImage() {
    const element = this.element.querySelector(
      BUZZ_ELEMENT_IDS["author-image"]
    )! as HTMLImageElement;
    element.src = this.buzzDetails.image;
  }
  private initAuthorUsername() {
    const element = this.element.querySelector(
      BUZZ_ELEMENT_IDS["author-username"]
    )!;
    element.textContent = this.buzzDetails.username;
  }
  private initPublishedTimestamp() {
    const element = this.element.querySelector(
      BUZZ_ELEMENT_IDS["published-timestamp"]
    )!;
    const renderCurrentTimeSince = () => {
      element.textContent =
        getRelativeTime(this.buzzDetails.timeStamp)!
          // TODO: Implement using regex
          .replace("ago", "")
          .replace(".", "")
          .split(" ")
          .join("") || "";
    };
    renderCurrentTimeSince();
    /**
     *
     * Let's update the timestamp so the correct time elapsed is shown
     *
     */
    setInterval(renderCurrentTimeSince, 2000);
  }
  private initTextContent() {
    const element = this.element.querySelector(
      BUZZ_ELEMENT_IDS["text-content"]
    )!;
    element.textContent = this.buzzDetails.text;
  }

  remove() {
    this.element.remove();
  }
}

export { Buzz };
