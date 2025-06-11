export interface TaskPluginSettings {
	taskTemplate: string;
	jiraBaseUrl: string;
	jiraEmail: string;
	jiraApiToken: string;
}

export const DEFAULT_SETTINGS: TaskPluginSettings = {
	taskTemplate: `- [ ] {{taskName}}
    - [ ] Ветка branches/afs-
    - [ ] Распланировать
    - [ ] Сделать
        - [ ] 
    - [ ] МР
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
};
