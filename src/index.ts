import { Timeline } from "./components/index";

new Timeline<HTMLBodyElement, HTMLUListElement>(
  2000, // Refresh every 2 seconds
  "timeline-template",
  "main"
);
