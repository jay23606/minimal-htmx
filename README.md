# minimal-htmx
A minimal implementation of HTMX that I am writing to understand how HTMX might work without looking at the HTMX source code

So far it will look for elements with jx-get attributes and for those elements it will also look to see if it has jx-target and jx-trigger attributes

If jx-trigger doesn't exist then it will assume a click event and if jx-target doesn't exist then it will replace itself

I tested jx-trigger with mouseover event and it seems to work and removed jx-target and it seems to work
