(function () {
	const UI_ID = "hs-floating-save";
	const TOAST_ID = "hs-toast";
	const MIN_LEN = 3;

	let cleanupTimer = null;

	function removeNodeById(id) {
		const el = document.getElementById(id);
		if (el) el.remove();
	}

	function createButton(rect) {
		removeNodeById(UI_ID);

		const btn = document.createElement("div");
		btn.id = UI_ID;
		btn.className = "hs-pop";
		btn.textContent = "Save highlight?";

		const top = window.scrollY + rect.top - 36;
		const left = window.scrollX + rect.left + Math.min(16, rect.width / 2);

		btn.style.top = `${Math.max(8, top)}px`;
		btn.style.left = `${Math.max(8, left)}px`;

		btn.addEventListener("mousedown", (e) => {
			e.preventDefault();
			e.stopPropagation();
		});
		btn.addEventListener("mouseup", (e) => {
			e.preventDefault();
			e.stopPropagation();
		});

		btn.addEventListener("click", async (e) => {
			e.preventDefault();
			e.stopPropagation();
			try {
				await saveCurrentSelection();
				removeNodeById(UI_ID);
				showToast("Highlight saved");
			} catch (err) {
				console.error("Error in click handler:", err);
			}
		});

		document.body.appendChild(btn);

		// Auto-hide on scroll or resize
		const hide = () => removeNodeById(UI_ID);
		window.addEventListener("scroll", hide, { once: true, passive: true });
		window.addEventListener("resize", hide, { once: true, passive: true });

		// Hide when user clicks elsewhere
		setTimeout(() => {
			const cancel = (evt) => {
				if (!btn.contains(evt.target)) removeNodeById(UI_ID);
				document.removeEventListener("mousedown", cancel, true);
			};
			document.addEventListener("mousedown", cancel, true);
		}, 0);
	}
	function showToast(msg) {
		removeNodeById(TOAST_ID);
		const toast = document.createElement("div");
		toast.id = TOAST_ID;
		toast.className = "hs-toast";
		toast.textContent = msg;
		document.body.appendChild(toast);
		clearTimeout(cleanupTimer);
		cleanupTimer = setTimeout(() => toast.remove(), 1600);
	}

	async function saveCurrentSelection() {
		try {
			const sel = window.getSelection();
			if (!sel || sel.rangeCount === 0) return;

			const text = sel.toString().trim();
			if (!text || text.length < MIN_LEN) return;

			const range = sel.getRangeAt(0);
			const rect = range.getBoundingClientRect();

			const payload = {
				id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
				text,
				pageUrl: location.href,
				pageTitle: document.title,
				createdAt: new Date().toISOString(),
				scrollY: window.scrollY,
				rect: {
					top: rect.top + window.scrollY,
					left: rect.left + window.scrollX,
					width: rect.width,
					height: rect.height,
				},
			};

			try {
				const response = await new Promise((resolve, reject) => {
					chrome.runtime?.sendMessage(
						{
							type: "SAVE_HIGHLIGHT",
							payload,
						},
						(response) => {
							if (chrome.runtime.lastError) {
								reject(chrome.runtime.lastError);
							} else {
								resolve(response);
							}
						}
					);
				});

				if (!response?.ok) {
					throw new Error(
						response?.error || "Failed to save highlight"
					);
				}

				showToast("Highlight saved");
			} catch (error) {
				console.error("Message sending failed:", error);
				showToast("Save failed - couldn't communicate with extension");
				throw error;
			}
		} catch (e) {
			console.error("Save failed", e);
			showToast("Save failed");
			throw e;
		}
	}
	function handleSelection() {
		const sel = window.getSelection();
		if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
			removeNodeById(UI_ID);
			return;
		}

		const text = sel.toString().trim();
		if (!text || text.length < MIN_LEN) {
			removeNodeById(UI_ID);
			return;
		}

		const rect = sel.getRangeAt(0).getBoundingClientRect();
		if (rect && rect.width >= 0 && rect.height >= 0) {
			createButton(rect);
		}
	}
	document.addEventListener("mouseup", handleSelection);
	document.addEventListener("keyup", (e) => {
		if (
			e.key === "Shift" ||
			e.key === "Control" ||
			e.key === "Alt" ||
			e.key === "Meta"
		)
			return;
		handleSelection();
	});
})();
