import IAnswer from "./redux/types/data/IAnswer";
import IInitData from "./redux/types/data/IInitData";
import ErrorService from "./services/ErrorService";

const startScript: () => Promise<void> = async () => {
	await fetch("http://localhost:3001/autogpt/start");
};

const killScript: () => Promise<void> = async () => {
	await fetch("http://localhost:3001/autogpt/stop");
};

const fetchData: () => Promise<IAnswer[]> = async () => {
	const res = await fetch("http://localhost:3001/autogpt/data");
	let data = await res.json();
	if (data === "") {
		return [];
	}
	// remove last char from data data is a string
	// remove \n
	data = data.output.replaceAll("\n", "");
	data = data.replaceAll("\u001b", "");
	// remove last comma
	data = data
		.split("")
		.reverse()
		.join("")
		.replace(",", "")
		.split("")
		.reverse()
		.join("");
	let json = [];
	try {
		console.log("data");
		console.log(typeof data);
		console.log(data);
		json = JSON.parse(`[${data}]`);
		// json = data;
	} catch (e) {
		console.log(e)
		console.log(data);
		// debugger;
	}
	return json;
};

const downloadFile: (filename: string) => Promise<void> = async (
	filename: string,
) => {
	const res = await fetch("http://localhost:3001/autogpt/download", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ filename }),
	});
	const blob = await res.blob();
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
};

const createInitData = async (data: IInitData) => {
	const res = await fetch("http://localhost:3001/autogpt/init", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	return res;
};

const sendData = async (data: string) => {
	console.log("sendData")
	console.log(data)
	console.log(data)
	const res = await fetch("http://localhost:3001/autogpt/sendData", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({data: data}),
	});
	return res;
};


export default {
	startScript: ErrorService.errorHandler(startScript),
	killScript: ErrorService.errorHandler(killScript),
	fetchData: ErrorService.errorHandler(fetchData),
	createInitData: ErrorService.errorHandler(createInitData),
	downloadFile: ErrorService.errorHandler(downloadFile),
	sendData: ErrorService.errorHandler(sendData),
};
