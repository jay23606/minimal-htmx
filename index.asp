<%@ Language=JScript %>
<%
var searchTerm = Request.QueryString("q");
var countries = ["afghanistan", "albania", "algeria", "andorra", "angola", "argentina", "armenia", "australia", "austria", "azerbaijan"];
var results = [];

for (var i = 0; i < countries.length; i++) 
    if (countries[i].indexOf(searchTerm) !== -1) 
        results.push(countries[i]);
%>
    <ul>
        <% for (var i = 0; i < results.length; i++) { %>
            <li><%= results[i] %></li>
        <% } %>
    </ul>
<%
if (Request.QueryString("q").count != 0) Response.End();
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTMX Autocomplete</title>
    <script>
	(() => {
		HTMLElement.prototype.on = function (e, fn) { return this.addEventListener(e, fn) }
		HTMLElement.prototype.attr = function (attribute, value) { return value === undefined ? this.getAttribute(attribute) : (this.setAttribute(attribute, value), this) }
		const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
		const $DP = (htmlString, selector = '') => (new DOMParser().parseFromString(htmlString, 'text/html').querySelector(selector)?.innerHTML || '');
		
		document.addEventListener('DOMContentLoaded', () => run());

		const run = () => ['get', 'post', 'put', 'delete', 'patch'].forEach(verb => $$(`[hx-${verb}]:not([hx-applied])`).forEach(el => {
			const url = el.attr(`hx-${verb}`), hxTarget = el.attr('hx-target'), hxTrigger = el.attr('hx-trigger');
			const targetEl = hxTarget ? $(hxTarget) : el;
			el instanceof HTMLFormElement
				? el.on('submit', async e => (e.preventDefault(), await fetchData(url, targetEl, el, { method: verb, body: new URLSearchParams(new FormData(el)) })))
				: el.on(hxTrigger || getEventType(el), async () => await fetchData(url, targetEl, el, { method: verb }));
			el.attr('hx-applied', 'true');
		}));

		const getEventType = el => el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement ? 'change' : 'click';

		const fetchData = async (url, targetEl, el, options = {}) => {
			const hxBefore = el.attr('hx-before'), hxAfter = el.attr('hx-after'), hxHeaders = el.attr('hx-headers'),
				hxVals = el.attr('hx-vals'), hxSwap = el.attr('hx-swap'), hxSelect = el.attr('hx-select');
			if (hxBefore) eval(hxBefore);
			const method = options.method || 'get';
			if (hxVals) method === 'get' ? url += '?' + new URLSearchParams(json(hxVals)) : options.body = json(hxVals);
			const response = await fetch(url, { ...options, method, headers: { ...options.headers, ...json(hxHeaders) } });
			const data = await response.text();
			applySwap(targetEl, data, hxSwap, hxSelect);
			if (hxAfter) eval(hxAfter);
			run();
		};

		const json = s => s ? s.startsWith('js:') ? Function(`return ${s.slice(3)}`)() : JSON.parse(s.replace(/'/g, '"')) : {};
		
		const applySwap = (el, data, hxSwap, hxSelect) => {
			const content = (hxSelect) ? $DP(data, hxSelect) : data;
			const actions = {
				'outerHTML': () => el.outerHTML = content,
				'append': () => el.innerHTML += content,
				'prepend': () => el.innerHTML = content + el.innerHTML,
				'before': () => el.insertAdjacentHTML('beforebegin', content),
				'after': () => el.insertAdjacentHTML('afterend', content),
				'default': () => el.innerHTML = content
			};
			(actions[hxSwap] || actions['default'])();
		};
	})();
	</script>
</head>
<body>
    <label for="autocomplete">Search Countries:</label>
    <input id="autocomplete" type="text" hx-trigger="keyup" hx-get="index.asp" hx-vals="js:{q: event.target.value}" hx-target="#autocomplete-results">
    <div id="autocomplete-results"></div>
</body>
</html>
