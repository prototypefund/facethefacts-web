import axios, { AxiosResponse } from 'axios';
// eslint-disable-next-line
export default async function fetch(url: string) {
	const BASE_URL = 'https://www.abgeordnetenwatch.de/api/v2/';
	const res: AxiosResponse = await axios.get(BASE_URL + url);
	return await res.data;
}

// eslint-disable-next-line
export async function newfetch(url: string) {
	const BASE_URL = 'https://backend-aoa59.ondigitalocean.app/';
	const res = await axios(BASE_URL + url);
	return res.data;
}

//Connect local server
// eslint-disable-next-line
export async function localFetch(url: string) {
	const BASE_URL = 'http://127.0.0.1:8000/';
	const res = await axios(BASE_URL + url);
	return res.data;
}