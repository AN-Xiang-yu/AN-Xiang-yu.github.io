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
	const renderMenu = (menu) => {
		const textElement = menu.querySelector("[data-text-size-label]");
		if (textElement !== null) textElement.textContent = labels.buttonTexts[level] ?? "";
		menu.querySelector("[data-text-size-toggle]")?.setAttribute("aria-label", labels.ariaLabels[level] ?? "");
		const options = menu.querySelectorAll("[data-text-size-option]");
		for (let index = 0; index < options.length; index += 1) {
			const option = options[index];
			if (option === void 0) continue;
			option.setAttribute("aria-checked", index === level ? "true" : "false");
			if (index === level) option.setAttribute("aria-current", "true");
			else option.removeAttribute("aria-current");
		}
		menu.removeAttribute("hidden");
	};
	const renderAll = () => {
		const menus = doc.querySelectorAll("[data-text-size-menu]");
		for (let index = 0; index < menus.length; index += 1) {
			const menu = menus[index];
			if (menu !== void 0) renderMenu(menu);
		}
	};
	const applyLevel = (next) => {
		if (next === level) return;
		level = next;
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
	const bindMenu = (menu) => {
		const toggle = menu.querySelector("[data-text-size-toggle]");
		const list = menu.querySelector("[data-text-size-list]");
		const options = menu.querySelectorAll("[data-text-size-option]");
		if (toggle === null || list === null || options.length === 0) return;
		let isOpen = false;
		let focusIndex = 0;
		const focusOption = (index) => {
			focusIndex = (index + options.length) % options.length;
			options[focusIndex]?.focus();
		};
		const open = (index) => {
			isOpen = true;
			toggle.setAttribute("aria-expanded", "true");
			list.removeAttribute("hidden");
			focusOption(index);
		};
		const close = (shouldRestoreFocus) => {
			isOpen = false;
			toggle.setAttribute("aria-expanded", "false");
			list.setAttribute("hidden", "");
			if (shouldRestoreFocus) toggle.focus();
		};
		toggle.addEventListener("click", () => {
			if (isOpen) close(false);
			else open(level);
		});
		toggle.addEventListener("keydown", (event) => {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				open(level);
			}
		});
		for (let index = 0; index < options.length; index += 1) {
			const option = options[index];
			option?.addEventListener("click", () => {
				applyLevel(index);
				close(true);
			});
			option?.addEventListener("focus", () => {
				focusIndex = index;
			});
		}
		list.addEventListener("keydown", (event) => {
			if (event.key === "ArrowDown") {
				event.preventDefault();
				focusOption(focusIndex + 1);
			} else if (event.key === "ArrowUp") {
				event.preventDefault();
				focusOption(focusIndex - 1);
			} else if (event.key === "Home") {
				event.preventDefault();
				focusOption(0);
			} else if (event.key === "End") {
				event.preventDefault();
				focusOption(options.length - 1);
			} else if (event.key === "Escape") {
				event.preventDefault();
				close(true);
			} else if (event.key === "Tab") close(false);
		});
		toggle.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && isOpen) {
				event.preventDefault();
				close(true);
			}
		});
		doc.addEventListener("click", (event) => {
			if (isOpen && !menu.contains(event.target)) close(false);
		});
	};
	const bindMenus = () => {
		const menus = doc.querySelectorAll("[data-text-size-menu]");
		for (let index = 0; index < menus.length; index += 1) {
			const menu = menus[index];
			if (menu !== void 0) bindMenu(menu);
		}
		renderAll();
	};
	if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", bindMenus);
	else bindMenus();
})(window, {"storageKey":"cnimee-text-size","eventName":"text-size-change","labels":{"zh":{"buttonTexts":["字号：标准","字号：大","字号：特大"],"ariaLabels":["大字，字号：标准，打开菜单选择字号","大字，字号：大，打开菜单选择字号","大字，字号：特大，打开菜单选择字号"]},"en":{"buttonTexts":["Text size: Standard","Text size: Large","Text size: Extra large"],"ariaLabels":["Text size: Standard. Open the menu to choose a size","Text size: Large. Open the menu to choose a size","Text size: Extra large. Open the menu to choose a size"]}}});
