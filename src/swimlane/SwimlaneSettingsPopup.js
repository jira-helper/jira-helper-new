import { PageModification } from '../shared/PageModification';
import { getSettingsTab } from '../routing';
import { BOARD_PROPERTIES } from '../shared/constants';
import { mergeSwimlaneSettings } from './utils';
import { Popup } from '../shared/getPopup';
import { settingsEditBtnTemplate, settingsPopupTableRowTemplate, settingsPopupTableTemplate } from './constants';

export default class SwimlaneSettingsLimit extends PageModification {
  static ids = {
    editLimitsBtn: 'edit-limits-btn-jh',
    editTable: 'edit-table-jh',
  };

  static classes = {
    editSwimlaneRow: 'edit-swimlane-row-jh',
  };

  static jiraSelectors = {
    swimlanes: '#swimlanes',
    swimlaneConfig: '#ghx-swimlane-strategy-config',
    swimlaneSelect: '#ghx-swimlanestrategy-select',
    swimlanesCloud: `[data-testid="software-board-settings-sortable-table.ui.sortable-table.table"]`,
    swimlaneSelectCloud: `[data-testid="software-board-settings-swimlanes.ui.swimlanes-settings-page.swimlane-strategy-field.select"]`,
  };

  async shouldApply() {
    return (await getSettingsTab()) === 'swimlanes';
  }

  getModificationId() {
    return `add-swimlane-settings-${this.getBoardId()}`;
  }

  waitForLoading() {
    return Promise.all([
      this.waitForFirstElement([
          SwimlaneSettingsLimit.jiraSelectors.swimlanes,
          SwimlaneSettingsLimit.jiraSelectors.swimlanesCloud,
      ]),
      this.waitForFirstElement([
          SwimlaneSettingsLimit.jiraSelectors.swimlaneSelect,
          SwimlaneSettingsLimit.jiraSelectors.swimlaneSelectCloud,
      ]),
    ]);
  }

  loadData() {
    return Promise.all([
      this.getBoardEditData(),
      Promise.all([
        this.getBoardProperty(BOARD_PROPERTIES.SWIMLANE_SETTINGS),
        this.getBoardProperty(BOARD_PROPERTIES.OLD_SWIMLANE_SETTINGS),
      ]).then(mergeSwimlaneSettings),
    ]);
  }

  apply(data) {
    if (!data) return;
    const [boardData, settings] = data;
    this.settings = settings;
    this.boardData = boardData;

    if (!(boardData && boardData.canEdit)) return;

    this.swimlaneSelect = document.querySelector(SwimlaneSettingsLimit.jiraSelectors.swimlaneSelect)
        ?? document.querySelector(SwimlaneSettingsLimit.jiraSelectors.swimlaneSelectCloud);

    if (
        this.swimlaneSelect.matches(SwimlaneSettingsLimit.jiraSelectors.swimlaneSelectCloud
        || this.swimlaneSelect.value === 'custom'
        )
    ) {
      this.renderEditButton();
    }

    this.addEventListener(this.swimlaneSelect, 'change', event => {
      if (
          this.swimlaneSelect.matches(SwimlaneSettingsLimit.jiraSelectors.swimlaneSelectCloud)
          || (event.target.value === 'custom')
      ) {
        this.renderEditButton();
      } else {
        this.removeEditBtn();
      }
    });
  }

  renderEditButton() {
    const target = document.querySelector(SwimlaneSettingsLimit.jiraSelectors.swimlaneConfig)
        ?? document.querySelector(SwimlaneSettingsLimit.jiraSelectors.swimlanesCloud);
    this.insertHTML(
      target,
      'beforebegin',
      settingsEditBtnTemplate(SwimlaneSettingsLimit.ids.editLimitsBtn)
    );

    this.popup = new Popup({
      title: 'Edit swimlane limits',
      onConfirm: this.handleConfirmEditing,
      okButtonText: 'Save',
    });

    this.editBtn = document.getElementById(SwimlaneSettingsLimit.ids.editLimitsBtn);
    this.addEventListener(this.editBtn, 'click', this.handleEditClick);
  }

  handleEditClick = () => {
    this.popup.render();
    this.popup.appendToContent(
      settingsPopupTableTemplate(
        SwimlaneSettingsLimit.ids.editTable,
        this.boardData.swimlanesConfig.swimlanes
          .map(item =>
            settingsPopupTableRowTemplate({
              id: item.id,
              name: item.name,
              limit: this.settings[item.id] ? this.settings[item.id].limit : 0,
              isIgnored: this.settings[item.id] ? this.settings[item.id].ignoreWipInColumns : false,
              rowClass: SwimlaneSettingsLimit.classes.editSwimlaneRow,
            })
          )
          .join('')
      )
    );
  };

  removeEditBtn() {
    this.editBtn.remove();
  }

  handleConfirmEditing = unmountCallback => {
    const rows = document.querySelectorAll(
      `#${SwimlaneSettingsLimit.ids.editTable} .${SwimlaneSettingsLimit.classes.editSwimlaneRow}`
    );
    const updatedSettings = {};

    rows.forEach(row => {
      const { value: rawLimitValue } = row.querySelector('input[type="number"]');
      const { checked: isExpediteValue } = row.querySelector('input[type="checkbox"]');

      const swimlaneId = row.getAttribute('data-swimlane-id');
      const limitValue = Number.parseInt(rawLimitValue, 10);

      updatedSettings[swimlaneId] = {
        limit: limitValue < 1 ? undefined : limitValue,
        ignoreWipInColumns: isExpediteValue,
      };
    });

    this.settings = updatedSettings;
    this.updateBoardProperty(BOARD_PROPERTIES.SWIMLANE_SETTINGS, updatedSettings);
    unmountCallback();
  };
}
