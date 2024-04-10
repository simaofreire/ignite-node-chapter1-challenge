import http from 'node:http';
import { extractQueryParams } from '../../src/utils/extract-query-params.js';
import { json } from './middlewares/json.js';
import { routes } from './routes.js';

const server = http.createServer(async (req, res) => {
	await json(req, res);
	
	const { method, url } = req;
	const route = routes.find((route) => route.method === method && route.path.test(url));

	if (route) {
		const routeParams = req.url.match(route.path);
		const { query, ...params } = routeParams.groups;

		req.params = params;
		req.query = query ? extractQueryParams(query) : {};

		return route.handler(req, res);
	}

	return res.writeHead(404).end('ROUTE NOT FOUND');
});

server.listen(3333);
