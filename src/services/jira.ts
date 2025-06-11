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

	async getIssue(issueKey: string): Promise<JiraIssue> {
		const response = await fetch(
			`${this.config.baseUrl}/rest/api/2/issue/${issueKey}`,
			{
				method: "GET",
				headers: {
					Authorization: this.getAuthHeader(),
					Accept: "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error(
				`Failed to fetch Jira issue: ${response.statusText}`
			);
		}

		return await response.json();
	}

	async searchIssues(jql: string): Promise<JiraIssue[]> {
		const response = await fetch(
			`${this.config.baseUrl}/rest/api/2/search`,
			{
				method: "POST",
				headers: {
					Authorization: this.getAuthHeader(),
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					jql,
					maxResults: 50,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(
				`Failed to search Jira issues: ${response.statusText}`
			);
		}

		const data = await response.json();
		return data.issues;
	}
}
