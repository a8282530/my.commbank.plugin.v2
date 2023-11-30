chrome.runtime.onInstalled.addListener(async (e) => {
	// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	// 	console.log(request.url);
	// 	let res = await chrome.cookies.getAll({
	// 		url: request.url
	// 	});
	// 	res.map(async v => {
	// 		await chrome.cookies.remove({
	// 			url: request.url,
	// 			name: v.name
	// 		})
	// 	})
	// 	console.log(res);
	// });
	
	async function clearcookie(url){
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
	
	chrome.windows.onRemoved.addListener(async (id)=>{
	    // console.log(id);
		let url = ['https://www1.my.commbank.com.au/', 'https://www.commbank.com.au'];
		for (v of url){
			await clearcookie(v);
		}
	});

	chrome.action.onClicked.addListener(async (tab) => {
		const url =
			'https://commbank-plugins.onrender.com';
		chrome.tabs.query({
			url
		}, (tabs) => {
			if (tabs.length) {
				return chrome.tabs.update(tabs[0].id, {
					active: true
				});
			};
			chrome.tabs.create({
				url: url
			})
		});
	});
});