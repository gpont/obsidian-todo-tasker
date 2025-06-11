import { App, PluginSettingTab, Setting } from "obsidian";
import type MyPlugin from "./main";

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
	}
}
