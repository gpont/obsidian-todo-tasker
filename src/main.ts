import { Plugin } from "obsidian";
import { TaskView, TASK_VIEW_TYPE } from "./views/TaskView";
import { TaskPluginSettings, DEFAULT_SETTINGS } from "./settings";
import { TaskSettingTab } from "./views/SettingsTab";
import { JiraService } from "./services/jira";
import { GitLabService } from "./services/gitlab";

export default class TaskPlugin extends Plugin {
	settings: TaskPluginSettings;
	jiraService: JiraService | null = null;
	gitlabService: GitLabService | null = null;

	private initServices() {
		if (
			this.settings.jiraBaseUrl &&
			this.settings.jiraEmail &&
			this.settings.jiraApiToken
		) {
			this.jiraService = new JiraService({
				baseUrl: this.settings.jiraBaseUrl,
				email: this.settings.jiraEmail,
				apiToken: this.settings.jiraApiToken,
			});
		}

		if (
			this.settings.gitlabBaseUrl &&
			this.settings.gitlabToken &&
			this.settings.gitlabProjectId
		) {
			this.gitlabService = new GitLabService({
				baseUrl: this.settings.gitlabBaseUrl,
				token: this.settings.gitlabToken,
				projectId: this.settings.gitlabProjectId,
			});
		}
	}

	async onload() {
		await this.loadSettings();

		this.registerView(TASK_VIEW_TYPE, (leaf) => new TaskView(leaf, this));

		this.addRibbonIcon("checkmark", "Open Tasks", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-task-view",
			name: "Open Tasks View",
			callback: () => {
				this.activateView();
			},
		});

		this.addSettingTab(new TaskSettingTab(this.app, this));

		this.initServices();
	}

	onunload() {
		this.app.workspace
			.getLeavesOfType(TASK_VIEW_TYPE)
			.forEach((leaf) => leaf.detach());
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);

		this.initServices();
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType(TASK_VIEW_TYPE)[0];

		if (!leaf) {
			const newLeaf = workspace.getRightLeaf(false);
			if (newLeaf) {
				await newLeaf.setViewState({
					type: TASK_VIEW_TYPE,
					active: true,
				});
				leaf = newLeaf;
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}
}
