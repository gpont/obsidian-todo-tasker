import {
	ItemView,
	MarkdownView,
	Notice,
	TFile,
	WorkspaceLeaf,
	App,
} from "obsidian";
import type MyPlugin from "../main";
import { JiraService } from "../services/jira";

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
	private jiraService: JiraService | null = null;

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

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();

		// Создаем форму для ввода данных задачи
		const form = container.createEl("form", {
			cls: "task-form",
		});

		// Поле для названия задачи
		const taskNameContainer = form.createDiv({
			cls: "task-input-container",
		});
		taskNameContainer.createEl("label", { text: "Task name:" });
		const taskNameInput = taskNameContainer.createEl("input", {
			type: "text",
			placeholder: "Enter task name",
		});

		// Поле для Jira issue key
		const jiraKeyContainer = form.createDiv({
			cls: "task-input-container",
		});
		jiraKeyContainer.createEl("label", {
			text: "Jira issue key (optional):",
		});
		const jiraKeyInput = jiraKeyContainer.createEl("input", {
			type: "text",
			placeholder: "e.g., PROJ-123",
		});

		form.createEl("button", {
			text: "Create new task",
			type: "submit",
		});

		form.onsubmit = async (e: Event) => {
			e.preventDefault();

			const taskName = taskNameInput.value.trim();
			const jiraKey = jiraKeyInput.value.trim();

			if (!taskName) {
				new Notice("Please enter a task name");
				return;
			}

			let taskTemplate = this.getTaskTemplate(taskName);

			// Если указан Jira issue key, пытаемся получить информацию о задаче
			if (jiraKey && this.jiraService) {
				try {
					const issue = await this.jiraService.getIssue(jiraKey);
					taskTemplate += `\nJira: [${issue.key}](${this.plugin.settings.jiraBaseUrl}/browse/${issue.key}) - ${issue.fields.summary}`;
				} catch (error) {
					new Notice(`Failed to fetch Jira issue: ${error.message}`);
				}
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

			// Очищаем форму
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
