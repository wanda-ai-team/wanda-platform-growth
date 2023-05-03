import IAnswer from "./redux/types/data/IAnswer";
import IInitData from "./redux/types/data/IInitData";
import ErrorService from "./services/ErrorService";
import { getServerSession } from "next-auth/next";

const startScript: () => Promise<void> = async () => {
	await fetch(process.env.NEXT_PUBLIC_AUTO_SERVER_URL + "/autogpt/start");
};

const killScript: () => Promise<void> = async () => {
	await fetch(process.env.NEXT_PUBLIC_AUTO_SERVER_URL + "/autogpt/stop");
};

const fetchData: () => Promise<IAnswer[]> = async () => {
	console.log(process.env.NEXT_PUBLIC_AUTO_SERVER_URL)
	const res = await fetch(process.env.NEXT_PUBLIC_AUTO_SERVER_URL + "/autogpt/data");
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
	let json: IAnswer[] = [];
	try {
		console.log("data");
		console.log(typeof data);
		console.log(`[${data}]`);
		// json = JSON.parse(`[${data}]`);
		// json.push({ content: data + '\n' })
		// json = JSON.parse(data);
		if (data.toLowerCase().includes('thinking')) {
			json = [{ content: data + '\n', title: 'Thinking' }]
		} else {
			if (data.toLowerCase().includes('plan')) {
				json = [{ content: data + '\n', title: 'PLAN' }]
			}
			else {
				json = [{ content: data + '\n', title: 'Text' }]
			}
		}
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
	const res = await fetch(process.env.NEXT_PUBLIC_AUTO_SERVER_URL + "/autogpt/download", {
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
	console.log("data")
	return await fetch('/api/autogpt/createInitData',
		{
			method: 'POST',
			body: JSON.stringify({
				data: data
			})
		})
		.then((res) => res.json())
		.then((data) => {
			if (data.suceess === false) {
				return { content: "Error", success: false };
			}
			else {
				return { content: data.content, success: true };
			}
		}).catch((err) => {
			return { content: "Error", success: false };
		});
};

const sendData = async (data: string) => {
	const res = await fetch(process.env.NEXT_PUBLIC_AUTO_SERVER_URL + "/autogpt/sendData", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ data: data }),
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
