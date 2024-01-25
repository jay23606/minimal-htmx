(function () {
    // Function to merge two objects
    function mergeObjects(obj1, obj2) {
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
        return obj1;
    }

    // Define htmx extension 'hx-class'
    htmx.defineExtension('hx-class', {
        onEvent: function (name, evt) {
            if (name === "htmx:configRequest") {
                // Find the closest element with 'hx-class' attribute
                var hxClassElt = htmx.closest(evt.detail.elt, "[hx-class],[data-hx-class]");
                if (hxClassElt) {
                    // Get the attribute value and evaluate it as needed
                    var hxClassValue = hxClassElt.getAttribute("hx-class") || hxClassElt.getAttribute("data-hx-class");

                    // Access the element and apply class attributes
                    var element = evt.detail.elt;
                    const applyAttributes = (element, attributes) => Object.entries(attributes).forEach(([key, value]) => element.hasAttribute(key) || element.setAttribute(key, value));
                    const applyClassAttributes = async (element, classNames) => {
                        const yamlData = document.getElementById('classAttributeMap').textContent;
                        const classAttributeMap = jsyaml.load(yamlData);

                        classNames.split(' ').forEach(className => {
                            const classAttributes = classAttributeMap[className] || {};
                            applyAttributes(element, classAttributes);
                        });
                    };

                    // Apply class attributes based on hx-class value
                    applyClassAttributes(element, hxClassValue);
                }
            }
        }
    });

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
	  const applyAttributes = (element, attributes) => Object.entries(attributes).forEach(([key, value]) => element.hasAttribute(key) || element.setAttribute(key, value));
	  const applyClassAttributes = async (element, classNames) => {
		const yamlData = document.getElementById('classAttributeMap').textContent;
		const classAttributeMap = jsyaml.load(yamlData);

		classNames.split(' ').forEach(className => {
		  const classAttributes = classAttributeMap[className] || {};
		  applyAttributes(element, classAttributes);
		});
	  };
	  document.querySelectorAll('[hx-class]').forEach(element => {
		const classNames = element.getAttribute('hx-class');
		applyClassAttributes(element, classNames);
	  });
	};
})();
