/**
 *
 * A class representing a timeline of Buzzes (like a timeline of Tweets)
 *
 * */

import { BaseComponent } from "./BaseComponent";
import { Buzz, TimelinePagination } from "./index";

const MAX_BUZZES_IN_DOM = 100;

type HTMLElementParams = { [key: string]: string };

class Timeline<
  T extends HTMLElement,
  U extends HTMLElement
> extends BaseComponent<T, U> {
  private buzzes: Buzz[] = [];
  private buzzesFragment: DocumentFragment;
  private refreshSetInterval: number | undefined;
  private prefersReducedMotion: boolean = false;
  private pagination: TimelinePagination;

  constructor(
    private refreshInterval: number,
    timelineTemplateElementId: string,
    hostElementSelector: string
  ) {
    super(timelineTemplateElementId, hostElementSelector);
    this.pagination = TimelinePagination.getInstance();
    this.buzzesFragment = document.createDocumentFragment();
    this.init();
  }

  async init() {
    /**
     *
     * Let's initialize a few things then make our first request for Buzzes
     *
     * NOTE: We don't want to initialize the refresh until the initial Buzzes are added to the DOM
     *
     *  */
    this.initPrefersReducedMotion();
    this.initScrollEventHandler();

    const buzzes = await this.pagination.first();
    if (buzzes && buzzes.length > 0) {
      this.createBuzzes(this.buzzesFragment, buzzes);
      this.attach();
    }
  }

  private attach() {
    // Let's attach are Timeline to the DOM with some fade transitions upon enter
    if (this.hostElement) {
      this.beforeAttach(
        this.buzzesFragment,
        { opacity: "0" },
        { animation: "fade-down-enter" }
      );
      this.element.appendChild(this.buzzesFragment);
      this.hostElement.insertAdjacentElement("afterbegin", this.element);
      this.afterAttach();
    }
  }

  private initRefresh() {
    this.refreshSetInterval = setInterval(() => {
      this.refreshTimeline();
    }, this.refreshInterval);
    this.toggleIntervalIndicator(true);
  }

  private initPrefersReducedMotion() {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      this.prefersReducedMotion = true;
    }
    mediaQuery.addEventListener("change", () => {
      if (mediaQuery.matches) {
        this.prefersReducedMotion = true;
      } else {
        this.prefersReducedMotion = false;
      }
    });
  }

  private initScrollEventHandler() {
    /**
     *
     * Let's allow users to scroll through and read Buzzes,
     * so let's pause fetching unless they are scrolled to the top of the page
     *
     *  */
    document.addEventListener("scroll", () => {
      const clearAnimations = () => {
        this.element.getAnimations().forEach((animation) => {
          animation.finish();
        });
      };
      if (scrollY !== 0) {
        this.toggleIntervalIndicator(false);
        clearInterval(this.refreshSetInterval);
        clearAnimations();
      } else {
        this.initRefresh();
        clearAnimations();
      }
    });
  }

  private toggleIntervalIndicator(toggle: boolean) {
    if (toggle) {
      document.body.setAttribute("data-interval-status", "true");
    } else {
      document.body.removeAttribute("data-interval-status");
    }
  }

  private createBuzzes(fragment: DocumentFragment, newBuzzes: any[]) {
    /**
     *
     * For performance, let's limit the number of list items we render or things could get ugly (slow)!
     *
     */
    const removeExcessBuzzDomNodes = () => {
      if (this.buzzes.length + newBuzzes.length > MAX_BUZZES_IN_DOM) {
        const remainder = MAX_BUZZES_IN_DOM - this.buzzes.length;

        [...this.buzzes]
          .slice(0, newBuzzes.length - remainder)
          .forEach((buzz, index, array) => {
            buzz.remove();
            this.buzzes.splice(0, 1);
          });
      }
    };

    // Remove before adding new Buzzes
    removeExcessBuzzDomNodes();

    const tempNewBuzzes: Buzz[] = [];

    for (const buzz of newBuzzes) {
      const newBuzz = new Buzz(buzz);
      fragment.appendChild(newBuzz.getElement());

      // Need to use a temporary array as order needs to be reversed
      tempNewBuzzes.push(newBuzz);
    }

    this.buzzes = [...this.buzzes, ...tempNewBuzzes.reverse()];
  }

  private beforeAttach(
    fragment: DocumentFragment,
    childrenStyles: HTMLElementParams = {},
    dataAttributes: HTMLElementParams = {}
  ) {
    // Do stuff before fragment is attached to the dom

    [...fragment.children].forEach((child) => {
      if (child instanceof HTMLElement) {
        for (const [key, value] of Object.entries(childrenStyles)) {
          child.style[key] = value;
        }
        for (const [key, value] of Object.entries(dataAttributes)) {
          child.setAttribute(`data-${key}`, value);
        }
      }
    });
  }

  private afterAttach() {
    // Do stuff after fragment is attached to the dom

    [...this.element.children].forEach((child, index) => {
      if (child instanceof HTMLElement) {
        child.style.animationDelay = `${(index + 1) * 100}ms`;
      }
    });

    const handleAnimationEnd = ({ target }) => {
      if (target === this.element.lastChild) {
        [...this.element.children].forEach((child) => {
          if (child instanceof HTMLElement) {
            child.style.animationDelay = ``;
            child.style.opacity = ``;
            child.removeAttribute("data-animation");
          }
        });

        /**
         *
         * This where we first initialise our refetching, though only if we our scrolled at the top of the page
         *
         * */
        if (scrollY === 0) {
          this.initRefresh();
        }
        this.element.removeEventListener(
          "animationend",
          handleAnimationEnd,
          false
        );
      }
    };

    this.element.addEventListener("animationend", handleAnimationEnd), false;
  }

  private async refreshTimeline() {
    const newFragment = document.createDocumentFragment();
    const newFragmentContainer = document.getElementById(
      "incoming-buzz-container"
    )!;

    const renderNewBuzzes = () => {
      this.beforeAttach(newFragment, { opacity: "1" }, { animation: "" });
      this.element.prepend(newFragment);
      newFragmentContainer.innerHTML = "";
      this.initRefresh();
    };

    const scrollNewBuzzesIntoView = () => {
      this.beforeAttach(
        newFragment,
        { opacity: "0" },
        { animation: "fade-enter" }
      );
      const serializer = new XMLSerializer();
      const newFragmentString = serializer.serializeToString(newFragment);
      newFragmentContainer.innerHTML = newFragmentString;

      this.element.prepend(newFragmentContainer);

      if (this.prefersReducedMotion) {
        renderNewBuzzes();
      } else {
        const animate = this.element.animate(
          [
            {
              transform: `translateY(${
                newFragmentContainer.offsetHeight + 16
              }px)`
            }
          ],
          {
            easing: "ease-in-out",
            duration:
              newFragmentContainer.children.length * 200 +
              800 / newFragmentContainer.children.length
          }
        );

        animate.onfinish = () => renderNewBuzzes();
      }
    };

    /**
     *
     * Let's clear interval for now to allow the Buzzes to enter, then re-initialize interval afterwards
     *
     *  */
    clearInterval(this.refreshSetInterval);

    const newBuzzes = await this.pagination.next();

    if (!newBuzzes || newBuzzes.length < 1) return;
    this.toggleIntervalIndicator(false);

    this.createBuzzes(newFragment, newBuzzes);

    /**
     *
     * Let's add a relative animationDelay for animating Buzzes
     *
     *  */
    [...newFragment.children].forEach((child, index, { length }) => {
      if (child instanceof HTMLElement) {
        child.style.animationDelay = `${(length - (index + 1)) * 100}ms`;
      }
    });

    scrollNewBuzzesIntoView();
  }
}

export { Timeline };
