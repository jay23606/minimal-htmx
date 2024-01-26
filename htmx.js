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
		if (hxBefore) (new Function('event', hxBefore))(event);
		const method = options.method || 'get';
		if (hxVals) method === 'get' ? url += '?' + new URLSearchParams(json(hxVals,el)) : options.body = json(hxVals,el);
		const response = await fetch(url, { ...options, method, headers: { ...options.headers, ...json(hxHeaders) } });
		const data = await response.text();
		applySwap(targetEl, data, hxSwap, hxSelect);
		if (hxAfter) (new Function('data', 'el', hxAfter))(data, el);
		run();
	};

	const json = (s, el) => s ? (s.startsWith('js:') ? Function('el',`return ${s.slice(3)}`)(el) : JSON.parse(s.replace(/'/g, '"'))) : {};
	
	const applySwap = (el, data, hxSwap, hxSelect) => {
		if (hxSwap === 'none') return;
		const content = (hxSelect) ? $DP(data, hxSelect) : data;
		const actions = {
			'outerHTML': () => el.outerHTML = content,
			'append': () => el.innerHTML += content,
			'prepend': () => el.innerHTML = content + el.innerHTML,
			'before': () => el.insertAdjacentHTML('beforebegin', content),
			'after': () => el.insertAdjacentHTML('afterend', content),
			'innerHTML': () => el.innerHTML = content
		};
		(actions[hxSwap] || actions['innerHTML'])();
	};
})();
