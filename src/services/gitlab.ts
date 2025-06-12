import * as https from "https";
import { URL } from "url";

interface GitLabConfig {
	baseUrl: string;
	token: string;
	projectId: string;
}

interface GitLabMergeRequest {
	id: number;
	iid: number;
	title: string;
	description: string;
	state: string;
	web_url: string;
	created_at: string;
	updated_at: string;
	source_branch: string;
	target_branch: string;
	author: {
		name: string;
		username: string;
	};
}

export class GitLabService {
	private config: GitLabConfig;

	constructor(config: GitLabConfig) {
		this.config = config;
	}

	private makeRequest<T>(
		path: string,
		method = "GET",
		body?: any
	): Promise<T> {
		return new Promise((resolve, reject) => {
			const url = new URL(`${this.config.baseUrl}/api/v4${path}`);

			const options = {
				method,
				headers: {
					"PRIVATE-TOKEN": this.config.token,
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

	async getMergeRequest(mrIid: number): Promise<GitLabMergeRequest> {
		return this.makeRequest<GitLabMergeRequest>(
			`/projects/${encodeURIComponent(
				this.config.projectId
			)}/merge_requests/${mrIid}`
		);
	}

	async searchMergeRequests(state = "opened"): Promise<GitLabMergeRequest[]> {
		return this.makeRequest<GitLabMergeRequest[]>(
			`/projects/${encodeURIComponent(
				this.config.projectId
			)}/merge_requests?state=${state}`
		);
	}

	async testConnection(): Promise<boolean> {
		return new Promise((resolve) => {
			const url = new URL(
				`${this.config.baseUrl}/api/v4/projects/${encodeURIComponent(
					this.config.projectId
				)}`
			);

			const options = {
				headers: {
					"PRIVATE-TOKEN": this.config.token,
					Accept: "application/json",
				},
			};

			const req = https.get(url, options, (res) => {
				resolve(res.statusCode === 200);
			});

			req.on("error", (error: Error) => {
				console.error("GitLab connection test error:", error);
				resolve(false);
			});

			req.end();
		});
	}

	async findMergeRequestByBranch(
		branchName: string
	): Promise<GitLabMergeRequest | null> {
		try {
			const mrs = await this.makeRequest<GitLabMergeRequest[]>(
				`/projects/${encodeURIComponent(
					this.config.projectId
				)}/merge_requests?source_branch=${encodeURIComponent(
					branchName
				)}`
			);

			// Возвращаем первый найденный MR или null, если MR не найден
			return mrs.length > 0 ? mrs[0] : null;
		} catch (error) {
			console.error("Error finding merge request:", error);
			return null;
		}
	}
}
