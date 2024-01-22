(function () {
	HTMLElement.prototype.on = function (e, fn) { this.addEventListener(e, fn) }
	HTMLElement.prototype.attr = function (attribute, value) { return value === undefined ? this.getAttribute(attribute) : (this.setAttribute(attribute, value), this) }
	const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
	const $DP = (htmlString, selector) => (new DOMParser().parseFromString(htmlString, 'text/html').querySelector(selector)?.innerHTML || '');
	const httpVerbs = ['get', 'post', 'put', 'delete', 'patch'];
	
	document.addEventListener('DOMContentLoaded', () => run());
	
	const run = () => {
		httpVerbs.forEach(verb => {
			const els = $$(`[jx-${verb}]:not([data-jx-applied])`);
			els.forEach(el => {
				applyLogic(el, verb);
				el.setAttribute('data-jx-applied', 'true');
			});
		});
	}
	
	const applyLogic = (el, verb) => {
		const url = el.attr(`jx-${verb}`), jxTarget = el.attr('jx-target'), jxTrigger = el.attr('jx-trigger');
		let targetEl = jxTarget ? $(jxTarget) : el;
	
		if (el instanceof HTMLFormElement) {
			el.on('submit', async (e) => {
				e.preventDefault();
				await fetchData(url, targetEl, el, { method: verb, body: new URLSearchParams(new FormData(el)) });
			});
		} else el.on(jxTrigger || 'click', async () => await fetchData(url, targetEl, el, { method: verb }));
	};
	
	const fetchData = async (url, targetEl, el, options = {}) => {
		const jxBefore = el.attr('jx-before'), jxAfter = el.attr('jx-after'), jxHeaders = el.attr('jx-headers'),
			jxVals = el.attr('jx-vals'), jxSwap = el.attr('jx-swap');
		if (jxBefore) eval(jxBefore);
		const method = options.method || 'get';
		if (jxVals) (method === 'get') ?
				url += '?' + (new URLSearchParams(parseAttributes(jxVals))).toString() :
				options.body = parseAttributes(jxVals);
		const response = await fetch(url, {
			...options,
			method,
			headers: {
				...options.headers,
				...parseAttributes(jxHeaders),
			},
		});
		if (!response.ok) throw new Error('Network response was not ok');
		const data = await response.text();
		const jxSelectAttribute = el.getAttribute('jx-select');
		//targetEl.innerHTML = (jxSelectAttribute) ? $DP(data, jxSelectAttribute) : data;
		applySwap(targetEl, data, jxSwap, jxSelectAttribute);
		if (jxAfter) eval(jxAfter);
		run();
	};
	
	const parseAttributes = (attributeValue) => {
		const attributes = {};
		if (attributeValue) {
			attributeValue.split(';').forEach(attribute => {
				const [name, value] = attribute.split(':');
				if (name && value) attributes[name.trim()] = value.trim();
			});
		}
		return attributes;
	};
	
	const applySwap = (targetEl, data, jxSwap, jxSelectAttribute) => {
		const contentToInsert = (jxSelectAttribute) ? $DP(data, jxSelectAttribute) : data;
		const swapActions = {
			'outerHTML': () => targetEl.outerHTML = contentToInsert,
			'append': () => targetEl.innerHTML += contentToInsert,
			'prepend': () => targetEl.innerHTML = contentToInsert + targetEl.innerHTML,
			'before': () => targetEl.insertAdjacentHTML('beforebegin', contentToInsert),
			'after': () => targetEl.insertAdjacentHTML('afterend', contentToInsert),
			'default': () => targetEl.innerHTML = contentToInsert,
		};
		const selectedAction = swapActions[jxSwap] || swapActions['default'];
		selectedAction();
	};
})();
