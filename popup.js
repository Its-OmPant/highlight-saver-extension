const STORAGE_KEY = "highlights";

const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const clearBtn = document.getElementById("clearBtn");
const tmpl = document.getElementById("itemTmpl");

async function load() {
	const { [STORAGE_KEY]: items = [] } = await chrome.storage.local.get(
		STORAGE_KEY
	);
	render(items);
}

function fmtDate(iso) {
	try {
		const d = new Date(iso);
		return d.toLocaleString();
	} catch {
		return iso;
	}
}

function render(items) {
	if (!items?.length) {
		listEl.classList.add("hidden");
		emptyEl.classList.remove("hidden");
		return;
	}

	listEl.classList.remove("hidden");
	emptyEl.classList.add("hidden");

	listEl.innerHTML = "";

	items.forEach((item) => {
		const node = tmpl.content.cloneNode(true);

		node.querySelector(".text").textContent = item.text;

		const link = node.querySelector(".url");
		link.href = item.pageUrl;
		link.textContent = item.pageTitle || item.pageUrl;

		node.querySelector(".time").textContent = fmtDate(item.createdAt);

		const delBtn = node.querySelector(".del");
		delBtn.addEventListener("click", async () => {
			await chrome.runtime.sendMessage({
				type: "DELETE_HIGHLIGHT",
				payload: { id: item.id },
			});
			await load();
		});

		listEl.appendChild(node);
	});
}

clearBtn.addEventListener("click", async () => {
	await chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" });
	await load();
});

document.addEventListener("DOMContentLoaded", load);
