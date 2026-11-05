(function bootTextSize(win, config) {
	const doc = win.document;
	const root = doc.documentElement;
	let level = 0;
	try {
		const raw = win.localStorage.getItem(config.storageKey);
		if (raw === "1") level = 1;
		else if (raw === "2") level = 2;
	} catch {
		level = 0;
	}
	root.setAttribute("data-text-size", String(level));
	const labels = (root.getAttribute("lang") ?? "").indexOf("en") === 0 ? config.labels.en : config.labels.zh;
	const renderButton = (button) => {
		const textElement = button.querySelector("[data-text-size-label]");
		if (textElement !== null) textElement.textContent = labels.buttonTexts[level] ?? "";
		button.setAttribute("aria-label", labels.ariaLabels[level] ?? "");
		const dots = button.querySelectorAll("[data-text-size-dot]");
		for (let index = 0; index < dots.length; index += 1) dots[index]?.setAttribute("data-on", index <= level ? "true" : "false");
		button.removeAttribute("hidden");
	};
	const renderAll = () => {
		const buttons = doc.querySelectorAll("[data-text-size-toggle]");
		for (let index = 0; index < buttons.length; index += 1) {
			const button = buttons[index];
			if (button !== void 0) renderButton(button);
		}
	};
	const handleClick = () => {
		level = (level + 1) % 3;
		root.setAttribute("data-text-size", String(level));
		try {
			win.localStorage.setItem(config.storageKey, String(level));
		} catch {}
		renderAll();
		try {
			const tracker = win.umami;
			if (tracker !== void 0 && typeof tracker.track === "function") tracker.track(config.eventName, { level });
		} catch {}
	};
	const bindButtons = () => {
		const buttons = doc.querySelectorAll("[data-text-size-toggle]");
		for (let index = 0; index < buttons.length; index += 1) buttons[index]?.addEventListener("click", handleClick);
		renderAll();
	};
	if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", bindButtons);
	else bindButtons();
})(window, {"storageKey":"cnimee-text-size","eventName":"text-size-change","labels":{"zh":{"buttonTexts":["字号：标准","字号：大","字号：特大"],"ariaLabels":["大字，字号：标准，点一下改为大","大字，字号：大，点一下改为特大","大字，字号：特大，点一下改为标准"]},"en":{"buttonTexts":["Text size: Standard","Text size: Large","Text size: Extra large"],"ariaLabels":["Text size: Standard. Press to change to Large","Text size: Large. Press to change to Extra large","Text size: Extra large. Press to change to Standard"]}}});
