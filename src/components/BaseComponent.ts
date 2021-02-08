/**
 *
 * An abstract class representing a component that can be attached to the DOM using HTML templates.
 *
 * */

abstract class BaseComponent<T extends HTMLElement, U extends HTMLElement> {
  private templateElement: HTMLTemplateElement;
  protected hostElement: T | null = null;
  protected element: U;

  constructor(templateId: string, hostElementSelector?: string) {
    this.templateElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;

    if (hostElementSelector) {
      this.hostElement = document.querySelector(hostElementSelector) as T;
    }

    if (this.templateElement) {
      const importedNode = document.importNode(
        this.templateElement.content,
        true
      );
      this.element = importedNode.firstElementChild as U;
    } else {
      throw Error(`No template found for ID: ${templateId}`);
    }
  }

  abstract init(): void;
}

export { BaseComponent };
