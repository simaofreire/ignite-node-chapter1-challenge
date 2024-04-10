import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();
const currentDay = new Date().toISOString().slice(0, 10);

export const routes = [
	{
		method: 'GET',
		path: buildRoutePath('/tasks'),
		handler: (req, res) => {
			const { search } = req.query;
			const decodedSearch = decodeURIComponent(search).toLowerCase();

			const tasks = database.select('tasks', search ? { title: decodedSearch, description: decodedSearch } : null);

			return res.writeHead(201).end(JSON.stringify(tasks));
		}
	},
	{
		method: 'POST',
		path: buildRoutePath('/tasks'),
		handler: async (req, res) => {
			const { title, description } = req.body;

			if (!title || !description) {
				return res.writeHead(400).end('Missing title or description parameters');
			}

			const task = {
				id: randomUUID(),
				title,
				description,
				completed_at: null,
				created_at: currentDay,
				updated_at: currentDay
			};

			database.insert('tasks', task);
			
			return res.writeHead(201).end(JSON.stringify({ message: 'Task created', ...task }));
		}
	},
	{
		method: 'PUT',
		path: buildRoutePath('/tasks/:id'),
		handler: (req, res) => {
			const { id } = req.params;
			const { title, description } = req.body;

			if (!title && !description) {
				return res.writeHead(400).end('Title or description are required');
			}

			let [task] = database.select('tasks', { id });
			console.log(task);
			if (!task) {
				return res.writeHead(404).end('Task not found');
			}

			database.update('tasks', id, {
				title: title ?? task.title,
				description: description ?? task.description,
				updated_at: currentDay
			});

			return res.writeHead(204).end();
		}
	},
	{
		method: 'PATCH',
		path: buildRoutePath('/tasks/:id/complete'),
		handler: (req, res) => {
			const { id } = req.params;
			let [task] = database.select('tasks', { id });

			if (!task) {
				return res.writeHead(404).end('Task not found');
			}

			database.update('tasks', id, { completed_at: task.completed_at ? null : currentDay, updated_at: currentDay });

			res.writeHead(204).end();
		}
	},
	{
		method: 'DELETE',
		path: buildRoutePath('/tasks/:id'),
		handler: (req, res) => {
			const { id } = req.params;
			let [task] = database.select('tasks', { id });

			if (!task) {
				return res.writeHead(404).end('Task not found');
			}

			database.delete('tasks', id);
			res.writeHead(204).end();
		}
	}
];
