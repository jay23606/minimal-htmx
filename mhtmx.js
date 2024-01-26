(() => {
	HTMLElement.prototype.on = function (e, fn) { return this.addEventListener(e, fn) }
	HTMLElement.prototype.attr = function (a, v) { return v === undefined ? this.getAttribute(a) : (this.setAttribute(a, v), this) }
	const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
	const $DP = (htm, sel = '') => (new DOMParser().parseFromString(htm, 'text/html').querySelector(sel)?.innerHTML || '');
	$el = (el, attrs = {}) => Object.assign(document.createElement(el), attrs);
	
	//document.addEventListener('DOMContentLoaded', () => loadScript('https://cdn.jsdelivr.net/npm/js-yaml/dist/js-yaml.min.js', () => run()));
	
	document.addEventListener('DOMContentLoaded', () => run());
	
	//Minimal custom YAML parser
	const parseYamlish = (text) => {
	  const getNextIdx = (m, i, t) => m[i + 1] ? t.indexOf(m[i + 1], t.indexOf(m[i])) : t.length;
	  const obj = {};
	  const parseClass = (classText, level) => {
		const clsObj = {};
		const regex = new RegExp(`^\\s{${4 * level}}([-_\\w:.]+):`, 'gm');
		const propMatches = classText.match(regex) || [];
		propMatches.forEach((propMatch, j) => {
		  const prop = propMatch.trim().slice(0, -1);
		  const propEndIdx = getNextIdx(propMatches, j, classText);
		  const value = classText.substring(classText.indexOf(propMatch) + propMatch.length, propEndIdx);
		  clsObj[prop] = value.trim().includes(':') ? parseClass(value, level + 1) : value.trim();
		});
		return clsObj;
	  };
	  const classMatches = text.match(/^([-_\w:.]+):/gm) || [];
	  classMatches.forEach((clsMatch, i) => {
		const cls = clsMatch.trim().slice(0, -1);
		const clsEndIdx = getNextIdx(classMatches, i, text);
		const clsValue = text.substring(text.indexOf(clsMatch) + clsMatch.length, clsEndIdx);
		obj[cls] = parseClass(clsValue, 1);
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
	
	const run = () => {
		$$('[hx-class]').forEach(el => applyClassAttrs(el, el.attr('hx-class')));
		['get', 'post', 'put', 'delete', 'patch'].forEach(verb => $$(`[hx-${verb}]:not([hx-applied])`)
		.forEach(el => {
			const url = el.attr(`hx-${verb}`), hxTarget = el.attr('hx-target'), hxTrigger = el.attr('hx-trigger');
			const targetEl = hxTarget ? $(hxTarget) : el;
			el instanceof HTMLFormElement
				? el.on('submit', async e => (e.preventDefault(), await fetchData(url, targetEl, el, { method: verb, body: new URLSearchParams(new FormData(el)) })))
				: el.on(hxTrigger || getEventType(el), async () => await fetchData(url, targetEl, el, { method: verb }));
			el.attr('hx-applied', 'true');
		}));
	};

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
		processAttrs();
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
			'default': () => el.innerHTML = content
		};
		(actions[hxSwap] || actions['default'])();
	};
})();