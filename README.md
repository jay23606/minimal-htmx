# minimal-htmx
A minimal implementation of HTMX that I am writing to understand how HTMX might work without looking at the HTMX source code

So far it will look for elements with jx-get/jx-put attributes and for those elements it will also look to see if it has jx-target and jx-trigger attributes

For jx-put it will assume it is applied to a form element and do a submit action otherwise it will use jx-trigger event

If jx-trigger doesn't exist then it will assume a click event and if jx-target doesn't exist then it will replace itself

I tested jx-trigger with mouseover event and it seems to work and removed jx-target and it seems to work

Need to add more tests to see what else it can support and what needs to be added

I've also added an 'Active Search' example for both ASP (classic, JScript) and ASPX (web forms) and the min-htmx project has a csproj (razor pages) usage example

Try it:
https://raw.githack.com/jay23606/minimal-htmx/master/index.html
