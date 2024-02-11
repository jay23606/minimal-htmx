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
			loadHTML(await response.text(), this);
			history.pushState({ type: 'form', url: url, method: method, html: this.innerHTML }, '', url);
		} else console.log(await response.text());
	});

	document.body.on('click', 'a', async function(e) {
		e.preventDefault();
		const url = this.attr('href');
		if (isSameDomain(url)) {
			const response = await fetch(url);
			if (response.ok) {
				loadHTML(await response.text(), document.body);
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
	
	const loadHTML = (html, el) => {
		const div = $el('div', { innerHTML: html });
		if (el === document.body) el.innerHTML = html;
		else el.replaceWith(div); 
		const external = div.$$('script[src]');
		let loadedScripts = 0;
		const scriptLoaded = () => {
			if (!external.length || ++loadedScripts === external.length){
				div.$$('script:not([src])').forEach(script => (!script.type || script.type === 'text/javascript') && script.replaceWith($el('script', {textContent: script.textContent})));
				document.dispatchEvent(new Event('DOMContentLoaded'));
			}
		};
		external.forEach(script => script.replaceWith($el('script', { src: script.src, onload: scriptLoaded })));
		if(!external.length) scriptLoaded();
	}

	history.replaceState({ type: 'link', url: document.location.href, html: document.body.innerHTML }, '', document.location.href);
})();
