import { parse } from 'csv-parse';
import fs from 'node:fs';

const csvPath = new URL('./data.csv', import.meta.url);

(async () => {
	const stream = fs.createReadStream(csvPath).pipe(
		parse({
			from_line: 2,
			skip_empty_lines: true,
			delimiter: ','
		})
	);

	for await (const chunk of stream) {
		const [title, description] = chunk;
		
		await fetch('http://localhost:3333/tasks', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ title, description })
		});
	}
})();
