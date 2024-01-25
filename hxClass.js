(() => {
	// Dynamically load js-yaml library
	const script = document.createElement('script');
	script.src = 'https://cdn.jsdelivr.net/npm/js-yaml/dist/js-yaml.min.js';
	script.onload = () => {
	  // After js-yaml is loaded, execute the main script
	  loadAndApplyAttributes();
	};
	document.head.appendChild(script);

	// Main script
	const loadAndApplyAttributes = async () => {
	  const applyAttributes = (element, attributes) => Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));

	  const applyClassAttributes = async (element, classNames) => {
		const yamlData = document.getElementById('classAttributeMap').textContent;
		const classAttributeMap = jsyaml.load(yamlData);

		classNames.split(' ').forEach(className => {
		  const classAttributes = classAttributeMap[className] || {};
		  applyAttributes(element, classAttributes);
		});
	  };

	  // Iterate over elements with hx-class attribute
	  document.querySelectorAll('[hx-class]').forEach(element => {
		const classNames = element.getAttribute('hx-class');
		applyClassAttributes(element, classNames);
	  });
	};
})();
