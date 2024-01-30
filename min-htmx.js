//latest version - only handles form and anchor tags, see mhtmx.html for usage
(()=>{
	const isSameDomain = (url) => ((a) => (a.href = url, a).hostname === location.hostname || !a.hostname)(document.createElement('a'));
	const $el = (el, attrs = {}) => Object.assign(document.createElement(el), attrs);
	HTMLElement.prototype.attr = function(a, v) {return v ? (this.setAttribute(a, v), this) : this.getAttribute(a) };
	HTMLElement.prototype.$$ = function(s) { return this.querySelectorAll(s) }
	HTMLElement.prototype.on = function(ev, selOrFn, fn) {
		this.addEventListener(ev, e => {
			const target = e.target.closest(selOrFn);
			if (target) typeof selOrFn === 'string' ? fn.call(target, e) : selOrFn(e);
		});
		return this;
	}
	
	document.body.on('submit', 'form', async function(e) {
		e.preventDefault();
		const method = this.attr('method') || 'POST';
		let url = this.attr('action');
		const formData = new FormData(this);
		let options = { method };
		if (method.toUpperCase() === 'GET') {
			const params = new URLSearchParams(formData);
			url += '?' + params
		} else options.body = formData;
		const response = await fetch(url, options);
		if (response.ok) {
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = await response.text();
			await replaceWithResponse(tempDiv, this, this.attr('action'));
			history.pushState({ type: 'form', url: url, method: method, html: this.innerHTML }, '', url);
		} else console.log(await response.text());
	});

	document.body.on('click', 'a', async function(e) {
		e.preventDefault();
		const url = this.attr('href');
		if (isSameDomain(url)) {
			const response = await fetch(url);
			if (response.ok) {
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = await response.text();
				await replaceWithResponse(tempDiv, document.body, url);
				history.pushState({ type: 'link', url: url, html: document.body.innerHTML }, '', url);
			} else console.log(await response.text());
		} else location.href = this.attr('href');
	});

	window.addEventListener('popstate', async function(event) {
		const state = event.state;
		if (state) {
			if (state.type === 'form') {
				const form = document.querySelector(`form[action="${state.url}"][method="${state.method}"]`);
				if (form) form.outerHTML = state.html;
			} else if (state.type === 'link') document.body.innerHTML = state.html;
		}
	});
	
	let hasLoaded = {};
	const replaceWithResponse = async (tempDiv, targetElement, url) => {
		const nodes = Array.from(tempDiv.childNodes);
		const [nodesScriptSrc, nodesScriptTextContent, nodesOther] = nodes.reduce((acc, node) => {
			if (!node.tagName) acc[2].push(node);
			else {
				const tagName = node.tagName.toLowerCase();
				if (tagName === 'script' && node.hasAttribute('src')) acc[0].push(node);
				else if (tagName === 'script' && node.type !== 'text/yaml') acc[1].push(node);
				else acc[2].push(node);
			}
			return acc;
		}, [[], [], []]);

		const txt = nodesOther.map(node => node.outerHTML || node.textContent).join('');
		targetElement === document.body ? (targetElement.innerHTML = txt) : (targetElement.outerHTML = txt);

		const loadScript = (src) => new Promise((resolve, reject) => {
			const script = $el('script', { src, onload: resolve, onerror: reject });
			document.head.appendChild(script);
		});

		const dispatchLoaded = () => document.dispatchEvent(new Event('DOMContentLoaded')); //,{ bubbles: true, cancelable: true } needed?

		const loadAllScripts = async (nodesScriptSrc) => {
			await Promise.all(nodesScriptSrc.map(scriptNode => loadScript(scriptNode.getAttribute('src'))));
			console.log('Loaded scripts for ' + url);
			hasLoaded[url] = true;
			nodesScriptTextContent.forEach(script => document.body.appendChild($el('script', { textContent: script.textContent })));
			dispatchLoaded();
		};

		hasLoaded[url] ? dispatchLoaded() : await loadAllScripts(nodesScriptSrc);
	};

	history.replaceState({ type: 'link', url: document.location.href, html: document.body.innerHTML }, '', document.location.href);
})();
