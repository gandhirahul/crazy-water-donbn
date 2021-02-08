Welcome to Buzzer!

Buzzer is a Twitter like timeline which displays Buzzes (like Tweets) 🐝

Features

- The technology stack is simple — no libraries or frameworks, just good old Typescript!
- It will auto-update with Buzzes every 2 seconds (this can be changed in src/index.ts)
- Will pause auto-update when scrolling in order to allow users to scroll and read through the Buzzes on their timeline
- The maximum number of Buzzes that will be displayed is 100, once 100 tweets are displayed the Buzzes at the bottom will start to be removed. This is inorder prevent bottle-neck performance with too many DOM nodes. This number can be modified in src/components/Timeline.ts.
- There is fetch retry functionality that will retry any failed api requests every 500ms up to a maximum 10 times

NOTE 1: I built this project locally using live sass loader but CodeSandbox doesn't make it as easy to use sass so the css has been compiled locally.

NOTE 2: I don't think the app performs as well on CodeSandbox as it does in stand alone mode (expected with any app). It seems a lot smoother if you open in a new window. There is an error `Cannot set property 'innerHTML' of null` that only throws in CodeSandbox for example.
