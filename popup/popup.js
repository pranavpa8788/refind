document.getElementById("handleNextResult").addEventListener("click", handleNextResult);
document.getElementById("handlePreviousResult").addEventListener("click", handlePreviousResult);
document.getElementById("handleClearText").addEventListener("click", handleClearText);

const searchBar = document.getElementById("searchBar");

searchBar.addEventListener("keydown", (event) => {
	console.log(`in event listener`);
    if (event.key === "Enter") {
		const query = searchBar.value;
		console.log(`detected enter key, query: ${query}`);
        search(query);
    }
});

async function search(sQuery) {
	chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
		const currentTab = tabs[0];
		chrome.scripting.executeScript({
			target: { tabId: currentTab.id },
			func: highlightMatches,
			args: [sQuery]
		});
	});
}

function clearHighlights() {
}

function highlightMatches(sPattern) {
	// clearHighlights();

	console.log(`pattern: ${sPattern}`);

	const regex = new RegExp(sPattern, "gi");

	const walker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_TEXT,
		null,
		false
	);

	const aMatches = [];
	let oNode;

	while (oNode = walker.nextNode()) {
		if (regex.test(oNode.textContent)) {
			aMatches.push(oNode);
		}
	}

	aMatches.forEach(oNode => {
		const oSpan = document.createElement("span");
		oSpan.innterHTML = oNode.textContent.replace(
			regex,
			match => `<mark class="extensionHighlight">${match}</mark>`
		);
		oSpan.className = "extensionWrapper";
		oNode.parentNode.replaceChild(oSpan, oNode);
	});

	console.log(`matches: ${aMatches.length}`);

	window.currentSearchResultIndex = 1;
}