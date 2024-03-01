document.addEventListener('DOMContentLoaded', e => {
	function delay(ms) {
	    return new Promise(resolve => {
	        setTimeout(resolve, ms);
	    });
	};
	let win,interval;
	loading('等待拖入文本文件...', 'slidedown');
	// document.addEventListener('click', e=>{
	// 	setTimeout(()=>{
	// 		table.clearAlert()
	// 	}, 1500);
	// },false);
	function alertmsg(msg) {
		pxmu.fail({
			msg, //loading信息 为空时不显示文本
			time: 2000, //停留时间 
			bg: 'rgba(0, 0, 0, 0.65)', //背景色
			color: '#fff', //文字颜色
			animation: 'slidedeg', //动画名 详见动画文档
			close: true, // 自动关闭 为false时可在业务完成后调用 pxmu.closeload();手动关闭
			inscroll: false, //模态 不可点击和滚动
			inscrollbg: 'rgba(0, 0, 0, 0.45)', //自定义遮罩层颜色 为空不显示遮罩层
		});
	}

	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		document.addEventListener(eventName, preventDefaults, false);
	});

	function preventDefaults(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	['dragenter', 'dragover'].forEach(eventName => {
		document.addEventListener(eventName, highlight, false);
	});

	['dragleave', 'drop'].forEach(eventName => {
		document.addEventListener(eventName, unhighlight, false);
	});

	function highlight(e) {
		console.log('highlight');
	}

	function unhighlight(e) {
		console.log('unhighlight');
		pxmu.closeload(100)
	}

	document.addEventListener('drop', handleDrop, false);

	function handleDrop(e) {
		let dt = e.dataTransfer;
		let files = dt.files;

		handleFiles(files);
	}

	function handleFiles(files) {
		([...files]).forEach(uploadFile);
	}

	async function writeFile(filename, str) {
		const options = {
			types: [{
				description: 'Text Files',
				accept: {
					'text/plain': ['.txt'],
				},
			}, ],
			suggestedName: filename,
		};
		// 创建一个新的文件句柄
		const fileHandle = await window.showSaveFilePicker(options);
		// 创建一个可写流
		const writableStream = await fileHandle.createWritable();
		// 写入数据
		await writableStream.write(str);
		// 关闭流
		await writableStream.close();
	}



	function render(data) {
		const ContextMenu = [{
				label: "显示所有数据",
				action: async (e, column) => {
					// column.popup("Hey There", "center");
					await table.clearFilter();
				}
			},
			{
				separator: true,
			},
			{
				label: "显示登录过的数据",
				action: async (e, column) => {
					let data = table.searchData('control', '!=', 'wait open');
					if (!data.length) {
						return alertmsg("无登录过的数据!", "error");
					}
					await table.setFilter('control', '!=', 'wait open');
				}
			},
			{
				separator: true,
			},
			{
				label: "显示登录成功的数据",
				action: async (e, column) => {
					let data = table.searchData('control', '=', 'success');
					if (!data.length) {
						return alertmsg("无登录成功的数据!", "error");
					}
					await table.setFilter('control', '=', 'success');
				}
			},
			{
				separator: true,
			},
			{
				label: "显示登录失败的数据",
				action: async (e, column) => {
					let data = table.searchData('control', '=', 'error');
					if (!data.length) {
						return alertmsg("无登录失败的数据!", "error");
					}
					await table.setFilter('control', '=', 'error');
				}
			},
			{
				separator: true,
			},
			{
				label: "下载当前数据",
				action: async (e, column) => {
					let data = column.getData();
					if (!data?.info) {
						return alertmsg("无下载数据!", "error");
					}
					// let txt = data.filter((obj) => {
					// 	return obj.control == data.control
					// }).map(obj => obj.info).join('\r\n')
					let txt = table.getData('active').map(obj => obj.info).join('\r\n')
					// await table.download("csv", `${data.control}.${document.title}.csv`);
					await writeFile(`${data.control}.${document.title}`, txt);
				}
			},
			{
				label: "运行自动登录",
				action: async (e, column) => {
					if (ContextMenu[9].label == "运行自动登录") {
						ContextMenu[9].label = "停止自动登录"
						column.getCells()[2].getElement().click();
					} else {
						ContextMenu[9].label = "运行自动登录";
						interval && clearTimeout(interval);
						win && win.close();
						
					};
					// window.col = column;
					// window.ee = e;
					// let data = column.getData();
					// console.info(data, e.target.innerText)
				}
			}
		];

		let table = new Tabulator("#table", {
			placeholder: "No Data Available", //无数据时默认占位
			responsiveLayout: 'hide', // 启用响应式布局
			// resizableRows:true,
			layout: "fitColumns",
			maxHeight: "100%",
			layoutColumnsOnNewData: true,
			renderHorizontal: "virtual", //启用水平虚拟 DOM 
			data, //set initial table data
			// rowFormatter: function(row) {
			// 	console.log(row.getElement())
			// },
			pagination: true, //启用分页
			paginationSize: 30, // 可选参数，用于请求每页一定数量的行
			// paginationInitialPage : 1 , // 可选参数设置要加载的初始页面
			paginationSizeSelector: [30, 50, 100, true], //选择末尾带有“all”选项的列表列表
			paginationCounter: "rows", //添加分页行计数器
			persistence: true, //启用表持久化
			selectable: true,
			Clipboard: true, //启用剪贴板功能
			// popupContainer:false, // 菜单设置
			rowContextMenu: (e, component) => {
				// console.log(e, component);
				// component.getTable().getData().map(obj=>)
				return ContextMenu
			},

			columns: [{
					title: "编号",
					field: "id",
					maxWidth: 100,
					download: false
				},
				{
					title: "信息",
					field: "info",
					editor: true
				},
				{
					title: "操作",
					field: "control",
					download: false,
					maxWidth: 150,
					// width:50,
					hozAlign: "center",
					cellClick: async (e, row) => {
						// getNextRow(row.getRow());
						// if(row){
						// 	return
						// }
						win && win.close();
						interval && clearTimeout(interval);
						let data = row.getData();
						// window.rr = row;
						let m = data.info.match(/\b(\d{8})\s+(\S+)/i);
						let [, user, pwd] = m || [,,];
						if (!user || !pwd || Number(pwd) || pwd.length < 6) {
							
							row.setValue('error', true);
							if (ContextMenu[9].label == "停止自动登录"){
								getNextRow(row.getRow());
								// row.getRow().getNextRow().getCells()[2].getElement().click();
							}
							return 
						};
						if (ContextMenu[9].label == "停止自动登录" && 'error success'.includes(data.control)){
							return getNextRow(row.getRow());
							// return row.getRow().getNextRow().getCells()[2].getElement().click();
						}
						row.setValue('waiting', true);
						let id = await openwindow(user, pwd, data.id);
						if (ContextMenu[9].label =="停止自动登录"){
							interval = setTimeout(()=>{
								console.log(id,user, pwd, data.id);
								row.getElement().click();
							},180000);
						}
						
					}
				}
			]
		});
		table.on("menuClosed", (component) => {
			console.log(component);
			window.component = component;

		});
		
		function getNextRow(row){
			// window.rr = row;
			// window.tt = table;
			let nextRow = row.getNextRow();
			if (!nextRow){
				if (table.getPage() >= table.getPageMax()){
					ContextMenu[9].label = "运行自动登录";
					interval && clearTimeout(interval);
					win && win.close();
					return pxmu.diaglog('任务已全部完成...');
				}
				table.nextPage();
				let div = document.querySelector('div.tabulator-cell[tabulator-field="control"]');
				div && div.click()
				return
			}
			
			nextRow.getCell('control').getElement().click();
			table.selectRow(nextRow.getIndex());
			
		}

		window.addEventListener('message', async msg => {
			if (msg.origin.includes('commbank.com.au')) {
				let data = msg.data;
				// console.log(data);
				if (!data.id || !data.status) {
					return
				}
				let row = table.getRow(Number(data.id));
				let rowdata = row.getData();
				let info = {
					control: data.status
				}
				data.info && !rowdata.info.includes(data.info) && (
					info.info = `${rowdata.info} | ${data.info}`
				);
				await row.update(info)
				if (data.status != 'next' && ContextMenu[9].label =="停止自动登录"){
					// win && win.close();
					// console.log(msg, row.getNextRow())
					await delay(600);
					// row.getNextRow().getCell('control').getElement().click();
					getNextRow(row);
				}
			}
			// console.log(msg)
			
		})


		async function openwindow(user, pwd, id) {
			let openurl = 'https://www.my.commbank.com.au/netbank/Logon/Logon.aspx?ei=mv_logon-NB',
				obj = btoa(JSON.stringify({
					user,
					pwd,
					id
				}));

			win = window.open(openurl, `${obj}`,
				"width=600,height=800,status=no,scrollbars=yes,resizable=no,location=no");
			return id;
		}
	}

	function loading(msg, animation) {
		animation = animation || 'slideup';
		pxmu.loading({
			msg, //loading信息 为空时不显示文本
			// time: 15000, //停留时间 
			bg: 'rgba(0, 0, 0, 0.65)', //背景色
			color: '#fff', //文字颜色
			animation, //动画名 详见动画文档
			close: false, // 自动关闭 为false时可在业务完成后调用 pxmu.closeload();手动关闭
			inscroll: true, //模态 不可点击和滚动
			inscrollbg: 'rgba(0, 0, 0, 0.45)', //自定义遮罩层颜色 为空不显示遮罩层
		});
	}

	function uploadFile(file) {
		let reader = new FileReader();
		reader.onload = function(e) {
			document.title = file.name;
			let regex = /\b\d{8}[\s\S]*?\d{3}[\s\S]*?\/[\s\S]*?\d{2}\b/g;
			// let regex = /\b(\d{8})\s+(\S+)\s+([\s\S]*?)\s+(\d+)\s+(\d{3})\s+(\d{2}\s+|\S+\d{2})/;
			let txt = e.target.result;
			let matches = txt.match(regex);
			let objlist = matches.map((v, i) => {
				return {
					id: i + 1,
					info: v.trim(),
					control: "wait open"
				}
			});
			loading('正在加载文件...');
			render(objlist);
			pxmu.closeload(300);
		};
		reader.readAsText(file);

	}


});
