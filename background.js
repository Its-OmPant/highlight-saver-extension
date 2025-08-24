const STORAGE_KEY = "highlights";

chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.get([STORAGE_KEY], ({ [STORAGE_KEY]: highlights }) => {
		if (!Array.isArray(highlights)) {
			chrome.storage.local.set({ [STORAGE_KEY]: [] });
		}
	});
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	(async () => {
		try {
			if (message?.type === "SAVE_HIGHLIGHT") {
				const item = message.payload;
				const { [STORAGE_KEY]: highlights = [] } =
					await chrome.storage.local.get(STORAGE_KEY);
				// console.log("Current highlights:", highlights);
				highlights.unshift(item); // newest first
				await chrome.storage.local.set({ [STORAGE_KEY]: highlights });
				// console.log("Updated highlights:", highlights); // Debug log
				sendResponse({ ok: true, id: item.id });
				return;
			}

			if (message?.type === "DELETE_HIGHLIGHT") {
				const id = message.payload?.id;
				const { [STORAGE_KEY]: highlights = [] } =
					await chrome.storage.local.get(STORAGE_KEY);
				const next = highlights.filter((h) => h.id !== id);
				await chrome.storage.local.set({ [STORAGE_KEY]: next });
				sendResponse({ ok: true });
				return;
			}

			if (message?.type === "CLEAR_HIGHLIGHTS") {
				await chrome.storage.local.set({ [STORAGE_KEY]: [] });
				sendResponse({ ok: true });
				return;
			}
		} catch (err) {
			console.error(err);
			sendResponse({ ok: false, error: String(err) });
		}
	})();

	return true;
});
