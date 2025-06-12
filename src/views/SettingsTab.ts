import { App, PluginSettingTab, Setting } from "obsidian";
import type MyPlugin from "../main";
import { Notice } from "obsidian";

export class TaskSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Task Settings" });

		new Setting(containerEl)
			.setName("Task template")
			.setDesc(
				"Template for new tasks. Use {{taskName}} as a placeholder for the task name."
			)
			.addTextArea((text) => {
				text.setPlaceholder("Enter your template")
					.setValue(this.plugin.settings.taskTemplate)
					.onChange(async (value) => {
						this.plugin.settings.taskTemplate = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.style.width = "300px";
				text.inputEl.rows = 17;
			});

		containerEl.createEl("h2", { text: "Jira Integration" });

		new Setting(containerEl)
			.setName("Jira Base URL")
			.setDesc(
				"Your Jira instance URL (e.g., https://your-domain.atlassian.net)"
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter Jira URL")
					.setValue(this.plugin.settings.jiraBaseUrl)
					.onChange(async (value) => {
						this.plugin.settings.jiraBaseUrl = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Jira Email")
			.setDesc("Your Jira account email")
			.addText((text) =>
				text
					.setPlaceholder("Enter your email")
					.setValue(this.plugin.settings.jiraEmail)
					.onChange(async (value) => {
						this.plugin.settings.jiraEmail = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Jira API Token")
			.setDesc(
				"Your Jira API token (create one at https://id.atlassian.com/manage-profile/security/api-tokens)"
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your API token")
					.setValue(this.plugin.settings.jiraApiToken)
					.onChange(async (value) => {
						this.plugin.settings.jiraApiToken = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h2", { text: "GitLab Integration" });

		new Setting(containerEl)
			.setName("GitLab Base URL")
			.setDesc("Your GitLab instance URL (e.g., https://gitlab.com)")
			.addText((text) =>
				text
					.setPlaceholder("Enter GitLab URL")
					.setValue(this.plugin.settings.gitlabBaseUrl)
					.onChange(async (value) => {
						this.plugin.settings.gitlabBaseUrl = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("GitLab Project ID")
			.setDesc(
				"Your GitLab project ID (can be found in project settings)"
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter project ID")
					.setValue(this.plugin.settings.gitlabProjectId)
					.onChange(async (value) => {
						this.plugin.settings.gitlabProjectId = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("GitLab Access Token")
			.setDesc(
				"Your GitLab access token (create one at https://gitlab.com/-/profile/personal_access_tokens)"
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your access token")
					.setValue(this.plugin.settings.gitlabToken)
					.onChange(async (value) => {
						this.plugin.settings.gitlabToken = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Test GitLab Connection")
			.setDesc("Test your GitLab connection settings")
			.addButton((button) => {
				button.setButtonText("Test Connection").onClick(async () => {
					if (!this.plugin.gitlabService) {
						new Notice("Please fill in all GitLab settings first");
						return;
					}

					button.setButtonText("Testing...");
					button.setDisabled(true);

					try {
						const isConnected =
							await this.plugin.gitlabService.testConnection();
						if (isConnected) {
							new Notice("Successfully connected to GitLab!");
						} else {
							new Notice(
								"Failed to connect to GitLab. Please check your settings."
							);
						}
					} catch (error) {
						new Notice(
							"Error testing connection: " + error.message
						);
					} finally {
						button.setButtonText("Test Connection");
						button.setDisabled(false);
					}
				});
			});

		new Setting(containerEl)
			.setName("Test Connection")
			.setDesc("Test your Jira connection settings")
			.addButton((button) => {
				button.setButtonText("Test Connection").onClick(async () => {
					if (!this.plugin.jiraService) {
						new Notice("Please fill in all Jira settings first");
						return;
					}

					button.setButtonText("Testing...");
					button.setDisabled(true);

					try {
						const isConnected =
							await this.plugin.jiraService.testConnection();
						if (isConnected) {
							new Notice("Successfully connected to Jira!");
						} else {
							new Notice(
								"Failed to connect to Jira. Please check your settings."
							);
						}
					} catch (error) {
						new Notice(
							"Error testing connection: " + error.message
						);
					} finally {
						button.setButtonText("Test Connection");
						button.setDisabled(false);
					}
				});
			});
	}
}
