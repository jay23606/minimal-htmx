(function () {
  HTMLElement.prototype.attr = function (a, v) { return v === undefined ? this.getAttribute(a) : (this.setAttribute(a, v), this); };
  HTMLElement.prototype.$ = function (selector) { return this.querySelector(selector); };
  HTMLElement.prototype.$$ = function (selector) { return this.querySelectorAll(selector); };
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  $el = (el, attrs = {}) => Object.assign(document.createElement(el), attrs);

  const applyAttrs = (el, attrs) => Object.entries(attrs).forEach(([key, value]) => el.attr(key, value));

  const applyClassAttrs = (el, classNames) => {
    const yamlScripts = $$('script[type="text/yaml"]');
    yamlScripts.forEach(script => {
      const yamlData = script.textContent;
      const classAttributeMap = jsyaml.load(yamlData);
      classNames.split(' ').forEach(className => applyAttrs(el, classAttributeMap[className] || {}));
    });
  };

  const loadScript = (src, callback) => {
    const script = $el('script', { src: src, onload: callback });
    document.head.appendChild(script);
  };

  const loadAndApplyAttrs = () => window.jsyaml ? applyAttrs() : loadScript('https://cdn.jsdelivr.net/npm/js-yaml/dist/js-yaml.min.js', processAttrs);

  const processAttrs = () => {
    $$('[hx-ext="hx-class"]').forEach(hxClassExt => {
      hxClassExt.$$('[hx-class]').forEach(el => {
        applyClassAttrs(el, el.attr('hx-class'));
        //htmx.process(el);
      });
      htmx.process(hxClassExt); //seems like a decent place to re-process nodes
    });
    //htmx.process(document.body);
  };

  document.addEventListener('DOMContentLoaded', loadAndApplyAttrs);
  //seems to cause an infinite loop
  //htmx.defineExtension('hx-class', { onEvent: (name, evt) => (name.includes("htmx:before") || name.includes("htmx:after")) && loadAndApplyAttrs() });
})();
