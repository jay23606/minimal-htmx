# minimal-htmx
A minimal implementation of HTMX that I am writing to understand how HTMX might work without looking at the HTMX source code

try it with an Active Search example that uses https://jsonplaceholder.typicode.com/users endpoint:

https://raw.githack.com/jay23606/minimal-htmx/master/ex1.html

I've also added an 'Active Search' example for both ASP (classic, JScript) and ASPX (C# web forms) and the min-htmx project has a Razor page usage example (cshtml)

Demo of hx-class.js extension that lets you dynamically add attributes to elements in a similar fashion that class lets you add CSS classes but it uses yaml (uses htmx from htmx.org and external yaml parser):

https://raw.githack.com/jay23606/minimal-htmx/master/ex3.html

Version that uses mhtmx.js and minimal custom YAML parser to extract data for hx-class attribute (self-contained):

https://raw.githack.com/jay23606/minimal-htmx/master/ex4.html

# Documentation

## `hx-class`
- **Description:** Applies YAML-defined attributes to HTML elements based on their classes.
- **Example:** `<div hx-class="my-class">...</div>`

## `hx-get`, `hx-post`, `hx-put`, `hx-delete`, `hx-patch`
- **Description:** Initiates a data-fetching action on specific events (e.g., click, change) using different HTTP methods.
- **Example:** `<button hx-get="/api/data" hx-target="#result">Load Data</button>`

## `hx-target`
- **Description:** Specifies the target element where the fetched data will be applied.
- **Example:** `<button hx-get="/api/data" hx-target="#result">Load Data</button>`

## `hx-trigger`
- **Description:** Overrides the default event type that triggers data fetching (default: 'click' or 'change').
- **Example:** `<input type="text" hx-get="/api/search" hx-trigger="keyup">`

## `hx-before`
- **Description:** Executes JavaScript code before the data-fetching action.
- **Example:** `<button hx-get="/api/data" hx-before="console.log('Before fetching data')">Load Data</button>`

## `hx-after`
- **Description:** Executes JavaScript code after the data-fetching action.
- **Example:** `<button hx-get="/api/data" hx-after="handleData">Load Data</button>`

## `hx-headers`
- **Description:** Specifies additional headers for the data-fetching request.
- **Example:** `<button hx-get="/api/data" hx-headers="{'Authorization': 'Bearer token'}">Load Data</button>`

## `hx-vals`
- **Description:** Defines values to be sent with the data-fetching request (supports JavaScript expressions).
- **Example:** `<button hx-get="/api/data" hx-vals="{ 'param1': 'value1', 'param2': getInputValue() }">Load Data</button>`

## `hx-swap`
- **Description:** Specifies how the fetched data should be applied to the target element ('outerHTML', 'append', 'prepend', 'before', 'after', 'default').
- **Example:** `<button hx-get="/api/data" hx-target="#result" hx-swap="append">Load Data</button>`

## `hx-select`
- **Description:** Specifies a selector to extract content from the fetched data before applying it to the target element.
- **Example:** `<button hx-get="/api/data" hx-target="#result" hx-select="p">Load Data</button>`
