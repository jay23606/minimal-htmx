## minimal-htmx (mhtmx.js)

A minimal implementation of HTMX that I am writing to understand how HTMX might work without looking at the HTMX source code. I also added a few of my own attributes that I thought might be useful such as hx-class. Doesn't go into as much detail with different events and doesn't currently expose an API.

***I've revised what I consider a minimal implementation of htmx to include 'fixes' for ONLY form and anchor tags and you can see a demo of how that works here:***

[View Demo](https://raw.githack.com/jay23606/minimal-htmx/master/mhtmx.html)

***It also includes handling the back button correctly using History API***

***I also realized that I needed to consider the script nodes separately from other node types and trigger a load in some cases**

## Documentation

## `hx-class`
- **Description:** Applies YAML-defined attributes to HTML elements based on their classes (attribute can appear on any element on first load but fetched elements must have a verb). For mhtmx.js It is not a full YAML parser and it only understands tabs and not spaces to denote structure!
- **Example:** `<div hx-class="my-class my-class2">...</div>`

## `hx-get`, `hx-post`, `hx-put`, `hx-delete`, `hx-patch`
- **Description:** Initiates a fetch on specific events (e.g., click, change) using different HTTP verbs (required).
- **Example:** `<button hx-get="/api/data" hx-target="#result">Load Data</button>`

## `hx-target`
- **Description:** Specifies the target element where the fetched data will be applied (defaults to this.innerHTML).
- **Example:** `<button hx-get="/api/data" hx-target="#result">Load Data</button>`

## `hx-trigger`
- **Description:** Overrides the default event type that triggers data fetching (default: 'click', 'change' for inputs, 'submit' for forms).
- **Example:** `<input type="text" hx-get="/api/search" hx-trigger="keyup">`

## `hx-before`
- **Description:** Executes JavaScript code before fetch.
- **Example:** `<button hx-get="/api/data" hx-before="console.log('Before fetching data')">Load Data</button>`

## `hx-after`
- **Description:** Executes JavaScript code after fetch.
- **Example:** `<button hx-get="/api/data" hx-after="handleData">Load Data</button>`

## `hx-headers`
- **Description:** Specifies additional headers for the fetch.
- **Example:** `<button hx-get="/api/data" hx-headers="{'Authorization': 'Bearer token'}">Load Data</button>`

## `hx-vals`
- **Description:** Defines values to be sent with the fetch (supports JavaScript expressions using js:functionName(event)).
- **Example:** `<button hx-get="/api/data" hx-vals="{ 'param1': 'value1', 'param2': getInputValue() }">Load Data</button>`

## `hx-swap`
- **Description:** Specifies how the fetched data should be applied to the target element (outerHTML, append, prepend, before, after, innerHTML, none).
- **Example:** `<button hx-get="/api/data" hx-target="#result" hx-swap="append">Load Data</button>`

## `hx-select`
- **Description:** Specifies a selector to extract content from the fetched data before applying it to the target element.
- **Example:** `<button hx-get="/api/data" hx-target="#result" hx-select="p">Load Data</button>`

## `hx-load`
- **Description:** Specifies a JavaScript function to run when the element is first introduced
- **Example:** `<button hx-class="fun" hx-load="el.click()">Next</button>`

## `hx-applied`
- **Description:** This attribute is applied automatically and is used to keep track of whether a new element with a http verb is introduced (only elements with verbs are considered)

## Examples
  
- Shows paging through posts and using a span to store the postId
  
   [View Demo](https://raw.githack.com/jay23606/minimal-htmx/master/ex5.html)

- Active Search example:

   [View Demo](https://raw.githack.com/jay23606/minimal-htmx/master/ex1.html)

- Demo of `hx-class.js` extension that uses HTMX from https://htmx.org and an external YAML parser.

   [View Demo](https://raw.githack.com/jay23606/minimal-htmx/master/ex3.html)
  
- 'Active Search' examples are also provided for both ASP (classic, JScript) and ASPX (C# web forms). Additionally, the `min-htmx` project includes a Razor page usage example (these examples use an earlier implementation however)
