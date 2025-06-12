import {
	ItemView,
	MarkdownView,
	Notice,
	TFile,
	WorkspaceLeaf,
	App,
} from "obsidian";
import type MyPlugin from "../main";

export const TASK_VIEW_TYPE = "task-view";

function getActiveMarkdownFile(app: App): TFile | null {
	const leaves = app.workspace.getLeavesOfType("markdown");
	for (const leaf of leaves) {
		const view = leaf.view;
		if (view instanceof MarkdownView && view.file instanceof TFile) {
			return view.file;
		}
	}
	return null;
}

export class TaskView extends ItemView {
	plugin: MyPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return TASK_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Tasks";
	}

	private processJiraTitle(title: string): string {
		const withoutBrackets = title.replace(/^\[.*?\]\s*/, "");
		const words = withoutBrackets.split(/\s+/).slice(0, 3);
		return words.join(" ");
	}

	private generateBranchName(jiraKey: string, taskName: string): string {
		const cleanTaskName = taskName
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-");

		return `branches/${jiraKey}-${cleanTaskName}`;
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();

		const form = container.createEl("form", {
			cls: "task-form",
		});

		const taskNameContainer = form.createDiv({
			cls: "task-input-container",
		});
		taskNameContainer.createEl("label", { text: "Task name:" });
		const taskNameInput = taskNameContainer.createEl("input", {
			type: "text",
			placeholder: "Enter task name",
		});

		const jiraKeyContainer = form.createDiv({
			cls: "task-input-container",
		});
		jiraKeyContainer.createEl("label", {
			text: "Jira issue key (optional):",
		});
		const jiraKeyInput = jiraKeyContainer.createEl("input", {
			type: "text",
			placeholder: "e.g., AFS-12345",
		});

		form.createEl("button", {
			text: "Create new task",
			type: "submit",
		});

		form.onsubmit = async (e: Event) => {
			e.preventDefault();

			const taskName = taskNameInput.value.trim();
			const jiraKey = jiraKeyInput.value.startsWith("http")
				? jiraKeyInput.value.split("/").at(-1)?.trim()
				: jiraKeyInput.value.trim();

			if (!taskName && !jiraKey) {
				new Notice("Please enter either a task name or Jira issue key");
				return;
			}

			let finalTaskName = taskName;
			let finalJiraKey = jiraKey;
			let taskTemplate = this.getTaskTemplate(finalTaskName);
			let branchName = "";

			if (jiraKey && this.plugin.jiraService) {
				try {
					const issue = await this.plugin.jiraService.getIssue(
						jiraKey
					);
					const jiraUrl = `${this.plugin.settings.jiraBaseUrl}/browse/${issue.key}`;

					if (!finalTaskName) {
						finalTaskName = this.processJiraTitle(
							issue.fields.summary
						);
					}

					finalJiraKey = issue.key;

					branchName = this.generateBranchName(
						finalJiraKey,
						finalTaskName
					);

					let mrLink = "";
					if (this.plugin.gitlabService) {
						const mr =
							await this.plugin.gitlabService.findMergeRequestByBranch(
								branchName
							);
						if (mr) {
							mrLink = mr.web_url;
						}
					}

					taskTemplate = this.getTaskTemplate(finalTaskName)
						.replace("{{jiraUrl}}", jiraUrl)
						.replace("{{jiraKey}}", finalJiraKey)
						.replace("{{branchName}}", branchName.toLowerCase())
						.replace("{{mrLink}}", mrLink);
				} catch (error) {
					new Notice(`Failed to fetch Jira issue: ${error.message}`);
					return;
				}
			} else {
				taskTemplate = this.getTaskTemplate(finalTaskName);
			}

			const file: TFile | null = getActiveMarkdownFile(this.app);
			if (!file) {
				new Notice("No active markdown file");
				return;
			}

			let content = await this.app.vault.read(file);
			content = content.replace(
				"# Tasks\n\n",
				`# Tasks\n\n${taskTemplate}\n`
			);
			await this.app.vault.modify(file, content);
			new Notice("New task added");

			taskNameInput.value = "";
			jiraKeyInput.value = "";
		};
	}

	getTaskTemplate(taskName: string): string {
		return this.plugin.settings.taskTemplate.replace(
			"{{taskName}}",
			taskName
		);
	}

	async onClose() {}
}
