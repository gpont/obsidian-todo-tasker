export interface TaskPluginSettings {
	taskTemplate: string;
	jiraBaseUrl: string;
	jiraEmail: string;
	jiraApiToken: string;
	gitlabBaseUrl: string;
	gitlabToken: string;
	gitlabProjectId: string;
}

export const DEFAULT_SETTINGS: TaskPluginSettings = {
	taskTemplate: `- [ ] {{taskName}} [{{jiraKey}}]({{jiraUrl}})
    - [ ] Ветка {{branchName}}
    - [ ] Распланировать
    - [ ] Сделать
        - [ ] 
    - [ ] [МР]({{mrLink}})
        - [ ] Описание
        - [ ] CTE
        - [ ] Протестить на CTE
        - [ ] Отдать в ревью
        - [ ] Отдать в QA
    - [ ] Успешный тест
    - [ ] Аппрув
    - [ ] Смержить`,
	jiraBaseUrl: "",
	jiraEmail: "",
	jiraApiToken: "",
	gitlabBaseUrl: "",
	gitlabToken: "",
	gitlabProjectId: "",
};
