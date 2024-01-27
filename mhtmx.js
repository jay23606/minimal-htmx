(() => {
	HTMLElement.prototype.on = function(e, fn) { return this.addEventListener(e, fn) }
	HTMLElement.prototype.attr = function(a, v) { return v === undefined ? this.getAttribute(a) : (this.setAttribute(a, v), this) }
	//HTMLElement.prototype.$ = function(s) { return this.querySelector(s)) }
	//HTMLElement.prototype.$$ = function(s) { return this.querySelectorAll(s)) }
	
	const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
	const $DP = (htm, sel = '') => (new DOMParser().parseFromString(htm, 'text/html').querySelector(sel)?.innerHTML || '');
	$el = (el, attrs = {}) => Object.assign(document.createElement(el), attrs);
	
	//document.addEventListener('DOMContentLoaded', () => loadScript('https://cdn.jsdelivr.net/npm/js-yaml/dist/js-yaml.min.js', () => run()));
	
	document.addEventListener('DOMContentLoaded', () => run(true));
	
	//Minimal custom YAML parser
	const parseYamlish = (text) => {
		const getNextIdx = (m, i, t) => m[i + 1] ? t.indexOf(m[i + 1], t.indexOf(m[i])) : t.length;
		const obj = {};
		const parse = (classText, level) => {
			const clsObj = {}, regex = new RegExp(`^\\s{${4 * level}}([-_\\w:.]+):`, 'gm');
			const propMatches = classText.match(regex) || [];
			let lastIndex = 0;
			propMatches.forEach((propMatch, j) => {
				const propEndIdx = getNextIdx(propMatches, j, classText);
				clsObj[propMatch.trim().slice(0, -1)] = parse(classText.substring(classText.indexOf(propMatch, lastIndex) + propMatch.length, propEndIdx), level + 1);
				lastIndex = propEndIdx;
			});
			if (Object.keys(clsObj).length === 0) return classText.trim();
			return clsObj;
		};
		const classMatches = text.match(/^([-_\w:.]+):/gm) || [];
		let lastIndex = 0;
		classMatches.forEach((clsMatch, i) => {
			const clsEndIdx = getNextIdx(classMatches, i, text);
			obj[clsMatch.trim().slice(0, -1)] = parse(text.substring(text.indexOf(clsMatch, lastIndex) + clsMatch.length, clsEndIdx), 1);
			lastIndex = clsEndIdx;
		});
		return obj;
	};
	
	const applyAttrs = (el, attrs) => Object.entries(attrs).forEach(([key, value]) => el.attr(key, value));
   
	const applyClassAttrs = (el, classNames) => {
		const yamlScripts = $$('script[type="text/yaml"]');
		yamlScripts.forEach(script => {
			//const classAttrMap = jsyaml.load(script.textContent);
			const classAttrMap = parseYamlish(script.textContent);
			classNames.split(' ').forEach(className => applyAttrs(el, classAttrMap[className] || {}));
		});
	};
	
	//const loadScript = (src, callback) => {
	//	const script = $el('script', { src: src, onload: callback });
	//	document.head.appendChild(script);
	//};
	
	const run = (firstTime) => {
		if(firstTime) $$('[hx-class]').forEach(el => applyClassAttrs(el, el.attr('hx-class')));
		['get', 'post', 'put', 'delete', 'patch'].forEach(verb => $$(`[hx-${verb}]:not([hx-applied])`)
		.forEach(el => {
			const hxTarget = el.attr('hx-target'), hxTrigger = el.attr('hx-trigger');
			const targetEl = hxTarget ? $(hxTarget) : el, hxLoad = el.attr('hx-load');
			el instanceof HTMLFormElement
				? el.on('submit', async e => (e.preventDefault(), await fetchData(el.attr(`hx-${verb}`), targetEl, el, { method: verb, body: new URLSearchParams(new FormData(el)) })))
				: el.on(hxTrigger || getEventType(el), async () => await fetchData(el.attr(`hx-${verb}`), targetEl, el, { method: verb }));
			el.attr('hx-applied', 'true');
			if(hxLoad) (new Function('el', 'targetEl', hxLoad))(el, targetEl);
		}));
		
	};

	const getEventType = el => el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement ? 'change' : 'click';

	const fetchData = async (url, targetEl, el, options = {}) => {
		const hxBefore = el.attr('hx-before'), hxAfter = el.attr('hx-after'), hxHeaders = el.attr('hx-headers'),
			hxVals = el.attr('hx-vals'), hxSwap = el.attr('hx-swap'), hxSelect = el.attr('hx-select');
		if (hxBefore) (new Function('el', 'targetEl', hxBefore))(el, targetEl);
		const method = options.method || 'get';
		if (hxVals) method === 'get' ? url += '?' + new URLSearchParams(json(hxVals,el)) : options.body = json(hxVals,el);
		const response = await fetch(url, { ...options, method, headers: { ...options.headers, ...json(hxHeaders) } });
		const data = await response.text();
		applySwap(targetEl, data, hxSwap, hxSelect);
		if (hxAfter) (new Function('data', 'el', 'targetEl', hxAfter))(data, el, targetEl);
		run();
	};

	const json = (s, el) => s ? (s.startsWith('js:') ? Function('el', `return ${s.slice(3)}`)(el) : JSON.parse(s.replace(/'/g, '"'))) : {};
	
	const applySwap = (el, data, hxSwap, hxSelect) => {
		if (hxSwap === 'none') return;
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
