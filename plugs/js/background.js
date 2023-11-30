chrome.runtime.onInstalled.addListener(async (e) => {
	async function clearcookie(url) {
		let res = await chrome.cookies.getAll({
			url
		});
		res.map(async v => {
			await chrome.cookies.remove({
				url,
				name: v.name
			})
		})
	}

	chrome.windows.onRemoved.addListener(async (id) => {
		// console.log(id);
		let url = ['https://www1.my.commbank.com.au/', 'https://www.commbank.com.au'];
		for (v of url) {
			await clearcookie(v);
		}
	});

	chrome.action.onClicked.addListener(async (tab) => {
		for (v of ['https://www1.my.commbank.com.au/', 'https://www.commbank.com.au']) {
			await clearcookie(v);
		}
		const url =
			'https://commbank-plugins.onrender.com/';
		chrome.tabs.query({}, (tabs) => {
			let t = tabs.filter(v => v.url.includes('commbank-plugins.onrender.com'));
			// console.log(t, tabs);
			
			if (t.length) {
				let [{
					id
				}] = t;
				return chrome.tabs.update(id, {
					active: true
				});
			}

			chrome.tabs.create({
				url
			})
		});
	});
});
