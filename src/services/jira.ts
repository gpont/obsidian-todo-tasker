import * as https from "https";
import { URL } from "url";

interface JiraConfig {
	baseUrl: string;
	email: string;
	apiToken: string;
}

interface JiraIssue {
	key: string;
	fields: {
		summary: string;
		description?: string;
		status: {
			name: string;
		};
	};
}

export class JiraService {
	private config: JiraConfig;

	constructor(config: JiraConfig) {
		this.config = config;
	}

	private getAuthHeader(): string {
		const auth = Buffer.from(
			`${this.config.email}:${this.config.apiToken}`
		).toString("base64");
		return `Basic ${auth}`;
	}

	private makeRequest<T>(
		path: string,
		method = "GET",
		body?: any
	): Promise<T> {
		return new Promise((resolve, reject) => {
			const url = new URL(`${this.config.baseUrl}${path}`);

			const options = {
				method,
				headers: {
					Authorization: this.getAuthHeader(),
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			};

			const req = https.request(url, options, (res) => {
				let data = "";

				res.on("data", (chunk) => {
					data += chunk;
				});

				res.on("end", () => {
					if (res.statusCode === 200) {
						try {
							resolve(JSON.parse(data));
						} catch (error) {
							reject(new Error("Failed to parse response"));
						}
					} else {
						reject(
							new Error(
								`Request failed with status ${res.statusCode}`
							)
						);
					}
				});
			});

			req.on("error", (error: Error) => {
				reject(error);
			});

			if (body) {
				req.write(JSON.stringify(body));
			}

			req.end();
		});
	}

	async getIssue(issueKey: string): Promise<JiraIssue> {
		return this.makeRequest<JiraIssue>(`/rest/api/2/issue/${issueKey}`);
	}

	async searchIssues(jql: string): Promise<JiraIssue[]> {
		const response = await this.makeRequest<{ issues: JiraIssue[] }>(
			"/rest/api/2/search",
			"POST",
			{
				jql,
				maxResults: 50,
			}
		);
		return response.issues;
	}

	async testConnection(): Promise<boolean> {
		return new Promise((resolve) => {
			const url = new URL(`${this.config.baseUrl}/rest/api/2/myself`);

			const options = {
				headers: {
					Authorization: this.getAuthHeader(),
					Accept: "application/json",
				},
			};

			const req = https.get(url, options, (res) => {
				resolve(res.statusCode === 200);
			});

			req.on("error", (error: Error) => {
				console.error("Jira connection test error:", error);
				resolve(false);
			});

			req.end();
		});
	}
}
